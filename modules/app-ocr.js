// ====================================================================
// MODULE: app-ocr.js (3-Pass Smart Receiver Number OCR + 3x TrxID Limit)
// ====================================================================

let _tesseractLoadPromise = null;
function ensureTesseractLoaded() {
    if (typeof Tesseract !== 'undefined') return Promise.resolve();
    if (_tesseractLoadPromise) return _tesseractLoadPromise;
    _tesseractLoadPromise = loadExternalScript('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js')
        .catch((err) => {
            _tesseractLoadPromise = null;
            throw err;
        });
    return _tesseractLoadPromise;
}

const ocrState = {
    pay: { verified: false, rawText: '', scanning: false, paidAmount: 0, receiverPhone: '', receiverType: 'Personal', imageHash: '', proofSig: null },
    sav: { verified: false, rawText: '', scanning: false, paidAmount: 0, receiverPhone: '', receiverType: 'Personal', imageHash: '', proofSig: null },
    emi: { verified: false, rawText: '', scanning: false, paidAmount: 0, receiverPhone: '', receiverType: 'Personal', imageHash: '', proofSig: null }
};

window.lockedPaymentSession = window.lockedPaymentSession || { pay: {}, sav: {}, emi: {} };
window._isBackgroundAdminSync = false;
window._activeSubmitPayOverride = null;

let sharedEngWorker = null;
let sharedEngWorkerPromise = null;
let sharedBenEngWorker = null;
let sharedBenEngWorkerPromise = null;
let activeOcrLogger = null;

const BN_TO_EN_DIGITS = {
    '০':'0','১':'1','২':'2','৩':'3','৪':'4',
    '৫':'5','৬':'6','৭':'7','৮':'8','৯':'9'
};

function convertBnDigitsToEn(str) {
    return String(str || '').replace(/[০-৯]/g, d => BN_TO_EN_DIGITS[d]);
}

function normalizeServerNumber(raw) {
    let digits = convertBnDigitsToEn(raw).replace(/\D/g, '');
    if (digits.startsWith('8801')) digits = digits.slice(2);
    return digits;
}

function digitFuzzyRegexPart(digitsStr) {
    const map = { '0': '[0Oo]', '1': '[1Il|]' };
    return String(digitsStr || '').split('').map(ch => map[ch] || ch).join('');
}

function matchServerNumberInText(rawText, serverNumber) {
    if (!rawText || !serverNumber || serverNumber.length < 11) return false;

    const unicodeSafeText = String(rawText).normalize('NFC').replace(/[\u200C\u200D]/g, '');
    const normalizedText = convertBnDigitsToEn(unicodeSafeText);
    const compactDigits = normalizedText.replace(/[\s\-\(\)\+\.]/g, '');

    // ডিজিট-সদৃশ ফোনের লাইনগুলোতে O->0, I/l->1, S->5, B->8, Z->2 রিকভারি
    const phoneLikeChunks = normalizedText.match(/[0-9OoDdIl|!SsBbZz\s\-\(\)\+\.]{9,24}/g) || [];
    const recoveredChunks = phoneLikeChunks
        .filter(ch => (ch.match(/[0-9]/g) || []).length >= 6)
        .map(ch => ch
            .replace(/[OoDd]/g, '0')
            .replace(/[Il|!]/g, '1')
            .replace(/[Ss]/g, '5')
            .replace(/[Bb]/g, '8')
            .replace(/[Zz]/g, '2')
            .replace(/\D/g, '')
        );

    const checkSingle = (num) => {
        if (compactDigits.includes(num)) return true;
        if (recoveredChunks.some(rc => rc.includes(num))) return true;

        // মাস্কড নম্বর ম্যাচিং: সামনের ৩-৪ ডিজিট + মাঝখানে স্টার/চিহ্ন/ফাঁকা + পেছনের ৩-৪ ডিজিট
        const p4 = digitFuzzyRegexPart(num.slice(0, 4));
        const p3 = digitFuzzyRegexPart(num.slice(0, 3));
        const s4 = digitFuzzyRegexPart(num.slice(-4));
        const s3 = digitFuzzyRegexPart(num.slice(-3));
        const maskAny = '[ \\t\\-\\.\\*•●?#_×✕✖Xx~—=°«»\\/\\(\\)]{0,12}';
        const maskReq = '[ \\t\\-\\.\\*•●?#_×✕✖Xx~—=°«»\\/\\(\\)]*[\\*•●?#_×✕✖Xx]{2,}[ \\t\\-\\.\\*•●?#_×✕✖Xx~—=°«»\\/\\(\\)]*';

        const patterns = [
            new RegExp(p4 + maskAny + s4),
            new RegExp(p4 + maskAny + s3),
            new RegExp(p3 + maskAny + s4),
            new RegExp(p3 + maskReq + s3)
        ];

        for (const rgx of patterns) {
            if (rgx.test(normalizedText) || rgx.test(compactDigits)) return true;
        }
        return false;
    };

    if (checkSingle(serverNumber)) return true;
    if (serverNumber.length === 12 && checkSingle(serverNumber.slice(0, 11))) return true;
    return false;
}

function getLockedOrLatestGatewayConfig(type, method) {
    if (!window.lockedPaymentSession[type]) window.lockedPaymentSession[type] = {};
    if (window.lockedPaymentSession[type][method]) {
        return window.lockedPaymentSession[type][method];
    }
    const cfg = getGatewayConfig(method);
    window.lockedPaymentSession[type][method] = { ...cfg };
    return window.lockedPaymentSession[type][method];
}

function getValidServerReceivers(type, gatewayName) {
    const list = [];
    const seen = new Set();
    const addCandidate = (rawNum, accType, gwName, isSelectedGw) => {
        const norm = normalizeServerNumber(rawNum);
        if (!norm || norm.length < 11 || seen.has(norm)) return;
        seen.add(norm);
        list.push({
            normNumber: norm,
            displayNumber: String(rawNum || norm).trim(),
            accType: accType || 'Personal',
            gateway: gwName || gatewayName || 'bKash',
            isSelectedGateway: !!isSelectedGw
        });
    };

    const primaryGw = gatewayName || 'bKash';
    const { serverNumId } = getFormControls(type);
    const screenNumEl = document.getElementById(serverNumId);
    const accTypeElId = type === 'pay' ? 'pay_det_account_type' : (type === 'sav' ? 'verify_account_type' : 'emi_account_type');
    const screenAccEl = document.getElementById(accTypeElId);
    if (screenNumEl) {
        addCandidate(screenNumEl.innerText, screenAccEl ? screenAccEl.innerText.trim() : 'Personal', primaryGw, true);
    }

    const locked = window.lockedPaymentSession[type] && window.lockedPaymentSession[type][primaryGw];
    if (locked) {
        addCandidate(locked.number, locked.accTypeLabel, primaryGw, true);
    }

    const GRACE_MS = 6 * 60 * 60 * 1000;
    const now = Date.now();
    let registryList = [];
    try {
        const rawReg = localStorage.getItem('app_number_registry');
        if (rawReg) registryList = JSON.parse(rawReg);
        if (!Array.isArray(registryList)) registryList = [];
    } catch (e) { registryList = []; }

    const addGatewayAndHistory = (gw, isSelectedGw) => {
        if (typeof getGatewayConfig === 'function') {
            const cfg = getGatewayConfig(gw);
            addCandidate(cfg.number, cfg.accTypeLabel, gw, isSelectedGw);
        }
        try {
            const hist = JSON.parse(localStorage.getItem('app_' + String(gw).toLowerCase() + '_history') || '[]');
            if (Array.isArray(hist)) {
                hist.forEach(item => {
                    if (item && item.number && !item.graceDisabled && item.replacedAt && (now - Number(item.replacedAt) <= GRACE_MS)) {
                        addCandidate(item.number, item.type === 'cash_out' ? 'Agent' : 'Personal', gw, isSelectedGw);
                    }
                });
            }
        } catch (e) {}
        try {
            registryList.forEach(r => {
                if (!r || !r.number || r.graceDisabled || !r.removedAt) return;
                if (r.gateway && String(r.gateway).toLowerCase() !== String(gw).toLowerCase()) return;
                if (now - Number(r.removedAt) <= GRACE_MS) {
                    addCandidate(r.number, r.type === 'cash_out' ? 'Agent' : 'Personal', gw, isSelectedGw);
                }
            });
        } catch (e) {}
    };

    addGatewayAndHistory(primaryGw, true);
    ['bKash', 'Nagad', 'Rocket'].forEach(otherGw => {
        if (otherGw.toLowerCase() !== String(primaryGw).toLowerCase()) {
            addGatewayAndHistory(otherGw, false);
        }
    });

    return list;
}

async function pasteFromClipboardToField(inputId, mode, ocrType = '') {
    const inputEl = document.getElementById(inputId);
    if (!inputEl) return;

    const applyPastedValue = (raw) => {
        if (!raw || !String(raw).trim()) return false;
        let val = String(raw).trim();
        if (mode === 'phone') {
            val = convertBnDigitsToEn(val).replace(/[\s\-]/g, '');
            if (val.startsWith('+88')) val = val.slice(3);
            else if (val.startsWith('8801')) val = val.slice(2);
            val = val.replace(/[^0-9]/g, '');
        } else if (mode === 'trx') {
            val = val.replace(/[^a-zA-Z0-9]/g, '').slice(0, 25);
        }
        inputEl.value = val;
        inputEl.focus();
        inputEl.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
    };

    try {
        if (navigator.clipboard && navigator.clipboard.readText) {
            const text = await navigator.clipboard.readText();
            if (!text || !text.trim()) {
                showPopup('ক্লিপবোর্ড খালি', 'আগে নম্বর বা TrxID কপি করুন, তারপর পেস্ট বাটনে চাপ দিন।', 'info');
                return;
            }
            if (applyPastedValue(text)) return;
        }
    } catch (err) {}

    inputEl.focus();
    showPopup('ম্যানুয়ালি পেস্ট করুন', 'বক্সের ভেতরে চেপে ধরে (বা রাইট-ক্লিক করে) Paste চাপুন।', 'info');
}

