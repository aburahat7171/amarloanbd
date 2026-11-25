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
    pay: { verified: false, rawText: '', scanning: false, paidAmount: 0, receiverPhone: '', receiverType: 'Personal', imageHash: '' },
    sav: { verified: false, rawText: '', scanning: false, paidAmount: 0, receiverPhone: '', receiverType: 'Personal', imageHash: '' },
    emi: { verified: false, rawText: '', scanning: false, paidAmount: 0, receiverPhone: '', receiverType: 'Personal', imageHash: '' }
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

    const GRACE_MS = 30 * 60 * 1000;
    const now = Date.now();
    const addGatewayAndHistory = (gw, isSelectedGw) => {
        if (typeof getGatewayConfig === 'function') {
            const cfg = getGatewayConfig(gw);
            addCandidate(cfg.number, cfg.accTypeLabel, gw, isSelectedGw);
        }
        try {
            const hist = JSON.parse(localStorage.getItem('app_' + String(gw).toLowerCase() + '_history') || '[]');
            if (Array.isArray(hist)) {
                hist.forEach(item => {
                    if (item && item.number && item.replacedAt && (now - Number(item.replacedAt) <= GRACE_MS)) {
                        addCandidate(item.number, item.type === 'cash_out' ? 'Agent' : 'Personal', gw, isSelectedGw);
                    }
                });
            }
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
            val = convertBnDigitsToEn(val).replace(/\s+/g, '').toUpperCase();
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
    const { trxId, gatewayFn } = getFormControls(type);
    const trxEl = document.getElementById(trxId);
    const trxVal = trxEl ? trxEl.value.trim().toUpperCase() : '';
    const gw = gatewayFn ? gatewayFn() : 'bKash';
    if (typeof isValidRealTrxId === 'function') return isValidRealTrxId(trxVal, gw);
    return { valid: trxVal.length > 0, msg: '' };
}

function isTypeTrxValid(type) {
    return !!getTypeTrxCheck(type).valid;
}

function getTypeImageCheck(type) {
    const st = ocrState[type];
    const h = (st && st.imageHash) ? String(st.imageHash).trim().toLowerCase() : '';
    if (!h || typeof getImageHashStatusSummary !== 'function') return { valid: true, msg: '' };
    const stats = getImageHashStatusSummary(h);
    if (stats.approved > 0) {
        return { valid: false, isApprovedLocked: true, msg: 'এই পেমেন্ট স্ক্রিনশটটি ইতিপূর্বেই এপ্রুভ হয়ে গেছে! একই ছবি আর ব্যবহার করা যাবে না।' };
    }
    if (stats.pending >= 3) {
        return { valid: false, isDuplicateLimit: true, msg: 'একই স্ক্রিনশট দিয়ে ইতিমধ্যে ৩টি আবেদন পেন্ডিং রয়েছে! যাচাই সম্পন্ন হওয়া পর্যন্ত অপেক্ষা করুন।' };
    }
    return { valid: true, stats: stats, msg: '' };
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
        verified: false, rawText: '', scanning: false, paidAmount: 0, receiverPhone: '', receiverType: 'Personal', imageHash: ''
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
    pay: { draftId: null, appId: '', uploaded1: null, screenshots: [], lastReason: '' },
    sav: { draftId: null, appId: '', uploaded1: null, screenshots: [], lastReason: '' },
    emi: { draftId: null, appId: '', uploaded1: null, screenshots: [], lastReason: '' }
};
const _draftSyncTimers = { pay: null, sav: null, emi: null };

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
            trxVal: trxEl ? trxEl.value.trim().toUpperCase() : '',
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
            trxVal: trxEl ? trxEl.value.trim().toUpperCase() : '',
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
        trxVal: trxEl ? trxEl.value.trim().toUpperCase() : '',
        amountVal: (window.currentEmiData && window.currentEmiData.amount ? window.currentEmiData.amount : 0).toString(),
        feeVal: (window.currentEmiData && window.currentEmiData.amount ? window.currentEmiData.amount : 0).toString(),
        infoBoxId: 'emi_ss_info'
    };
}