function extractPaidAmountFromOcr(rawText) {
    if (!rawText) return 0;

    let txt = convertBnDigitsToEn(String(rawText).normalize('NFC')).replace(/[\u200C\u200D]/g, '');
    txt = txt.replace(/(\d),(\d)/g, '$1$2').replace(/(\d),(\d)/g, '$1$2');

    txt = txt.replace(/(?:\+?88)?01[3-9]\d{8,9}/g, ' [PHONE] ');
    txt = txt.replace(/\b\d+(?:\.\d+)?[ \t]*%/g, ' [PCT] ');
    txt = txt.replace(/\b\d{1,2}:\d{2}(?:[ \t]*(?:am|pm))?\b/gi, ' [TIME] ');
    txt = txt.replace(/\b\d{1,2}\.\d{2}[ \t]*(?:am|pm)\b/gi, ' [TIME] ');
    txt = txt.replace(/\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g, ' [DATE] ');

    txt = txt.replace(
        /(?:^|\n)[^\n]*(?:ক্যাশ\s*ব্যাক|ক্যাশব্যাক|cash\s*back|cashback|বোনাস|bonus|রিওয়ার্ড|রিওয়ার্ড|reward)[^\n]*(?:\n[ \t]*(?:টাকার\s*পরিমা[ণন]|পরিমা[ণন]|amount)[^\n]*)?/gi,
        '\n[NOTIF_SKIP]\n'
    );

    txt = txt.replace(
        /(?:new\s*balance|avail(?:able)?\s*balance|current\s*balance|closing\s*balance|নতুন\s*ব্যালেন্স|বর্তমান\s*ব্যালেন্স|অবশিষ্ট\s*ব্যালেন্স|মোট\s*ব্যালেন্স|ব্যালেন্স|ব্যালেনস|balance|bal)\s*[:\-]?\s*(?:tk\.?|bdt|৳|টাকা)?\s*[0-9]+(?:\.[0-9]{1,2})?(?:[ \t]*(?:tk\.?|bdt|৳|টাকা))?/gi,
        ' [BAL_SKIP] '
    );

    const plusMatches = [];
    const plusRgx = /(?:৳|tk\.?|bdt|টাকা)?[ \t]*([0-9]+(?:\.[0-9]{1,2})?)[ \t]*\+[ \t]*(?:৳|tk\.?|bdt|টাকা|t|#|\*)?[ \t]*([0-9]+(?:\.[0-9]{1,2})?)/gi;
    let pm;
    while ((pm = plusRgx.exec(txt)) !== null) {
        const mainVal = parseFloat(pm[1]);
        const chargeVal = parseFloat(pm[2]);
        if (mainVal >= 10 && mainVal <= 10000000 && chargeVal > 0 && chargeVal < mainVal) {
            plusMatches.push(mainVal);
        }
    }
    if (plusMatches.length > 0) return Math.max(...plusMatches);

    const collectCurrencyNums = (s) => {
        const nums = [];
        const rgxList = [
            /(?:৳|tk\.?|bdt)[ \t]*([0-9]+(?:\.[0-9]{1,2})?)/gi,
            /([0-9]+(?:\.[0-9]{1,2})?)[ \t]*(?:tk\.?|bdt|টাকা|৳)/gi
        ];
        for (const rgx of rgxList) {
            let m;
            while ((m = rgx.exec(s)) !== null) {
                const v = parseFloat(m[1]);
                if (v > 0 && v <= 10000000) nums.push(v);
            }
        }
        return nums;
    };

    const allNums = collectCurrencyNums(txt);
    const decOnlyRgx = /\b([0-9]+\.[0-9]{2})\b/g;
    let dcm;
    while ((dcm = decOnlyRgx.exec(txt)) !== null) {
        const dv = parseFloat(dcm[1]);
        if (dv > 0 && dv <= 10000000 && !allNums.some(n => Math.abs(n - dv) < 0.001)) allNums.push(dv);
    }

    let bestTripleMain = 0;
    if (allNums.length >= 3) {
        for (let i = 0; i < allNums.length; i++) {
            for (let j = i + 1; j < allNums.length; j++) {
                for (let k = 0; k < allNums.length; k++) {
                    if (k === i || k === j) continue;
                    const a = allNums[i], b = allNums[j], c = allNums[k];
                    if (Math.abs((a + b) - c) <= 0.10) {
                        const mainCandidate = Math.max(a, b);
                        if (mainCandidate > bestTripleMain) bestTripleMain = mainCandidate;
                    }
                }
            }
        }
    }
    if (bestTripleMain > 0) return bestTripleMain;

    let txtNoFee = txt.replace(
        /(?:transaction\s*(?:charge|fee)|service\s*(?:charge|fee)|cash\s*out\s*(?:charge|fee)|cashout\s*(?:charge|fee)|send\s*money\s*(?:charge|fee)|total\s*(?:charge|fee)|txn\s*(?:charge|fee)|tx\s*(?:charge|fee)|ট্রানজেকশন\s*(?:চার্জ|ফি)|সার্ভিস\s*(?:চার্জ|ফি)|ক্যাশ\s*আউট\s*(?:চার্জ|ফি)|সেন্ড\s*মানি\s*(?:চার্জ|ফি)|অতিরিক্ত\s*(?:চার্জ|ফি|খরচ)|চার্জ|ফি|খরচ|কমিশন|ভ্যাট|fee|charge|cost|expense|comm(?:ission)?|vat)\s*[+\-:]?\s*(?:[+\-:]\s*)?(?:tk\.?|bdt|৳|টাকা)?\s*[0-9]+(?:\.[0-9]{1,2})?(?:[ \t]*(?:tk\.?|bdt|৳|টাকা))?/gi,
        ' [FEE_SKIP] '
    );
    let txtClean = txtNoFee.replace(
        /(?:সর্ব\s*মোট|সর্বমোট|মোট\s*টাকা|grand\s*total|total\s*amount|total)\s*[:\-]?\s*(?:tk\.?|bdt|৳|টাকা)?\s*[0-9]+(?:\.[0-9]{1,2})?(?:[ \t]*(?:tk\.?|bdt|৳|টাকা))?/gi,
        ' [TOTAL_SKIP] '
    );

    const priorityRegex = /(?:পরিমাণ|পরিমান|amount|amt|send\s*money|cash\s*out|cash\s*in|cashout|cashin|payment|gift|সেন্ড\s*মানি|ক্যাশ\s*আউট|ক্যাশ\s*ইন|পেমেন্ট|গিফট)\s*(?:is|of|:|\-)?\s*(?:tk\.?|bdt|৳|টাকা)?\s*[:\-]?\s*([0-9]+(?:\.[0-9]{1,2})?)/i;
    const pMatch = txtClean.match(priorityRegex);
    if (pMatch && pMatch[1]) {
        const val = parseFloat(pMatch[1]);
        if (val > 0 && val <= 10000000) return val;
    }

    const remNums = collectCurrencyNums(txtClean);
    if (remNums.length > 0) return Math.max(...remNums);

    const decMatches = [];
    const decRgx = /\b([0-9]+\.[0-9]{2})\b/g;
    let dm;
    while ((dm = decRgx.exec(txtClean)) !== null) {
        const dv = parseFloat(dm[1]);
        if (dv > 0 && dv <= 10000000) decMatches.push(dv);
    }
    if (decMatches.length > 0) return Math.max(...decMatches);

    const fallbackNums = collectCurrencyNums(txtNoFee);
    if (fallbackNums.length > 0) return Math.max(...fallbackNums);

    return 0;
}

function loadFileToImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load error')); };
        img.src = url;
    });
}

function prepareGentleCanvas(img) {
    const targetWidth = Math.min(1800, Math.max(1100, img.width * 1.5));
    const scale = targetWidth / img.width;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
        let g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        g = Math.max(0, Math.min(255, ((g - 128) * 1.25) + 128));
        d[i] = d[i + 1] = d[i + 2] = g;
    }
    ctx.putImageData(imgData, 0, 0);
    return canvas;
}

function prepareColorScaledCanvas(img) {
    const targetWidth = Math.min(1800, Math.max(1100, img.width * 1.5));
    const scale = targetWidth / img.width;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas;
}

function preprocessImageForOcr(imgOrFile) {
    return new Promise(async (resolve) => {
        try {
            const img = (imgOrFile instanceof HTMLImageElement) ? imgOrFile : await loadFileToImage(imgOrFile);
            const targetWidth = Math.min(1800, Math.max(1100, img.width * 1.6));
            const scale = targetWidth / img.width;
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imgData.data;

            const xStart = Math.floor(canvas.width * 0.25), xEnd = Math.ceil(canvas.width * 0.75);
            const yStart = Math.floor(canvas.height * 0.20), yEnd = Math.ceil(canvas.height * 0.80);

            let brightnessSum = 0, sampleCount = 0;
            const hist = new Uint32Array(256);

            for (let y = yStart; y < yEnd; y++) {
                for (let x = xStart; x < xEnd; x++) {
                    const idx = (y * canvas.width + x) * 4;
                    const g = Math.round(0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]);
                    brightnessSum += g;
                    hist[g]++;
                    sampleCount++;
                }
            }

            const avgBrightness = sampleCount > 0 ? (brightnessSum / sampleCount) : 200;
            const isDarkBg = avgBrightness < 105;

            let bgLevel = 240;
            if (sampleCount > 0) {
                if (!isDarkBg) {
                    const targetCount = Math.floor(sampleCount * 0.86);
                    let acc = 0;
                    for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc >= targetCount) { bgLevel = Math.max(190, v); break; } }
                } else {
                    const targetCount = Math.floor(sampleCount * 0.14);
                    let acc = 0;
                    for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc >= targetCount) { bgLevel = Math.max(190, 255 - v); break; } }
                }
            }

            for (let i = 0; i < data.length; i += 4) {
                let gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                if (isDarkBg) gray = 255 - gray;
                const norm = Math.min(1, Math.max(0, gray / bgLevel));
                let enhanced = norm >= 0.92 ? 255 : Math.pow(norm, 1.85) * 255;
                enhanced = Math.max(0, Math.min(255, enhanced));
                data[i] = data[i + 1] = data[i + 2] = enhanced;
            }
            ctx.putImageData(imgData, 0, 0);
            resolve(canvas);
        } catch (e) {
            resolve(imgOrFile);
        }
    });
}