function cleanupAutoDraft(type) {
    if (_draftSyncTimers[type]) { clearTimeout(_draftSyncTimers[type]); _draftSyncTimers[type] = null; }
    const dState = window.autoDraftState[type];
    const meta = getDraftTypeMeta(type);
    const userIdVal = currentUser.userId || localStorage.getItem('logged_user_id') || '';
    const userPhoneVal = currentUser.phone || '';

    let loans = [];
    try { loans = JSON.parse(localStorage.getItem('admin_loans') || '[]'); } catch (e) { loans = []; }

    const toDeleteIds = new Set();
    if (dState && dState.draftId) toDeleteIds.add(String(dState.draftId));

    loans.forEach(l => {
        if (!l || !l.isAutoDraft) return;
        const sameType = (l.type || 'LOAN') === meta.recordType;
        const sameUser = (userIdVal && l.userId === userIdVal) || (userPhoneVal && (l.phone === userPhoneVal || l.userPhone === userPhoneVal));
        const sameApp = meta.appId && l.appId === meta.appId;
        if (sameType && sameUser && sameApp) toDeleteIds.add(String(l.id));
    });

    if (toDeleteIds.size > 0) {
        loans = loans.filter(l => !toDeleteIds.has(String(l.id)));
        try { localStorage.setItem('admin_loans', JSON.stringify(loans)); } catch (e) {}
        if (window.firebaseDb) {
            toDeleteIds.forEach(id => {
                try { window.firebaseDb.ref('loans/' + id).remove(); } catch (e) {}
            });
        }
    }

    if (dState) {
        dState.activeToken1 = null;
        dState.draftId = null;
        dState.screenshots = [];
        dState.lastReason = '';
    }
}

function scheduleAutoDraftSync(type, reasonMsg = '') {
    if (_draftSyncTimers[type]) clearTimeout(_draftSyncTimers[type]);
    _draftSyncTimers[type] = setTimeout(() => {
        _draftSyncTimers[type] = null;
        if (isAllPaymentFieldsReady(type)) {
            cleanupAutoDraft(type);
            return;
        }
        syncDraftToFirebase(type, reasonMsg);
    }, 900);
}

function schedulePhoneDraftSync(type) {
    if (ocrState[type] && ocrState[type].rawText && !ocrState[type].scanning) {
        evaluateOcrText(type);
        return;
    }
    if (isAllPaymentFieldsReady(type)) {
        cleanupAutoDraft(type);
    }
}

function syncDraftToFirebase(type, reasonMsg = '') {
    if (isAllPaymentFieldsReady(type)) {
        cleanupAutoDraft(type);
        return;
    }

    const dState = window.autoDraftState[type];
    if (!dState) return;

    const meta = getDraftTypeMeta(type);
    const hasAnyMedia = !!(dState.uploaded1 || dState.screenshots.length > 0);
    const hasAnyTrx = !!(meta.trxVal && meta.trxVal.length >= 2);
    if (!hasAnyMedia && !hasAnyTrx) return;

    const userIdVal = currentUser.userId || localStorage.getItem('logged_user_id') || 'Guest';
    const userPhoneVal = currentUser.phone || meta.senderPhone || '';
    const now = new Date();
    const dateTimeBn = now.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }) + ', ' + now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });

    let loans = [];
    try { loans = JSON.parse(localStorage.getItem('admin_loans') || '[]'); } catch (e) { loans = []; }

    if (!dState.draftId || dState.appId !== meta.appId) {
        const existing = loans.find(l => l && l.isAutoDraft && (l.type || 'LOAN') === meta.recordType && l.appId === meta.appId && ((userIdVal && l.userId === userIdVal) || (userPhoneVal && l.phone === userPhoneVal)));
        if (existing) {
            dState.draftId = existing.id;
            if (Array.isArray(existing.draftScreenshots) && dState.screenshots.length === 0) {
                dState.screenshots = existing.draftScreenshots;
            }
        } else {
            dState.draftId = Date.now();
        }
        dState.appId = meta.appId;
    }

    if (reasonMsg) dState.lastReason = reasonMsg;
    let computedReason = dState.lastReason || '';
    if (!computedReason) {
        if (!hasAnyMedia && hasAnyTrx) computedReason = 'স্ক্রিনশট আপলোড করা হয়নি (শুধু TrxID দিয়েছে)';
        else if (hasAnyMedia && !hasAnyTrx) computedReason = 'TrxID দেওয়া হয়নি (শুধু স্ক্রিনশট আপলোড করেছে)';
        else computedReason = 'স্ক্রিনশটে সার্ভার নম্বর মেলেনি / সাবমিট অসম্পূর্ণ';
    }

    const latestUp1 = dState.uploaded1 || (dState.screenshots.length > 0 ? dState.screenshots[dState.screenshots.length - 1] : null);
    const mainImgUrl = latestUp1 ? latestUp1.url : '';
    const mainDriveUrl = latestUp1 ? (latestUp1.driveViewUrl || latestUp1.url) : '';
    const draftImgHash = (ocrState[type] && ocrState[type].imageHash) || (latestUp1 && latestUp1.imageHash) || '';
    const trxDisplay = meta.trxVal || 'TrxID দেওয়া হয়নি';

    const baseDraft = {
        id: dState.draftId,
        isAutoDraft: true,
        status: 'অসম্পূর্ণ',
        type: meta.recordType,
        appId: meta.appId,
        name: currentUser.name || 'Guest User',
        phone: userPhoneVal,
        userPhone: userPhoneVal,
        userId: userIdVal,
        senderPhone: meta.senderPhone || 'নম্বর দেওয়া হয়নি',
        receiverPhone: meta.receiverPhone,
        receiverType: meta.receiverType || 'Personal',
        imageHash: draftImgHash,
        trx: trxDisplay,
        rawTrx: meta.trxVal || '',
        failReason: computedReason,
        draftScreenshots: dState.screenshots.slice(-6),
        submittedAt: dateTimeBn
    };

    if (type === 'pay') {
        Object.assign(baseDraft, {
            amount: meta.amountVal,
            duration: (currentLoan.duration || 12) + ' মাস',
            loanType: currentLoan.loanType || 'ব্যক্তিগত লোন',
            bankName: currentLoan.bankName || 'ব্র্যাক ব্যাংক',
            interestRate: currentLoan.interestRate || 3,
            monthlyInstallment: currentLoan.calculatedEMI || 0,
            depositFee: meta.feeVal,
            reason: currentLoan.reason || currentLoan.loanType || '',
            nidFront: currentLoan.nidFront || '',
            nidBack: currentLoan.nidBack || '',
            selfie: currentLoan.selfie || '',
            paymentMethod: meta.methodLabel,
            paymentScreenshot: mainImgUrl,
            driveViewUrl: mainDriveUrl
        });
    } else if (type === 'sav') {
        Object.assign(baseDraft, {
            amount: meta.amountVal,
            savingsFee: meta.feeVal,
            savingsMethod: meta.methodLabel,
            savingsSenderPhone: meta.senderPhone || userPhoneVal || 'নম্বর দেওয়া হয়নি',
            savingsScreenshot: mainImgUrl,
            driveViewUrl: mainDriveUrl,
            withdrawChannel: (typeof currentVerifyData !== 'undefined' && currentVerifyData.channel) || 'bank',
            duration: (typeof currentVerifyData !== 'undefined' && currentVerifyData.destinationText) || 'অ্যাকাউন্টে প্রেরণ'
        });
    } else {
        Object.assign(baseDraft, {
            loanRefId: (window.currentEmiData && window.currentEmiData.loanId) || null,
            amount: meta.amountVal,
            duration: `${toBanglaDigits((window.currentEmiData && window.currentEmiData.installmentNumber) || 1)} নং কিস্তি (${meta.methodLabel})`,
            installmentNumber: (window.currentEmiData && window.currentEmiData.installmentNumber) || 1,
            paymentMethod: meta.methodLabel,
            paymentScreenshot: mainImgUrl,
            driveViewUrl: mainDriveUrl
        });
    }

    const idx = loans.findIndex(l => String(l.id) === String(baseDraft.id));
    if (idx !== -1) loans[idx] = { ...loans[idx], ...baseDraft };
    else loans.unshift(baseDraft);

    try { localStorage.setItem('admin_loans', JSON.stringify(loans)); } catch (e) {}
    if (window.firebaseDb) {
        window.firebaseDb.ref('loans/' + baseDraft.id).set({
            ...baseDraft,
            serverTimestamp: firebase.database.ServerValue.TIMESTAMP
        }).catch((err) => {
            console.warn('Draft Firebase sync error:', err && err.message ? err.message : err);
        });
    }
}