function getFormControls(type) {
    if (type === 'pay') {
        return {
            boxId: 'pay_ocr_box', btnId: 'pay_submit_btn', trxId: 'trx_id',
            serverNumId: 'payment-number', expectedAmtId: 'payment_fee_display',
            gatewayFn: () => activePaymentMethod || currentLoan.paymentMethod || 'bKash'
        };
    } else if (type === 'sav') {
        return {
            boxId: 'sav_ocr_box', btnId: 'sav_submit_btn', trxId: 'verify_trx',
            serverNumId: 'verify_payment_number', expectedAmtId: 'verify_fee_text',
            gatewayFn: () => (typeof currentVerifyData !== 'undefined' && currentVerifyData.method) || 'bKash'
        };
    }
    return {
        boxId: 'emi_ocr_box', btnId: 'emi_submit_btn', trxId: 'emi_trx_id',
        serverNumId: 'emi_payment_number', expectedAmtId: 'emi_pay_fee_text',
        gatewayFn: () => (window.currentEmiData && window.currentEmiData.method) ? window.currentEmiData.method : 'bKash'
    };
}

function renderOcrProgress(type, label, percent) {
    const { boxId, btnId } = getFormControls(type);
    const box = document.getElementById(boxId);
    const btn = document.getElementById(btnId);
    if (btn) btn.disabled = true;
    if (!box) return;
    box.className = 'mt-2 p-2.5 rounded-xl border border-blue-300 bg-blue-50 text-blue-900 text-[11px] font-bold space-y-1.5';
    box.classList.remove('hidden');
    const pct = Math.min(100, Math.max(0, Math.round(percent || 0)));
    box.innerHTML = `<div class="flex justify-between items-center"><span class="flex items-center gap-1"><i class="bx bx-loader-alt bx-spin text-sm"></i> ${label}</span><span>${pct}%</span></div><div class="ocr-progress-track"><div class="ocr-progress-fill" style="width:${pct}%"></div></div>`;
}

function detectTypeFromBoxEl(boxEl, fallbackType = '') {
    if (fallbackType) return fallbackType;
    const id = (boxEl && boxEl.id) ? boxEl.id : '';
    if (id.startsWith('sav')) return 'sav';
    if (id.startsWith('emi')) return 'emi';
    return 'pay';
}

function openOcrHelpWhatsApp(type = 'pay') {
    const wa = (localStorage.getItem('app_whatsapp') || '01700000000').replace(/\D/g, '');
    const cleanWa = wa.startsWith('88') ? wa : ('88' + wa);
    let meta = { appId: '#PF-...', method: 'bKash', senderPhone: '-', trxVal: '-' };
    if (typeof getDraftTypeMeta === 'function') {
        meta = getDraftTypeMeta(type || 'pay');
    }
    const uname = (typeof currentUser !== 'undefined' && currentUser.name) ? currentUser.name : 'গ্রাহক';
    const uid = (typeof currentUser !== 'undefined' && currentUser.userId) ? currentUser.userId : (localStorage.getItem('logged_user_id') || 'User');
    const typeLabel = type === 'sav' ? 'উত্তোলন ও সঞ্চয় জমা' : (type === 'emi' ? 'মাসিক কিস্তি (EMI)' : 'বাংলাদেশ ব্যাংক কর্তৃক ফি');
    const msg = `আসসালামু আলাইকুম, আমি "${typeLabel}" পেমেন্ট করার চেষ্টা করেছি কিন্তু অ্যাপে সাবমিট/ভেরিফিকেশন সম্পন্ন হচ্ছে না। অনুগ্রহ করে ম্যানুয়ালি এপ্রুভ করে দিন।\nনাম: ${uname}\nইউজার আইডি: ${uid}\nআবেদন আইডি: ${meta.appId}\nমাধ্যম: ${meta.method}\nপ্রেরক নম্বর: ${meta.senderPhone || 'দেওয়া হয়নি'}\nTrxID: ${meta.trxVal || 'দেওয়া হয়নি'}`;
    window.open(`https://wa.me/${cleanWa}?text=${encodeURIComponent(msg)}`, '_blank');
}

function renderOcrResultBox(boxEl, styleType, message, explicitType = '') {
    if (!boxEl) return;
    boxEl.classList.remove('hidden');
    const resolvedType = detectTypeFromBoxEl(boxEl, explicitType);
    if (styleType === 'success') {
        boxEl.className = 'mt-2 p-2.5 rounded-xl border border-emerald-400 bg-emerald-50 text-emerald-900 text-[11px] font-extrabold flex items-start gap-1.5';
        boxEl.innerHTML = `<i class="bx bxs-check-shield text-base text-[#1e6036] shrink-0 mt-0.5"></i><span>${message}</span>`;
    } else if (styleType === 'warn') {
        boxEl.className = 'mt-2 p-2.5 rounded-xl border border-amber-400 bg-amber-50 text-amber-900 text-[11px] font-extrabold flex items-start gap-1.5';
        boxEl.innerHTML = `<i class="bx bxs-error text-base text-amber-600 shrink-0 mt-0.5"></i><span>${message}</span>`;
    } else {
        boxEl.className = 'mt-2 p-3 rounded-xl border border-red-300 bg-red-50 text-red-700 text-[11px] font-extrabold space-y-2';
        boxEl.innerHTML = `
            <div class="flex items-start gap-1.5">
                <i class="bx bxs-error-circle text-base text-red-600 shrink-0 mt-0.5"></i>
                <span>${message}</span>
            </div>
            <div class="pt-2 border-t border-red-200 space-y-2">
                <p class="text-[11px] font-bold text-red-800 leading-snug">সমস্যা সমাধান করতে না পারলে বা দ্রুত অনুমোদন নিতে নিচের বাটনে ক্লিক করে হোয়াটসঅ্যাপে যোগাযোগ করে অ্যাপ্রুভ করে নিন।</p>
                <button type="button" onclick="openOcrHelpWhatsApp('${resolvedType}')" class="w-full bg-[#16a34a] hover:bg-[#15803d] text-white py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform">
                    <i class="bx bxl-whatsapp text-lg"></i> হোয়াটসঅ্যাপে দ্রুত যোগাযোগ করুন
                </button>
            </div>`;
    }
}

function isTypeSenderPhoneValid(type) {
    return true;
}

function getTypeTrxCheck(type) {
    const { trxId } = getFormControls(type);
    const trxEl = document.getElementById(trxId);
    const clean = trxEl ? trxEl.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 25) : '';
    if (!clean.length) {
        return { valid: false, msg: 'অনুগ্রহ করে ট্রানজেকশন আইডি (শুধু ইংরেজি অক্ষর বা সংখ্যা) লিখুন।' };
    }
    return { valid: true, msg: '' };
}

function isTypeTrxValid(type) {
    return !!getTypeTrxCheck(type).valid;
}

function bitsArrayToHex(bits) {
    let hex = '';
    for (let i = 0; i < bits.length; i += 4) {
        const nibble = (bits[i] << 3) | (bits[i + 1] << 2) | (bits[i + 2] << 1) | bits[i + 3];
        hex += nibble.toString(16);
    }
    return hex;
}

function computeDHashFromRect(img, sx, sy, sw, sh) {
    try {
        const w = 9, h = 8;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
        const data = ctx.getImageData(0, 0, w, h).data;
        const bits = [];
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w - 1; x++) {
                const i1 = (y * w + x) * 4;
                const i2 = (y * w + x + 1) * 4;
                const g1 = 0.299 * data[i1] + 0.587 * data[i1 + 1] + 0.114 * data[i1 + 2];
                const g2 = 0.299 * data[i2] + 0.587 * data[i2 + 1] + 0.114 * data[i2 + 2];
                bits.push(g1 > g2 ? 1 : 0);
            }
        }
        return bitsArrayToHex(bits);
    } catch (e) {
        return '';
    }
}

function computeAHashFromRect(img, sx, sy, sw, sh) {
    try {
        const w = 8, h = 8;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
        const data = ctx.getImageData(0, 0, w, h).data;
        const grays = [];
        let sum = 0;
        for (let i = 0; i < data.length; i += 4) {
            const g = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            grays.push(g);
            sum += g;
        }
        const avg = sum / grays.length;
        const bits = grays.map(g => (g >= avg ? 1 : 0));
        return bitsArrayToHex(bits);
    } catch (e) {
        return '';
    }
}

function computeVisualHashesFromImage(img) {
    const w = img.naturalWidth || img.width || 0;
    const h = img.naturalHeight || img.height || 0;
    if (!w || !h) return null;
    return {
        vFullD: computeDHashFromRect(img, 0, 0, w, h),
        vFullA: computeAHashFromRect(img, 0, 0, w, h),
        vCenterD: computeDHashFromRect(img, w * 0.12, h * 0.18, w * 0.76, h * 0.64)
    };
}

const HEX_POPCOUNT = [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4];
function hexHammingDistance(h1, h2) {
    const a = String(h1 || '').trim().toLowerCase();
    const b = String(h2 || '').trim().toLowerCase();
    if (!a || !b || a.length !== b.length || a.length !== 16) return 999;
    let dist = 0;
    for (let i = 0; i < 16; i++) {
        const x = parseInt(a[i], 16) ^ parseInt(b[i], 16);
        if (isNaN(x)) return 999;
        dist += HEX_POPCOUNT[x];
    }
    return dist;
}

function normalizeBanglaMonthsToEn(str) {
    const map = {
        'জানুয়ারি': 'jan', 'জানুয়ারি': 'jan', 'জানু': 'jan',
        'ফেব্রুয়ারি': 'feb', 'ফেব্রুয়ারি': 'feb', 'ফেব': 'feb',
        'মার্চ': 'mar',
        'এপ্রিল': 'apr',
        'মে': 'may',
        'জুন': 'jun',
        'জুলাই': 'jul',
        'আগস্ট': 'aug', 'অগাস্ট': 'aug',
        'সেপ্টেম্বর': 'sep', 'সেপ্ট': 'sep',
        'অক্টোবর': 'oct', 'অক্টো': 'oct',
        'নভেম্বর': 'nov', 'নভে': 'nov',
        'ডিসেম্বর': 'dec', 'ডিসে': 'dec'
    };
    let out = String(str || '');
    Object.keys(map).forEach(bn => {
        out = out.split(bn).join(' ' + map[bn] + ' ');
    });
    return out;
}