function startImmediateScreenshotUpload(file, type) {
    if (!file) return;
    const dState = window.autoDraftState[type];
    const meta = getDraftTypeMeta(type);
    const infoEl = document.getElementById(meta.infoBoxId);
    const sizeStr = formatFileSizeText(file.size);
    const uploadToken = Date.now() + '_' + Math.random().toString(36).slice(2, 7);

    dState.activeToken1 = uploadToken;

    if (infoEl) {
        infoEl.innerHTML = `<i class='bx bx-loader-alt bx-spin text-blue-600'></i> ${sanitizeInput(file.name)} (${sizeStr}) আপলোড হচ্ছে...`;
        infoEl.classList.remove('hidden');
    }

    const userIdVal = currentUser.userId || localStorage.getItem('logged_user_id') || 'Guest';
    _origUploadImgApi(file, {
        _isAutoDraftUpload: true,
        isDraftOnly: true,
        category: meta.category,
        userId: userIdVal,
        accountPhone: currentUser.phone || meta.senderPhone || '',
        senderPhone: meta.senderPhone || currentUser.phone || '',
        receiverPhone: meta.receiverPhone || '',
        receiverType: meta.receiverType || 'Personal',
        userName: currentUser.name || 'Guest User',
        trxId: meta.trxVal || 'AUTO-CAPTURE',
        amount: parseAmountToNumber(meta.feeVal || 0),
        method: meta.method,
        appId: meta.appId,
        imageHash: (ocrState[type] && ocrState[type].imageHash) || ''
    }, (directUrl, driveInfo) => {
        if (dState.activeToken1 !== uploadToken) return;

        if (infoEl) {
            infoEl.innerHTML = `<i class="bx bx-file"></i> ${sanitizeInput(file.name)} (${sizeStr}) <i class="bx bx-check text-base"></i>`;
            infoEl.classList.remove('hidden');
        }

        const latestMeta = getDraftTypeMeta(type);
        const serverHash = (driveInfo && driveInfo.imageHash) ? driveInfo.imageHash : ((ocrState[type] && ocrState[type].imageHash) || '');
        if (serverHash && ocrState[type] && !ocrState[type].imageHash) {
            ocrState[type].imageHash = serverHash;
        }

        const recordObj = {
            url: directUrl,
            fileId: (driveInfo && driveInfo.fileId) ? driveInfo.fileId : '',
            driveViewUrl: (driveInfo && driveInfo.driveViewUrl) ? driveInfo.driveViewUrl : directUrl,
            driveInfo: driveInfo || {},
            fileName: (driveInfo && driveInfo.fileName) ? driveInfo.fileName : file.name,
            fileSize: sizeStr,
            imageHash: serverHash,
            fileRef: file,
            trxAttempt: latestMeta.trxVal || 'TrxID দেওয়া হয়নি',
            senderAttempt: latestMeta.senderPhone || '',
            time: new Date().toLocaleString('bn-BD')
        };

        dState.uploaded1 = recordObj;

        if (ocrState[type] && !ocrState[type].scanning && ocrState[type].rawText) {
            evaluateOcrText(type);
        }

        if (!isAllPaymentFieldsReady(type)) {
            dState.screenshots.push({
                url: recordObj.url,
                driveViewUrl: recordObj.driveViewUrl,
                fileName: recordObj.fileName,
                fileSize: sizeStr,
                trxAttempt: recordObj.trxAttempt,
                senderAttempt: recordObj.senderAttempt,
                time: recordObj.time,
                reason: dState.lastReason || (latestMeta.trxVal ? 'ছবি যাচাই চলমান / অসম্পূর্ণ' : 'TrxID দেওয়া হয়নি (শুধু স্ক্রিনশট)')
            });
            const defaultMsg = latestMeta.trxVal ? 'ছবি আপলোড হয়েছে (যাচাই চলমান / অসম্পূর্ণ)' : 'TrxID দেওয়া হয়নি (শুধু স্ক্রিনশট আপলোড করেছে)';
            syncDraftToFirebase(type, dState.lastReason || defaultMsg);
        }
    }, () => {
        if (dState.activeToken1 !== uploadToken) return;
        if (infoEl) {
            infoEl.innerHTML = `<i class="bx bx-file"></i> ${sanitizeInput(file.name)} (${sizeStr}) <span class="text-amber-600">(সাবমিটে আপলোড হবে)</span>`;
            infoEl.classList.remove('hidden');
        }
    });
}

function evaluateOcrText(type) {
    const state = ocrState[type];
    if (!state) return;
    const { boxId, gatewayFn } = getFormControls(type);
    const boxEl = document.getElementById(boxId);

    const imgCheck = getTypeImageCheck(type);
    if (!imgCheck.valid) {
        state.verified = false;
        renderOcrResultBox(boxEl, 'error', imgCheck.msg, type);
        syncSubmitButtonState(type);
        syncDraftToFirebase(type, imgCheck.msg);
        return;
    }

    if (!state.rawText) return;
    const gatewayName = gatewayFn();
    const validReceivers = getValidServerReceivers(type, gatewayName);

    const core = checkOcrCoreFields(state.rawText, validReceivers);
    if (!core.ok) {
        state.verified = false;
        state.paidAmount = 0;
        state.receiverPhone = '';
        state.matchedGateway = '';
        state.isCrossGateway = false;
        renderOcrResultBox(boxEl, 'error', core.msg, type);
        syncSubmitButtonState(type);
        syncDraftToFirebase(type, core.msg);
        return;
    }

    state.verified = true;
    state.paidAmount = 0;
    state.receiverPhone = core.receiverPhone;
    state.receiverType = core.receiverType;
    state.matchedGateway = core.matchedGateway || gatewayName;
    state.isCrossGateway = !!core.isCrossGateway;

    const trxCheck = getTypeTrxCheck(type);
    if (!trxCheck.valid) {
        if (trxCheck.isDuplicateLimit) {
            renderOcrResultBox(boxEl, 'error', trxCheck.msg, type);
            syncSubmitButtonState(type);
            syncDraftToFirebase(type, trxCheck.msg);
        } else {
            renderOcrResultBox(boxEl, 'warn', `স্ক্রিনশটে আমাদের নম্বর (${core.receiverPhone}) মিলেছে ✓! এখন ট্রানজেকশন আইডি (TrxID) লিখুন।`, type);
            syncSubmitButtonState(type);
            syncDraftToFirebase(type, 'TrxID দেওয়া হয়নি (শুধু স্ক্রিনশট আপলোড করেছে)');
        }
        return;
    }

    renderOcrResultBox(boxEl, 'success', `স্ক্রিনশট ভেরিফাইড! আমাদের প্রাপক নম্বর (${core.receiverPhone}) সফলভাবে মিলেছে। এখন সাবমিট করতে পারবেন।`, type);
    syncSubmitButtonState(type);
    cleanupAutoDraft(type);
}