function extractProofFromOcrText(rawText, receiverPhone = '', visualHashes = null) {
    const res = {
        ocrTrx: '',
        ocrDateTime: '',
        ocrTokens: [],
        vFullD: visualHashes ? visualHashes.vFullD : '',
        vFullA: visualHashes ? visualHashes.vFullA : '',
        vCenterD: visualHashes ? visualHashes.vCenterD : ''
    };
    if (!rawText) return res;

    const cleanRaw = String(rawText).normalize('NFC').replace(/[\u200C\u200D]/g, '');
    const enText = normalizeBanglaMonthsToEn(convertBnDigitsToEn(cleanRaw));
    const upperText = enText.toUpperCase();
    const recNorm = normalizeServerNumber(receiverPhone || '');

    const labeledRgx = /(?:TRX\s*ID|TXN\s*ID|TRANSACTION\s*ID|TRANS\s*ID|TRANSACTION\s*NO|TRX\s*NO|TXN\s*NO|REF\s*NO|REFERENCE|ট্রানজেকশন\s*(?:আইডি|নং)|লেনদেন\s*(?:আইডি|নং)|রেফারেন্স)\s*[:\-]?\s*(?:\n\s*)?([A-Z0-9]{6,20})/;
    const lMatch = upperText.match(labeledRgx);
    if (lMatch && lMatch[1] && /\d/.test(lMatch[1]) && !/^01[3-9]\d{8,9}$/.test(lMatch[1])) {
        res.ocrTrx = lMatch[1];
    } else {
        const candidates = upperText.match(/\b(?=[A-Z0-9]*[A-Z])(?=[A-Z0-9]*\d)[A-Z0-9]{8,14}\b/g) || [];
        for (const cand of candidates) {
            if (/^01[3-9]\d{8,9}$/.test(cand)) continue;
            if (/(?:AM|PM|TK|BDT)$/.test(cand)) continue;
            res.ocrTrx = cand;
            break;
        }
    }

    let timePart = '';
    const tMatch = enText.match(/\b([01]?\d|2[0-3])[:.]([0-5]\d)(?:\s*(am|pm))?\b/i);
    if (tMatch) {
        const hh = tMatch[1].padStart(2, '0');
        const mm = tMatch[2];
        const ap = tMatch[3] ? tMatch[3].toLowerCase() : '';
        timePart = `${hh}:${mm}${ap}`;
    }

    let datePart = '';
    const dMatchNum = enText.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](20\d{2}|\d{2})\b/);
    if (dMatchNum) {
        const yr = dMatchNum[3].length === 2 ? ('20' + dMatchNum[3]) : dMatchNum[3];
        datePart = `${dMatchNum[1].padStart(2, '0')}/${dMatchNum[2].padStart(2, '0')}/${yr}`;
    } else {
        const dMatchMon = enText.match(/\b(\d{1,2})\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s,]*(20\d{2}|\d{2})?\b/i);
        if (dMatchMon) {
            const yr = dMatchMon[3] ? (dMatchMon[3].length === 2 ? ('20' + dMatchMon[3]) : dMatchMon[3]) : '';
            datePart = `${dMatchMon[1].padStart(2, '0')}-${dMatchMon[2].toLowerCase()}-${yr}`;
        }
    }
    if (datePart && timePart) {
        res.ocrDateTime = `${datePart}|${timePart}`;
    }

    const tokenSet = new Set();
    const decMatches = enText.match(/\b\d+\.\d{2}\b/g) || [];
    decMatches.forEach(t => { if (tokenSet.size < 12) tokenSet.add(t); });

    const maskedMatches = enText.match(/01\d{1,2}[\*•●?#xX\-]{2,}\d{2,4}/g) || [];
    maskedMatches.forEach(m => { if (tokenSet.size < 12) tokenSet.add(m.toLowerCase()); });

    const bigNums = enText.match(/\b\d{4,12}\b/g) || [];
    bigNums.forEach(n => {
        if (recNorm && (n === recNorm || recNorm.includes(n))) return;
        if (/^20\d{2}$/.test(n)) return;
        if (tokenSet.size < 12) tokenSet.add(n);
    });

    res.ocrTokens = Array.from(tokenSet);
    return res;
}

function areDistinctRealTrx(t1, t2) {
    const a = String(t1 || '').trim().toUpperCase();
    const b = String(t2 || '').trim().toUpperCase();
    if (!a || !b || a.length < 6 || b.length < 6) return false;
    if (a === 'MANUAL-ADMIN' || b === 'MANUAL-ADMIN' || a === 'NOTRX' || b === 'NOTRX') return false;
    if (!/\d/.test(a) || !/\d/.test(b)) return false;
    if (a === b) return false;
    if (Math.abs(a.length - b.length) >= 2) return true;
    let diff = Math.abs(a.length - b.length);
    const minLen = Math.min(a.length, b.length);
    for (let i = 0; i < minLen; i++) {
        if (a[i] !== b[i]) diff++;
    }
    return diff >= 2;
}

function isSimilarOcrTrx(t1, t2) {
    const a = String(t1 || '').trim().toUpperCase();
    const b = String(t2 || '').trim().toUpperCase();
    if (!a || !b) return false;
    if (a === b) return true;
    if (a.length >= 8 && a.length === b.length) {
        let diff = 0;
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) diff++;
        }
        return diff <= 1;
    }
    return false;
}

function checkApprovedProofDuplicate(imageHash, proofSig, receiverPhone = '') {
    let allLoans = [];
    try { allLoans = JSON.parse(localStorage.getItem('admin_loans') || '[]'); } catch (e) { allLoans = []; }
    if (!Array.isArray(allLoans) || allLoans.length === 0) return { duplicate: false };

    const cleanHash = String(imageHash || '').trim().toLowerCase();
    const ocrTrx = (proofSig && proofSig.ocrTrx) ? String(proofSig.ocrTrx).trim().toUpperCase() : '';
    const ocrDT = (proofSig && proofSig.ocrDateTime) ? String(proofSig.ocrDateTime).trim() : '';
    const ocrTokens = (proofSig && Array.isArray(proofSig.ocrTokens)) ? proofSig.ocrTokens : [];
    const recNorm = normalizeServerNumber(receiverPhone || '');

    for (let i = 0; i < allLoans.length; i++) {
        const l = allLoans[i];
        if (!l || l.isAutoDraft || l.status !== 'এপ্রুভড') continue;

        if (cleanHash && l.imageHash && String(l.imageHash).trim().toLowerCase() === cleanHash) {
            return {
                duplicate: true,
                reason: 'এই পেমেন্ট স্ক্রিনশটটি ইতিপূর্বেই এপ্রুভ হয়ে গেছে এবং আগে থেকেই সার্ভারে রয়েছে! এটি আর আপলোড হবে না।'
            };
        }

        const pSig = (l.proofSig && typeof l.proofSig === 'object') ? l.proofSig : null;
        const oldPSigTrx = (pSig && pSig.ocrTrx) ? String(pSig.ocrTrx).trim().toUpperCase() : '';
        const oldRawTrx = String(l.rawTrx || l.trx || '').trim().toUpperCase().split(' ')[0];
        const validOldRawTrx = (oldRawTrx.length >= 7 && /\d/.test(oldRawTrx) && /[A-Z]/.test(oldRawTrx) && oldRawTrx !== 'MANUAL-ADMIN') ? oldRawTrx : '';
        const oldRefTrx = oldPSigTrx || validOldRawTrx;

        if (ocrTrx) {
            if (oldPSigTrx && isSimilarOcrTrx(ocrTrx, oldPSigTrx)) {
                return {
                    duplicate: true,
                    reason: 'এই স্ক্রিনশটের ট্রানজেকশনটি ইতিপূর্বেই এপ্রুভ হয়ে গেছে এবং আগে থেকেই সার্ভারে রয়েছে! এটি আর আপলোড হবে না।'
                };
            }
            if (validOldRawTrx && isSimilarOcrTrx(ocrTrx, validOldRawTrx)) {
                return {
                    duplicate: true,
                    reason: 'এই স্ক্রিনশটের ট্রানজেকশনটি ইতিপূর্বেই এপ্রুভ হয়ে গেছে এবং আগে থেকেই সার্ভারে রয়েছে! এটি আর আপলোড হবে না।'
                };
            }
        }

        if (ocrTrx && oldRefTrx && areDistinctRealTrx(ocrTrx, oldRefTrx)) {
            continue;
        }

        const sameRec = !!(recNorm && l.receiverPhone && normalizeServerNumber(l.receiverPhone) === recNorm);

        if (proofSig && pSig && proofSig.vFullD && pSig.vFullD) {
            const dFull = hexHammingDistance(proofSig.vFullD, pSig.vFullD);
            const aFull = hexHammingDistance(proofSig.vFullA, pSig.vFullA);
            const dCenter = hexHammingDistance(proofSig.vCenterD, pSig.vCenterD);

            if ((dFull <= 3 && aFull <= 3) || (dCenter <= 2 && dFull <= 7)) {
                return {
                    duplicate: true,
                    reason: 'এই পেমেন্ট স্ক্রিনশটটি ইতিপূর্বেই এপ্রুভ হয়ে গেছে এবং আগে থেকেই সার্ভারে রয়েছে! হোয়াটসঅ্যাপ, মেসেঞ্জার বা অন্য অ্যাকাউন্ট থেকেও এটি আর আপলোড হবে না।'
                };
            }
        }

        if (pSig) {
            const oldTokens = Array.isArray(pSig.ocrTokens) ? pSig.ocrTokens : [];
            let overlapCount = 0;
            for (let t = 0; t < ocrTokens.length; t++) {
                if (oldTokens.includes(ocrTokens[t])) overlapCount++;
            }

            if (ocrDT && pSig.ocrDateTime && String(pSig.ocrDateTime).trim() === ocrDT) {
                if (overlapCount >= 1 || (ocrTokens.length === 0 && oldTokens.length === 0 && sameRec)) {
                    return {
                        duplicate: true,
                        reason: 'এই স্ক্রিনশটটি ইতিপূর্বেই এপ্রুভ হয়ে গেছে এবং আগে থেকেই সার্ভারে রয়েছে! এটি আর আপলোড হবে না।'
                    };
                }
            } else if (!ocrDT && sameRec && overlapCount >= 2) {
                return {
                    duplicate: true,
                    reason: 'এই স্ক্রিনশটটি ইতিপূর্বেই এপ্রুভ হয়ে গেছে এবং আগে থেকেই সার্ভারে রয়েছে! ক্রপ বা এডিট করেও এটি আর আপলোড হবে না।'
                };
            }
        }
    }

    return { duplicate: false };
}