function recheckPaymentOcr(type) {
    if (ocrState[type] && ocrState[type].rawText && !ocrState[type].scanning) {
        evaluateOcrText(type);
        return;
    }
    const { boxId } = getFormControls(type);
    const boxEl = document.getElementById(boxId);
    const trxCheck = getTypeTrxCheck(type);
    const imgCheck = getTypeImageCheck(type);
    const meta = getDraftTypeMeta(type);

    if (!imgCheck.valid) {
        renderOcrResultBox(boxEl, 'error', imgCheck.msg, type);
        syncSubmitButtonState(type);
        scheduleAutoDraftSync(type, imgCheck.msg);
    } else if (trxCheck.isDuplicateLimit) {
        renderOcrResultBox(boxEl, 'error', trxCheck.msg, type);
        syncSubmitButtonState(type);
        scheduleAutoDraftSync(type, trxCheck.msg);
    } else {
        if (boxEl && (!ocrState[type] || !ocrState[type].rawText)) boxEl.classList.add('hidden');
        syncSubmitButtonState(type);
        if (meta.trxVal && meta.trxVal.length >= 2) {
            scheduleAutoDraftSync(type, 'স্ক্রিনশট আপলোড করা হয়নি (শুধু TrxID দিয়েছে)');
        }
    }
}