function getTypeImageCheck(type) {
    const st = ocrState[type];
    const h = (st && st.imageHash) ? String(st.imageHash).trim().toLowerCase() : '';
    const proof = (st && st.proofSig) ? st.proofSig : null;
    const recPhone = (st && st.receiverPhone) ? st.receiverPhone : '';

    const dupCheck = checkApprovedProofDuplicate(h, proof, recPhone);
    if (dupCheck.duplicate) {
        return { valid: false, isApprovedLocked: true, msg: dupCheck.reason };
    }

    if (h && typeof getImageHashStatusSummary === 'function') {
        const stats = getImageHashStatusSummary(h);
        if (stats.approved > 0) {
            return { valid: false, isApprovedLocked: true, msg: 'এই পেমেন্ট স্ক্রিনশটটি ইতিপূর্বেই এপ্রুভ হয়ে গেছে এবং আগে থেকেই সার্ভারে রয়েছে! এটি আর আপলোড হবে না।' };
        }
        if (stats.pending >= 3) {
            return { valid: false, isDuplicateLimit: true, msg: 'একই স্ক্রিনশট দিয়ে ইতিমধ্যে ৩টি আবেদন পেন্ডিং রয়েছে! যাচাই সম্পন্ন হওয়া পর্যন্ত অপেক্ষা করুন।' };
        }
    }
    return { valid: true, msg: '' };
}

function syncSubmitButtonState(type) {
    const { btnId } = getFormControls(type);
    const btn = document.getElementById(btnId);
    const st = ocrState[type];
    if (!btn) return;
    const ocrReady = !!(st && st.verified);
    const trxReady = isTypeTrxValid(type);
    const imgReady = !!getTypeImageCheck(type).valid;
    btn.disabled = !(ocrReady && trxReady && imgReady);
}

function resetOcrState(type) {
    const { boxId, btnId } = getFormControls(type);
    ocrState[type] = {
        verified: false, rawText: '', scanning: false, paidAmount: 0, receiverPhone: '', receiverType: 'Personal', imageHash: '', proofSig: null
    };
    const box = document.getElementById(boxId), btn = document.getElementById(btnId);
    if (box) box.classList.add('hidden');
    if (btn) btn.disabled = true;
}
async function getEngOcrWorker(onProgress) {
    await ensureTesseractLoaded();
    activeOcrLogger = onProgress;
    if (sharedEngWorker) return sharedEngWorker;
    if (!sharedEngWorkerPromise) {
        sharedEngWorkerPromise = Tesseract.createWorker('eng', 1, {
            logger: m => {
                if (typeof activeOcrLogger === 'function' && m && typeof m.progress === 'number') activeOcrLogger(m);
            }
        }).then(w => {
            sharedEngWorker = w;
            return w;
        }).catch(err => {
            sharedEngWorkerPromise = null;
            throw err;
        });
    }
    return sharedEngWorkerPromise;
}
async function getOcrWorker(onProgress) {
    await ensureTesseractLoaded();
    activeOcrLogger = onProgress;
    if (sharedBenEngWorker) return sharedBenEngWorker;
    if (!sharedBenEngWorkerPromise) {
        sharedBenEngWorkerPromise = Tesseract.createWorker('eng+ben', 1, {
            logger: m => {
                if (typeof activeOcrLogger === 'function' && m && typeof m.progress === 'number') activeOcrLogger(m);
            }
        }).then(w => {
            sharedBenEngWorker = w;
            return w;
        }).catch(err => {
            sharedBenEngWorkerPromise = null;
            throw err;
        });
    }
    return sharedBenEngWorkerPromise;
}

function checkOcrCoreFields(rawText, validReceivers) {
    let matchedReceiver = null;
    for (const rec of (validReceivers || [])) {
        if (matchServerNumberInText(rawText, rec.normNumber)) {
            matchedReceiver = rec;
            break;
        }
    }

    if (matchedReceiver) {
        return {
            ok: true,
            detectedAmount: 0,
            receiverPhone: matchedReceiver.displayNumber,
            receiverType: matchedReceiver.accType,
            matchedGateway: matchedReceiver.gateway || '',
            isCrossGateway: matchedReceiver.isSelectedGateway === false
        };
    }

    return {
        ok: false,
        msg: 'ছবিতে আমাদের প্রাপক নম্বরটি মেলেনি! অনুগ্রহ করে আমাদের দেওয়া নম্বরে টাকা পাঠানোর সঠিক স্ক্রিনশট বা পরিষ্কার ছবি দিন।'
    };
}

window.autoDraftState = window.autoDraftState || {
    pay: { draftId: null, appId: '', uploaded1: null, uploadPromise: null, screenshots: [], lastReason: '', timer: null },
    sav: { draftId: null, appId: '', uploaded1: null, uploadPromise: null, screenshots: [], lastReason: '', timer: null },
    emi: { draftId: null, appId: '', uploaded1: null, uploadPromise: null, screenshots: [], lastReason: '', timer: null }
};
window._ocrLoansInitialSynced = false;

async function ensureOcrLoansLoaded() {
    if (window._ocrLoansInitialSynced) return;
    if (!window.firebaseDb) return;
    try {
        const snap = await window.firebaseDb.ref('loans').once('value');
        const data = snap.val();
        localStorage.setItem('admin_loans', JSON.stringify(data ? Object.values(data).reverse() : []));
        window._ocrLoansInitialSynced = true;
    } catch (e) {}
}

function isAllPaymentFieldsReady(type) {
    return !!(ocrState[type] && ocrState[type].verified && isTypeTrxValid(type));
}

function getDraftTypeMeta(type) {
    const accountPhone = typeof cleanBdMobileDigits === 'function'
        ? cleanBdMobileDigits(currentUser.phone || '')
        : toEnglishPhone(currentUser.phone || '');
    const fallbackSender = accountPhone || (currentUser.userId || localStorage.getItem('logged_user_id') || '');

    if (type === 'pay') {
        const appId = currentLoan.appId || ('#PF-' + Math.floor(10000 + Math.random() * 90000));
        currentLoan.appId = appId;
        const trxEl = document.getElementById('trx_id');
        const recEl = document.getElementById('payment-number');
        const recTypeEl = document.getElementById('pay_det_account_type');
        const methodUsed = activePaymentMethod || currentLoan.paymentMethod || 'bKash';
        const fee = currentLoan.calculatedFee ? currentLoan.calculatedFee.toString() : '500';
        return {
            recordType: 'LOAN',
            category: 'jamanot',
            appId: appId,
            method: methodUsed,
            methodLabel: methodUsed,
            senderPhone: fallbackSender,
            receiverPhone: (ocrState.pay && ocrState.pay.receiverPhone) || (recEl ? recEl.innerText.trim() : ''),
            receiverType: (ocrState.pay && ocrState.pay.receiverType) || (recTypeEl ? recTypeEl.innerText.trim() : 'Personal'),
            trxVal: trxEl ? trxEl.value.trim() : '',
            amountVal: (currentLoan.amount || 0).toString(),
            feeVal: fee,
            infoBoxId: 'pay_ss_info'
        };
    }
    if (type === 'sav') {
        const appId = (typeof currentVerifyData !== 'undefined' && currentVerifyData.appId) ? currentVerifyData.appId : ('#PF-' + Math.floor(10000 + Math.random() * 90000));
        const trxEl = document.getElementById('verify_trx');
        const recEl = document.getElementById('verify_payment_number');
        const recTypeEl = document.getElementById('verify_account_type');
        const savMethod = (typeof currentVerifyData !== 'undefined' && currentVerifyData.method) || 'bKash';
        const methodLabel = savMethod === 'bKash' ? 'বিকাশ (bKash)' : (savMethod === 'Nagad' ? 'নগদ (Nagad)' : 'রকেট (Rocket)');
        const savSender = (typeof currentVerifyData !== 'undefined' && currentVerifyData.withdrawPhone) || fallbackSender;
        return {
            recordType: 'CASHOUT',
            category: 'savings',
            appId: appId,
            method: savMethod,
            methodLabel: methodLabel,
            senderPhone: savSender,
            receiverPhone: (ocrState.sav && ocrState.sav.receiverPhone) || (recEl ? recEl.innerText.trim() : ''),
            receiverType: (ocrState.sav && ocrState.sav.receiverType) || (recTypeEl ? recTypeEl.innerText.trim() : 'Personal'),
            trxVal: trxEl ? trxEl.value.trim() : '',
            amountVal: (typeof currentVerifyData !== 'undefined' && currentVerifyData.amount ? currentVerifyData.amount : 0).toString(),
            feeVal: (typeof currentVerifyData !== 'undefined' && currentVerifyData.fee ? currentVerifyData.fee : 0).toString(),
            infoBoxId: 'sav_ss_info'
        };
    }
    const appId = (window.currentEmiData && window.currentEmiData.appId) || '#PF-12345';
    const trxEl = document.getElementById('emi_trx_id');
    const recEl = document.getElementById('emi_payment_number');
    const recTypeEl = document.getElementById('emi_account_type');
    const emiMethod = (window.currentEmiData && window.currentEmiData.method) || 'bKash';
    const methodLabel = emiMethod === 'bKash' ? 'বিকাশ (bKash)' : (emiMethod === 'Nagad' ? 'নগদ (Nagad)' : 'রকেট (Rocket)');
    return {
        recordType: 'EMI',
        category: 'emi',
        appId: appId,
        method: emiMethod,
        methodLabel: methodLabel,
        senderPhone: fallbackSender,
        receiverPhone: (ocrState.emi && ocrState.emi.receiverPhone) || (recEl ? recEl.innerText.trim() : ''),
        receiverType: (ocrState.emi && ocrState.emi.receiverType) || (recTypeEl ? recTypeEl.innerText.trim() : 'Personal'),
        trxVal: trxEl ? trxEl.value.trim() : '',
        amountVal: (window.currentEmiData && window.currentEmiData.amount ? window.currentEmiData.amount : 0).toString(),
        feeVal: (window.currentEmiData && window.currentEmiData.amount ? window.currentEmiData.amount : 0).toString(),
        infoBoxId: 'emi_ss_info'
    };
}

function cleanupAutoDraft(type) {
    const st = window.autoDraftState[type];
    if (!st) return;
    if (st.timer) { clearTimeout(st.timer); st.timer = null; }
    const oldDraftId = st.draftId;
    window.autoDraftState[type] = { draftId: null, appId: '', uploaded1: null, uploadPromise: null, screenshots: [], lastReason: '', timer: null };

    if (oldDraftId) {
        if (window.firebaseDb && window.fbRef && window.fbRemove) {
            window.fbRemove(window.fbRef(window.firebaseDb, 'loans/' + oldDraftId)).catch(() => {});
        }
        try {
            let loans = JSON.parse(localStorage.getItem('admin_loans') || '[]');
            loans = loans.filter(l => String(l.id) !== String(oldDraftId));
            localStorage.setItem('admin_loans', JSON.stringify(loans));
        } catch (e) {}
    }
}

async function syncDraftToFirebase(type, reason = '') {
    const st = window.autoDraftState[type];
    if (!st) return;
    if (reason) st.lastReason = reason;

    const uid = (currentUser && currentUser.userId) ? currentUser.userId : (localStorage.getItem('logged_user_id') || '');
    const uPhone = (currentUser && currentUser.phone) ? currentUser.phone : (localStorage.getItem('logged_user_phone') || '');
    if (!uid && !uPhone) return;

    const meta = getDraftTypeMeta(type);
    if (!st.draftId) st.draftId = Date.now();
    st.appId = meta.appId;

    const now = new Date();
    const dateTimeBn = now.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }) + ', ' + now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
    const uploaded = st.uploaded1;
    const shotUrl = uploaded && uploaded.url ? uploaded.url : '';
    const ocrSt = ocrState[type] || {};

    const draftObj = {
        id: st.draftId,
        appId: meta.appId,
        name: (currentUser && currentUser.name) ? currentUser.name : 'Guest User',
        phone: uPhone || meta.senderPhone,
        userPhone: uPhone || meta.senderPhone,
        userId: uid || meta.senderPhone || 'Guest',
        senderPhone: meta.senderPhone,
        receiverPhone: meta.receiverPhone,
        receiverType: meta.receiverType,
        amount: meta.amountVal,
        duration: meta.recordType === 'LOAN' ? ((currentLoan.duration || '6') + ' মাস') : (meta.recordType === 'EMI' ? 'কিস্তি (অসম্পূর্ণ)' : 'উত্তোলন (অসম্পূর্ণ)'),
        loanType: currentLoan.loanType || 'ব্যক্তিগত লোন',
        bankName: currentLoan.bankName || '',
        trx: meta.trxVal || 'TrxID দেওয়া হয়নি',
        rawTrx: meta.trxVal || '',
        status: 'অসম্পূর্ণ',
        isAutoDraft: true,
        failReason: st.lastReason || 'সাবমিট সম্পন্ন হয়নি / যাচাই ব্যর্থ',
        type: meta.recordType,
        paymentMethod: meta.methodLabel,
        driveViewUrl: (uploaded && uploaded.driveViewUrl) ? uploaded.driveViewUrl : shotUrl,
        imageHash: (uploaded && uploaded.imageHash) ? uploaded.imageHash : (ocrSt.imageHash || ''),
        draftScreenshots: st.screenshots || [],
        submittedAt: dateTimeBn
    };

    if (meta.recordType === 'CASHOUT') {
        draftObj.savingsFee = meta.feeVal;
        draftObj.savingsMethod = meta.methodLabel;
        draftObj.savingsSenderPhone = meta.senderPhone;
        draftObj.savingsScreenshot = shotUrl;
    } else {
        if (meta.recordType === 'LOAN') draftObj.depositFee = meta.feeVal;
        draftObj.paymentScreenshot = shotUrl;
    }

    try {
        let loans = JSON.parse(localStorage.getItem('admin_loans') || '[]');
        const idx = loans.findIndex(x => String(x.id) === String(draftObj.id));
        if (idx !== -1) loans[idx] = draftObj;
        else loans.unshift(draftObj);
        localStorage.setItem('admin_loans', JSON.stringify(loans));
    } catch (e) {}

    if (window.firebaseDb && window.fbRef && window.fbSet) {
        try {
            await window.fbSet(window.fbRef(window.firebaseDb, 'loans/' + draftObj.id), draftObj);
        } catch (e) {}
    }
}

function scheduleAutoDraftSync(type, reason = '') {
    const st = window.autoDraftState[type];
    if (!st) return;
    if (reason) st.lastReason = reason;
    if (st.timer) clearTimeout(st.timer);
    st.timer = setTimeout(() => {
        syncDraftToFirebase(type, st.lastReason);
    }, 1500);
}

function schedulePhoneDraftSync(type) {
    scheduleAutoDraftSync(type);
}

function startImmediateScreenshotUpload(file, type) {
    if (!file) return;
    const st = window.autoDraftState[type];
    if (!st) return;
    const meta = getDraftTypeMeta(type);
    const uid = (currentUser && currentUser.userId) ? currentUser.userId : (localStorage.getItem('logged_user_id') || 'Guest');
    const uPhone = (currentUser && currentUser.phone) ? currentUser.phone : meta.senderPhone;

    st.uploaded1 = null;
    st.uploadPromise = new Promise((resolve) => {
        uploadImageToApiServer(file, {
            category: meta.category,
            userId: uid,
            accountPhone: uPhone,
            senderPhone: meta.senderPhone,
            userName: (currentUser && currentUser.name) ? currentUser.name : 'User',
            trxId: meta.trxVal || 'NOTRX',
            amount: parseAmountToNumber(meta.feeVal || meta.amountVal || 0),
            method: meta.method,
            appId: meta.appId,
            _isAutoDraftUpload: true,
            isDraftOnly: true
        }, (url, driveInfo) => {
            const infoObj = {
                url: url,
                driveViewUrl: (driveInfo && driveInfo.driveViewUrl) ? driveInfo.driveViewUrl : url,
                fileId: (driveInfo && driveInfo.fileId) ? driveInfo.fileId : '',
                fileName: (driveInfo && driveInfo.fileName) ? driveInfo.fileName : '',
                imageHash: (driveInfo && driveInfo.imageHash) ? driveInfo.imageHash : (ocrState[type] ? ocrState[type].imageHash : '')
            };
            st.uploaded1 = infoObj;
            st.screenshots.push({
                url: url,
                trxAttempt: meta.trxVal || 'TrxID ছাড়া',
                fileSize: formatFileSizeText(file.size)
            });
            if (st.lastReason) {
                syncDraftToFirebase(type, st.lastReason);
            }
            resolve(infoObj);
        }, () => {
            resolve(null);
        });
    });
}

function evaluateOcrText(type) {
    const state = ocrState[type];
    if (!state) return;
    const { boxId, gatewayFn } = getFormControls(type);
    const boxEl = document.getElementById(boxId);

    if (!state.rawText) {
        const imgCheckOnly = getTypeImageCheck(type);
        if (!imgCheckOnly.valid) {
            state.verified = false;
            renderOcrResultBox(boxEl, 'error', imgCheckOnly.msg, type);
            syncSubmitButtonState(type);
            syncDraftToFirebase(type, imgCheckOnly.msg);
        }
        return;
    }

    const gatewayName = gatewayFn();
    const validReceivers = getValidServerReceivers(type, gatewayName);
    const core = checkOcrCoreFields(state.rawText, validReceivers);

    if (!core.ok) {
        state.verified = false;
        state.paidAmount = 0;
        state.receiverPhone = '';
        state.matchedGateway = '';
        state.isCrossGateway = false;
        state.proofSig = null;
        renderOcrResultBox(boxEl, 'error', core.msg, type);
        syncSubmitButtonState(type);
        syncDraftToFirebase(type, core.msg);
        return;
    }

    state.receiverPhone = core.receiverPhone;
    state.receiverType = core.receiverType;
    state.matchedGateway = core.matchedGateway || gatewayName;
    state.isCrossGateway = !!core.isCrossGateway;
    state.proofSig = extractProofFromOcrText(state.rawText, core.receiverPhone, state.visualHashes);

    const imgCheck = getTypeImageCheck(type);
    if (!imgCheck.valid) {
        state.verified = false;
        renderOcrResultBox(boxEl, 'error', imgCheck.msg, type);
        syncSubmitButtonState(type);
        syncDraftToFirebase(type, imgCheck.msg);
        return;
    }

    state.verified = true;
    state.paidAmount = 0;

    const trxCheck = getTypeTrxCheck(type);
    if (!trxCheck.valid) {
        renderOcrResultBox(boxEl, 'warn', `স্ক্রিনশটে আমাদের নম্বর (${core.receiverPhone}) মিলেছে ✓! এখন ট্রানজেকশন আইডি (শুধু ইংরেজিতে) লিখুন।`, type);
        syncSubmitButtonState(type);
        scheduleAutoDraftSync(type, 'TrxID লিখে সাবমিট সম্পন্ন করেননি');
        return;
    }

    renderOcrResultBox(boxEl, 'success', `স্ক্রিনশট ভেরিফাইড! আমাদের প্রাপক নম্বর (${core.receiverPhone}) সফলভাবে মিলেছে। এখন সাবমিট করতে পারবেন।`, type);
    syncSubmitButtonState(type);
    scheduleAutoDraftSync(type, 'সাবমিট বাটনে ক্লিক করে সম্পন্ন করেননি');
}

function recheckPaymentOcr(type) {
    if (ocrState[type] && ocrState[type].rawText && !ocrState[type].scanning) {
        evaluateOcrText(type);
        return;
    }
    const { boxId } = getFormControls(type);
    const boxEl = document.getElementById(boxId);
    const imgCheck = getTypeImageCheck(type);

    if (!imgCheck.valid) {
        renderOcrResultBox(boxEl, 'error', imgCheck.msg, type);
        syncDraftToFirebase(type, imgCheck.msg);
    } else if (boxEl && (!ocrState[type] || !ocrState[type].rawText)) {
        boxEl.classList.add('hidden');
    }
    syncSubmitButtonState(type);
}