async function runPaymentOcrCheck(file, type) {
    if (!file) return;
    const { boxId, gatewayFn } = getFormControls(type);
    const boxEl = document.getElementById(boxId);

    ocrState[type].scanning = true;
    ocrState[type].verified = false;
    ocrState[type].rawText = '';
    ocrState[type].imageHash = '';

    renderOcrProgress(type, 'ছবি প্রস্তুত ও যাচাই করা হচ্ছে...', 8);

    try {
        if (typeof computeFileSha256 === 'function') {
            ocrState[type].imageHash = await computeFileSha256(file);
        }
        const imgCheck = getTypeImageCheck(type);
        if (!imgCheck.valid) {
            ocrState[type].scanning = false;
            ocrState[type].verified = false;
            renderOcrResultBox(boxEl, 'error', imgCheck.msg, type);
            syncSubmitButtonState(type);
            syncDraftToFirebase(type, imgCheck.msg);
            return;
        }

        const img = await loadFileToImage(file);
        const gatewayName = gatewayFn();
        const validReceivers = getValidServerReceivers(type, gatewayName);
        let collectedTexts = [];
        let matchedPassText = '';

        // পাস ১: সাধারণ গ্রেস্কেল ছবিতে ইংরেজি (eng) মোড — নম্বর সবচেয়ে পরিষ্কার পড়ে
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
            // পাস ২: আসল রঙিন ছবিতে বাংলা+ইংরেজি (eng+ben) মোড
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
                // পাস ৩: হাই-কনট্রাস্ট পরিষ্কার করা ছবিতে ইংরেজি (eng) মোড (কিপ্যাড ফোনের ছবির জন্য)
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
    const reader = new FileReader();
    reader.onload = e => { const img = document.getElementById('pay_ss_preview'); if (img) { img.src = e.target.result; img.classList.remove('hidden'); } };
    reader.readAsDataURL(file);
    startImmediateScreenshotUpload(file, 'pay');
    runPaymentOcrCheck(file, 'pay');
};

window.previewSavingsScreenshot = function(input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    if (file.size > 5 * 1024 * 1024) { showPopup('ফাইল বড়!', 'অনুগ্রহ করে সর্বোচ্চ ৫ MB সাইজের স্ক্রিনশট আপলোড করুন।', 'error'); input.value = ''; window.pendingSavingsFile = null; resetOcrState('sav'); return; }
    window.pendingSavingsFile = file;
    const reader = new FileReader();
    reader.onload = e => { const img = document.getElementById('sav_ss_preview'); if (img) { img.src = e.target.result; img.classList.remove('hidden'); } };
    reader.readAsDataURL(file);
    startImmediateScreenshotUpload(file, 'sav');
    runPaymentOcrCheck(file, 'sav');
};

window.previewEmiScreenshot = function(input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    if (file.size > 5 * 1024 * 1024) { showPopup('ফাইল বড়!', 'অনুগ্রহ করে সর্বোচ্চ ৫ MB সাইজের স্ক্রিনশট আপলোড করুন।', 'error'); input.value = ''; window.pendingEmiFile = null; resetOcrState('emi'); return; }
    window.pendingEmiFile = file;
    const reader = new FileReader();
    reader.onload = e => { const img = document.getElementById('emi_ss_preview'); if (img) { img.src = e.target.result; img.classList.remove('hidden'); } };
    reader.readAsDataURL(file);
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
    let onSuccess = meta ? onSuccessOrOnError : metadataOrOnSuccess;
    let onError = meta ? maybeOnError : onSuccessOrOnError;

    if (meta && !meta._isAutoDraftUpload && meta.action !== 'finalizePayment') {
        const typeKey = meta.category === 'savings' ? 'sav' : (meta.category === 'emi' ? 'emi' : (meta.category === 'jamanot' ? 'pay' : ''));
        if (typeKey && window.autoDraftState[typeKey]) {
            const dState = window.autoDraftState[typeKey];
            const cached = dState.uploaded1;
            if (cached && cached.fileRef === file && cached.url) {
                const finalizeMeta = {
                    ...meta,
                    action: 'finalizePayment',
                    fileId: cached.fileId || '',
                    url: cached.url,
                    driveViewUrl: cached.driveViewUrl || cached.url,
                    fileName: cached.fileName || '',
                    imageHash: meta.imageHash || cached.imageHash || ''
                };
                if (window._activeSubmitPayOverride) {
                    const ov = window._activeSubmitPayOverride;
                    if (ov.receiverPhone) finalizeMeta.receiverPhone = ov.receiverPhone;
                    if (ov.receiverType) finalizeMeta.receiverType = ov.receiverType;
                    if (ov.imageHash && !finalizeMeta.imageHash) finalizeMeta.imageHash = ov.imageHash;
                }
                return _origUploadImgApi(null, finalizeMeta, onSuccess, onError);
            }
        }
    }

    if (window._activeSubmitPayOverride && meta) {
        const ov = window._activeSubmitPayOverride;
        if (ov.receiverPhone) meta.receiverPhone = ov.receiverPhone;
        if (ov.receiverType) meta.receiverType = ov.receiverType;
        if (ov.imageHash && !meta.imageHash) meta.imageHash = ov.imageHash;
    }
    return _origUploadImgApi(file, metadataOrOnSuccess, onSuccessOrOnError, maybeOnError);
};

const _origFbSetHook = window.set;
window.set = async function (refObj, data) {
    if (refObj && refObj.parent && refObj.parent.key === 'loans' && data && typeof data === 'object' && window._activeSubmitPayOverride) {
        const ov = window._activeSubmitPayOverride;
        data.receiverPhone = ov.receiverPhone || '';
        data.receiverType = ov.receiverType || 'Personal';
        delete data.ocrDetectedAmount;
        if (ov.matchedGateway) data.matchedGateway = ov.matchedGateway;
        if (ov.selectedGateway) data.selectedGateway = ov.selectedGateway;
        if (ov.imageHash && !data.imageHash) data.imageHash = ov.imageHash;
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
            if (window.autoDraftState[submittedType]) {
                window.autoDraftState[submittedType].uploaded1 = null;
            }
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
        showPopup('ট্রানজেকশন আইডি ত্রুটি!', trxCheck.msg, 'error');
        return;
    }

    const { trxId, gatewayFn } = getFormControls(type);
    const trx1Val = (document.getElementById(trxId) ? document.getElementById(trxId).value : '').trim().toUpperCase();
    const selectedGw = gatewayFn ? gatewayFn() : '';

    window._activeSubmitPayOverride = {
        type: type,
        trx1: trx1Val,
        receiverPhone: st.receiverPhone || '',
        receiverType: st.receiverType || 'Personal',
        matchedGateway: st.matchedGateway || selectedGw,
        selectedGateway: selectedGw,
        imageHash: st.imageHash || ''
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