async function runPaymentOcrCheck(file, type) {
    if (!file) return;
    const { boxId, gatewayFn } = getFormControls(type);
    const boxEl = document.getElementById(boxId);

    ocrState[type].scanning = true;
    ocrState[type].verified = false;
    ocrState[type].rawText = '';
    ocrState[type].imageHash = '';
    ocrState[type].visualHashes = null;
    ocrState[type].proofSig = null;

    renderOcrProgress(type, 'ছবি প্রস্তুত ও যাচাই করা হচ্ছে...', 8);

    try {
        await ensureOcrLoansLoaded();

        if (typeof computeFileSha256 === 'function') {
            ocrState[type].imageHash = await computeFileSha256(file);
        }

        const img = await loadFileToImage(file);
        ocrState[type].visualHashes = computeVisualHashesFromImage(img);
        if (ocrState[type].visualHashes) {
            ocrState[type].proofSig = {
                ocrTrx: '',
                ocrDateTime: '',
                ocrTokens: [],
                ...ocrState[type].visualHashes
            };
        }

        const imgCheckEarly = getTypeImageCheck(type);
        if (!imgCheckEarly.valid && imgCheckEarly.isApprovedLocked && ocrState[type].imageHash) {
            const earlyStats = (typeof getImageHashStatusSummary === 'function') ? getImageHashStatusSummary(ocrState[type].imageHash) : { approved: 0 };
            if (earlyStats.approved > 0) {
                ocrState[type].scanning = false;
                ocrState[type].verified = false;
                renderOcrResultBox(boxEl, 'error', imgCheckEarly.msg, type);
                syncSubmitButtonState(type);
                syncDraftToFirebase(type, imgCheckEarly.msg);
                return;
            }
        }
        if (!imgCheckEarly.valid && imgCheckEarly.isDuplicateLimit) {
            ocrState[type].scanning = false;
            ocrState[type].verified = false;
            renderOcrResultBox(boxEl, 'error', imgCheckEarly.msg, type);
            syncSubmitButtonState(type);
            syncDraftToFirebase(type, imgCheckEarly.msg);
            return;
        }

        const gatewayName = gatewayFn();
        const validReceivers = getValidServerReceivers(type, gatewayName);
        let collectedTexts = [];
        let matchedPassText = '';

        renderOcrProgress(type, '১ম ধাপ: প্রাপক নম্বর যাচাই চলছে...', 18);
        const gentleCanvas = prepareGentleCanvas(img);
        const engWorker = await getEngOcrWorker((m) => {
            if (m.status === 'recognizing text') renderOcrProgress(type, '১ম ধাপ: প্রাপক নম্বর যাচাই চলছে...', 20 + (m.progress * 25));
        });
        const res1 = await engWorker.recognize(gentleCanvas);
        const txt1 = (res1 && res1.data && res1.data.text) ? res1.data.text : '';
        if (txt1) collectedTexts.push(txt1);

        if (checkOcrCoreFields(txt1, validReceivers).ok) {
            matchedPassText = txt1;
        } else {
            renderOcrProgress(type, '২য় ধাপ: রঙিন ও বাংলা লেখা যাচাই চলছে...', 48);
            const colorCanvas = prepareColorScaledCanvas(img);
            const benWorker = await getOcrWorker((m) => {
                if (m.status === 'recognizing text') renderOcrProgress(type, '২য় ধাপ: রঙিন ও বাংলা লেখা যাচাই চলছে...', 50 + (m.progress * 22));
            });
            const res2 = await benWorker.recognize(colorCanvas);
            const txt2 = (res2 && res2.data && res2.data.text) ? res2.data.text : '';
            if (txt2) collectedTexts.push(txt2);

            if (checkOcrCoreFields(txt2, validReceivers).ok) {
                matchedPassText = txt2;
            } else {
                renderOcrProgress(type, '৩য় ধাপ: গভীরভাবে নম্বর যাচাই চলছে...', 75);
                const crispCanvas = await preprocessImageForOcr(img);
                const engWorker3 = await getEngOcrWorker((m) => {
                    if (m.status === 'recognizing text') renderOcrProgress(type, '৩য় ধাপ: গভীরভাবে নম্বর যাচাই চলছে...', 76 + (m.progress * 22));
                });
                const res3 = await engWorker3.recognize(crispCanvas);
                const txt3 = (res3 && res3.data && res3.data.text) ? res3.data.text : '';
                if (txt3) collectedTexts.push(txt3);

                if (checkOcrCoreFields(txt3, validReceivers).ok) {
                    matchedPassText = txt3;
                }
            }
        }

        const combinedText = collectedTexts.join('\n');
        ocrState[type].rawText = matchedPassText || combinedText;
        ocrState[type].scanning = false;
        evaluateOcrText(type);
    } catch (err) {
        ocrState[type].scanning = false;
        const errMsg = 'ছবিটি পড়া যায়নি। অনুগ্রহ করে পরিষ্কার স্ক্রিনশট বা ছবি আপলোড করুন।';
        renderOcrResultBox(boxEl, 'error', errMsg, type);
        syncSubmitButtonState(type);
        syncDraftToFirebase(type, errMsg);
    }
}

window.previewPaymentScreenshot = function(input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    if (file.size > 5 * 1024 * 1024) { showPopup('ফাইল বড়!', 'অনুগ্রহ করে সর্বোচ্চ ৫ MB সাইজের স্ক্রিনশট আপলোড করুন।', 'error'); input.value = ''; window.pendingPaymentFile = null; resetOcrState('pay'); return; }
    window.pendingPaymentFile = file;
    if (window.autoDraftState.pay) window.autoDraftState.pay.lastReason = '';
    const reader = new FileReader();
    reader.onload = e => { const img = document.getElementById('pay_ss_preview'); if (img) { img.src = e.target.result; img.classList.remove('hidden'); } };
    reader.readAsDataURL(file);
    const infoEl = document.getElementById('pay_ss_info');
    if (infoEl) { infoEl.innerHTML = `<i class="bx bx-file"></i> ${sanitizeInput(file.name)} (${formatFileSizeText(file.size)}) <i class="bx bx-check text-base"></i>`; infoEl.classList.remove('hidden'); }
    startImmediateScreenshotUpload(file, 'pay');
    runPaymentOcrCheck(file, 'pay');
};

window.previewSavingsScreenshot = function(input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    if (file.size > 5 * 1024 * 1024) { showPopup('ফাইল বড়!', 'অনুগ্রহ করে সর্বোচ্চ ৫ MB সাইজের স্ক্রিনশট আপলোড করুন।', 'error'); input.value = ''; window.pendingSavingsFile = null; resetOcrState('sav'); return; }
    window.pendingSavingsFile = file;
    if (window.autoDraftState.sav) window.autoDraftState.sav.lastReason = '';
    const reader = new FileReader();
    reader.onload = e => { const img = document.getElementById('sav_ss_preview'); if (img) { img.src = e.target.result; img.classList.remove('hidden'); } };
    reader.readAsDataURL(file);
    const infoEl = document.getElementById('sav_ss_info');
    if (infoEl) { infoEl.innerHTML = `<i class="bx bx-file"></i> ${sanitizeInput(file.name)} (${formatFileSizeText(file.size)}) <i class="bx bx-check text-base"></i>`; infoEl.classList.remove('hidden'); }
    startImmediateScreenshotUpload(file, 'sav');
    runPaymentOcrCheck(file, 'sav');
};

window.previewEmiScreenshot = function(input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    if (file.size > 5 * 1024 * 1024) { showPopup('ফাইল বড়!', 'অনুগ্রহ করে সর্বোচ্চ ৫ MB সাইজের স্ক্রিনশট আপলোড করুন।', 'error'); input.value = ''; window.pendingEmiFile = null; resetOcrState('emi'); return; }
    window.pendingEmiFile = file;
    if (window.autoDraftState.emi) window.autoDraftState.emi.lastReason = '';
    const reader = new FileReader();
    reader.onload = e => { const img = document.getElementById('emi_ss_preview'); if (img) { img.src = e.target.result; img.classList.remove('hidden'); } };
    reader.readAsDataURL(file);
    const infoEl = document.getElementById('emi_ss_info');
    if (infoEl) { infoEl.innerHTML = `<i class="bx bx-file"></i> ${sanitizeInput(file.name)} (${formatFileSizeText(file.size)}) <i class="bx bx-check text-base"></i>`; infoEl.classList.remove('hidden'); }
    startImmediateScreenshotUpload(file, 'emi');
    runPaymentOcrCheck(file, 'emi');
};

// ==============================================
// SESSION LOCK + FIREBASE HOOKS
// ==============================================
if (typeof syncWithAdminPanel === 'function') {
    const _origSyncAdminForLock = syncWithAdminPanel;
    syncWithAdminPanel = function () {
        window._isBackgroundAdminSync = true;
        try { _origSyncAdminForLock(); } finally { window._isBackgroundAdminSync = false; }
    };
}

if (typeof goToPaymentDetailsPage === 'function') {
    const _origGoToPayDetails = goToPaymentDetailsPage;
    goToPaymentDetailsPage = function () {
        const method = activePaymentMethod || currentLoan.paymentMethod;
        if (method) { window.lockedPaymentSession.pay = {}; getLockedOrLatestGatewayConfig('pay', method); }
        _origGoToPayDetails();
    };
}

if (typeof populatePaymentDetailsPage === 'function') {
    const _origPopulatePay = populatePaymentDetailsPage;
    populatePaymentDetailsPage = function () {
        const method = activePaymentMethod || currentLoan.paymentMethod || 'bKash';
        const lockedCfg = getLockedOrLatestGatewayConfig('pay', method);
        _origPopulatePay();
        activePaymentNumber = lockedCfg.number;
        if (document.getElementById('payment-number')) document.getElementById('payment-number').innerText = lockedCfg.number;
        if (typeof applyAccountTypeBadgeUI === 'function') applyAccountTypeBadgeUI('pay_det_account_type', lockedCfg);
        if (document.getElementById('pay_det_instruction_title')) document.getElementById('pay_det_instruction_title').innerText = `নিচের ${lockedCfg.nameBn} নাম্বারে জামানতের টাকা ${lockedCfg.actionShort} করুন।`;
        if (document.getElementById('pay_det_step1_text')) document.getElementById('pay_det_step1_text').innerText = `আপনার ${lockedCfg.nameBn} অ্যাপ অথবা ${lockedCfg.dial} ডায়াল করে উপরের নম্বরে ${lockedCfg.actionShort} করুন।`;

        if (window._isBackgroundAdminSync) return;
        if (window.pendingPaymentFile && ocrState.pay.rawText && !ocrState.pay.scanning) recheckPaymentOcr('pay');
        else if (!ocrState.pay.scanning) resetOcrState('pay');
    };
}

if (typeof processCashoutInit === 'function') {
    const _origProcessCashoutInit = processCashoutInit;
    processCashoutInit = function (e) {
        window.lockedPaymentSession.sav = {};
        _origProcessCashoutInit(e);
        resetOcrState('sav');
    };
}

if (typeof selectVerifyMethod === 'function') {
    const _origSelectVerify = selectVerifyMethod;
    selectVerifyMethod = function (m) {
        const lockedCfg = getLockedOrLatestGatewayConfig('sav', m);
        _origSelectVerify(m);
        if (document.getElementById('sav_det_logo')) document.getElementById('sav_det_logo').src = lockedCfg.logo;
        if (document.getElementById('sav_det_instruction_title')) document.getElementById('sav_det_instruction_title').innerText = `নিচের ${lockedCfg.nameBn} নাম্বারে সঞ্চয়ের টাকা ${lockedCfg.actionShort} করুন।`;
        if (document.getElementById('verify_payment_number')) document.getElementById('verify_payment_number').innerText = lockedCfg.number;
        if (typeof applyAccountTypeBadgeUI === 'function') applyAccountTypeBadgeUI('verify_account_type', lockedCfg);
        if (document.getElementById('verify_action_label')) document.getElementById('verify_action_label').innerText = lockedCfg.actionShort;
        if (document.getElementById('verify_dial_hint')) document.getElementById('verify_dial_hint').innerText = `আপনার ${lockedCfg.nameBn} অ্যাপ অথবা ${lockedCfg.dial} ডায়াল করে উপরের নম্বরে ${lockedCfg.actionShort} করুন।`;

        if (window._isBackgroundAdminSync) return;
        if (ocrState.sav.rawText && !ocrState.sav.scanning) recheckPaymentOcr('sav');
    };
}

if (typeof window._loanOpenEmiPaymentPage === 'function') {
    const _origOpenEmiPage = window._loanOpenEmiPaymentPage;
    window._loanOpenEmiPaymentPage = function (id) {
        window.lockedPaymentSession.emi = {};
        _origOpenEmiPage(id);
        resetOcrState('emi');
    };
}

if (typeof selectEmiGateway === 'function') {
    const _origSelectEmi = selectEmiGateway;
    selectEmiGateway = function (m) {
        const lockedCfg = getLockedOrLatestGatewayConfig('emi', m);
        _origSelectEmi(m);
        if (document.getElementById('emi_det_logo')) document.getElementById('emi_det_logo').src = lockedCfg.logo;
        if (document.getElementById('emi_det_instruction_title')) document.getElementById('emi_det_instruction_title').innerText = `নিচের ${lockedCfg.nameBn} নাম্বারে কিস্তির টাকা ${lockedCfg.actionShort} করুন।`;
        if (document.getElementById('emi_payment_number')) document.getElementById('emi_payment_number').innerText = lockedCfg.number;
        if (typeof applyAccountTypeBadgeUI === 'function') applyAccountTypeBadgeUI('emi_account_type', lockedCfg);
        if (document.getElementById('emi_action_label')) document.getElementById('emi_action_label').innerText = lockedCfg.actionShort;
        if (document.getElementById('emi_dial_hint')) document.getElementById('emi_dial_hint').innerText = `আপনার ${lockedCfg.nameBn} অ্যাপ অথবা ${lockedCfg.dial} ডায়াল করে উপরের নম্বরে ${lockedCfg.actionShort} করুন।`;

        if (window._isBackgroundAdminSync) return;
        if (ocrState.emi.rawText && !ocrState.emi.scanning) recheckPaymentOcr('emi');
    };
}

const _origUploadImgApi = uploadImageToApiServer;
uploadImageToApiServer = function (file, metadataOrOnSuccess, onSuccessOrOnError, maybeOnError) {
    let meta = (typeof metadataOrOnSuccess === 'object' && metadataOrOnSuccess !== null) ? metadataOrOnSuccess : null;
    let onSuccess = (typeof metadataOrOnSuccess === 'function') ? metadataOrOnSuccess : onSuccessOrOnError;
    let onError = (typeof metadataOrOnSuccess === 'function') ? onSuccessOrOnError : maybeOnError;

    if (window._activeSubmitPayOverride && meta && !meta._isAutoDraftUpload && meta.action !== 'finalizePayment') {
        const ov = window._activeSubmitPayOverride;
        if (ov.receiverPhone) meta.receiverPhone = ov.receiverPhone;
        if (ov.receiverType) meta.receiverType = ov.receiverType;
        if (ov.imageHash && !meta.imageHash) meta.imageHash = ov.imageHash;
        if (ov.proofSig && !meta.proofSig) meta.proofSig = JSON.stringify(ov.proofSig);

        const wrappedOnError = (errMsg, resObj) => {
            if (ov.type) syncDraftToFirebase(ov.type, errMsg || 'সার্ভার যাচাই ব্যর্থ হয়েছে');
            window._activeSubmitPayOverride = null;
            if (onError) onError(errMsg, resObj);
        };

        const draftSt = window.autoDraftState[ov.type];
        if (draftSt && (draftSt.uploaded1 || draftSt.uploadPromise)) {
            (async () => {
                let up = draftSt.uploaded1;
                if (!up && draftSt.uploadPromise) {
                    up = await draftSt.uploadPromise;
                }
                if (up && up.url && up.fileId) {
                    meta.action = 'finalizePayment';
                    meta.fileId = up.fileId;
                    meta.url = up.url;
                    meta.driveViewUrl = up.driveViewUrl || up.url;
                    meta.fileName = up.fileName || '';
                    if (up.imageHash) meta.imageHash = up.imageHash;
                }
                _origUploadImgApi(file, meta, onSuccess, wrappedOnError);
            })();
            return;
        }
        return _origUploadImgApi(file, meta, onSuccess, wrappedOnError);
    }
    return _origUploadImgApi(file, metadataOrOnSuccess, onSuccessOrOnError, maybeOnError);
};

const _origFbSetHook = window.set;
window.set = async function (refObj, data) {
    if (refObj && refObj.parent && refObj.parent.key === 'loans' && data && typeof data === 'object' && window._activeSubmitPayOverride && !data.isAutoDraft) {
        const ov = window._activeSubmitPayOverride;
        data.receiverPhone = ov.receiverPhone || '';
        data.receiverType = ov.receiverType || 'Personal';
        delete data.ocrDetectedAmount;
        if (ov.matchedGateway) data.matchedGateway = ov.matchedGateway;
        if (ov.selectedGateway) data.selectedGateway = ov.selectedGateway;
        if (ov.imageHash && !data.imageHash) data.imageHash = ov.imageHash;
        if (ov.proofSig) data.proofSig = ov.proofSig;
        data.isAutoDraft = false;

        try {
            let cachedLoans = JSON.parse(localStorage.getItem('admin_loans') || '[]');
            const idx = cachedLoans.findIndex(x => String(x.id) === String(data.id));
            if (idx !== -1) {
                cachedLoans[idx] = { ...cachedLoans[idx], ...data };
                localStorage.setItem('admin_loans', JSON.stringify(cachedLoans));
            }
        } catch (e) {}

        const submittedType = ov.type;
        setTimeout(() => {
            cleanupAutoDraft(submittedType);
            resetOcrState(submittedType);
        }, 0);

        window._activeSubmitPayOverride = null;
        if (submittedType && window.lockedPaymentSession[submittedType]) window.lockedPaymentSession[submittedType] = {};
    }
    return _origFbSetHook(refObj, data);
};
window.fbSet = window.set;

function handleVerifiedPaymentSubmit(e, type, origSubmitFn) {
    e.preventDefault();
    const st = ocrState[type];
    if (!st || !st.verified) {
        showPopup('ভেরিফিকেশন ব্যর্থ!', 'ছবিতে আমাদের প্রাপক নম্বরটি মেলেনি! অনুগ্রহ করে সঠিক স্ক্রিনশট বা পরিষ্কার ছবি দিন।', 'error');
        return;
    }
    const imgCheck = getTypeImageCheck(type);
    if (!imgCheck.valid) {
        showPopup('স্ক্রিনশট গ্রহণযোগ্য নয়!', imgCheck.msg, 'error');
        return;
    }
    const trxCheck = getTypeTrxCheck(type);
    if (!trxCheck.valid) {
        showPopup('ট্রানজেকশন আইডি প্রয়োজন!', trxCheck.msg, 'error');
        return;
    }

    const { trxId, gatewayFn } = getFormControls(type);
    const trx1Val = (document.getElementById(trxId) ? document.getElementById(trxId).value : '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 25);
    const selectedGw = gatewayFn ? gatewayFn() : '';

    window._activeSubmitPayOverride = {
        type: type,
        trx1: trx1Val,
        receiverPhone: st.receiverPhone || '',
        receiverType: st.receiverType || 'Personal',
        matchedGateway: st.matchedGateway || selectedGw,
        selectedGateway: selectedGw,
        imageHash: st.imageHash || '',
        proofSig: st.proofSig || null
    };
    origSubmitFn(e);
}

if (typeof handleDeposit === 'function') {
    const _origHandleDeposit = handleDeposit;
    handleDeposit = function (e) {
        handleVerifiedPaymentSubmit(e, 'pay', _origHandleDeposit);
    };
}

if (typeof submitSavingsVerification === 'function') {
    const _origSubmitSavings = submitSavingsVerification;
    submitSavingsVerification = function (e) {
        handleVerifiedPaymentSubmit(e, 'sav', _origSubmitSavings);
    };
}

if (typeof handleEmiSubmit === 'function') {
    const _origHandleEmi = handleEmiSubmit;
    handleEmiSubmit = function (e) {
        handleVerifiedPaymentSubmit(e, 'emi', _origHandleEmi);
    };
}