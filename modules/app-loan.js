// ====================================================================
// MODULE: app-loan.js (Apply, NID, Summary, Deposit, Payment, Cashout/Savings, EMI)
// ====================================================================

(function injectLoanTemplates() {
    const root = document.getElementById('loan-module-root');
    if (!root || document.getElementById('apply-page')) return;

    root.innerHTML = `
    <!-- 1. APPLY LOAN PAGE (ধাপ ১) -->
    <div id="apply-page" class="page min-h-screen flex-col pb-24 bg-gradient-to-b from-[#e4f2f7] via-[#edf6fa] to-[#e2f0f6]">
        <header class="w-full bg-[#e9f4f9]/95 backdrop-blur-md sticky top-0 z-50 px-3 py-2.5 flex items-center justify-between gap-2 border-b border-[#d5e7f0]">
            <div class="flex items-center gap-1.5 min-w-0 flex-1">
                <button type="button" onclick="navigate('home-page')" class="text-gray-900 p-1 shrink-0 active:scale-95 transition-transform"><i class="bx bx-arrow-back text-2xl font-bold"></i></button>
                <span class="font-extrabold text-[14px] sm:text-base text-gray-900 tracking-tight truncate">নতুন লোন আবেদন</span>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
                <div class="flex items-center gap-1 cursor-pointer" onclick="navigate('home-page')">
                    <div class="text-right leading-none pr-1 border-r border-gray-300"><span class="block text-[10px] font-black text-gray-900">আমার</span><span class="block text-[10px] font-black text-gray-900">লোন</span></div>
                    <div class="flex items-center gap-1"><div class="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-[#1e6036]"><i class="bx bxs-donate-heart text-sm"></i></div><div class="leading-none"><span class="block text-[10px] font-black text-[#1e6036]">সুফল</span><span class="block text-[9px] font-bold text-[#2b7a78]">ফিন্যান্স</span></div></div>
                </div>
                <button type="button" onclick="toggleSidebar()" class="text-gray-900 p-0.5 active:scale-95 transition-transform"><i class="bx bx-menu text-2xl"></i></button>
            </div>
        </header>

        <main class="flex-1 w-full max-w-md mx-auto px-3.5 pt-4 space-y-4">
            <div class="flex items-center justify-between px-2 relative">
                <div class="absolute left-10 right-10 top-4 h-0.5 bg-gray-300 -z-0"></div>
                <div class="flex flex-col items-center z-10"><div class="w-8 h-8 rounded-full bg-[#1e6036] text-white font-black text-sm flex items-center justify-center shadow">১</div><span class="text-[11px] font-extrabold text-gray-900 mt-1">ধাপ ১: তথ্য পূরণ</span></div>
                <div class="flex flex-col items-center z-10"><div class="w-8 h-8 rounded-full bg-gray-300 text-gray-600 font-black text-sm flex items-center justify-center">২</div><span class="text-[11px] font-bold text-gray-600 mt-1">ধাপ ২: নথিপত্র</span></div>
                <div class="flex flex-col items-center z-10"><div class="w-8 h-8 rounded-full bg-gray-300 text-gray-600 font-black text-sm flex items-center justify-center">৩</div><span class="text-[11px] font-bold text-gray-600 mt-1">ধাপ ৩: বাংলাদেশ ব্যাংক ফি</span></div>
            </div>

            <form onsubmit="handleApply(event)" class="space-y-4">
                <div class="bg-white rounded-2xl shadow-sm border border-[#b8c9d4] overflow-hidden">
                    <div class="bg-[#eef4f8] px-4 py-2.5 border-b border-[#d4e0e8]"><h3 class="font-extrabold text-gray-900 text-base">১. ঋণের বিবরণ</h3></div>
                    <div class="p-3.5 space-y-4">
                        <div>
                            <p class="text-xs font-extrabold text-gray-700 mb-2">লোনের ধরন ও কারণ নির্বাচন করুন (ডানে স্ক্রল করুন):</p>
                            <div id="apply_loan_types_container" class="flex overflow-x-auto snap-x snap-mandatory gap-2.5 pb-1 hide-scrollbar"></div>
                        </div>
                        <div>
                            <p class="text-xs font-extrabold text-gray-700 mb-2">কোন ব্যাংক / মাধ্যমে লোন নিবেন (সুদ/প্রফিট হারসহ):</p>
                            <div id="apply_banks_container" class="flex overflow-x-auto snap-x snap-mandatory gap-2.5 pb-1 hide-scrollbar"></div>
                        </div>
                        <div class="grid grid-cols-2 gap-3 pt-1">
                            <div>
                                <label class="block text-sm font-black text-gray-900 mb-1.5">লোনের পরিমাণ</label>
                                <select id="loan_amount" onchange="updateApplyLoanCalculation()" class="w-full min-h-[48px] bg-[#f0f4f7] border-2 border-[#748490] rounded-xl px-3 py-3 text-[15px] font-black text-gray-900 outline-none focus:bg-white focus:border-[#1e6036]" required>
                                    <option value="" disabled>নির্বাচন করুন</option>
                                    <option value="5000">৳ ৫,০০০</option><option value="10000" selected>৳ ১০,০০০</option><option value="15000">৳ ১৫,০০০</option>
                                    <option value="20000">৳ ২০,০০০</option><option value="25000">৳ ২৫,০০০</option><option value="30000">৳ ৩০,০০০</option>
                                    <option value="40000">৳ ৪০,০০০</option><option value="50000">৳ ৫০,০০০</option><option value="70000">৳ ৭০,০০০</option>
                                    <option value="80000">৳ ৮০,০০০</option><option value="100000">৳ ১,০০,০০০</option><option value="150000">৳ ১,৫০,০০০</option>
                                    <option value="200000">৳ ২,০০,০০০</option><option value="250000">৳ ২,৫০,০০০</option><option value="300000">৳ ৩,০০,০০০</option>
                                    <option value="400000">৳ ৪,০০,০০০</option><option value="500000">৳ ৫,০০,০০০</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-black text-gray-900 mb-1.5">মেয়াদ (মাস / দিন)</label>
                                <select id="loan_duration" onchange="updateApplyLoanCalculation()" class="w-full min-h-[48px] bg-[#f0f4f7] border-2 border-[#748490] rounded-xl px-3 py-3 text-[15px] font-black text-gray-900 outline-none focus:bg-white focus:border-[#1e6036]" required>
                                    <option value="" disabled>নির্বাচন করুন</option>
                                    <option value="3">৩ মাস (৯০ দিন)</option><option value="6" selected>৬ মাস (১৮০ দিন)</option><option value="9">৯ মাস (২৭০ দিন)</option>
                                    <option value="12">১২ মাস (১ বছর)</option><option value="18">১৮ মাস</option><option value="24">২৪ মাস (২ বছর)</option>
                                    <option value="36">৩৬ মাস (৩ বছর)</option>
                                </select>
                            </div>
                        </div>
                        <div id="apply_calc_box" class="bg-[#eef7f2] border border-[#a7d7bc] rounded-xl p-3 space-y-1.5 text-xs">
                            <div class="flex justify-between items-center"><span class="font-bold text-gray-700">নির্বাচিত ব্যাংক:</span><span id="apply_calc_bank" class="font-black text-[#123c69]">ব্র্যাক ব্যাংক</span></div>
                            <div class="flex justify-between items-center"><span class="font-bold text-gray-700">সুদ / লভ্যাংশ (<span id="apply_calc_rate">৩%</span>):</span><span id="apply_calc_profit" class="font-black text-gray-900">৳ ৩০০</span></div>
                            <div class="flex justify-between items-center"><span class="font-bold text-gray-700">আনুমানিক মাসিক কিস্তি:</span><span id="apply_calc_emi" class="font-black text-[#1e6036] text-sm">৳ ১,৭১৭</span></div>
                            <div class="flex justify-between items-center border-t border-[#bfe3cf] pt-1.5"><span class="font-extrabold text-gray-800">মোট পরিশোধযোগ্য:</span><span id="apply_calc_total" class="font-black text-gray-900">৳ ১০,৩০০</span></div>
                        </div>
                    </div>
                </div>

                <div class="space-y-3 pt-1">
                    <label class="custom-check-box">
                        <input type="checkbox" id="apply_confirm_check" required class="custom-check-input">
                        <span class="text-xs sm:text-sm font-extrabold text-gray-900 leading-relaxed">
                            আমি নিশ্চিত করছি যে উপরে দেওয়া তথ্যগুলো সঠিক ও সত্য।
                        </span>
                    </label>
                    <button type="submit" class="w-full bg-[#1e6036] hover:bg-[#164b29] text-white py-3.5 rounded-xl font-extrabold text-base shadow-md active:scale-95 transition-all flex items-center justify-center gap-2">পরবর্তী ধাপে যান <i class="bx bx-right-arrow-alt text-xl"></i></button>
                </div>
            </form>
        </main>
    </div>

    <!-- 2. NID VERIFY PAGE (ধাপ ২) -->
    <div id="nid-verify-page" class="page min-h-screen flex-col pb-24 bg-gradient-to-b from-[#e4f2f7] via-[#edf6fa] to-[#e2f0f6]">
        <header class="w-full bg-[#e9f4f9]/95 backdrop-blur-md sticky top-0 z-50 px-3 py-2.5 flex items-center justify-between gap-2 border-b border-[#d5e7f0]">
            <div class="flex items-center gap-1.5 min-w-0 flex-1">
                <button type="button" onclick="navigate('apply-page')" class="text-gray-900 p-1 shrink-0 active:scale-95 transition-transform"><i class="bx bx-arrow-back text-2xl font-bold"></i></button>
                <span class="font-extrabold text-[14px] sm:text-base text-gray-900 tracking-tight truncate">নতুন লোন আবেদন</span>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
                <div class="flex items-center gap-1 cursor-pointer" onclick="refreshHomePage()">
                    <div class="text-right leading-none pr-1 border-r border-gray-300"><span class="block text-[10px] font-black text-gray-900">আমার</span><span class="block text-[10px] font-black text-gray-900">লোন</span></div>
                    <div class="flex items-center gap-1"><div class="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-[#1e6036]"><i class="bx bxs-donate-heart text-sm"></i></div><div class="leading-none"><span class="block text-[10px] font-black text-[#1e6036]">সুফল</span><span class="block text-[9px] font-bold text-[#2b7a78]">ফিন্যান্স</span></div></div>
                </div>
                <button type="button" onclick="toggleSidebar()" class="text-gray-900 p-0.5 active:scale-95 transition-transform"><i class="bx bx-menu text-2xl"></i></button>
            </div>
        </header>

        <main class="flex-1 w-full max-w-md mx-auto px-3.5 pt-4 space-y-4">
            <div class="flex items-center justify-between px-2 relative">
                <div class="absolute left-10 right-10 top-4 h-0.5 bg-[#a7d7bc] -z-0"></div>
                <div class="flex flex-col items-center z-10"><div class="w-8 h-8 rounded-full bg-[#1e6036] text-white font-black text-base flex items-center justify-center shadow"><i class="bx bx-check"></i></div><span class="text-[11px] font-bold text-gray-800 mt-1">ধাপ ১: তথ্য পূরণ</span></div>
                <div class="flex flex-col items-center z-10"><div class="w-8 h-8 rounded-full bg-[#1e6036] text-white font-black text-sm flex items-center justify-center shadow">২</div><span class="text-[11px] font-extrabold text-gray-900 mt-1">ধাপ ২: নথিপত্র</span></div>
                <div class="flex flex-col items-center z-10"><div class="w-8 h-8 rounded-full bg-gray-300 text-gray-600 font-black text-sm flex items-center justify-center">৩</div><span class="text-[11px] font-bold text-gray-600 mt-1">ধাপ ৩: বাংলাদেশ ব্যাংক ফি</span></div>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-[#b8c9d4] overflow-hidden">
                <div class="bg-[#eef4f8] px-4 py-2.5 border-b border-[#d4e0e8]"><h3 class="font-extrabold text-gray-900 text-base">২. প্রয়োজনীয় নথিপত্র আপলোড করুন</h3></div>
                <div class="p-4 space-y-4">
                    <p class="text-[11px] font-bold text-gray-700">অনুগ্রহ করে স্পষ্ট ছবি বা PDF ফাইল আপলোড করুন (সর্বোচ্চ ৫ MB প্রতি ফাইল)।</p>
                    <div>
                        <h4 class="font-extrabold text-gray-900 text-sm mb-2">১ ও ২. জাতীয় পরিচয়পত্র (NID)</h4>
                        <div class="grid grid-cols-2 gap-3">
                            <label class="border border-[#748490] bg-[#f4f7f9] rounded-xl p-3 text-center cursor-pointer hover:border-[#1e6036] transition-colors flex flex-col items-center justify-center min-h-[120px]">
                                <span class="text-xs font-extrabold text-gray-900 mb-1">সামনের অংশ (Front)</span>
                                <span id="front_text" class="text-[11px] text-gray-700 font-bold flex flex-col items-center"><i class="bx bxs-camera text-3xl text-[#123c69] my-1"></i>ছবি তুলুন বা ফাইল<br>আপলোড করুন</span>
                                <div id="front_progress" class="hidden text-[10px] font-bold mt-1"></div>
                                <img id="front_preview" src="" class="hidden mx-auto h-14 w-full object-cover rounded-lg mt-1 border border-gray-200">
                                <p id="front_file_info" class="hidden text-[10px] font-extrabold text-[#1e6036] mt-1 truncate max-w-full"></p>
                                <input type="file" id="nid_front" class="hidden" accept="image/*" onchange="previewLoanDoc(this, 'front_preview', 'front_text', 'front_progress', 'front_file_info', 'nidFront')">
                            </label>
                            <label class="border border-[#748490] bg-[#f4f7f9] rounded-xl p-3 text-center cursor-pointer hover:border-[#1e6036] transition-colors flex flex-col items-center justify-center min-h-[120px]">
                                <span class="text-xs font-extrabold text-gray-900 mb-1">পেছনের অংশ (Back)</span>
                                <span id="back_text" class="text-[11px] text-gray-700 font-bold flex flex-col items-center"><i class="bx bxs-camera text-3xl text-[#123c69] my-1"></i>ছবি তুলুন বা ফাইল<br>আপলোড করুন</span>
                                <div id="back_progress" class="hidden text-[10px] font-bold mt-1"></div>
                                <img id="back_preview" src="" class="hidden mx-auto h-14 w-full object-cover rounded-lg mt-1 border border-gray-200">
                                <p id="back_file_info" class="hidden text-[10px] font-extrabold text-[#1e6036] mt-1 truncate max-w-full"></p>
                                <input type="file" id="nid_back" class="hidden" accept="image/*" onchange="previewLoanDoc(this, 'back_preview', 'back_text', 'back_progress', 'back_file_info', 'nidBack')">
                            </label>
                        </div>
                    </div>
                    <div>
                        <h4 class="font-extrabold text-gray-900 text-xs sm:text-sm mb-2">৩. আবেদনকারীর সদ্য তোলা ছবি (Selfie/Photo)</h4>
                        <label class="border border-[#748490] bg-[#f4f7f9] rounded-xl p-4 text-center cursor-pointer hover:border-[#1e6036] transition-colors flex flex-col items-center justify-center">
                            <span id="selfie_text" class="text-xs font-bold text-gray-800 flex flex-col items-center"><i class="bx bxs-user-rectangle text-3xl text-[#123c69] mb-1"></i>আপনার একটি স্পষ্ট ছবি আপলোড করুন</span>
                            <div id="selfie_progress" class="hidden text-[10px] font-bold mt-1"></div>
                            <img id="selfie_preview" src="" class="hidden mx-auto h-16 w-16 object-cover rounded-full mt-1 border border-gray-300">
                            <p id="selfie_file_info" class="hidden text-xs font-extrabold text-[#1e6036] mt-1"></p>
                            <input type="file" id="applicant_selfie" class="hidden" accept="image/*" onchange="previewLoanDoc(this, 'selfie_preview', 'selfie_text', 'selfie_progress', 'selfie_file_info', 'selfie')">
                        </label>
                    </div>
                </div>
            </div>

            <p class="text-[11px] font-bold text-gray-700 px-1">নিরাপত্তা নিশ্চিত করতে আপনার আপলোডকৃত সকল তথ্য এনক্রিপ্ট ও সুরক্ষিত রাখা হবে।</p>
            <div class="grid grid-cols-2 gap-3 pt-1">
                <button type="button" onclick="navigate('apply-page')" class="bg-[#e8eff3] hover:bg-[#dce6ec] text-gray-900 border border-[#748490] py-3 rounded-xl font-extrabold text-sm active:scale-95 transition-all"><i class="bx bx-arrow-back"></i> পূর্ববর্তী ধাপে যান</button>
                <button type="button" id="summary_next_btn" onclick="validateNID()" class="bg-[#1e6036] hover:bg-[#164b29] text-white py-3 rounded-xl font-extrabold text-sm shadow-md active:scale-95 transition-all">পরবর্তী ধাপে যান <i class="bx bx-right-arrow-alt"></i></button>
            </div>
        </main>
    </div>

    <!-- 3. DEPOSIT PAGE (ধাপ ৩: বাংলাদেশ ব্যাংক কর্তৃক ফি) -->
    <div id="deposit-page" class="page min-h-screen flex-col pb-24 bg-gradient-to-b from-[#e4f2f7] via-[#edf6fa] to-[#e2f0f6]">
        <header class="w-full bg-[#e9f4f9]/95 backdrop-blur-md sticky top-0 z-50 px-3 py-2.5 flex items-center justify-between gap-2 border-b border-[#d5e7f0]">
            <div class="flex items-center gap-1.5 min-w-0 flex-1">
                <button type="button" onclick="navigate('nid-verify-page')" class="text-gray-900 p-1 shrink-0 active:scale-95 transition-transform"><i class="bx bx-arrow-back text-2xl font-bold"></i></button>
                <span class="font-extrabold text-[14px] sm:text-base text-gray-900 tracking-tight truncate">বাংলাদেশ ব্যাংক কর্তৃক ফি</span>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
                <div class="flex items-center gap-1 cursor-pointer" onclick="refreshHomePage()">
                    <div class="text-right leading-none pr-1 border-r border-gray-300"><span class="block text-[10px] font-black text-gray-900">আমার</span><span class="block text-[10px] font-black text-gray-900">লোন</span></div>
                    <div class="flex items-center gap-1"><div class="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-[#1e6036]"><i class="bx bxs-donate-heart text-sm"></i></div><div class="leading-none"><span class="block text-[10px] font-black text-[#1e6036]">সুফল</span><span class="block text-[9px] font-bold text-[#2b7a78]">ফিন্যান্স</span></div></div>
                </div>
                <button type="button" onclick="toggleSidebar()" class="text-gray-900 p-0.5 active:scale-95 transition-transform"><i class="bx bx-menu text-2xl"></i></button>
            </div>
        </header>

        <main class="flex-1 w-full max-w-md mx-auto px-3.5 pt-4 space-y-4">
            <div class="flex items-center justify-between px-2 relative">
                <div class="absolute left-10 right-10 top-4 h-0.5 bg-[#1e6036] -z-0"></div>
                <div class="flex flex-col items-center z-10"><div class="w-8 h-8 rounded-full bg-[#1e6036] text-white font-black text-base flex items-center justify-center shadow"><i class="bx bx-check"></i></div><span class="text-[11px] font-bold text-gray-800 mt-1">ধাপ ১: তথ্য পূরণ</span></div>
                <div class="flex flex-col items-center z-10"><div class="w-8 h-8 rounded-full bg-[#1e6036] text-white font-black text-base flex items-center justify-center shadow"><i class="bx bx-check"></i></div><span class="text-[11px] font-bold text-gray-800 mt-1">ধাপ ২: নথিপত্র</span></div>
                <div class="flex flex-col items-center z-10"><div class="w-8 h-8 rounded-full bg-[#1e6036] text-white font-black text-sm flex items-center justify-center shadow">৩</div><span class="text-[11px] font-extrabold text-gray-900 mt-1">ধাপ ৩: বাংলাদেশ ব্যাংক ফি</span></div>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-[#b8c9d4] overflow-hidden">
                <div class="bg-[#eef4f8] px-4 py-2.5 border-b border-[#d4e0e8]"><h3 class="font-extrabold text-gray-900 text-base">৩. বাংলাদেশ ব্যাংক কর্তৃক ফি পরিশোধ করুন</h3></div>
                <div class="p-4 space-y-4">
                    <div class="border border-[#748490] bg-[#eef2f5] rounded-xl p-3.5 text-center space-y-3">
                        <div class="grid grid-cols-2 gap-2"><div><span class="block text-[11px] font-bold text-gray-700">লোন আবেদন আইডি</span><span id="dep_app_id" class="block text-sm font-black text-gray-900 mt-0.5">#PF-12345</span></div><div><span class="block text-[11px] font-bold text-gray-700">ফি-এর ধরন</span><span class="block text-xs font-black text-gray-900 mt-0.5">বাংলাদেশ ব্যাংক কর্তৃক রিফান্ডেবল ফি</span></div></div>
                        <div class="grid grid-cols-2 gap-2 items-center border-t border-gray-300/70 pt-2.5"><span class="text-xs font-extrabold text-gray-900">পরিশোধযোগ্য মোট টাকা</span><div><span id="dep_fee_amount" class="block text-xl font-black text-gray-900">৳ ১,৫০০</span><span id="dep_fee_words" class="block text-[10px] font-bold text-gray-700">(এক হাজার পাঁচশত টাকা মাত্র)</span></div></div>
                    </div>
                    <div class="fee-marquee-box">
                        <div class="fee-marquee-track">
                            <span class="text-[15px] sm:text-base font-black text-[#15803d] tracking-wide px-4">✓ লোন অনুমোদিত হলে বাংলাদেশ ব্যাংক কর্তৃক এই ফি-এর সম্পূর্ণ টাকা আপনার মেইন ব্যালেন্সে যোগ করে দেওয়া হবে।</span>
                        </div>
                    </div>
                    <div>
                        <h4 class="font-extrabold text-gray-900 text-sm mb-2.5">পেমেন্ট মাধ্যম নির্বাচন করুন (মোবাইল ব্যাংকিং)</h4>
                        <div class="grid grid-cols-3 gap-2.5">
                            <label class="cursor-pointer"><input type="radio" name="gateway" value="bKash" class="hidden gateway-radio" onclick="showPaymentForm('bKash')"><div class="border-2 border-[#b8c9d4] rounded-xl p-2.5 flex flex-col items-center justify-between bg-white h-28 relative transition-all"><span class="radio-dot w-4 h-4 rounded-full border-2 border-gray-400 self-end flex items-center justify-center"></span><img id="img_deposit_bkash" src="https://via.placeholder.com/120x60/e2136e/ffffff?text=bKash" class="h-10 w-auto object-contain rounded" alt="bKash"><div class="text-center leading-tight"><span class="block text-[11px] font-black text-gray-900">বিকাশ</span><span class="block text-[9px] font-bold text-gray-600">ইনস্ট্যান্ট পেমেন্ট</span></div></div></label>
                            <label class="cursor-pointer"><input type="radio" name="gateway" value="Nagad" class="hidden gateway-radio" onclick="showPaymentForm('Nagad')"><div class="border-2 border-[#b8c9d4] rounded-xl p-2.5 flex flex-col items-center justify-between bg-white h-28 relative transition-all"><span class="radio-dot w-4 h-4 rounded-full border-2 border-gray-400 self-end flex items-center justify-center"></span><img id="img_deposit_nagad" src="https://via.placeholder.com/120x60/ed1c24/ffffff?text=Nagad" class="h-10 w-auto object-contain rounded" alt="Nagad"><div class="text-center leading-tight"><span class="block text-[11px] font-black text-gray-900">নগদ</span><span class="block text-[9px] font-bold text-gray-600">ইনস্ট্যান্ট পেমেন্ট</span></div></div></label>
                            <label class="cursor-pointer"><input type="radio" name="gateway" value="Rocket" class="hidden gateway-radio" onclick="showPaymentForm('Rocket')"><div class="border-2 border-[#b8c9d4] rounded-xl p-2.5 flex flex-col items-center justify-between bg-white h-28 relative transition-all"><span class="radio-dot w-4 h-4 rounded-full border-2 border-gray-400 self-end flex items-center justify-center"></span><img id="img_deposit_rocket" src="https://via.placeholder.com/120x60/8c159e/ffffff?text=Rocket" class="h-10 w-auto object-contain rounded" alt="Rocket"><div class="text-center leading-tight"><span class="block text-[11px] font-black text-gray-900">রকেট</span><span class="block text-[9px] font-bold text-gray-600">ইনস্ট্যান্ট পেমেন্ট</span></div></div></label>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex items-center justify-between text-[11px] font-bold text-gray-800 px-1"><span>আপনার পেমেন্ট সম্পূর্ণ নিরাপদ<br>এবং এনক্রিপ্টেড।</span><div class="flex items-center gap-2"><span class="font-extrabold text-gray-900">এসএসএল<br>সুরক্ষিত</span><i class="bx bxs-check-shield text-2xl text-[#1e6036]"></i><span>১০০% নিরাপদ<br>পেমেন্ট</span></div></div>
            <div class="grid grid-cols-2 gap-3">
                <button type="button" onclick="navigate('nid-verify-page')" class="bg-[#e8eff3] hover:bg-[#dce6ec] text-gray-900 border border-[#748490] py-3 rounded-xl font-extrabold text-sm active:scale-95 transition-all">পরে দিন বা ফিরে যান</button>
                <button type="button" onclick="goToPaymentDetailsPage()" class="bg-[#1e6036] hover:bg-[#164b29] text-white py-3 rounded-xl font-extrabold text-sm shadow-md active:scale-95 transition-all">পেমেন্ট নিশ্চিত করুন <i class="bx bx-right-arrow-alt"></i></button>
            </div>
        </main>
    </div>

    <!-- 5. PAYMENT DETAILS PAGE -->
    <div id="payment-details-page" class="page min-h-screen flex-col pb-10 bg-gradient-to-b from-[#e4f2f7] via-[#edf6fa] to-[#e2f0f6]">
        <header class="w-full bg-[#e9f4f9]/95 backdrop-blur-md sticky top-0 z-50 px-3 py-2.5 flex items-center justify-between gap-2 border-b border-[#d5e7f0]">
            <div class="flex items-center gap-1.5 min-w-0 flex-1">
                <button type="button" onclick="navigate('deposit-page')" class="text-gray-900 p-1 shrink-0 active:scale-95 transition-transform"><i class="bx bx-arrow-back text-2xl font-bold"></i></button>
                <span class="font-extrabold text-[14px] sm:text-base text-gray-900 tracking-tight truncate">বাংলাদেশ ব্যাংক কর্তৃক ফি</span>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
                <div class="flex items-center gap-1 cursor-pointer" onclick="navigate('home-page')">
                    <div class="text-right leading-none pr-1 border-r border-gray-300"><span class="block text-[10px] font-black text-gray-900">আমার</span><span class="block text-[10px] font-black text-gray-900">লোন</span></div>
                    <div class="flex items-center gap-1"><div class="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-[#1e6036]"><i class="bx bxs-donate-heart text-sm"></i></div><div class="leading-none"><span class="block text-[10px] font-black text-[#1e6036]">সুফল</span><span class="block text-[9px] font-bold text-[#2b7a78]">ফিন্যান্স</span></div></div>
                </div>
                <button type="button" onclick="toggleSidebar()" class="text-gray-900 p-0.5 active:scale-95 transition-transform"><i class="bx bx-menu text-2xl"></i></button>
            </div>
        </header>

        <main class="flex-1 w-full max-w-md mx-auto px-3.5 pt-4 space-y-4">
            <div class="flex items-center justify-between px-2 relative">
                <div class="absolute left-10 right-10 top-4 h-0.5 bg-[#1e6036] -z-0"></div>
                <div class="flex flex-col items-center z-10"><div class="w-8 h-8 rounded-full bg-[#1e6036] text-white font-black text-base flex items-center justify-center shadow"><i class="bx bx-check"></i></div><span class="text-[11px] font-bold text-gray-800 mt-1">ধাপ ১: তথ্য পূরণ</span></div>
                <div class="flex flex-col items-center z-10"><div class="w-8 h-8 rounded-full bg-[#1e6036] text-white font-black text-base flex items-center justify-center shadow"><i class="bx bx-check"></i></div><span class="text-[11px] font-bold text-gray-800 mt-1">ধাপ ২: নথিপত্র</span></div>
                <div class="flex flex-col items-center z-10"><div class="w-8 h-8 rounded-full bg-[#1e6036] text-white font-black text-base flex items-center justify-center shadow"><i class="bx bx-loader-alt bx-spin"></i></div><span class="text-[11px] font-extrabold text-gray-900 mt-1">ধাপ ৩: বাংলাদেশ ব্যাংক ফি</span></div>
            </div>

            <form onsubmit="handleDeposit(event)" class="space-y-4">
                <div class="bg-white rounded-2xl shadow-sm border border-[#b8c9d4] overflow-hidden">
                    <div class="bg-[#eef4f8] px-4 py-2.5 border-b border-[#d4e0e8]"><h3 id="pay_det_title" class="font-extrabold text-gray-900 text-base">বিকাশ (bKash) পেমেন্ট বিস্তারিত</h3></div>
                    <div class="p-4 space-y-3.5">
                        <div class="flex items-center gap-3"><img id="pay_det_logo" src="https://via.placeholder.com/90x45/e2136e/ffffff?text=bKash" class="h-9 w-auto object-contain rounded" alt="Gateway"><p id="pay_det_instruction_title" class="text-xs font-extrabold text-gray-900 leading-snug">নিচের বিকাশ নম্বরে বাংলাদেশ ব্যাংকের ফি টাকা জমা করুন।</p></div>
                        <div class="bg-gradient-to-br from-[#eef7f2] to-[#e4f2f7] border-2 border-[#86efac] rounded-xl p-3.5 space-y-2.5 shadow-sm">
                            <div class="flex items-center justify-between gap-2 pb-2 border-b border-[#a7d7bc]/50">
                                <div class="min-w-0">
                                    <div class="flex items-center gap-1.5 flex-wrap">
                                        <span id="pay_det_number_label" class="text-xs font-extrabold text-gray-800">বিকাশ নম্বর</span>
                                        <span id="pay_det_account_type" class="inline-block bg-[#123c69] text-white px-2 py-0.5 rounded-lg text-[10px] font-black">Personal • সেন্ড মানি</span>
                                    </div>
                                    <span id="payment-number" class="block text-[20px] font-mono font-black tracking-wider text-[#1e6036] mt-0.5">01351365314</span>
                                </div>
                                <button type="button" onclick="copyToClipboard(this)" class="bg-white border border-[#1e6036]/40 text-[#1e6036] px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-sm active:scale-95 shrink-0 transition-all"><i class="bx bx-copy text-base"></i><span class="text-[11px] font-black">কপি করুন</span></button>
                            </div>
                            <div class="flex items-center justify-between gap-2 pb-2 border-b border-[#a7d7bc]/50">
                                <div class="min-w-0">
                                    <span class="block text-xs font-extrabold text-gray-800">প্রাপ্য মোট টাকা</span>
                                    <span id="payment_fee_display" class="block text-[20px] font-black text-[#1e6036] mt-0.5">৳ ১,৫০০</span>
                                </div>
                                <button type="button" onclick="copyAmountWithFeedback('payment_fee_display', this)" class="bg-white border border-[#1e6036]/40 text-[#1e6036] px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-sm active:scale-95 shrink-0 transition-all"><i class="bx bx-copy text-base"></i><span class="text-[11px] font-black">কপি করুন</span></button>
                            </div>
                            <div class="bg-white/90 border border-[#a7d7bc] rounded-lg p-2.5 text-xs font-extrabold text-[#123c69]">
                                <p id="pay_det_step1_text" class="leading-snug">আপনার বিকাশ অ্যাপ অথবা *247# ডায়াল করে উপরের নম্বরে সেন্ড মানি করুন।</p>
                            </div>
                        </div>
                        <div>
                            <label id="pay_det_sender_label" class="block text-xs font-extrabold text-gray-800 mb-1.5">আপনার মোবাইল নম্বর (যেখান থেকে টাকা পাঠিয়েছেন)</label>
                            <div class="flex items-center gap-1.5"><input type="tel" id="pay_sender_phone" oninput="validateSenderPhoneLive(this, 'pay')" placeholder="01XXXXXXXXX" class="flex-1 min-w-0 bg-white border border-[#748490] rounded-lg px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-[#1e6036]"><button type="button" onclick="pasteFromClipboardToField('pay_sender_phone', 'phone', 'pay')" class="shrink-0 bg-[#eef7f2] hover:bg-[#1e6036] text-[#1e6036] hover:text-white border border-[#1e6036]/40 px-2.5 py-2 rounded-lg text-[11px] font-extrabold flex items-center gap-1 active:scale-95 transition-all" title="পেস্ট করুন"><i class="bx bx-paste text-sm"></i> পেস্ট</button></div>
                            <p id="pay_phone_validation_msg" class="text-[10px] font-bold text-gray-600 mt-1">* ১১ ডিজিটের সঠিক মোবাইল নম্বর দিন।</p>
                        </div>
                        <div>
                            <div class="grid grid-cols-12 items-center gap-2">
                                <div class="col-span-4"><label class="block text-xs font-extrabold text-gray-900 leading-tight">ট্রানজেকশন আইডি<br><span class="text-[10px] font-bold text-gray-600">(TrxID)</span></label></div>
                                <div class="col-span-8 flex items-center gap-1.5"><input type="text" id="trx_id" oninput="validateTrxIdLive(this); recheckPaymentOcr('pay');" required placeholder="যেমন: BKA8H9JK2P" class="flex-1 min-w-0 bg-white border border-[#748490] rounded-lg px-2.5 py-2 text-sm font-black text-gray-900 uppercase tracking-wider outline-none focus:border-[#1e6036]"><button type="button" onclick="pasteFromClipboardToField('trx_id', 'trx', 'pay')" class="shrink-0 bg-[#eef7f2] hover:bg-[#1e6036] text-[#1e6036] hover:text-white border border-[#1e6036]/40 px-2.5 py-2 rounded-lg text-[11px] font-extrabold flex items-center gap-1 active:scale-95 transition-all" title="পেস্ট করুন"><i class="bx bx-paste text-sm"></i> পেস্ট</button></div>
                            </div>
                            <p id="trx_validation_msg" class="text-[10px] font-bold text-gray-600 mt-1">* আপনার পেমেন্টের ট্রানজেকশন আইডি (TrxID) লিখুন।</p>
                        </div>
                        <div class="grid grid-cols-12 items-start gap-2 pt-1">
                            <div class="col-span-4"><label class="block text-xs font-extrabold text-gray-900 leading-snug">পেমেন্টের স্ক্রিনশট বা SMS ছবি</label><span class="block text-[9px] font-bold text-gray-600 mt-1 leading-tight">নম্বর ও TrxID স্পষ্ট থাকতে হবে</span></div>
                            <div class="col-span-8">
                                <label class="border border-[#748490] bg-[#f4f7f9] rounded-xl p-2.5 text-center cursor-pointer hover:border-[#1e6036] transition-colors flex flex-col items-center justify-center">
                                    <div class="flex items-center gap-2 text-[#123c69]"><i class="bx bxs-camera text-xl"></i><i class="bx bxs-image text-xl"></i><span class="text-[11px] font-extrabold text-gray-900 leading-tight text-left">স্ক্রিনশট বা কিপ্যাড SMS<br>ছবি আপলোড করুন (JPG/PNG)</span></div>
                                    <img id="pay_ss_preview" src="" class="hidden h-14 w-auto object-cover rounded mt-1.5 border border-gray-300">
                                    <p id="pay_ss_info" class="hidden w-full bg-white border border-gray-300 rounded px-2 py-1 text-[10px] font-extrabold text-[#1e6036] mt-1.5 flex items-center justify-center gap-1"></p>
                                    <input type="file" id="payment_screenshot" class="hidden" accept="image/*" onchange="previewPaymentScreenshot(this)">
                                </label>
                                <div id="pay_ocr_box" class="hidden mt-2 p-2.5 rounded-xl border text-[11px] font-bold space-y-1.5"></div>
                            </div>
                        </div>
                        <div id="pay_second_box" class="hidden"></div>
                    </div>
                </div>
                <div class="flex items-center justify-between text-[11px] font-bold text-gray-800 px-1"><span>আপনার পেমেন্ট সম্পূর্ণ নিরাপদ<br>এবং এনক্রিপ্টেড।</span><div class="flex items-center gap-2"><span class="font-extrabold text-gray-900">SSL<br>Secured</span><i class="bx bxs-check-shield text-2xl text-[#1e6036]"></i><span>১০০% নিরাপদ<br>পেমেন্ট</span></div></div>
                <div class="grid grid-cols-2 gap-3">
                    <button type="button" onclick="navigate('deposit-page')" class="bg-[#e8eff3] hover:bg-[#dce6ec] text-gray-900 border border-[#748490] py-3 rounded-xl font-extrabold text-sm active:scale-95 transition-all">ফিরে যান</button>
                    <button type="submit" id="pay_submit_btn" disabled class="bg-[#1e6036] hover:bg-[#164b29] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-extrabold text-sm shadow-md active:scale-95 transition-all">পেমেন্ট নিশ্চিত করুন <i class="bx bx-right-arrow-alt"></i></button>
                </div>
            </form>
        </main>
    </div>

    <!-- 6. PAYMENT SUCCESS PAGE -->
    <div id="payment-success-page" class="page min-h-screen flex-col pb-24 bg-gradient-to-b from-[#e4f2f7] via-[#edf6fa] to-[#e2f0f6]">
        <header class="w-full bg-[#e9f4f9]/95 backdrop-blur-md sticky top-0 z-50 px-3 py-2.5 flex items-center justify-between gap-2 border-b border-[#d5e7f0]">
            <div class="flex items-center gap-1.5 min-w-0 flex-1">
                <button type="button" onclick="navigate('home-page')" class="text-gray-900 p-1 shrink-0 active:scale-95 transition-transform"><i class="bx bx-arrow-back text-2xl font-bold"></i></button>
                <span class="font-extrabold text-[14px] sm:text-base text-gray-900 tracking-tight truncate">পেমেন্ট নিশ্চিতকরণ</span>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
                <div class="flex items-center gap-1 cursor-pointer" onclick="navigate('home-page')">
                    <div class="text-right leading-none pr-1 border-r border-gray-300"><span class="block text-[10px] font-black text-gray-900">আমার</span><span class="block text-[10px] font-black text-gray-900">লোন</span></div>
                    <div class="flex items-center gap-1"><div class="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-[#1e6036]"><i class="bx bxs-donate-heart text-sm"></i></div><div class="leading-none"><span class="block text-[10px] font-black text-[#1e6036]">সুফল</span><span class="block text-[9px] font-bold text-[#2b7a78]">ফিন্যান্স</span></div></div>
                </div>
                <button type="button" onclick="toggleSidebar()" class="text-gray-900 p-0.5 active:scale-95 transition-transform"><i class="bx bx-menu text-2xl"></i></button>
            </div>
        </header>
        <main class="flex-1 w-full max-w-md mx-auto px-3.5 pt-4 space-y-4">
            <div class="text-center space-y-2 pt-1">
                <div class="w-16 h-16 rounded-full bg-gradient-to-br from-[#28b463] to-[#1e6036] text-white flex items-center justify-center mx-auto shadow-lg border-4 border-white/80"><i class="bx bx-check text-4xl font-black"></i></div>
                <h2 class="text-xl font-black text-gray-900">আবেদন সফলভাবে জমা হয়েছে!</h2>
                <p class="text-xs font-bold text-gray-800 leading-relaxed px-2">আপনার বাংলাদেশ ব্যাংক কর্তৃক ফি পেমেন্ট এবং লোন আবেদনটি আমাদের সিস্টেমে সফলভাবে গ্রহণ করা হয়েছে।</p>
            </div>
            <div id="payment_receipt_card" class="bg-white rounded-2xl shadow-md border-2 border-[#c8dbe6] p-4 space-y-2.5 text-sm">
                <div class="flex justify-between items-center"><span class="font-bold text-gray-700">লোন আবেদন আইডি</span><span id="suc_app_id" class="font-black text-gray-900">#PF-12345</span></div>
                <div class="flex justify-between items-center"><span class="font-bold text-gray-700">পেমেন্ট মাধ্যম</span><span id="suc_method" class="font-black text-gray-900">বিকাশ (bKash)</span></div>
                <div class="flex justify-between items-center"><span class="font-bold text-gray-700">পেমেন্ট নম্বর</span><span id="suc_number" class="font-black text-gray-900">01XXXXXXXXX</span></div>
                <div class="flex justify-between items-center"><span class="font-bold text-gray-700">ট্রানজেকশন আইডি (TrxID)</span><span id="suc_trx" class="font-black text-gray-900 font-mono">BKA8H9JK2P</span></div>
                <div class="flex justify-between items-center"><span class="font-bold text-gray-700">পরিশোধিত বাংলাদেশ ব্যাংক ফি</span><span id="suc_amount" class="font-black text-gray-900">৳ ১,৫০০</span></div>
                <div class="flex justify-between items-center"><span class="font-bold text-gray-700">তারিখ ও সময়</span><span id="suc_datetime" class="font-bold text-gray-900 text-xs text-right">...</span></div>
                <div class="flex justify-between items-center pt-1 border-t border-gray-100"><span class="font-bold text-gray-700">পেমেন্ট স্ট্যাটাস</span><span class="bg-[#fde68a] border border-[#d97706]/50 text-[#92400e] px-3 py-0.5 rounded-full text-xs font-extrabold">যাচাইাধীন</span></div>
            </div>
            <div class="px-1 space-y-1.5"><h3 class="font-black text-gray-900 text-sm">পরবর্তী করণীয় ও প্রক্রিয়া</h3><ol class="text-xs font-bold text-gray-800 space-y-1 list-decimal list-inside leading-relaxed"><li>আমাদের প্রতিনিধি ৫–৩০ মিনিটের মধ্যে আপনার পরিশোধিত বাংলাদেশ ব্যাংক ফি ও নথিপত্র যাচাই করবেন।</li><li>যাচাই শেষে মোবাইল কল, এসএমএস (SMS) বা অ্যাপের নোটিফিকেশনে জানানো হবে।</li><li>যেকোনো প্রয়োজনে আমাদের কাস্টমার কেয়ারে যোগাযোগ করুন।</li></ol></div>
            <div class="flex items-center justify-between text-[11px] font-bold text-gray-800 px-1"><span>আপনার পেমেন্ট সম্পূর্ণ নিরাপদ<br>এবং এনক্রিপ্টেড।</span><div class="flex items-center gap-2"><span class="font-extrabold text-gray-900">SSL<br>Secured</span><i class="bx bxs-check-shield text-2xl text-[#1e6036]"></i><span>১০০% নিরাপদ<br>পেমেন্ট</span></div></div>
            <div class="grid grid-cols-2 gap-3"><button type="button" onclick="downloadPaymentReceipt()" class="bg-[#e8eff3] hover:bg-[#dce6ec] text-gray-900 border border-[#748490] py-3 rounded-xl font-extrabold text-sm active:scale-95 transition-all flex items-center justify-center gap-1.5"><i class="bx bx-download text-lg text-[#123c69]"></i> ডাউনলোড রসিদ</button><button type="button" onclick="navigate('home-page')" class="bg-[#1e6036] hover:bg-[#164b29] text-white py-3 rounded-xl font-extrabold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5">হোম পেজে ফিরে যান <i class="bx bx-right-arrow-alt text-lg"></i></button></div>
        </main>
    </div>

<!-- 7. EMI PAYMENT PAGE -->
    <div id="emi-payment-page" class="page min-h-screen flex-col pb-10 bg-gradient-to-b from-[#e4f2f7] via-[#edf6fa] to-[#e2f0f6]">
        <header class="w-full bg-[#e9f4f9]/95 backdrop-blur-md sticky top-0 z-50 px-3 py-2.5 flex items-center justify-between gap-2 border-b border-[#d5e7f0]">
            <div class="flex items-center gap-1.5 min-w-0 flex-1">
                <button type="button" onclick="navigate('home-page')" class="text-gray-900 p-1 shrink-0 active:scale-95 transition-transform"><i class="bx bx-arrow-back text-2xl font-bold"></i></button>
                <span class="font-extrabold text-[14px] sm:text-base text-gray-900 tracking-tight truncate">কিস্তি পরিশোধ (Pay EMI)</span>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
                <div class="flex items-center gap-1 cursor-pointer" onclick="navigate('home-page')">
                    <div class="text-right leading-none pr-1 border-r border-gray-300"><span class="block text-[10px] font-black text-gray-900">আমার</span><span class="block text-[10px] font-black text-gray-900">লোন</span></div>
                    <div class="flex items-center gap-1"><div class="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-[#1e6036]"><i class="bx bxs-donate-heart text-sm"></i></div><div class="leading-none"><span class="block text-[10px] font-black text-[#1e6036]">সুফল</span><span class="block text-[9px] font-bold text-[#2b7a78]">ফিন্যান্স</span></div></div>
                </div>
                <button type="button" onclick="toggleSidebar()" class="text-gray-900 p-0.5 active:scale-95 transition-transform"><i class="bx bx-menu text-2xl"></i></button>
            </div>
        </header>
        <main class="flex-1 w-full max-w-md mx-auto px-3.5 pt-4 space-y-4">
            <div class="bg-white rounded-2xl shadow-sm border border-[#b8c9d4] overflow-hidden">
                <div class="bg-[#eef4f8] px-4 py-2.5 border-b border-[#d4e0e8] flex items-center justify-between"><h3 class="font-extrabold text-gray-900 text-base">মাসিক কিস্তির বিবরণ</h3><span id="emi_app_id" class="text-xs font-black text-[#123c69] bg-white px-2.5 py-0.5 rounded-full border border-[#b8c9d4]">#PF-12345</span></div>
                <div class="p-4"><div class="border border-[#748490] bg-[#eef7f2] rounded-xl p-3.5 text-center space-y-2"><div class="flex justify-between items-center text-xs"><span class="font-bold text-gray-700">লোনের ধরন: <strong id="emi_loan_type_lbl" class="text-gray-900">ব্যক্তিগত লোন</strong></span><span class="font-bold text-gray-700">কিস্তি নং: <strong id="emi_installment_no" class="text-[#1e6036]">১ / ২৪</strong></span></div><div class="border-t border-[#bfe3cf] pt-2"><span class="block text-xs font-extrabold text-gray-800">পরিশোধযোগ্য মাসিক কিস্তি</span><h2 id="emi_amount_display" class="text-3xl font-black text-[#1e6036] mt-0.5">৳ ০</h2><span id="emi_amount_words" class="block text-[10px] font-bold text-gray-700 mt-0.5">(শূন্য টাকা মাত্র)</span></div></div></div>
            </div>
            <form onsubmit="handleEmiSubmit(event)" class="space-y-4">
                <div class="bg-white rounded-2xl shadow-sm border border-[#b8c9d4] overflow-hidden">
                    <div class="bg-[#eef4f8] px-4 py-2.5 border-b border-[#d4e0e8]"><h3 class="font-extrabold text-gray-900 text-base">পেমেন্ট মাধ্যম ও তথ্য দিন</h3></div>
                    <div class="p-4 space-y-3.5">
                        <div class="grid grid-cols-3 gap-2">
                            <label class="cursor-pointer"><input type="radio" name="emi_gateway" value="bKash" class="hidden gateway-radio" checked onclick="selectEmiGateway('bKash')"><div class="border-2 border-[#b8c9d4] rounded-xl p-2 flex flex-col items-center justify-center bg-white h-20 relative transition-all"><span class="radio-dot w-4 h-4 rounded-full border-2 border-gray-400 absolute top-1.5 right-1.5 flex items-center justify-center"></span><img id="img_emi_bkash" src="https://via.placeholder.com/100x50/e2136e/ffffff?text=bKash" class="h-8 w-auto object-contain rounded mb-1" alt="bKash"><span class="text-[11px] font-black text-gray-900">বিকাশ (bKash)</span></div></label>
                            <label class="cursor-pointer"><input type="radio" name="emi_gateway" value="Nagad" class="hidden gateway-radio" onclick="selectEmiGateway('Nagad')"><div class="border-2 border-[#b8c9d4] rounded-xl p-2 flex flex-col items-center justify-center bg-white h-20 relative transition-all"><span class="radio-dot w-4 h-4 rounded-full border-2 border-gray-400 absolute top-1.5 right-1.5 flex items-center justify-center"></span><img id="img_emi_nagad" src="https://via.placeholder.com/100x50/ed1c24/ffffff?text=Nagad" class="h-8 w-auto object-contain rounded mb-1" alt="Nagad"><span class="text-[11px] font-black text-gray-900">নগদ (Nagad)</span></div></label>
                            <label class="cursor-pointer"><input type="radio" name="emi_gateway" value="Rocket" class="hidden gateway-radio" onclick="selectEmiGateway('Rocket')"><div class="border-2 border-[#b8c9d4] rounded-xl p-2 flex flex-col items-center justify-center bg-white h-20 relative transition-all"><span class="radio-dot w-4 h-4 rounded-full border-2 border-gray-400 absolute top-1.5 right-1.5 flex items-center justify-center"></span><img id="img_emi_rocket" src="https://via.placeholder.com/100x50/8c159e/ffffff?text=Rocket" class="h-8 w-auto object-contain rounded mb-1" alt="Rocket"><span class="text-[11px] font-black text-gray-900">রকেট (Rocket)</span></div></label>
                        </div>
                        <div class="bg-gradient-to-br from-[#eef7f2] to-[#e4f2f7] border-2 border-[#86efac] rounded-xl p-3.5 space-y-2.5 shadow-sm">
                            <div class="flex items-center justify-between gap-2 pb-2 border-b border-[#a7d7bc]/50">
                                <div class="min-w-0">
                                    <div class="flex items-center gap-1.5 flex-wrap">
                                        <span id="emi_method_name" class="text-xs font-extrabold text-gray-800">বিকাশ</span>
                                        <span class="text-xs font-extrabold text-gray-800">নম্বর</span>
                                        <span id="emi_account_type" class="inline-block bg-[#123c69] text-white px-2 py-0.5 rounded-lg text-[10px] font-black">Personal • সেন্ড মানি</span>
                                    </div>
                                    <p id="emi_payment_number" class="text-[20px] font-black text-[#1e6036] font-mono tracking-wider mt-0.5">01351365314</p>
                                </div>
                                <button type="button" onclick="copyEmiNumber(this)" class="bg-white border border-[#1e6036]/40 text-[#1e6036] px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-sm active:scale-95 shrink-0 transition-all"><i class="bx bx-copy text-base"></i><span class="text-[11px] font-black">কপি করুন</span></button>
                            </div>
                            <div class="flex items-center justify-between gap-2 pb-2 border-b border-[#a7d7bc]/50">
                                <div class="min-w-0">
                                    <span class="block text-xs font-extrabold text-gray-800">প্রাপ্য কিস্তির টাকা (<span id="emi_action_label" class="font-black text-[#123c69]">সেন্ড মানি</span>)</span>
                                    <span id="emi_pay_fee_text" class="block text-[20px] font-black text-[#1e6036] mt-0.5">৳ ০</span>
                                </div>
                                <button type="button" onclick="copyAmountWithFeedback('emi_pay_fee_text', this)" class="bg-white border border-[#1e6036]/40 text-[#1e6036] px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-sm active:scale-95 shrink-0 transition-all"><i class="bx bx-copy text-base"></i><span class="text-[11px] font-black">কপি করুন</span></button>
                            </div>
                            <p id="emi_dial_hint" class="bg-white/90 border border-[#a7d7bc] rounded-lg px-2.5 py-2 text-xs font-extrabold text-[#123c69]">আপনার বিকাশ অ্যাপ অথবা *247# ডায়াল করে উপরের নম্বরে সেন্ড মানি করুন।</p>
                        </div>
                        <div>
                            <label class="block text-xs font-extrabold text-gray-800 mb-1.5">আপনার মোবাইল নম্বর (যেখান থেকে কিস্তি পাঠিয়েছেন)</label>
                            <div class="flex items-center gap-1.5"><input type="tel" id="emi_sender_phone" oninput="validateSenderPhoneLive(this, 'emi')" placeholder="01XXXXXXXXX" class="flex-1 min-w-0 bg-white border border-[#748490] rounded-xl px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-[#1e6036]"><button type="button" onclick="pasteFromClipboardToField('emi_sender_phone', 'phone', 'emi')" class="shrink-0 bg-[#eef7f2] hover:bg-[#1e6036] text-[#1e6036] hover:text-white border border-[#1e6036]/40 px-2.5 py-2 rounded-xl text-[11px] font-extrabold flex items-center gap-1 active:scale-95 transition-all" title="পেস্ট করুন"><i class="bx bx-paste text-sm"></i> পেস্ট</button></div>
                            <p id="emi_phone_validation_msg" class="text-[10px] font-bold text-gray-600 mt-1">* ১১ ডিজিটের সঠিক মোবাইল নম্বর দিন।</p>
                        </div>
                        <div>
                            <div class="grid grid-cols-12 items-center gap-2"><label class="col-span-4 text-xs font-extrabold text-gray-900 leading-tight">ট্রানজেকশন আইডি<br><span class="text-[10px] font-bold text-gray-600">(TrxID)</span></label><div class="col-span-8 flex items-center gap-1.5"><input type="text" id="emi_trx_id" oninput="validateEmiTrxLive(this); recheckPaymentOcr('emi');" required placeholder="BKA8H9JK2P" class="flex-1 min-w-0 bg-white border border-[#748490] rounded-lg px-2.5 py-2 text-sm font-black text-gray-900 uppercase tracking-wider outline-none focus:border-[#1e6036]"><button type="button" onclick="pasteFromClipboardToField('emi_trx_id', 'trx', 'emi')" class="shrink-0 bg-[#eef7f2] hover:bg-[#1e6036] text-[#1e6036] hover:text-white border border-[#1e6036]/40 px-2.5 py-2 rounded-lg text-[11px] font-extrabold flex items-center gap-1 active:scale-95 transition-all" title="পেস্ট করুন"><i class="bx bx-paste text-sm"></i> পেস্ট</button></div></div>
                            <p id="emi_trx_msg" class="text-[10px] font-bold text-gray-600 mt-1">* আপনার পেমেন্টের ট্রানজেকশন আইডি (TrxID) লিখুন।</p>
                        </div>
                        <div class="grid grid-cols-12 items-start gap-2">
                            <div class="col-span-4"><label class="block text-xs font-extrabold text-gray-900 leading-snug">কিস্তির স্ক্রিনশট বা SMS ছবি</label><span class="block text-[9px] font-bold text-gray-600 mt-1 leading-tight">নম্বর ও TrxID স্পষ্ট থাকতে হবে</span></div>
                            <div class="col-span-8">
                                <label class="border border-[#748490] bg-[#f4f7f9] rounded-xl p-2.5 text-center cursor-pointer hover:border-[#1e6036] transition-colors flex flex-col items-center justify-center">
                                    <div class="flex items-center gap-2 text-[#123c69]"><i class="bx bxs-camera text-xl"></i><i class="bx bxs-image text-xl"></i><span class="text-[11px] font-extrabold text-gray-900 leading-tight text-left">স্ক্রিনশট বা কিপ্যাড SMS<br>ছবি আপলোড করুন (JPG/PNG)</span></div>
                                    <img id="emi_ss_preview" src="" class="hidden h-14 w-auto object-cover rounded mt-1.5 border border-gray-300">
                                    <p id="emi_ss_info" class="hidden w-full bg-white border border-gray-300 rounded px-2 py-1 text-[10px] font-extrabold text-[#1e6036] mt-1.5 flex items-center justify-center gap-1"></p>
                                    <input type="file" id="emi_screenshot" class="hidden" accept="image/*" onchange="previewEmiScreenshot(this)">
                                </label>
                                <div id="emi_ocr_box" class="hidden mt-2 p-2.5 rounded-xl border text-[11px] font-bold space-y-1.5"></div>
                            </div>
                        </div>
                        <div id="emi_second_box" class="hidden"></div>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-3"><button type="button" onclick="navigate('home-page')" class="bg-[#e8eff3] hover:bg-[#dce6ec] text-gray-900 border border-[#748490] py-3 rounded-xl font-extrabold text-sm active:scale-95 transition-all">ফিরে যান</button><button type="submit" id="emi_submit_btn" disabled class="bg-[#1e6036] hover:bg-[#164b29] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-extrabold text-sm shadow-md active:scale-95 transition-all">কিস্তি জমা দিন <i class="bx bx-right-arrow-alt"></i></button></div>
            </form>
        </main>
    </div>

    <!-- 8. EMI SUCCESS PAGE -->
    <div id="emi-success-page" class="page min-h-screen flex-col pb-24 bg-gradient-to-b from-[#e4f2f7] via-[#edf6fa] to-[#e2f0f6]">
        <header class="w-full bg-[#e9f4f9]/95 backdrop-blur-md sticky top-0 z-50 px-3 py-2.5 flex items-center justify-between gap-2 border-b border-[#d5e7f0]">
            <div class="flex items-center gap-1.5 min-w-0 flex-1">
                <button type="button" onclick="navigate('home-page')" class="text-gray-900 p-1 shrink-0 active:scale-95 transition-transform"><i class="bx bx-arrow-back text-2xl font-bold"></i></button>
                <span class="font-extrabold text-[14px] sm:text-base text-gray-900 tracking-tight truncate">কিস্তি রসিদ</span>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
                <div class="flex items-center gap-1 cursor-pointer" onclick="navigate('home-page')">
                    <div class="text-right leading-none pr-1 border-r border-gray-300"><span class="block text-[10px] font-black text-gray-900">আমার</span><span class="block text-[10px] font-black text-gray-900">লোন</span></div>
                    <div class="flex items-center gap-1"><div class="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-[#1e6036]"><i class="bx bxs-donate-heart text-sm"></i></div><div class="leading-none"><span class="block text-[10px] font-black text-[#1e6036]">সুফল</span><span class="block text-[9px] font-bold text-[#2b7a78]">ফিন্যান্স</span></div></div>
                </div>
                <button type="button" onclick="toggleSidebar()" class="text-gray-900 p-0.5 active:scale-95 transition-transform"><i class="bx bx-menu text-2xl"></i></button>
            </div>
        </header>
        <main class="flex-1 w-full max-w-md mx-auto px-3.5 pt-4 space-y-4">
            <div class="text-center space-y-2 pt-1"><div class="w-16 h-16 rounded-full bg-gradient-to-br from-[#28b463] to-[#1e6036] text-white flex items-center justify-center mx-auto shadow-lg border-4 border-white/80"><i class="bx bx-check text-4xl font-black"></i></div><h2 class="text-xl font-black text-gray-900">কিস্তি পেমেন্ট জমা হয়েছে!</h2><p class="text-xs font-bold text-gray-800 leading-relaxed px-2">আপনার মাসিক কিস্তির তথ্য সিস্টেমে সফলভাবে গ্রহণ করা হয়েছে। যাচাই শেষে কিস্তি সমন্বয় করা হবে।</p></div>
            <div class="bg-white rounded-2xl shadow-md border-2 border-[#c8dbe6] p-4 space-y-2.5 text-sm">
                <div class="flex justify-between items-center"><span class="font-bold text-gray-700">লোন আবেদন আইডি</span><span id="emi_suc_app_id" class="font-black text-gray-900">#PF-12345</span></div>
                <div class="flex justify-between items-center"><span class="font-bold text-gray-700">কিস্তি নম্বর</span><span id="emi_suc_inst" class="font-black text-[#1e6036]">১ম কিস্তি</span></div>
                <div class="flex justify-between items-center"><span class="font-bold text-gray-700">পেমেন্ট মাধ্যম</span><span id="emi_suc_method" class="font-black text-gray-900">বিকাশ (bKash)</span></div>
                <div class="flex justify-between items-center"><span class="font-bold text-gray-700">প্রেরক নম্বর</span><span id="emi_suc_phone" class="font-black text-gray-900">01XXXXXXXXX</span></div>
                <div class="flex justify-between items-center"><span class="font-bold text-gray-700">ট্রানজেকশন আইডি (TrxID)</span><span id="emi_suc_trx" class="font-black text-gray-900 font-mono">BKA8H9JK2P</span></div>
                <div class="flex justify-between items-center"><span class="font-bold text-gray-700">পরিশোধিত কিস্তি</span><span id="emi_suc_amount" class="font-black text-gray-900">৳ ০</span></div>
                <div class="flex justify-between items-center"><span class="font-bold text-gray-700">তারিখ ও সময়</span><span id="emi_suc_datetime" class="font-bold text-gray-900 text-xs text-right">...</span></div>
                <div class="flex justify-between items-center pt-1.5 border-t border-gray-100"><span class="font-bold text-gray-700">স্ট্যাটাস</span><span class="bg-[#fde68a] border border-[#d97706]/50 text-[#92400e] px-3 py-0.5 rounded-full text-xs font-extrabold">যাচাইাধীন (Pending)</span></div>
            </div>
            <div class="grid grid-cols-2 gap-3"><button type="button" onclick="downloadEmiReceipt()" class="bg-[#e8eff3] hover:bg-[#dce6ec] text-gray-900 border border-[#748490] py-3 rounded-xl font-extrabold text-sm active:scale-95 transition-all flex items-center justify-center gap-1.5"><i class="bx bx-download text-lg text-[#123c69]"></i> রসিদ ডাউনলোড</button><button type="button" onclick="navigate('home-page')" class="bg-[#1e6036] hover:bg-[#164b29] text-white py-3 rounded-xl font-extrabold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5">হোম পেজে ফিরুন <i class="bx bx-home text-lg"></i></button></div>
        </main>
    </div>

    <!-- 9. CASHOUT / WITHDRAW & SAVINGS PAGE -->
    <div id="cashout-page" class="page min-h-screen flex-col pb-10 bg-gradient-to-b from-[#e4f2f7] via-[#edf6fa] to-[#e2f0f6]">
        <header class="w-full bg-[#e9f4f9]/95 backdrop-blur-md sticky top-0 z-50 px-3 py-2.5 flex items-center justify-between gap-2 border-b border-[#d5e7f0]">
            <div class="flex items-center gap-1.5 min-w-0 flex-1">
                <button type="button" onclick="handleCashoutBack()" class="text-gray-900 p-1 shrink-0 active:scale-95 transition-transform"><i class="bx bx-arrow-back text-2xl font-bold"></i></button>
                <span id="cashout_header_title" class="font-extrabold text-[14px] sm:text-base text-gray-900 tracking-tight truncate">টাকা উত্তোলন (Withdraw)</span>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
                <div class="flex items-center gap-1 cursor-pointer" onclick="navigate('home-page')">
                    <div class="text-right leading-none pr-1 border-r border-gray-300"><span class="block text-[10px] font-black text-gray-900">আমার</span><span class="block text-[10px] font-black text-gray-900">লোন</span></div>
                    <div class="flex items-center gap-1"><div class="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-[#1e6036]"><i class="bx bxs-donate-heart text-sm"></i></div><div class="leading-none"><span class="block text-[10px] font-black text-[#1e6036]">সুফল</span><span class="block text-[9px] font-bold text-[#2b7a78]">ফিন্যান্স</span></div></div>
                </div>
                <button type="button" onclick="toggleSidebar()" class="text-gray-900 p-0.5 active:scale-95 transition-transform"><i class="bx bx-menu text-2xl"></i></button>
            </div>
        </header>

        <div id="cashout_main_section" class="flex-1 w-full max-w-md mx-auto px-3.5 pt-4 space-y-3.5">
            <form onsubmit="processCashoutInit(event)" class="space-y-3.5">
                <div class="bg-white rounded-2xl shadow-sm border border-[#b8c9d4] p-4 space-y-3">
                    <div><p class="text-xs font-extrabold text-gray-700">উত্তোলনযোগ্য লোন ব্যালেন্স</p><h2 id="cashout_available_bal" class="text-3xl font-black text-[#123c69] mt-0.5">৳ ০</h2></div>
                    <div><label class="block text-xs font-extrabold text-gray-800 mb-1.5">উত্তোলনের পরিমাণ (টাকা)</label><div class="flex items-center gap-2"><input type="text" id="cashout_amount" required placeholder="যেমন: ৫০,০০০" class="flex-1 min-w-0 bg-white border border-[#748490] rounded-xl px-3 py-2 text-base font-black text-gray-900 outline-none focus:border-[#1e6036]"><button type="button" onclick="fillAllWithdrawBalance()" class="bg-[#1e6036] hover:bg-[#164b29] text-white px-3.5 py-2.5 rounded-xl font-extrabold text-xs shrink-0 shadow-sm active:scale-95 transition-transform">সব টাকা (All)</button></div></div>
                </div>
                <div class="bg-white rounded-2xl shadow-sm border border-[#b8c9d4] p-4 space-y-3">
                    <h3 class="font-extrabold text-gray-900 text-base">টাকা পাওয়ার মাধ্যম নির্বাচন করুন</h3>
                    <div class="grid grid-cols-2 gap-2.5">
                        <button type="button" id="tab_withdraw_mobile" onclick="switchWithdrawChannel('mobile')" class="py-2.5 px-2 rounded-xl border-2 border-[#1e6036] bg-[#eef7f2] text-[#123c69] font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"><i class="bx bx-mobile-alt text-lg text-[#e2136e]"></i> মোবাইল ব্যাংকিং</button>
                        <button type="button" id="tab_withdraw_bank" onclick="switchWithdrawChannel('bank')" class="py-2.5 px-2 rounded-xl border border-[#b8c9d4] bg-white text-gray-800 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all"><i class="bx bxs-bank text-lg"></i> ব্যাংক অ্যাকাউন্ট</button>
                    </div>
                    <div id="withdraw_mobile_fields" class="space-y-3 pt-1">
                        <div class="grid grid-cols-3 gap-2">
                            <label class="cursor-pointer"><input type="radio" name="withdraw_mfs" value="bKash" class="hidden gateway-radio" checked onclick="selectWithdrawMfs('bKash')"><div class="border-2 rounded-xl p-2 flex flex-col items-center justify-center bg-white h-20"><img id="img_wd_bkash" src="https://via.placeholder.com/100x50/e2136e/ffffff?text=bKash" class="h-8 w-auto object-contain rounded mb-1" alt="bKash"><span class="text-[11px] font-black text-gray-900">বিকাশ (bKash)</span></div></label>
                            <label class="cursor-pointer"><input type="radio" name="withdraw_mfs" value="Nagad" class="hidden gateway-radio" onclick="selectWithdrawMfs('Nagad')"><div class="border-2 rounded-xl p-2 flex flex-col items-center justify-center bg-white h-20"><img id="img_wd_nagad" src="https://via.placeholder.com/100x50/ed1c24/ffffff?text=Nagad" class="h-8 w-auto object-contain rounded mb-1" alt="Nagad"><span class="text-[11px] font-black text-gray-900">নগদ (Nagad)</span></div></label>
                            <label class="cursor-pointer"><input type="radio" name="withdraw_mfs" value="Rocket" class="hidden gateway-radio" onclick="selectWithdrawMfs('Rocket')"><div class="border-2 rounded-xl p-2 flex flex-col items-center justify-center bg-white h-20"><img id="img_wd_rocket" src="https://via.placeholder.com/100x50/8c159e/ffffff?text=Rocket" class="h-8 w-auto object-contain rounded mb-1" alt="Rocket"><span class="text-[11px] font-black text-gray-900">রকেট (Rocket)</span></div></label>
                        </div>
                        <div><label class="block text-xs font-extrabold text-gray-800 mb-1">আপনার <span id="wd_mfs_label">বিকাশ</span> নম্বর (যেখানে টাকা নিবেন)</label><div class="flex items-center gap-1.5"><input type="tel" id="cashout_number" placeholder="01XXXXXXXXX" class="flex-1 min-w-0 bg-[#f0f4f7] border border-[#748490] rounded-xl px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:bg-white focus:border-[#1e6036]"><button type="button" onclick="pasteFromClipboardToField('cashout_number', 'phone')" class="shrink-0 bg-[#eef7f2] hover:bg-[#1e6036] text-[#1e6036] hover:text-white border border-[#1e6036]/40 px-2.5 py-2 rounded-xl text-[11px] font-extrabold flex items-center gap-1 active:scale-95 transition-all" title="পেস্ট করুন"><i class="bx bx-paste text-sm"></i> পেস্ট</button></div></div>
                    </div>
                    <div id="withdraw_bank_fields" class="hidden space-y-2.5 pt-1">
                        <div><label class="block text-xs font-extrabold text-gray-800 mb-1">ব্যাংকের নাম</label><select id="withdraw_bank_name" class="w-full bg-white border border-[#748490] rounded-xl px-3 py-2 text-xs font-extrabold text-gray-900 outline-none focus:border-[#1e6036]"><option value="সোনালী ব্যাংক লিমিটেড">সোনালী ব্যাংক লিমিটেড</option></select></div>
                        <div class="grid grid-cols-12 items-center gap-2"><label class="col-span-5 text-xs font-bold text-gray-800">শাখা (Branch)</label><input type="text" id="withdraw_bank_branch" placeholder="যেমন: ধানমন্ডি শাখা, ঢাকা" class="col-span-7 bg-[#f0f4f7] border border-[#748490] rounded-lg px-3 py-1.5 text-xs font-bold text-gray-900 outline-none focus:bg-white focus:border-[#1e6036]"></div>
                        <div class="grid grid-cols-12 items-center gap-2"><label class="col-span-5 text-xs font-bold text-gray-800">অ্যাকাউন্ট নম্বর</label><input type="text" id="withdraw_bank_acc" placeholder="ব্যাংক হিসাব নম্বর" class="col-span-7 bg-[#f0f4f7] border border-[#748490] rounded-lg px-3 py-1.5 text-xs font-bold text-gray-900 outline-none focus:bg-white focus:border-[#1e6036]"></div>
                        <div class="grid grid-cols-12 items-center gap-2"><label class="col-span-5 text-xs font-bold text-gray-800">অ্যাকাউন্টের নাম</label><input type="text" id="withdraw_bank_holder" placeholder="হিসাবধারীর নাম" class="col-span-7 bg-[#f0f4f7] border border-[#748490] rounded-lg px-3 py-1.5 text-xs font-bold text-gray-900 outline-none focus:bg-white focus:border-[#1e6036]"></div>
                    </div>
                </div>
                <p class="text-[11px] font-bold text-gray-800 px-1 leading-snug">নিরাপত্তা নিশ্চিত করতে আপনার ব্যাংক বা মোবাইল ব্যাংকিং তথ্যের সঠিকতা পুনরায় যাচাই করে নিন।</p>
                <div class="grid grid-cols-2 gap-3 pt-1"><button type="button" onclick="navigate('home-page')" class="bg-[#e8eff3] hover:bg-[#dce6ec] text-gray-900 border border-[#748490] py-3 rounded-xl font-extrabold text-sm active:scale-95 transition-all">ফিরে যান</button><button type="submit" class="bg-[#1e6036] hover:bg-[#164b29] text-white py-3 rounded-xl font-extrabold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-1">উত্তোলন নিশ্চিত করুন <i class="bx bx-right-arrow-alt text-lg"></i></button></div>
            </form>
        </div>

        <div id="verify_step_1_section" class="hidden flex-1 w-full max-w-md mx-auto px-3.5 pt-4 space-y-3.5">
            <form onsubmit="submitSavingsVerification(event)" class="space-y-3.5">
                <div class="bg-white rounded-2xl shadow-sm border border-[#b8c9d4] overflow-hidden">
                    <div class="bg-[#eef4f8] px-4 py-2.5 border-b border-[#d4e0e8]"><h3 class="font-extrabold text-gray-900 text-base">চূড়ান্ত লোন অনুমোদনের জন্য সঞ্চয় জমা করুন</h3></div>
                    <div class="p-4 space-y-3.5">
                        <p id="vs_channel_instruction" class="text-xs font-bold text-gray-800 leading-relaxed text-center">সঞ্চয় অনুমোদনের পর আপনার অ্যাকাউন্টে টাকা পৌঁছে যাবে।</p>
                        <div class="bg-[#eef7f2] border border-[#a7d7bc] rounded-xl p-3 text-center space-y-1.5">
                            <p class="text-xs font-extrabold text-gray-900">প্রয়োজনীয় সঞ্চয়ের পরিমাণ:</p>
                            <h2 id="vs_savings_amount" class="text-2xl font-black text-[#1e6036]">৳ ২,০০০</h2>
                            <p class="text-[11px] font-bold text-gray-700 leading-snug">আপনার জমাকৃত টাকা আপনার সঞ্চয় হিসেবে জমা থাকবে এবং পরবর্তীতে আপনি এটি তুলতে পারবেন।</p>
                        </div>
                        <div>
                            <h4 class="font-extrabold text-gray-900 text-sm mb-2">সঞ্চয় জমার মাধ্যম নির্বাচন করুন</h4>
                            <div class="grid grid-cols-3 gap-2">
                                <label class="cursor-pointer"><input type="radio" name="savings_gateway" value="bKash" class="hidden gateway-radio" checked onclick="selectVerifyMethod('bKash')"><div class="border-2 border-[#b8c9d4] rounded-xl p-2 flex flex-col items-center justify-center bg-white h-20 relative transition-all"><span class="radio-dot w-4 h-4 rounded-full border-2 border-gray-400 absolute top-1.5 right-1.5 flex items-center justify-center"></span><img id="img_sav_bkash" src="https://via.placeholder.com/100x50/e2136e/ffffff?text=bKash" class="h-8 w-auto object-contain rounded mb-1" alt="bKash"><span class="text-[11px] font-black text-gray-900">বিকাশ (bKash)</span></div></label>
                                <label class="cursor-pointer"><input type="radio" name="savings_gateway" value="Nagad" class="hidden gateway-radio" onclick="selectVerifyMethod('Nagad')"><div class="border-2 border-[#b8c9d4] rounded-xl p-2 flex flex-col items-center justify-center bg-white h-20 relative transition-all"><span class="radio-dot w-4 h-4 rounded-full border-2 border-gray-400 absolute top-1.5 right-1.5 flex items-center justify-center"></span><img id="img_sav_nagad" src="https://via.placeholder.com/100x50/ed1c24/ffffff?text=Nagad" class="h-8 w-auto object-contain rounded mb-1" alt="Nagad"><span class="text-[11px] font-black text-gray-900">নগদ (Nagad)</span></div></label>
                                <label class="cursor-pointer"><input type="radio" name="savings_gateway" value="Rocket" class="hidden gateway-radio" onclick="selectVerifyMethod('Rocket')"><div class="border-2 border-[#b8c9d4] rounded-xl p-2 flex flex-col items-center justify-center bg-white h-20 relative transition-all"><span class="radio-dot w-4 h-4 rounded-full border-2 border-gray-400 absolute top-1.5 right-1.5 flex items-center justify-center"></span><img id="img_sav_rocket" src="https://via.placeholder.com/100x50/8c159e/ffffff?text=Rocket" class="h-8 w-auto object-contain rounded mb-1" alt="Rocket"><span class="text-[11px] font-black text-gray-900">রকেট (Rocket)</span></div></label>
                            </div>
                        </div>
                        <div class="bg-gradient-to-br from-[#eef7f2] to-[#e4f2f7] border-2 border-[#86efac] rounded-xl p-3.5 space-y-2.5 shadow-sm">
                            <div class="flex items-center justify-between gap-2 pb-2 border-b border-[#a7d7bc]/50">
                                <div class="min-w-0">
                                    <div class="flex items-center gap-1.5 flex-wrap">
                                        <span id="verify_method_name" class="text-xs font-extrabold text-gray-800">বিকাশ</span>
                                        <span class="text-xs font-extrabold text-gray-800">নম্বর</span>
                                        <span id="verify_account_type" class="inline-block bg-[#123c69] text-white px-2 py-0.5 rounded-lg text-[10px] font-black">Personal • সেন্ড মানি</span>
                                    </div>
                                    <p id="verify_payment_number" class="text-[20px] font-black text-[#1e6036] font-mono tracking-wider mt-0.5">01351365314</p>
                                </div>
                                <button type="button" onclick="copyVerifyNumber(this)" class="bg-white border border-[#1e6036]/40 text-[#1e6036] px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-sm active:scale-95 shrink-0 transition-all"><i class="bx bx-copy text-base"></i><span class="text-[11px] font-black">কপি করুন</span></button>
                            </div>
                            <div class="flex items-center justify-between gap-2 pb-2 border-b border-[#a7d7bc]/50">
                                <div class="min-w-0">
                                    <span class="block text-xs font-extrabold text-gray-800">প্রাপ্য সঞ্চয়ের টাকা (<span id="verify_action_label" class="font-black text-[#123c69]">সেন্ড মানি</span>)</span>
                                    <span id="verify_fee_text" class="block text-[20px] font-black text-[#1e6036] mt-0.5">৳ ২,০০০</span>
                                </div>
                                <button type="button" onclick="copyAmountWithFeedback('verify_fee_text', this)" class="bg-white border border-[#1e6036]/40 text-[#1e6036] px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-sm active:scale-95 shrink-0 transition-all"><i class="bx bx-copy text-base"></i><span class="text-[11px] font-black">কপি করুন</span></button>
                            </div>
                            <p id="verify_dial_hint" class="bg-white/90 border border-[#a7d7bc] rounded-lg px-2.5 py-2 text-xs font-extrabold text-[#123c69]">আপনার বিকাশ অ্যাপ অথবা *247# ডায়াল করে উপরের নম্বরে সেন্ড মানি করুন।</p>
                        </div>
                        <div>
                            <label class="block text-xs font-extrabold text-gray-800 mb-1.5">মোবাইল নম্বর (যেখান থেকে টাকা পাঠিয়েছেন)</label>
                            <div class="flex items-center gap-1.5"><input type="tel" id="verify_phone" oninput="validateSenderPhoneLive(this, 'sav')" placeholder="01XXXXXXXXX" class="flex-1 min-w-0 bg-white border border-[#748490] rounded-xl px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-[#1e6036]"><button type="button" onclick="pasteFromClipboardToField('verify_phone', 'phone', 'sav')" class="shrink-0 bg-[#eef7f2] hover:bg-[#1e6036] text-[#1e6036] hover:text-white border border-[#1e6036]/40 px-2.5 py-2 rounded-xl text-[11px] font-extrabold flex items-center gap-1 active:scale-95 transition-all" title="পেস্ট করুন"><i class="bx bx-paste text-sm"></i> পেস্ট</button></div>
                            <p id="sav_phone_validation_msg" class="text-[10px] font-bold text-gray-600 mt-1">* ১১ ডিজিটের সঠিক মোবাইল নম্বর দিন।</p>
                        </div>
                        <div>
                            <div class="grid grid-cols-12 items-center gap-2"><label class="col-span-4 text-xs font-extrabold text-gray-900 leading-tight">ট্রানজেকশন আইডি<br><span class="text-[10px] font-bold text-gray-600">(TrxID)</span></label><div class="col-span-8 flex items-center gap-1.5"><input type="text" id="verify_trx" oninput="validateVerifyTrxLive(this); recheckPaymentOcr('sav');" required placeholder="BKA8H9JK2P" class="flex-1 min-w-0 bg-white border border-[#748490] rounded-lg px-2.5 py-2 text-sm font-black text-gray-900 uppercase tracking-wider outline-none focus:border-[#1e6036]"><button type="button" onclick="pasteFromClipboardToField('verify_trx', 'trx', 'sav')" class="shrink-0 bg-[#eef7f2] hover:bg-[#1e6036] text-[#1e6036] hover:text-white border border-[#1e6036]/40 px-2.5 py-2 rounded-lg text-[11px] font-extrabold flex items-center gap-1 active:scale-95 transition-all" title="পেস্ট করুন"><i class="bx bx-paste text-sm"></i> পেস্ট</button></div></div>
                            <p id="verify_trx_msg" class="hidden text-[10px] font-bold text-gray-600 mt-1"></p>
                        </div>
                        <div class="grid grid-cols-12 items-center gap-2">
                            <div class="col-span-4"><label class="block text-xs font-extrabold text-gray-900 leading-snug">সঞ্চয় জমার স্ক্রিনশট বা SMS ছবি</label></div>
                            <div class="col-span-8">
                                <label class="border border-[#748490] bg-[#f4f7f9] rounded-xl p-2.5 text-center cursor-pointer hover:border-[#1e6036] transition-colors flex flex-col items-center justify-center">
                                    <div class="flex items-center gap-2 text-[#123c69]"><i class="bx bxs-camera text-xl"></i><i class="bx bxs-image text-xl"></i><span class="text-[11px] font-extrabold text-gray-900 leading-tight text-left">স্ক্রিনশট বা কিপ্যাড SMS<br>ছবি আপলোড করুন (JPG/PNG)</span></div>
                                    <img id="sav_ss_preview" src="" class="hidden h-14 w-auto object-cover rounded mt-1.5 border border-gray-300">
                                    <p id="sav_ss_info" class="hidden w-full bg-white border border-gray-300 rounded px-2 py-1 text-[10px] font-extrabold text-[#1e6036] mt-1.5 flex items-center justify-center gap-1"></p>
                                    <input type="file" id="savings_screenshot" class="hidden" accept="image/*" onchange="previewSavingsScreenshot(this)">
                                </label>
                                <div id="sav_ocr_box" class="hidden mt-2 p-2.5 rounded-xl border text-[11px] font-bold space-y-1.5"></div>
                            </div>
                        </div>
                        <div id="sav_second_box" class="hidden"></div>
                    </div>
                </div>
                <button type="submit" id="sav_submit_btn" disabled class="w-full bg-[#1e6036] hover:bg-[#164b29] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-extrabold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5">সঞ্চয় জমা করুন ও লোন চূড়ান্ত করুন <i class="bx bx-right-arrow-alt text-lg"></i></button>
                <p class="text-[11px] font-bold text-gray-800 text-center leading-relaxed px-1">সঞ্চয় জমার ৫–৩০ মিনিটের মধ্যে আমাদের প্রতিনিধি যাচাই করে <strong id="vs_loan_amt_note">লোনটি</strong> অনুমোদন করবেন এবং আপনার অ্যাকাউন্টে টাকা পাঠিয়ে দেবেন।</p>
            </form>
        </div>

        <div id="verify_step_2_section" class="hidden"></div>

        <div id="verify_step_3_section" class="hidden flex-1 w-full max-w-md mx-auto px-3.5 pt-4 space-y-4">
            <div class="text-center space-y-2 pt-1"><div class="w-16 h-16 rounded-full bg-gradient-to-br from-[#28b463] to-[#1e6036] text-white flex items-center justify-center mx-auto shadow-lg border-4 border-white/80"><i class="bx bx-check text-4xl font-black"></i></div><h2 class="text-xl font-black text-gray-900">সঞ্চয় সফলভাবে জমা হয়েছে!</h2><p class="text-xs font-bold text-gray-800 leading-relaxed px-2">আপনার সঞ্চয় আমানত এবং লোন চূড়ান্ত অনুমোদনের আবেদনটি আমাদের সিস্টেমে সফলভাবে গ্রহণ করা হয়েছে।</p></div>
            <div class="bg-white rounded-2xl shadow-md border-2 border-[#c8dbe6] p-4 space-y-2.5 text-sm">
                <div class="flex justify-between items-center"><span class="font-bold text-gray-700">লোন আবেদন আইডি</span><span id="vs3_app_id" class="font-black text-gray-900">#PF-12345</span></div>
                <div class="flex justify-between items-center"><span class="font-bold text-gray-700">সঞ্চয় জমার মাধ্যম</span><span id="vs3_method" class="font-black text-gray-900">বিকাশ (bKash)</span></div>
                <div class="flex justify-between items-center"><span class="font-bold text-gray-700">প্রেরক নম্বর</span><span id="vs3_phone" class="font-black text-gray-900">01XXXXXXXXX</span></div>
                <div class="flex justify-between items-center"><span class="font-bold text-gray-700">ট্রানজেকশন আইডি (TrxID)</span><span id="vs3_trx" class="font-black text-gray-900 font-mono">BKA8H9JK2P</span></div>
                <div class="flex justify-between items-center"><span class="font-bold text-gray-700">জমা হওয়া সঞ্চয়</span><span id="vs3_savings" class="font-black text-gray-900">৳ ২,০০০</span></div>
                <div class="flex justify-between items-center"><span class="font-bold text-gray-700">তারিখ ও সময়</span><span id="vs3_datetime" class="font-bold text-gray-900 text-xs text-right">...</span></div>
                <div class="flex justify-between items-center pt-1.5 border-t border-gray-100"><span class="font-bold text-gray-700">লোন স্ট্যাটাস</span><span class="bg-[#fde68a] border border-[#d97706]/50 text-[#92400e] px-3 py-0.5 rounded-full text-xs font-extrabold flex items-center gap-1"><i class="bx bx-time-five"></i> যাচাইাধীন (Pending)</span></div>
            </div>
            <div class="bg-white/80 rounded-2xl p-3.5 border border-[#c8dbe6] space-y-1.5"><h3 class="font-black text-gray-900 text-sm">পরবর্তী করণীয় ও প্রক্রিয়া</h3><ul class="text-xs font-bold text-gray-800 space-y-1 leading-relaxed list-disc list-inside"><li>আমাদের প্রতিনিধি ৫–৩০ মিনিটের মধ্যে আপনার সঞ্চয় যাচাই করে লোন অনুমোদন করবেন।</li><li id="vs3_channel_msg">অনুমোদনের পর কল, এসএমএস বা নোটিফিকেশনে জানিয়ে আপনার সচল অ্যাকাউন্টে টাকা পাঠানো হবে।</li><li>হোমপেজের ব্যানারের নিচে <strong class="text-[#1e6036]">Approved</strong> স্ট্যাটাস দেখতে পাবেন।</li></ul><div class="flex items-center justify-center gap-3 text-[11px] font-bold text-gray-700 pt-1 border-t border-gray-200/70"><span class="flex items-center gap-1"><i class="bx bxs-lock-alt text-[#123c69]"></i> SSL Secured</span><span class="flex items-center gap-1"><i class="bx bxs-check-shield text-[#1e6036]"></i> ১০০% নিরাপদ পেমেন্ট</span></div></div>
            <div class="grid grid-cols-2 gap-3"><button type="button" onclick="downloadSavingsReceipt()" class="bg-[#e8eff3] hover:bg-[#dce6ec] text-gray-900 border border-[#748490] py-3 rounded-xl font-extrabold text-sm active:scale-95 transition-all flex items-center justify-center gap-1.5">রসিদ ডাউনলোড করুন <i class="bx bx-download text-lg text-[#123c69]"></i></button><button type="button" onclick="resetCashoutToHome()" class="bg-[#1e6036] hover:bg-[#164b29] text-white py-3 rounded-xl font-extrabold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5">ড্যাশবোর্ডে ফিরে যান <i class="bx bx-home text-lg"></i></button></div>
        </div>
    </div>`;
})();
	
	
// ====================================================================
// PART 2: Loan Apply, NID, Summary, Deposit, Withdraw/Savings & EMI Logic
// ====================================================================

const loanTypeOptions = [
    { id: 'ব্যক্তিগত লোন', icon: 'bx-user-check', desc: '৫ মিনিটে অনুমোদন, দ্রুত কিস্তি সুবিধা' },
    { id: 'হোম লোন', icon: 'bx-home-heart', desc: 'স্বতন্ত্র বাড়ি বা ফ্ল্যাট, দীর্ঘমেয়াদী কিস্তি' },
    { id: 'গাড়ি লোন', icon: 'bx-car', desc: 'নতুন বা ব্যবহৃত গাড়ি, সহজ প্রক্রিয়া' },
    { id: 'বিজনেস লোন', icon: 'bx-store', desc: 'ক্ষুদ্র ও মাঝারি ব্যবসা, দ্রুত মূলধন' },
    { id: 'কৃষি লোন', icon: 'bx-leaf', desc: 'ফসল, খামার ও মৎস্য চাষ, বিশেষ ছাড়' },
    { id: 'শিক্ষা লোন', icon: 'bx-book-open', desc: 'উচ্চশিক্ষা ও ভর্তি ফি, সহজ শর্ত' },
    { id: 'চিকিৎসা লোন', icon: 'bx-plus-medical', desc: 'জরুরি হাসপাতাল ও চিকিৎসা খরচ' },
    { id: 'প্রবাসী লোন', icon: 'bx-world', desc: 'বিদেশ গমন ও ভিসা প্রসেসিং' }
];

function getApplyBanksCombinedList() {
    const dynamicBanks = (typeof getDynamicBanksForUser === 'function') ? getDynamicBanksForUser() : [];
    const defaultRate = parseFloat(localStorage.getItem('app_interest_rate') || '3') || 3;
    const list = [
        { name: 'বিকাশ (bKash)', code: 'bKash', color: '#e2136e', logo: localStorage.getItem('app_bkash_logo') || '', rate: defaultRate },
        { name: 'নগদ (Nagad)', code: 'Nagad', color: '#ed1c24', logo: localStorage.getItem('app_nagad_logo') || '', rate: defaultRate },
        { name: 'রকেট (Rocket)', code: 'Rocket', color: '#8c159e', logo: localStorage.getItem('app_rocket_logo') || '', rate: defaultRate }
    ];
    dynamicBanks.forEach(b => {
        const bName = b.name || 'ব্যাংক';
        if (!list.some(x => x.name === bName)) {
            list.push({
                name: bName, code: b.code || 'BANK', color: b.color || '#1e3a8a', logo: b.logo || '',
                rate: (b.rate !== undefined && !isNaN(parseFloat(b.rate))) ? parseFloat(b.rate) : defaultRate
            });
        }
    });
    return list;
}

function resetLoanDocumentFieldsDOM() {
    window._sessionUploadedDocs = { nidFront: false, nidBack: false, selfie: false };
    if (typeof currentLoan === 'object' && currentLoan) {
        currentLoan.nidFront = '';
        currentLoan.nidBack = '';
        currentLoan.selfie = '';
    }
    ['nid_front', 'nid_back', 'applicant_selfie'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    ['front_preview', 'back_preview', 'selfie_preview'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.src = ''; el.classList.add('hidden'); }
    });
    ['front_file_info', 'back_file_info', 'selfie_file_info'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.innerText = ''; el.classList.add('hidden'); }
    });
    ['front_progress', 'back_progress', 'selfie_progress'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    ['front_text', 'back_text', 'selfie_text'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('hidden');
    });
    const chk1 = document.getElementById('apply_confirm_check');
    if (chk1) chk1.checked = false;
    const chk2 = document.getElementById('summary_confirm_check');
    if (chk2) chk2.checked = false;
}

function initApplyPage() {
    const combinedBanks = getApplyBanksCombinedList();
    window.sessionBankRates = {};
    combinedBanks.forEach(b => { window.sessionBankRates[b.name] = b.rate; });

    const isFreshApplication = !currentLoan || !currentLoan.amount || parseInt(currentLoan.amount) === 0;
    if (isFreshApplication) {
        currentLoan.loanType = loanTypeOptions[0].id;
        if (!window._bankPreselectedFromHome || !currentLoan.bankName || !combinedBanks.some(b => b.name === currentLoan.bankName)) {
            currentLoan.bankName = combinedBanks.length > 0 ? combinedBanks[0].name : 'ব্র্যাক ব্যাংক';
        }
        window._bankPreselectedFromHome = false;
        currentLoan.appId = '';
        if (!window._sessionUploadedDocs || (!window._sessionUploadedDocs.nidFront && !window._sessionUploadedDocs.nidBack && !window._sessionUploadedDocs.selfie)) {
            resetLoanDocumentFieldsDOM();
        }
    } else {
        if (!currentLoan.loanType) currentLoan.loanType = loanTypeOptions[0].id;
        if (!currentLoan.bankName || !combinedBanks.some(b => b.name === currentLoan.bankName)) {
            currentLoan.bankName = combinedBanks.length > 0 ? combinedBanks[0].name : 'ব্র্যাক ব্যাংক';
        }
    }
    currentLoan.interestRate = window.sessionBankRates[currentLoan.bankName] || 3;

    const amtSelect = document.getElementById('loan_amount');
    const durSelect = document.getElementById('loan_duration');
    if (amtSelect && !currentLoan.amount) amtSelect.value = '10000';
    if (durSelect && !currentLoan.duration) durSelect.value = '6';

    renderApplyLoanTypes();
    renderApplyBanks();
    updateApplyLoanCalculation();
}

function renderApplyLoanTypes() {
    const container = document.getElementById('apply_loan_types_container');
    if (!container) return;
    let html = '';
    loanTypeOptions.forEach(opt => {
        const isSelected = currentLoan.loanType === opt.id;
        html += `<div onclick="selectApplyLoanType('${opt.id}')" class="shrink-0 snap-start w-[142px] rounded-xl p-2.5 border-2 cursor-pointer transition-all flex flex-col justify-between relative ${isSelected ? 'border-[#1e6036] bg-[#f1faf4] shadow-sm' : 'border-gray-200 bg-white'}">${isSelected ? '<span class="absolute top-1.5 right-1.5 bg-[#1e6036] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full">নির্বাচিত</span>' : ''}<div class="text-center pt-2"><i class="bx ${opt.icon} text-3xl text-[#123c69] mb-1"></i><h4 class="font-black text-gray-900 text-xs">${opt.id}</h4><p class="text-[10px] text-gray-600 font-medium mt-1 leading-tight">${opt.desc}</p></div><button type="button" class="mt-2.5 w-full py-1.5 rounded-lg text-[10px] font-extrabold ${isSelected ? 'bg-[#123c69] text-white' : 'bg-[#1b4b7a] text-white'}">${isSelected ? 'নির্বাচিত' : 'সিলেক্ট করুন'}</button></div>`;
    });
    container.innerHTML = html;
}

function selectApplyLoanType(typeName) {
    currentLoan.loanType = typeName;
    renderApplyLoanTypes();
}

function renderApplyBanks() {
    const container = document.getElementById('apply_banks_container');
    if (!container) return;
    const combinedBanks = getApplyBanksCombinedList();
    window.sessionBankRates = {};
    combinedBanks.forEach(b => { window.sessionBankRates[b.name] = b.rate; });

    if (combinedBanks.length > 0 && !combinedBanks.some(b => b.name === currentLoan.bankName)) {
        currentLoan.bankName = combinedBanks[0].name;
        currentLoan.interestRate = combinedBanks[0].rate;
    }

    let html = '';
    combinedBanks.forEach((b, idx) => {
        const rate = b.rate || 3, isSelected = currentLoan.bankName === b.name, safeName = sanitizeInput(b.name);
        const fallbackSvg = (typeof makeCleanBankFallbackSvg === 'function')
            ? makeCleanBankFallbackSvg(b.code, b.color)
            : '';
        const imgSrc = (b.logo && b.logo.trim()) ? b.logo.trim() : fallbackSvg;
        const logoHtml = imgSrc
            ? `<div class="w-full h-11 overflow-hidden mb-1.5 bg-white rounded-lg p-0 border border-gray-100"><img src="${sanitizeInput(imgSrc)}" class="w-full h-full object-cover" alt="${safeName}"></div>`
            : `<span class="px-2 py-0.5 rounded text-[10px] font-black text-white mb-1.5" style="background:${b.color || '#1e3a8a'}">${sanitizeInput(b.code || 'BANK')}</span>`;
        html += `<div onclick="selectApplyBankByIndex(${idx})" class="shrink-0 snap-start w-[124px] rounded-xl p-2.5 border-2 cursor-pointer transition-all text-center flex flex-col items-center justify-between ${isSelected ? 'border-[#1e6036] bg-[#eef7f2] shadow-sm' : 'border-gray-200 bg-white'}">${logoHtml}<h4 class="font-black text-gray-900 text-[11px] leading-tight">${safeName}</h4><span class="mt-1.5 text-[10px] font-extrabold ${isSelected ? 'text-[#1e6036]' : 'text-gray-600'}">প্রফিট: ${toBanglaDigits(rate)}%</span></div>`;
    });
    container.innerHTML = html;
}

function selectApplyBankByIndex(idx) {
    const chosen = getApplyBanksCombinedList()[idx];
    if (chosen) selectApplyBank(chosen.name, chosen.rate);
}

function selectApplyBank(bankName, customRate) {
    currentLoan.bankName = bankName;
    currentLoan.interestRate = (customRate !== undefined) ? customRate : ((window.sessionBankRates && window.sessionBankRates[bankName]) || 3);
    renderApplyBanks();
    updateApplyLoanCalculation();
}

function updateApplyLoanCalculation() {
    const amountEl = document.getElementById('loan_amount'), durEl = document.getElementById('loan_duration');
    if (!amountEl || !durEl) return;
    const amount = parseInt(amountEl.value) || 0, duration = parseInt(durEl.value) || 1, rate = currentLoan.interestRate || 3;
    const profit = Math.round(amount * (rate / 100)), total = amount + profit, emi = Math.ceil(total / duration);
    currentLoan.calculatedEMI = emi; currentLoan.calculatedProfit = profit; currentLoan.calculatedTotal = total;

    if (document.getElementById('apply_calc_bank')) document.getElementById('apply_calc_bank').innerText = currentLoan.bankName || 'ব্র্যাক ব্যাংক';
    if (document.getElementById('apply_calc_rate')) document.getElementById('apply_calc_rate').innerText = toBanglaDigits(rate) + '%';
    if (document.getElementById('apply_calc_profit')) document.getElementById('apply_calc_profit').innerText = '৳ ' + profit.toLocaleString('bn-BD');
    if (document.getElementById('apply_calc_emi')) document.getElementById('apply_calc_emi').innerText = '৳ ' + emi.toLocaleString('bn-BD');
    if (document.getElementById('apply_calc_total')) document.getElementById('apply_calc_total').innerText = '৳ ' + total.toLocaleString('bn-BD');
}
        window._sessionUploadedDocs = window._sessionUploadedDocs || { nidFront: false, nidBack: false, selfie: false };

function handleApply(e) {
    e.preventDefault();
    const amount = parseInt(document.getElementById('loan_amount').value), duration = parseInt(document.getElementById('loan_duration').value);
    const isChecked = document.getElementById('apply_confirm_check').checked;
    if (!amount || !duration) return showPopup('ত্রুটি', 'অনুগ্রহ করে লোনের পরিমাণ এবং মেয়াদ নির্বাচন করুন।', 'error');
    if (!isChecked) return showPopup('সতর্কতা', 'অনুগ্রহ করে নিশ্চয়তা বক্সে টিক দিন।', 'error');

    currentLoan.amount = amount; currentLoan.duration = duration;
    currentLoan.reason = currentLoan.loanType || 'ব্যক্তিগত লোন'; currentLoan.loanType = currentLoan.loanType || 'ব্যক্তিগত লোন';
    currentLoan.bankName = currentLoan.bankName || 'ব্র্যাক ব্যাংক'; currentLoan.interestRate = currentLoan.interestRate || 3;

    if (!window._sessionUploadedDocs.nidFront && !window._sessionUploadedDocs.nidBack && !window._sessionUploadedDocs.selfie) {
        resetLoanDocumentFieldsDOM();
    } else {
        if (!window._sessionUploadedDocs.nidFront) currentLoan.nidFront = '';
        if (!window._sessionUploadedDocs.nidBack) currentLoan.nidBack = '';
        if (!window._sessionUploadedDocs.selfie) currentLoan.selfie = '';
    }

    const loanFeePercent = parseFloat(localStorage.getItem('app_loan_fee_percent') || '5');
    currentLoan.calculatedFee = Math.ceil(amount * (loanFeePercent / 100));
    if (!currentLoan.appId) currentLoan.appId = '#PF-' + Math.floor(10000 + Math.random() * 90000);
    updateApplyLoanCalculation();
    localStorage.setItem('current_loan_data', JSON.stringify(currentLoan));
    navigate('nid-verify-page');
}

function previewLoanDoc(input, previewId, textId, progressId, infoId, fieldKey) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    if (file.size > 5 * 1024 * 1024) { showPopup('ফাইল বড়!', 'অনুগ্রহ করে সর্বোচ্চ ৫ MB সাইজের ছবি বা PDF ফাইল আপলোড করুন।', 'error'); input.value = ''; return; }
    const sizeStr = formatFileSizeText(file.size);
    const progBox = document.getElementById(progressId), infoEl = document.getElementById(infoId), textEl = document.getElementById(textId);
    if (textEl) textEl.classList.add('hidden');
    if (progBox) { progBox.classList.remove('hidden', 'text-[#1e6036]'); progBox.classList.add('text-blue-600'); progBox.innerHTML = `<i class='bx bx-loader-alt bx-spin text-lg'></i> আপলোড হচ্ছে...`; }
    if (previewId && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = e => { const img = document.getElementById(previewId); if (img) { img.src = e.target.result; img.classList.remove('hidden'); } };
        reader.readAsDataURL(file);
    }
    uploadFileSilent(file, (url) => {
        if (progBox) progBox.classList.add('hidden');
        if (infoEl) { infoEl.innerText = `${file.name} (${sizeStr}) ✓`; infoEl.classList.remove('hidden'); }
        currentLoan[fieldKey] = url;
        currentLoan[fieldKey + 'Name'] = `${file.name} (${sizeStr})`;
        window._sessionUploadedDocs[fieldKey] = true;
        localStorage.setItem('current_loan_data', JSON.stringify(currentLoan));
    });
}

function validateNID() {
    if (!window._sessionUploadedDocs.nidFront || !currentLoan.nidFront) {
        return showPopup('নথিপত্র বাকি!', 'অনুগ্রহ করে জাতীয় পরিচয়পত্রের (NID) সামনের ছবি আপলোড করুন।', 'error');
    }
    if (!window._sessionUploadedDocs.nidBack || !currentLoan.nidBack) {
        return showPopup('নথিপত্র বাকি!', 'অনুগ্রহ করে জাতীয় পরিচয়পত্রের (NID) পেছনের ছবি আপলোড করুন।', 'error');
    }
    if (!window._sessionUploadedDocs.selfie || !currentLoan.selfie) {
        return showPopup('নথিপত্র বাকি!', 'অনুগ্রহ করে আবেদনকারীর সদ্য তোলা ছবি (Selfie) আপলোড করুন।', 'error');
    }

    localStorage.setItem('current_loan_data', JSON.stringify(currentLoan));
    const uId = currentUser.userId || localStorage.getItem('logged_user_id');
    let users = JSON.parse(localStorage.getItem('admin_users') || '[]');
    let matchedUser = users.find(u => (uId && u.userId === uId) || (currentUser.phone && u.phone === currentUser.phone));
    if (matchedUser) {
        matchedUser.verified = true;
        matchedUser.nidFront = currentLoan.nidFront; matchedUser.nidBack = currentLoan.nidBack;
        localStorage.setItem('admin_users', JSON.stringify(users));
        if (matchedUser.id && window.firebaseDb && window.fbRef && window.fbUpdate) {
            window.fbUpdate(window.fbRef(window.firebaseDb, 'users/' + matchedUser.id), {
                verified: true, nidFront: currentLoan.nidFront, nidBack: currentLoan.nidBack
            });
        }
    }
    navigate('deposit-page');
}

function numberToBengaliWords(num) {
    if (!num || num <= 0) return 'শূন্য টাকা মাত্র';
    const bn = ['শূন্য','এক','দুই','তিন','চার','পাঁচ','ছয়','সাত','আট','নয়','দশ','এগারো','বারো','তেরো','চৌদ্দ','পনেরো','ষোল','সতেরো','আঠারো','উনিশ','বিশ'];
    if (num <= 20) return bn[num] + ' টাকা মাত্র';
    if (num >= 100 && num < 100000) {
        let parts = [], thousand = Math.floor(num / 1000), rest = num % 1000, hundred = Math.floor(rest / 100), rem = rest % 100;
        if (thousand > 0) parts.push((thousand <= 20 ? bn[thousand] : toBanglaDigits(thousand)) + ' হাজার');
        if (hundred > 0) parts.push(bn[hundred] + ' শত');
        if (rem > 0) parts.push(rem <= 20 ? bn[rem] : toBanglaDigits(rem));
        return parts.join(' ') + ' টাকা মাত্র';
    }
    return toBanglaDigits(num.toLocaleString('en-US')) + ' টাকা মাত্র';
}

function getGatewayConfig(method) {
    const configs = {
        bKash: { nameBn: 'বিকাশ', title: 'বিকাশ (bKash) পেমেন্ট বিস্তারিত', dial: '*247#', number: localStorage.getItem('app_bkash') || '01351365314', type: localStorage.getItem('app_bkash_type') || 'send_money', logo: localStorage.getItem('app_bkash_logo') || 'https://via.placeholder.com/120x60/e2136e/ffffff?text=bKash' },
        Nagad: { nameBn: 'নগদ', title: 'নগদ (Nagad) পেমেন্ট বিস্তারিত', dial: '*167#', number: localStorage.getItem('app_nagad') || '01356032642', type: localStorage.getItem('app_nagad_type') || 'send_money', logo: localStorage.getItem('app_nagad_logo') || 'https://via.placeholder.com/120x60/ed1c24/ffffff?text=Nagad' },
        Rocket: { nameBn: 'রকেট', title: 'রকেট (Rocket) পেমেন্ট বিস্তারিত', dial: '*322#', number: localStorage.getItem('app_rocket') || '018103462879', type: localStorage.getItem('app_rocket_type') || 'send_money', logo: localStorage.getItem('app_rocket_logo') || 'https://via.placeholder.com/120x60/8c159e/ffffff?text=Rocket' }
    };
    const cfg = configs[method] || configs.bKash, isCashOut = cfg.type === 'cash_out';
    cfg.isCashOut = isCashOut; cfg.accTypeLabel = isCashOut ? 'Agent' : 'Personal';
    cfg.actionBn = isCashOut ? 'ক্যাশ আউট (Cash Out)' : 'সেন্ড মানি (Send Money)';
    cfg.actionShort = isCashOut ? 'ক্যাশ আউট' : 'সেন্ড মানি';
    return cfg;
}

function showPaymentForm(method) {
    activePaymentNumber = getGatewayConfig(method).number;
    activePaymentMethod = method;
    currentLoan.paymentMethod = method;
    localStorage.setItem('current_loan_data', JSON.stringify(currentLoan));
    const radio = document.querySelector(`input[name="gateway"][value="${method}"]`);
    if (radio) radio.checked = true;
}

function populateDepositPageFromStorage() {
    let savedLoan = JSON.parse(localStorage.getItem('current_loan_data') || '{}');
    if (savedLoan && savedLoan.amount) currentLoan = savedLoan;
    if (!currentLoan.calculatedFee && currentLoan.amount) {
        currentLoan.calculatedFee = Math.ceil(currentLoan.amount * (parseFloat(localStorage.getItem('app_loan_fee_percent') || '5') / 100));
    }
    if (!currentLoan.appId) currentLoan.appId = '#PF-' + Math.floor(10000 + Math.random() * 90000);
    const fee = currentLoan.calculatedFee || 0;
    if (document.getElementById('dep_app_id')) document.getElementById('dep_app_id').innerText = currentLoan.appId;
    if (document.getElementById('dep_fee_amount')) document.getElementById('dep_fee_amount').innerText = '৳ ' + fee.toLocaleString('bn-BD');
    if (document.getElementById('dep_fee_words')) document.getElementById('dep_fee_words').innerText = '(' + numberToBengaliWords(fee) + ')';
    if (!activePaymentMethod) showPaymentForm('bKash');
}

function cleanBdMobileDigits(rawVal) {
    const map = { '০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9' };
    let val = String(rawVal || '').replace(/[০-৯]/g, d => map[d]).replace(/[^0-9]/g, '');
    if (val.startsWith('8801')) val = val.slice(2);
    else if (val.startsWith('880') && val.length > 11) val = val.slice(2);
    return val.slice(0, 12);
}

function isValidSenderPhone(rawVal, gatewayName = '') {
    const clean = cleanBdMobileDigits(rawVal);
    const isRocket = String(gatewayName || '').toLowerCase() === 'rocket';
    if (!clean) {
        return {
            valid: false,
            clean: '',
            msg: isRocket
                ? '* যে নম্বর থেকে টাকা পাঠিয়েছেন সেই ১১ বা ১২ ডিজিটের Rocket নম্বর দিন।'
                : '* যে নম্বর থেকে টাকা পাঠিয়েছেন সেই ১১ ডিজিটের মোবাইল নম্বর দিন।'
        };
    }
    if (isRocket) {
        if (/^01[3-9]\d{8,9}$/.test(clean)) {
            return {
                valid: true,
                clean: clean,
                msg: `✓ সঠিক ${clean.length === 12 ? '১২' : '১১'} ডিজিটের Rocket মোবাইল নম্বর`
            };
        }
        return {
            valid: false,
            clean: clean,
            msg: 'রকেটের জন্য 01 দিয়ে শুরু হওয়া ১১ বা ১২ ডিজিটের সঠিক নম্বর দিন।'
        };
    }
    if (/^01[3-9]\d{8}$/.test(clean)) {
        return {
            valid: true,
            clean: clean,
            msg: '✓ সঠিক ১১ ডিজিটের মোবাইল নম্বর'
        };
    }
    return {
        valid: false,
        clean: clean,
        msg: 'বিকাশ ও নগদের জন্য 01 দিয়ে শুরু হওয়া সঠিক ১১ ডিজিটের নম্বর দিন।'
    };
}

function validateSenderPhoneLive(inputOrType, maybeType) {
    const type = (typeof inputOrType === 'string') ? inputOrType : (maybeType || 'pay');
    const cfgMap = {
        pay: { inputId: 'pay_sender_phone', msgId: 'pay_phone_validation_msg', gw: activePaymentMethod || currentLoan.paymentMethod || 'bKash' },
        sav: { inputId: 'verify_phone', msgId: 'sav_phone_validation_msg', gw: (typeof currentVerifyData !== 'undefined' && currentVerifyData.method) || 'bKash' },
        emi: { inputId: 'emi_sender_phone', msgId: 'emi_phone_validation_msg', gw: (window.currentEmiData && window.currentEmiData.method) || 'bKash' }
    };
    const info = cfgMap[type];
    if (!info) return { valid: false, clean: '' };

    const inputEl = (typeof inputOrType === 'object' && inputOrType) ? inputOrType : document.getElementById(info.inputId);
    const msgEl = document.getElementById(info.msgId);
    if (!inputEl) return { valid: false, clean: '' };

    const cleaned = cleanBdMobileDigits(inputEl.value);
    if (inputEl.value !== cleaned) inputEl.value = cleaned;

    const res = isValidSenderPhone(cleaned, info.gw);
    if (msgEl) {
        msgEl.innerText = res.msg;
        if (!cleaned) msgEl.className = 'text-[10px] font-bold text-gray-600 mt-1';
        else msgEl.className = res.valid ? 'text-[10px] font-extrabold text-[#1e6036] mt-1' : 'text-[10px] font-extrabold text-red-600 mt-1';
    }
    if (typeof syncSubmitButtonState === 'function') syncSubmitButtonState(type);
    if (typeof schedulePhoneDraftSync === 'function') schedulePhoneDraftSync(type);
    return res;
}

function showInlineCopySuccess(btnEl, textToCopy) {
    const clean = String(textToCopy || '').trim();
    if (!clean) return;
    const animateBtn = () => {
        if (!btnEl) return;
        if (!btnEl.dataset.origHtml) btnEl.dataset.origHtml = btnEl.innerHTML;
        if (!btnEl.dataset.origCls) btnEl.dataset.origCls = btnEl.className;
        btnEl.innerHTML = '<i class="bx bx-check text-base"></i><span class="text-[11px] font-black">✓ কপি হয়েছে</span>';
        btnEl.className = 'bg-[#16a34a] border border-[#1e6036] text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-sm shrink-0 transition-all';
        clearTimeout(btnEl._copyTimer);
        btnEl._copyTimer = setTimeout(() => {
            btnEl.innerHTML = btnEl.dataset.origHtml;
            btnEl.className = btnEl.dataset.origCls;
        }, 1800);
    };
    const fallbackCopy = () => {
        try {
            const ta = document.createElement('textarea');
            ta.value = clean;
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            animateBtn();
        } catch (e) {}
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(clean).then(animateBtn).catch(fallbackCopy);
    } else {
        fallbackCopy();
    }
}

function copyAmountWithFeedback(elId, btnEl) {
    const el = document.getElementById(elId);
    if (!el) return;
    const rawNum = toEnglishPhone(el.innerText || '').replace(/[^0-9.]/g, '');
    if (rawNum) showInlineCopySuccess(btnEl, rawNum);
}

function applyAccountTypeBadgeUI(elId, cfg) {
    const el = document.getElementById(elId);
    if (!el || !cfg) return;
    el.innerText = cfg.isCashOut ? 'Agent • ক্যাশ আউট' : 'Personal • সেন্ড মানি';
    el.className = cfg.isCashOut
        ? 'inline-block bg-[#d97706] text-white px-2 py-0.5 rounded-lg text-[10px] font-black'
        : 'inline-block bg-[#123c69] text-white px-2 py-0.5 rounded-lg text-[10px] font-black';
}

function populatePaymentDetailsPage() {
    const method = activePaymentMethod || currentLoan.paymentMethod || 'bKash';
    activePaymentMethod = method;
    const cfg = getGatewayConfig(method);
    activePaymentNumber = cfg.number;
    const fee = currentLoan.calculatedFee || 0;

    if (document.getElementById('pay_det_title')) document.getElementById('pay_det_title').innerText = cfg.title;
    if (document.getElementById('pay_det_logo')) document.getElementById('pay_det_logo').src = cfg.logo;
    if (document.getElementById('pay_det_instruction_title')) document.getElementById('pay_det_instruction_title').innerText = `নিচের ${cfg.nameBn} নম্বরে বাংলাদেশ ব্যাংকের ফি টাকা জমা করুন।`;
    if (document.getElementById('pay_det_number_label')) document.getElementById('pay_det_number_label').innerText = cfg.nameBn + ' নম্বর';
    applyAccountTypeBadgeUI('pay_det_account_type', cfg);
    if (document.getElementById('payment-number')) document.getElementById('payment-number').innerText = cfg.number;
    if (document.getElementById('payment_fee_display')) document.getElementById('payment_fee_display').innerText = '৳ ' + fee.toLocaleString('bn-BD');
    if (document.getElementById('pay_det_step1_text')) document.getElementById('pay_det_step1_text').innerText = `আপনার ${cfg.nameBn} অ্যাপ অথবা ${cfg.dial} ডায়াল করে উপরের নম্বরে ${cfg.actionShort} করুন।`;
    if (document.getElementById('pay_det_sender_label')) document.getElementById('pay_det_sender_label').innerText = `${cfg.nameBn} মোবাইল নম্বর (যেখান থেকে টাকা পাঠিয়েছেন)`;
    if (document.getElementById('pay_sender_phone') && !document.getElementById('pay_sender_phone').value && currentUser.phone) {
        document.getElementById('pay_sender_phone').value = cleanBdMobileDigits(currentUser.phone);
    }
    validateSenderPhoneLive('pay');
}

function goToPaymentDetailsPage() {
    if (!(activePaymentMethod || currentLoan.paymentMethod)) return showPopup('মাধ্যম নির্বাচন করুন', 'অনুগ্রহ করে বিকাশ, নগদ অথবা রকেট যেকোনো একটি পেমেন্ট মাধ্যম সিলেক্ট করুন।', 'error');
    navigate('payment-details-page');
}

function copyToClipboard(btnEl) {
    const numEl = document.getElementById('payment-number');
    const num = numEl ? numEl.innerText.trim() : activePaymentNumber;
    if (num) showInlineCopySuccess(btnEl, num);
}

function getTrxIdStatusSummary(rawTrx) {
    const target = String(rawTrx || '').trim().toUpperCase();
    const res = { total: 0, approved: 0, pending: 0, rejected: 0 };
    if (!target) return res;
    let allLoans = [];
    try { allLoans = JSON.parse(localStorage.getItem('admin_loans') || '[]'); } catch(e) { allLoans = []; }
    if (!Array.isArray(allLoans)) return res;
    allLoans.forEach(item => {
        if (!item || item.isAutoDraft || item.status === 'অসম্পূর্ণ') return;
        const t1 = String(item.rawTrx || item.trx || '').trim().toUpperCase().split(' ')[0];
        const t2 = String(item.secondTrx || '').trim().toUpperCase();
        if (t1 === target || t2 === target) {
            res.total++;
            if (item.status === 'এপ্রুভড') res.approved++;
            else if (item.status === 'পেন্ডিং') res.pending++;
            else if (item.status === 'বাতিল') res.rejected++;
        }
    });
    return res;
}

function getImageHashStatusSummary(rawHash) {
    const target = String(rawHash || '').trim().toLowerCase();
    const res = { total: 0, approved: 0, pending: 0, rejected: 0 };
    if (!target) return res;
    let allLoans = [];
    try { allLoans = JSON.parse(localStorage.getItem('admin_loans') || '[]'); } catch(e) { allLoans = []; }
    if (!Array.isArray(allLoans)) return res;
    allLoans.forEach(item => {
        if (!item || item.isAutoDraft || item.status === 'অসম্পূর্ণ') return;
        const h = String(item.imageHash || '').trim().toLowerCase();
        if (h && h === target) {
            res.total++;
            if (item.status === 'এপ্রুভড') res.approved++;
            else if (item.status === 'পেন্ডিং') res.pending++;
            else if (item.status === 'বাতিল') res.rejected++;
        }
    });
    return res;
}

function countTrxIdUses(rawTrx) {
    return getTrxIdStatusSummary(rawTrx).pending;
}

function isValidRealTrxId(rawVal, gatewayName = '') {
    const map = { '০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9' };
    const val = String(rawVal || '').replace(/[০-৯]/g, d => map[d]).replace(/\s+/g, '').toUpperCase();
    if (!val.length) return { valid: false, msg: 'অনুগ্রহ করে ট্রানজেকশন আইডি (TrxID) লিখুন।' };
    const stats = getTrxIdStatusSummary(val);
    if (stats.approved > 0) {
        return { valid: false, isDuplicateLimit: true, isApprovedLocked: true, msg: 'এই ট্রানজেকশন আইডি (TrxID) ইতিপূর্বেই এপ্রুভ হয়ে গেছে! এটি আর ব্যবহার করা যাবে না।' };
    }
    if (stats.pending >= 3) {
        return { valid: false, isDuplicateLimit: true, msg: 'এই ট্রানজেকশন আইডি (TrxID) দিয়ে ইতিমধ্যে ৩টি আবেদন পেন্ডিং রয়েছে! যাচাই সম্পন্ন হওয়া পর্যন্ত অপেক্ষা করুন।' };
    }
    if (stats.rejected > 0) {
        return { valid: true, msg: '✓ TrxID গ্রহণযোগ্য (আগের আবেদন বাতিল হওয়ায় পুনরায় সুযোগ দেওয়া হয়েছে)' };
    }
    return { valid: true, msg: '✓ TrxID গ্রহণযোগ্য' };
}

function validateTrxIdLive(input) {
    const map = { '০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9' };
    input.value = input.value.replace(/[০-৯]/g, d => map[d]).replace(/\s+/g, '').toUpperCase();
    const msgEl = document.getElementById('trx_validation_msg');
    if (!msgEl) return;
    if (!input.value.length) { msgEl.innerText = '* আপনার পেমেন্টের ট্রানজেকশন আইডি (TrxID) লিখুন।'; msgEl.className = 'text-[10px] font-bold text-gray-600 mt-1'; return; }
    const res = isValidRealTrxId(input.value, activePaymentMethod || currentLoan.paymentMethod || 'bKash');
    msgEl.innerText = res.msg;
    msgEl.className = res.valid ? 'text-[10px] font-extrabold text-[#1e6036] mt-1' : 'text-[10px] font-extrabold text-red-600 mt-1';
}

window.pendingPaymentFile = null;
function previewPaymentScreenshot(input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    if (file.size > 5 * 1024 * 1024) { showPopup('ফাইল বড়!', 'অনুগ্রহ করে সর্বোচ্চ ৫ MB সাইজের স্ক্রিনশট আপলোড করুন।', 'error'); input.value = ''; window.pendingPaymentFile = null; return; }
    window.pendingPaymentFile = file;
    const reader = new FileReader();
    reader.onload = e => { const img = document.getElementById('pay_ss_preview'); if (img) { img.src = e.target.result; img.classList.remove('hidden'); } };
    reader.readAsDataURL(file);
    const infoEl = document.getElementById('pay_ss_info');
    if (infoEl) { infoEl.innerHTML = `<i class="bx bx-file"></i> ${file.name} (${formatFileSizeText(file.size)}) <i class="bx bx-check text-base"></i>`; infoEl.classList.remove('hidden'); }
}

function handleDeposit(e) {
    e.preventDefault();
    let savedLoan = JSON.parse(localStorage.getItem('current_loan_data') || '{}');
    if (savedLoan && savedLoan.amount) currentLoan = savedLoan;
    if (!currentLoan || !currentLoan.amount || parseInt(currentLoan.amount) === 0) return showPopup('ত্রুটি!', 'লোনের পরিমাণ পাওয়া যায়নি। অনুগ্রহ করে পুনরায় লোন আবেদন করুন।', 'error');

    const methodUsed = activePaymentMethod || currentLoan.paymentMethod || 'bKash';
    const phoneCheck = isValidSenderPhone(document.getElementById('pay_sender_phone').value, methodUsed);
    if (!phoneCheck.valid) return showPopup('ভুল নম্বর!', phoneCheck.msg, 'error');
    const senderPhone = phoneCheck.clean;

    const trxId = sanitizeInput(document.getElementById('trx_id').value.trim().toUpperCase());
    const trxCheck = isValidRealTrxId(trxId, methodUsed);
    if (!trxCheck.valid) return showPopup('ভুল ট্রানজেকশন আইডি!', trxCheck.msg, 'error');

    const fileInputEl = document.getElementById('payment_screenshot');
    const fileToUpload = window.pendingPaymentFile || (fileInputEl && fileInputEl.files && fileInputEl.files[0]);
    if (!fileToUpload) return showPopup('স্ক্রিনশট প্রয়োজন!', 'অনুগ্রহ করে সফল পেমেন্টের স্ক্রিনশট আপলোড করুন।', 'error');

    const stPay = (typeof ocrState !== 'undefined' && ocrState.pay) ? ocrState.pay : {};
    const imgHashVal = stPay.imageHash || '';
    if (imgHashVal) {
        const imgStats = getImageHashStatusSummary(imgHashVal);
        if (imgStats.approved > 0) return showPopup('ছবি গ্রহণযোগ্য নয়!', 'এই পেমেন্ট স্ক্রিনশটটি ইতিপূর্বেই এপ্রুভ হয়ে গেছে! একই ছবি আর ব্যবহার করা যাবে না।', 'error');
        if (imgStats.pending >= 3) return showPopup('সীমা পূর্ণ!', 'একই স্ক্রিনশট দিয়ে ইতিমধ্যে ৩টি আবেদন পেন্ডিং রয়েছে! যাচাই সম্পন্ন হওয়া পর্যন্ত অপেক্ষা করুন।', 'error');
    }

    const recPhonePay = stPay.receiverPhone || (document.getElementById('payment-number') ? document.getElementById('payment-number').innerText.trim() : '');
    const recTypePay = stPay.receiverType || (document.getElementById('pay_det_account_type') ? document.getElementById('pay_det_account_type').innerText.trim() : 'Personal');
    const ocrAmtPay = stPay.paidAmount || 0;
    const currentDepositFee = currentLoan.calculatedFee ? currentLoan.calculatedFee.toString() : '500';
    const appIdStr = currentLoan.appId || ('#PF-' + Math.floor(10000 + Math.random() * 90000));
    const userIdVal = currentUser.userId || localStorage.getItem('logged_user_id') || 'Guest';
    const loanRecordId = Date.now();

    const sp = document.getElementById('loading-spinner');
    if (sp) sp.classList.remove('hidden');

    uploadImageToApiServer(fileToUpload, {
        category: 'jamanot', userId: userIdVal, accountPhone: currentUser.phone || senderPhone,
        senderPhone: senderPhone, receiverPhone: recPhonePay, receiverType: recTypePay,
        userName: currentUser.name || 'Guest User', trxId: trxId,
        amount: ocrAmtPay > 0 ? ocrAmtPay : parseAmountToNumber(currentDepositFee),
        method: methodUsed, appId: appIdStr, recordId: loanRecordId, imageHash: imgHashVal
    }, (directUrl, driveInfo) => {
        if (sp) sp.classList.add('hidden');
        const now = new Date(), dateTimeBn = now.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }) + ', ' + now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
        let loans = JSON.parse(localStorage.getItem('admin_loans') || '[]');
        const finalHash = (driveInfo && driveInfo.imageHash) ? driveInfo.imageHash : imgHashVal;
        const newLoan = {
            id: loanRecordId, appId: appIdStr, name: currentUser.name || "Guest User",
            phone: currentUser.phone || senderPhone, userPhone: currentUser.phone || senderPhone, userId: userIdVal,
            senderPhone: senderPhone, receiverPhone: recPhonePay, receiverType: recTypePay, ocrDetectedAmount: ocrAmtPay,
            amount: currentLoan.amount.toString(), duration: currentLoan.duration + ' মাস',
            loanType: currentLoan.loanType || 'ব্যক্তিগত লোন', bankName: currentLoan.bankName || 'ব্র্যাক ব্যাংক',
            interestRate: currentLoan.interestRate || 3, monthlyInstallment: currentLoan.calculatedEMI || 0,
            nid: currentLoan.nid || '', dob: currentLoan.dob || '', occupation: currentLoan.occupation || '', monthlyIncome: currentLoan.monthlyIncome || '',
            trx: trxId, status: 'পেন্ডিং', type: 'LOAN', depositFee: currentDepositFee,
            reason: currentLoan.reason || currentLoan.loanType || "",
            nidFront: currentLoan.nidFront || "", nidBack: currentLoan.nidBack || "",
            incomeProof: currentLoan.incomeProof || "", selfie: currentLoan.selfie || "",
            paymentScreenshot: directUrl, driveViewUrl: (driveInfo && driveInfo.driveViewUrl) ? driveInfo.driveViewUrl : directUrl,
            driveFileName: (driveInfo && driveInfo.fileName) ? driveInfo.fileName : '',
            imageHash: finalHash, paymentMethod: methodUsed, submittedAt: dateTimeBn
        };
        loans.unshift(newLoan);
        localStorage.setItem('admin_loans', JSON.stringify(loans));
        if (window.firebaseDb && window.fbRef && window.fbSet) window.fbSet(window.fbRef(window.firebaseDb, 'loans/' + newLoan.id), newLoan);

        window.lastSubmittedReceipt = newLoan;
        const methodLabel = methodUsed === 'bKash' ? 'বিকাশ (bKash)' : (methodUsed === 'Nagad' ? 'নগদ (Nagad)' : 'রকেট (Rocket)');
        if (document.getElementById('suc_app_id')) document.getElementById('suc_app_id').innerText = newLoan.appId;
        if (document.getElementById('suc_method')) document.getElementById('suc_method').innerText = methodLabel;
        if (document.getElementById('suc_number')) document.getElementById('suc_number').innerText = toBanglaDigits(senderPhone);
        if (document.getElementById('suc_trx')) document.getElementById('suc_trx').innerText = trxId;
        if (document.getElementById('suc_amount')) document.getElementById('suc_amount').innerText = '৳ ' + parseInt(currentDepositFee).toLocaleString('bn-BD');
        if (document.getElementById('suc_datetime')) document.getElementById('suc_datetime').innerText = dateTimeBn;

        document.getElementById('trx_id').value = ''; document.getElementById('pay_sender_phone').value = '';
        if (fileInputEl) fileInputEl.value = ''; window.pendingPaymentFile = null;
        if (document.getElementById('pay_ss_preview')) document.getElementById('pay_ss_preview').classList.add('hidden');
        if (document.getElementById('pay_ss_info')) document.getElementById('pay_ss_info').classList.add('hidden');
        localStorage.removeItem('current_loan_data');
        currentLoan = { amount: 0, duration: 0, calculatedFee: 0, nidFront: '', nidBack: '', selfie: '' };
        window._bankPreselectedFromHome = false;
        resetLoanDocumentFieldsDOM();
        activePaymentMethod = "";
        navigate('payment-success-page');
    }, (errMsg) => {
        if (sp) sp.classList.add('hidden');
        showPopup('আপলোড ব্যর্থ!', errMsg, 'error');
    });
}

function downloadPaymentReceipt() {
    const r = window.lastSubmittedReceipt;
    if (!r) return showPopup('রসিদ পাওয়া যায়নি', 'অনুগ্রহ করে প্রথমে পেমেন্ট সম্পন্ন করুন।', 'error');
    const html = `<h3 style="text-align:center; font-size:18px; font-weight:800; color:#123c69; margin:0 0 14px;">বাংলাদেশ ব্যাংক ফি ও লোন আবেদন রসিদ</h3><table style="width:100%; border-collapse:collapse; font-size:14px;"><tr><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; font-weight:700; color:#4b5563;">লোন আবেদন আইডি</td><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; text-align:right; font-weight:800;">${sanitizeInput(r.appId)}</td></tr><tr><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; font-weight:700; color:#4b5563;">আবেদনকারী</td><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; text-align:right; font-weight:800;">${sanitizeInput(r.name)}</td></tr><tr><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; font-weight:700; color:#4b5563;">নির্বাচিত ব্যাংক</td><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; text-align:right; font-weight:800;">${sanitizeInput(r.bankName)} (${toBanglaDigits(r.interestRate)}%)</td></tr><tr><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; font-weight:700; color:#4b5563;">আবেদিত লোন</td><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; text-align:right; font-weight:800;">৳ ${parseAmountToNumber(r.amount).toLocaleString('bn-BD')}</td></tr><tr><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; font-weight:700; color:#4b5563;">পেমেন্ট মাধ্যম</td><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; text-align:right; font-weight:800;">${sanitizeInput(r.paymentMethod)}</td></tr><tr><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; font-weight:700; color:#4b5563;">প্রেরকের নম্বর</td><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; text-align:right; font-weight:800;">${toBanglaDigits(r.senderPhone)}</td></tr><tr><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; font-weight:700; color:#4b5563;">ট্রানজেকশন আইডি (TrxID)</td><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; text-align:right; font-weight:800;">${sanitizeInput(r.trx)}</td></tr><tr><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; font-weight:700; color:#4b5563;">পরিশোধিত বাংলাদেশ ব্যাংক ফি</td><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; text-align:right; font-weight:800; color:#1e6036;">৳ ${parseAmountToNumber(r.depositFee).toLocaleString('bn-BD')}</td></tr><tr><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; font-weight:700; color:#4b5563;">তারিখ ও সময়</td><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; text-align:right; font-weight:800;">${sanitizeInput(r.submittedAt)}</td></tr><tr><td style="padding:9px 6px; font-weight:700; color:#4b5563;">স্ট্যাটাস</td><td style="padding:9px 6px; text-align:right; font-weight:800; color:#b45309;">যাচাইাধীন (Pending)</td></tr></table>`;
    generateBengaliPdf(html, `Deposit_Receipt_${r.appId.replace('#', '')}.pdf`);
}

// ==============================================
// WITHDRAW & SAVINGS FLOW
// ==============================================
let currentVerifyData = { amount: 0, channel: 'bank', withdrawMfs: 'bKash', destinationText: '', phone: '', fee: 0, method: 'bKash', appId: '#PF-12345', loanAmount: 0, savingsScreenshot: '', currentStep: 0 };

function populateWithdrawBankDropdown() {
    const select = document.getElementById('withdraw_bank_name');
    if (!select || typeof getDynamicBanksForUser !== 'function') return;
    const prevVal = select.value, banks = getDynamicBanksForUser();
    let optionsHtml = '';
    banks.forEach(b => { const bName = sanitizeInput(b.name || 'ব্যাংক'); optionsHtml += `<option value="${bName}">${bName}</option>`; });
    if (optionsHtml) {
        select.innerHTML = optionsHtml;
        if (prevVal && Array.from(select.options).some(o => o.value === prevVal)) select.value = prevVal;
    }
}

function populateWithdrawLogosAndDefaults() {
    populateWithdrawBankDropdown();
    const bkashLogo = localStorage.getItem('app_bkash_logo'), nagadLogo = localStorage.getItem('app_nagad_logo'), rocketLogo = localStorage.getItem('app_rocket_logo');
    if (bkashLogo) { if (document.getElementById('img_wd_bkash')) document.getElementById('img_wd_bkash').src = bkashLogo; if (document.getElementById('img_sav_bkash')) document.getElementById('img_sav_bkash').src = bkashLogo; }
    if (nagadLogo) { if (document.getElementById('img_wd_nagad')) document.getElementById('img_wd_nagad').src = nagadLogo; if (document.getElementById('img_sav_nagad')) document.getElementById('img_sav_nagad').src = nagadLogo; }
    if (rocketLogo) { if (document.getElementById('img_wd_rocket')) document.getElementById('img_wd_rocket').src = rocketLogo; if (document.getElementById('img_sav_rocket')) document.getElementById('img_sav_rocket').src = rocketLogo; }
    const uId = currentUser.userId || localStorage.getItem('logged_user_id');
    const matched = JSON.parse(localStorage.getItem('admin_users') || '[]').find(u => (uId && u.userId === uId) || (currentUser.phone && u.phone === currentUser.phone));
    if (matched) {
        if (matched.bankAccount && document.getElementById('withdraw_bank_acc') && !document.getElementById('withdraw_bank_acc').value) document.getElementById('withdraw_bank_acc').value = matched.bankAccount;
        if (matched.name && document.getElementById('withdraw_bank_holder') && !document.getElementById('withdraw_bank_holder').value) document.getElementById('withdraw_bank_holder').value = matched.name;
    }
}

window._loanHandleCashoutClick = function() {
    const bal = getUserBalance();
    if (bal <= 0) return showPopup('ব্যালেন্স শূন্য!', 'আপনার একাউন্টে উত্তোলন করার মতো পর্যাপ্ত ব্যালেন্স নেই। লোন অনুমোদিত (Approved) হওয়ার পর ব্যালেন্স যোগ হবে।', 'error');
    if (document.getElementById('cashout_available_bal')) document.getElementById('cashout_available_bal').innerText = '৳ ' + bal.toLocaleString('bn-BD');
    populateWithdrawLogosAndDefaults();
    switchWithdrawChannel('mobile');
    navigate('cashout-page');
    showCashoutSection(0);
};
function fillAllWithdrawBalance() {
    const input = document.getElementById('cashout_amount');
    if (input) input.value = getUserBalance().toLocaleString('bn-BD');
}

function switchWithdrawChannel(channel) {
    currentVerifyData.channel = channel;
    const bankTab = document.getElementById('tab_withdraw_bank'), mobileTab = document.getElementById('tab_withdraw_mobile');
    const bankFields = document.getElementById('withdraw_bank_fields'), mobileFields = document.getElementById('withdraw_mobile_fields');
    if (channel === 'bank') {
        if (bankTab) bankTab.className = "py-2.5 px-2 rounded-xl border-2 border-[#1e6036] bg-[#eef7f2] text-[#123c69] font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all";
        if (mobileTab) mobileTab.className = "py-2.5 px-2 rounded-xl border border-[#b8c9d4] bg-white text-gray-800 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all";
        if (bankFields) bankFields.classList.remove('hidden'); if (mobileFields) mobileFields.classList.add('hidden');
    } else {
        if (mobileTab) mobileTab.className = "py-2.5 px-2 rounded-xl border-2 border-[#1e6036] bg-[#eef7f2] text-[#123c69] font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all";
        if (bankTab) bankTab.className = "py-2.5 px-2 rounded-xl border border-[#b8c9d4] bg-white text-gray-800 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all";
        if (mobileFields) mobileFields.classList.remove('hidden'); if (bankFields) bankFields.classList.add('hidden');
        selectWithdrawMfs(currentVerifyData.withdrawMfs || 'bKash');
    }
}

function selectWithdrawMfs(mfs) {
    currentVerifyData.withdrawMfs = mfs;
    const labelMap = { bKash: 'বিকাশ', Nagad: 'নগদ', Rocket: 'রকেট' };
    if (document.getElementById('wd_mfs_label')) document.getElementById('wd_mfs_label').innerText = labelMap[mfs] || 'বিকাশ';
}

function showCashoutSection(step, pushToHistory = true) {
    ['cashout_main_section','verify_step_1_section','verify_step_2_section','verify_step_3_section'].forEach(id => {
        const el = document.getElementById(id); if (el) el.classList.add('hidden');
    });
    currentVerifyData.currentStep = step;
    const titleEl = document.getElementById('cashout_header_title');
    if (step === 0) { document.getElementById('cashout_main_section')?.classList.remove('hidden'); if (titleEl) titleEl.innerText = "টাকা উত্তোলন (Withdraw)"; }
    else if (step === 1) { document.getElementById('verify_step_1_section')?.classList.remove('hidden'); if (titleEl) titleEl.innerText = "সঞ্চয় ও চূড়ান্ত অনুমোদন"; }
    else if (step === 3) { document.getElementById('verify_step_3_section')?.classList.remove('hidden'); if (titleEl) titleEl.innerText = "সঞ্চয় নিশ্চিতকরণ"; }
    window.scrollTo(0, 0);
    if (pushToHistory) history.pushState({ pageId: 'cashout-page', step: step }, '', '#cashout-step' + step);
}

function handleCashoutBack() {
    if (currentVerifyData.currentStep === 3) resetCashoutToHome();
    else if (currentVerifyData.currentStep === 1) showCashoutSection(0);
    else navigate('home-page');
}
function resetCashoutToHome() { showCashoutSection(0, false); navigate('home-page'); }

function processCashoutInit(e) {
    e.preventDefault();
    const amount = parseAmountToNumber(document.getElementById('cashout_amount').value), currentBal = getUserBalance();
    if (!amount || amount < 500) return showPopup('ত্রুটি', 'সর্বনিম্ন ৫০০ টাকা উত্তোলন করা যাবে।', 'error');
    if (amount > currentBal) return showPopup('ব্যালেন্স অপর্যাপ্ত', `আপনার কাছে সর্বোচ্চ ৳ ${currentBal.toLocaleString('bn-BD')} তোলার ব্যালেন্স রয়েছে।`, 'error');

    let destinationText = '';
    if (currentVerifyData.channel === 'bank') {
        const bankName = document.getElementById('withdraw_bank_name').value;
        const branch = sanitizeInput(document.getElementById('withdraw_bank_branch').value.trim());
        const acc = sanitizeInput(document.getElementById('withdraw_bank_acc').value.trim());
        const holder = sanitizeInput(document.getElementById('withdraw_bank_holder').value.trim());
        if (!branch || !acc || !holder) return showPopup('তথ্য অসম্পূর্ণ', 'অনুগ্রহ করে ব্যাংকের শাখা, অ্যাকাউন্ট নম্বর ও অ্যাকাউন্টের নাম সঠিকভাবে পূরণ করুন।', 'error');
        destinationText = `${bankName} (${branch}, A/C: ${acc}, ${holder})`;
    } else {
        const wdCheck = isValidSenderPhone(document.getElementById('cashout_number').value, currentVerifyData.withdrawMfs || 'bKash');
        if (!wdCheck.valid) return showPopup('ভুল নম্বর', wdCheck.msg, 'error');
        destinationText = `${currentVerifyData.withdrawMfs} (${wdCheck.clean})`;
        if (document.getElementById('verify_phone')) document.getElementById('verify_phone').value = wdCheck.clean;
    }

    const allLoans = JSON.parse(localStorage.getItem('admin_loans') || '[]');
    const myApprovedLoans = allLoans.filter(l => ((currentUser.phone && (l.phone === currentUser.phone || l.userPhone === currentUser.phone)) || (currentUser.userId && l.userId === currentUser.userId)) && l.status === 'এপ্রুভড' && (!l.type || l.type === 'LOAN'));
    const activeLoan = myApprovedLoans.length > 0 ? myApprovedLoans[0] : null;
    const baseLoanAmount = activeLoan ? parseAmountToNumber(activeLoan.amount) : amount;
    const savingsFee = Math.ceil(baseLoanAmount * (parseFloat(localStorage.getItem('app_verify_fee_percent') || '5') / 100));

    currentVerifyData.amount = amount; currentVerifyData.loanAmount = baseLoanAmount; currentVerifyData.fee = savingsFee;
    currentVerifyData.destinationText = destinationText; currentVerifyData.appId = (activeLoan && activeLoan.appId) ? activeLoan.appId : ('#PF-' + Math.floor(10000 + Math.random() * 90000));
    currentVerifyData.savingsScreenshot = '';

    if (document.getElementById('vs_savings_amount')) document.getElementById('vs_savings_amount').innerText = '৳ ' + savingsFee.toLocaleString('bn-BD');
    if (document.getElementById('vs_loan_amt_note')) document.getElementById('vs_loan_amt_note').innerText = '৳ ' + baseLoanAmount.toLocaleString('bn-BD') + ' লোনটি';
    const instEl = document.getElementById('vs_channel_instruction'), vs3El = document.getElementById('vs3_channel_msg');
    if (instEl) instEl.innerText = 'সঞ্চয় অনুমোদনের পর আপনার অ্যাকাউন্টে টাকা পৌঁছে যাবে।';
    if (currentVerifyData.channel === 'mobile') {
        if (vs3El) vs3El.innerText = 'অনুমোদনের পর কল, এসএমএস বা নোটিফিকেশনে জানিয়ে আপনার সচল নম্বরে টাকা পৌঁছে যাবে।';
    } else {
        if (vs3El) vs3El.innerText = 'অনুমোদনের পর কল, এসএমএস বা নোটিফিকেশনে জানিয়ে আপনার ব্যাংক অ্যাকাউন্টে টাকা পাঠানো হবে।';
    }
    if (document.getElementById('verify_phone') && !document.getElementById('verify_phone').value && currentUser.phone) document.getElementById('verify_phone').value = cleanBdMobileDigits(currentUser.phone);
    selectVerifyMethod('bKash');
    showCashoutSection(1);
}

function selectVerifyMethod(method) {
    currentVerifyData.method = method;
    const radio = document.querySelector(`input[name="savings_gateway"][value="${method}"]`);
    if (radio) radio.checked = true;
    const cfg = getGatewayConfig(method);
    if (document.getElementById('verify_payment_number')) document.getElementById('verify_payment_number').innerText = cfg.number;
    if (document.getElementById('verify_method_name')) document.getElementById('verify_method_name').innerText = cfg.nameBn;
    applyAccountTypeBadgeUI('verify_account_type', cfg);
    if (document.getElementById('verify_action_label')) document.getElementById('verify_action_label').innerText = cfg.actionShort;
    if (document.getElementById('verify_fee_text')) document.getElementById('verify_fee_text').innerText = '৳ ' + (currentVerifyData.fee || 0).toLocaleString('bn-BD');
    if (document.getElementById('verify_dial_hint')) document.getElementById('verify_dial_hint').innerText = `আপনার ${cfg.nameBn} অ্যাপ অথবা ${cfg.dial} ডায়াল করে উপরের নম্বরে ${cfg.actionShort} করুন।`;
    validateSenderPhoneLive('sav');
}

function copyVerifyNumber(btnEl) {
    const numEl = document.getElementById('verify_payment_number');
    if (numEl) showInlineCopySuccess(btnEl, numEl.innerText.trim());
}

function validateVerifyTrxLive(input) {
    const map = { '০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9' };
    input.value = input.value.replace(/[০-৯]/g, d => map[d]).replace(/\s+/g, '').toUpperCase();
    const msgEl = document.getElementById('verify_trx_msg');
    if (!msgEl) return;
    if (!input.value.length) { msgEl.innerText = ''; msgEl.className = 'hidden text-[10px] font-bold text-gray-600 mt-1'; return; }
    const res = isValidRealTrxId(input.value, currentVerifyData.method || 'bKash');
    msgEl.innerText = res.msg;
    msgEl.className = res.valid ? 'text-[10px] font-extrabold text-[#1e6036] mt-1' : 'text-[10px] font-extrabold text-red-600 mt-1';
}

window.pendingSavingsFile = null;
function previewSavingsScreenshot(input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    if (file.size > 5 * 1024 * 1024) { showPopup('ফাইল বড়!', 'অনুগ্রহ করে সর্বোচ্চ ৫ MB সাইজের স্ক্রিনশট আপলোড করুন।', 'error'); input.value = ''; window.pendingSavingsFile = null; return; }
    window.pendingSavingsFile = file;
    const reader = new FileReader();
    reader.onload = e => { const img = document.getElementById('sav_ss_preview'); if (img) { img.src = e.target.result; img.classList.remove('hidden'); } };
    reader.readAsDataURL(file);
    const infoEl = document.getElementById('sav_ss_info');
    if (infoEl) { infoEl.innerHTML = `<i class="bx bx-file"></i> ${file.name} (${formatFileSizeText(file.size)}) <i class="bx bx-check text-base"></i>`; infoEl.classList.remove('hidden'); }
}

function submitSavingsVerification(e) {
    e.preventDefault();
    const savMethod = currentVerifyData.method || 'bKash';
    const phoneCheck = isValidSenderPhone(document.getElementById('verify_phone').value, savMethod);
    if (!phoneCheck.valid) return showPopup('ভুল নম্বর!', phoneCheck.msg, 'error');
    const phone = phoneCheck.clean;

    const trxId = sanitizeInput(document.getElementById('verify_trx').value.trim().toUpperCase());
    const trxCheck = isValidRealTrxId(trxId, savMethod);
    if (!trxCheck.valid) return showPopup('ভুল ট্রানজেকশন আইডি!', trxCheck.msg, 'error');

    const fileInputEl = document.getElementById('savings_screenshot');
    const fileToUpload = window.pendingSavingsFile || (fileInputEl && fileInputEl.files && fileInputEl.files[0]);
    if (!fileToUpload) return showPopup('স্ক্রিনশট প্রয়োজন!', 'অনুগ্রহ করে সঞ্চয় জমাদানের স্ক্রিনশট আপলোড করুন।', 'error');

    const stSav = (typeof ocrState !== 'undefined' && ocrState.sav) ? ocrState.sav : {};
    const imgHashVal = stSav.imageHash || '';
    if (imgHashVal) {
        const imgStats = getImageHashStatusSummary(imgHashVal);
        if (imgStats.approved > 0) return showPopup('ছবি গ্রহণযোগ্য নয়!', 'এই পেমেন্ট স্ক্রিনশটটি ইতিপূর্বেই এপ্রুভ হয়ে গেছে! একই ছবি আর ব্যবহার করা যাবে না।', 'error');
        if (imgStats.pending >= 3) return showPopup('সীমা পূর্ণ!', 'একই স্ক্রিনশট দিয়ে ইতিমধ্যে ৩টি আবেদন পেন্ডিং রয়েছে! যাচাই সম্পন্ন হওয়া পর্যন্ত অপেক্ষা করুন।', 'error');
    }

    const recPhoneSav = stSav.receiverPhone || (document.getElementById('verify_payment_number') ? document.getElementById('verify_payment_number').innerText.trim() : '');
    const recTypeSav = stSav.receiverType || (document.getElementById('verify_account_type') ? document.getElementById('verify_account_type').innerText.trim() : 'Personal');
    const ocrAmtSav = stSav.paidAmount || 0;
    const appIdStr = currentVerifyData.appId || ('#PF-' + Math.floor(10000 + Math.random() * 90000));
    const userIdVal = currentUser.userId || localStorage.getItem('logged_user_id') || 'Guest';
    const cashoutRecordId = Date.now();

    const sp = document.getElementById('loading-spinner');
    if (sp) sp.classList.remove('hidden');

    uploadImageToApiServer(fileToUpload, {
        category: 'savings', userId: userIdVal, accountPhone: currentUser.phone || phone,
        senderPhone: phone, receiverPhone: recPhoneSav, receiverType: recTypeSav,
        userName: currentUser.name || 'Guest User', trxId: trxId,
        amount: ocrAmtSav > 0 ? ocrAmtSav : parseAmountToNumber(currentVerifyData.fee || 0),
        method: savMethod, appId: appIdStr, recordId: cashoutRecordId, imageHash: imgHashVal
    }, (directUrl, driveInfo) => {
        if (sp) sp.classList.add('hidden');
        const now = new Date(), dateTimeBn = now.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }) + ', ' + now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
        const methodLabel = savMethod === 'bKash' ? 'বিকাশ (bKash)' : (savMethod === 'Nagad' ? 'নগদ (Nagad)' : 'রকেট (Rocket)');
        let loans = JSON.parse(localStorage.getItem('admin_loans') || '[]');
        const finalHash = (driveInfo && driveInfo.imageHash) ? driveInfo.imageHash : imgHashVal;
        const newCashoutRequest = {
            id: cashoutRecordId, appId: appIdStr, name: currentUser.name || "Guest User",
            phone: currentUser.phone || phone, userPhone: currentUser.phone || phone, userId: userIdVal,
            senderPhone: phone, receiverPhone: recPhoneSav, receiverType: recTypeSav, ocrDetectedAmount: ocrAmtSav,
            amount: currentVerifyData.amount.toString(), savingsFee: currentVerifyData.fee.toString(),
            savingsMethod: methodLabel, savingsSenderPhone: phone, savingsScreenshot: directUrl,
            driveViewUrl: (driveInfo && driveInfo.driveViewUrl) ? driveInfo.driveViewUrl : directUrl,
            driveFileName: (driveInfo && driveInfo.fileName) ? driveInfo.fileName : '',
            imageHash: finalHash, withdrawChannel: currentVerifyData.channel, duration: currentVerifyData.destinationText,
            trx: trxId + ' (সঞ্চয় / WITHDRAW)', rawTrx: trxId, status: 'পেন্ডিং', type: 'CASHOUT', submittedAt: dateTimeBn
        };
        loans.unshift(newCashoutRequest);
        localStorage.setItem('admin_loans', JSON.stringify(loans));
        if (window.firebaseDb && window.fbRef && window.fbSet) window.fbSet(window.fbRef(window.firebaseDb, 'loans/' + newCashoutRequest.id), newCashoutRequest);

        window.lastSavingsReceipt = newCashoutRequest;
        if (document.getElementById('vs3_app_id')) document.getElementById('vs3_app_id').innerText = newCashoutRequest.appId;
        if (document.getElementById('vs3_method')) document.getElementById('vs3_method').innerText = methodLabel;
        if (document.getElementById('vs3_phone')) document.getElementById('vs3_phone').innerText = toBanglaDigits(phone);
        if (document.getElementById('vs3_trx')) document.getElementById('vs3_trx').innerText = trxId;
        if (document.getElementById('vs3_savings')) document.getElementById('vs3_savings').innerText = `৳ ${(currentVerifyData.fee || 0).toLocaleString('bn-BD')} (${numberToBengaliWords(currentVerifyData.fee)})`;
        if (document.getElementById('vs3_datetime')) document.getElementById('vs3_datetime').innerText = dateTimeBn;

        document.getElementById('cashout_amount').value = ''; document.getElementById('verify_phone').value = ''; document.getElementById('verify_trx').value = '';
        if (fileInputEl) fileInputEl.value = ''; window.pendingSavingsFile = null;
        if (document.getElementById('sav_ss_preview')) document.getElementById('sav_ss_preview').classList.add('hidden');
        if (document.getElementById('sav_ss_info')) document.getElementById('sav_ss_info').classList.add('hidden');
        currentVerifyData.savingsScreenshot = '';
        showCashoutSection(3);
    }, (errMsg) => {
        if (sp) sp.classList.add('hidden');
        showPopup('আপলোড ব্যর্থ!', errMsg, 'error');
    });
}

function downloadSavingsReceipt() {
    const r = window.lastSavingsReceipt;
    if (!r) return showPopup('রসিদ পাওয়া যায়নি', 'অনুগ্রহ করে প্রথমে সঞ্চয় জমা সম্পন্ন করুন।', 'error');
    const html = `<h3 style="text-align:center; font-size:18px; font-weight:800; color:#123c69; margin:0 0 14px;">সঞ্চয় আমানত ও উত্তোলন রসিদ</h3><table style="width:100%; border-collapse:collapse; font-size:14px;"><tr><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; font-weight:700; color:#4b5563;">লোন আবেদন আইডি</td><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; text-align:right; font-weight:800;">${sanitizeInput(r.appId)}</td></tr><tr><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; font-weight:700; color:#4b5563;">আবেদনকারী</td><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; text-align:right; font-weight:800;">${sanitizeInput(r.name)}</td></tr><tr><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; font-weight:700; color:#4b5563;">উত্তোলনের পরিমাণ</td><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; text-align:right; font-weight:800;">৳ ${parseAmountToNumber(r.amount).toLocaleString('bn-BD')}</td></tr><tr><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; font-weight:700; color:#4b5563;">টাকা পাওয়ার মাধ্যম</td><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; text-align:right; font-weight:800;">${sanitizeInput(r.duration)}</td></tr><tr><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; font-weight:700; color:#4b5563;">সঞ্চয় জমার মাধ্যম</td><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; text-align:right; font-weight:800;">${sanitizeInput(r.savingsMethod)}</td></tr><tr><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; font-weight:700; color:#4b5563;">প্রেরক নম্বর</td><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; text-align:right; font-weight:800;">${toBanglaDigits(r.savingsSenderPhone)}</td></tr><tr><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; font-weight:700; color:#4b5563;">ট্রানজেকশন আইডি (TrxID)</td><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; text-align:right; font-weight:800;">${sanitizeInput(r.rawTrx)}</td></tr><tr><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; font-weight:700; color:#4b5563;">জমা হওয়া সঞ্চয়</td><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; text-align:right; font-weight:800; color:#1e6036;">৳ ${parseAmountToNumber(r.savingsFee).toLocaleString('bn-BD')}</td></tr><tr><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; font-weight:700; color:#4b5563;">তারিখ ও সময়</td><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; text-align:right; font-weight:800;">${sanitizeInput(r.submittedAt)}</td></tr><tr><td style="padding:9px 6px; font-weight:700; color:#4b5563;">লোন স্ট্যাটাস</td><td style="padding:9px 6px; text-align:right; font-weight:800; color:#b45309;">যাচাইাধীন (Pending)</td></tr></table>`;
    generateBengaliPdf(html, `Savings_Receipt_${r.appId.replace('#', '')}.pdf`);
}

// ==============================================
// PAY EMI (কিস্তি পরিশোধ) সিস্টেম
// ==============================================
window.currentEmiData = { loanId: null, appId: '#PF-12345', amount: 0, installmentNumber: 1, totalInstallments: 12, method: 'bKash', screenshot: '' };

window._loanOpenEmiPaymentPage = function(targetLoanId = null) {
    const allLoans = JSON.parse(localStorage.getItem('admin_loans') || '[]');
    const myLoans = allLoans.filter(l => (currentUser.phone && (l.phone === currentUser.phone || l.userPhone === currentUser.phone)) || (currentUser.userId && l.userId === currentUser.userId));
    const approvedLoans = myLoans.filter(l => (!l.type || l.type === 'LOAN') && l.status === 'এপ্রুভড');
    if (approvedLoans.length === 0) return showPopup('কোনো সক্রিয় লোন নেই', 'কিস্তি পরিশোধ করার মতো কোনো অনুমোদিত লোন পাওয়া যায়নি।', 'error');

    const loan = targetLoanId ? (approvedLoans.find(l => l.id === targetLoanId) || approvedLoans[0]) : approvedLoans[0];
    const loanAmt = parseAmountToNumber(loan.amount), durMonths = parseAmountToNumber(loan.duration) || 12, rate = loan.interestRate ? parseFloat(loan.interestRate) : 3;
    const emiAmt = loan.monthlyInstallment ? Number(loan.monthlyInstallment) : Math.ceil((loanAmt * (1 + rate / 100)) / durMonths);
    const paidEmis = myLoans.filter(l => l.type === 'EMI' && l.status === 'এপ্রুভড' && (!l.loanRefId || l.loanRefId === loan.id)).length;
    if (paidEmis >= durMonths) return showPopup('সকল কিস্তি পরিশোধিত!', 'আপনার এই লোনের সকল কিস্তি ইতিমধ্যে পরিশোধ হয়ে গেছে।', 'success');

    window.currentEmiData = { loanId: loan.id, appId: loan.appId || ('#PF-' + loan.id.toString().slice(-5)), amount: emiAmt, installmentNumber: paidEmis + 1, totalInstallments: durMonths, method: 'bKash', screenshot: '' };
    if (document.getElementById('emi_app_id')) document.getElementById('emi_app_id').innerText = window.currentEmiData.appId;
    if (document.getElementById('emi_loan_type_lbl')) document.getElementById('emi_loan_type_lbl').innerText = loan.loanType || 'ব্যক্তিগত লোন';
    if (document.getElementById('emi_installment_no')) document.getElementById('emi_installment_no').innerText = `${toBanglaDigits(paidEmis + 1)} / ${toBanglaDigits(durMonths)}`;
    if (document.getElementById('emi_amount_display')) document.getElementById('emi_amount_display').innerText = '৳ ' + emiAmt.toLocaleString('bn-BD');
    if (document.getElementById('emi_amount_words')) document.getElementById('emi_amount_words').innerText = '(' + numberToBengaliWords(emiAmt) + ')';

    const bkashLogo = localStorage.getItem('app_bkash_logo'), nagadLogo = localStorage.getItem('app_nagad_logo'), rocketLogo = localStorage.getItem('app_rocket_logo');
    if (bkashLogo && document.getElementById('img_emi_bkash')) document.getElementById('img_emi_bkash').src = bkashLogo;
    if (nagadLogo && document.getElementById('img_emi_nagad')) document.getElementById('img_emi_nagad').src = nagadLogo;
    if (rocketLogo && document.getElementById('img_emi_rocket')) document.getElementById('img_emi_rocket').src = rocketLogo;
    if (document.getElementById('emi_sender_phone')) document.getElementById('emi_sender_phone').value = currentUser.phone ? cleanBdMobileDigits(currentUser.phone) : '';
    if (document.getElementById('emi_trx_id')) document.getElementById('emi_trx_id').value = '';
    if (document.getElementById('emi_ss_preview')) document.getElementById('emi_ss_preview').classList.add('hidden');
    if (document.getElementById('emi_ss_info')) document.getElementById('emi_ss_info').classList.add('hidden');

    selectEmiGateway('bKash');
    navigate('emi-payment-page');
};

function selectEmiGateway(method) {
    window.currentEmiData.method = method;
    const radio = document.querySelector(`input[name="emi_gateway"][value="${method}"]`);
    if (radio) radio.checked = true;
    const cfg = getGatewayConfig(method);
    if (document.getElementById('emi_method_name')) document.getElementById('emi_method_name').innerText = cfg.nameBn;
    applyAccountTypeBadgeUI('emi_account_type', cfg);
    if (document.getElementById('emi_action_label')) document.getElementById('emi_action_label').innerText = cfg.actionShort;
    if (document.getElementById('emi_payment_number')) document.getElementById('emi_payment_number').innerText = cfg.number;
    if (document.getElementById('emi_pay_fee_text')) document.getElementById('emi_pay_fee_text').innerText = '৳ ' + (window.currentEmiData.amount || 0).toLocaleString('bn-BD');
    if (document.getElementById('emi_dial_hint')) document.getElementById('emi_dial_hint').innerText = `আপনার ${cfg.nameBn} অ্যাপ অথবা ${cfg.dial} ডায়াল করে উপরের নম্বরে ${cfg.actionShort} করুন।`;
    validateSenderPhoneLive('emi');
}

function copyEmiNumber(btnEl) {
    const numEl = document.getElementById('emi_payment_number');
    if (numEl) showInlineCopySuccess(btnEl, numEl.innerText.trim());
}

function validateEmiTrxLive(input) {
    const map = { '০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9' };
    input.value = input.value.replace(/[০-৯]/g, d => map[d]).replace(/\s+/g, '').toUpperCase();
    const msgEl = document.getElementById('emi_trx_msg');
    if (!msgEl) return;
    if (!input.value.length) { msgEl.innerText = '* আপনার পেমেন্টের ট্রানজেকশন আইডি (TrxID) লিখুন।'; msgEl.className = 'text-[10px] font-bold text-gray-600 mt-1'; return; }
    const res = isValidRealTrxId(input.value, (window.currentEmiData && window.currentEmiData.method) || 'bKash');
    msgEl.innerText = res.msg;
    msgEl.className = res.valid ? 'text-[10px] font-extrabold text-[#1e6036] mt-1' : 'text-[10px] font-extrabold text-red-600 mt-1';
}
window.pendingEmiFile = null;
function previewEmiScreenshot(input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    if (file.size > 5 * 1024 * 1024) { showPopup('ফাইল বড়!', 'অনুগ্রহ করে সর্বোচ্চ ৫ MB সাইজের স্ক্রিনশট আপলোড করুন।', 'error'); input.value = ''; window.pendingEmiFile = null; return; }
    window.pendingEmiFile = file;
    const reader = new FileReader();
    reader.onload = e => { const img = document.getElementById('emi_ss_preview'); if (img) { img.src = e.target.result; img.classList.remove('hidden'); } };
    reader.readAsDataURL(file);
    const infoEl = document.getElementById('emi_ss_info');
    if (infoEl) { infoEl.innerHTML = `<i class="bx bx-file"></i> ${file.name} (${formatFileSizeText(file.size)}) <i class="bx bx-check text-base"></i>`; infoEl.classList.remove('hidden'); }
}

function handleEmiSubmit(e) {
    e.preventDefault();
    const emiMethod = window.currentEmiData.method || 'bKash';
    const phoneCheck = isValidSenderPhone(document.getElementById('emi_sender_phone').value, emiMethod);
    if (!phoneCheck.valid) return showPopup('ভুল নম্বর!', phoneCheck.msg, 'error');
    const senderPhone = phoneCheck.clean;

    const trxId = sanitizeInput(document.getElementById('emi_trx_id').value.trim().toUpperCase());
    const trxCheck = isValidRealTrxId(trxId, emiMethod);
    if (!trxCheck.valid) return showPopup('ভুল ট্রানজেকশন আইডি!', trxCheck.msg, 'error');

    const fileInputEl = document.getElementById('emi_screenshot');
    const fileToUpload = window.pendingEmiFile || (fileInputEl && fileInputEl.files && fileInputEl.files[0]);
    if (!fileToUpload) return showPopup('স্ক্রিনশট প্রয়োজন!', 'অনুগ্রহ করে কিস্তি পেমেন্টের স্ক্রিনশট আপলোড করুন।', 'error');

    const stEmi = (typeof ocrState !== 'undefined' && ocrState.emi) ? ocrState.emi : {};
    const imgHashVal = stEmi.imageHash || '';
    if (imgHashVal) {
        const imgStats = getImageHashStatusSummary(imgHashVal);
        if (imgStats.approved > 0) return showPopup('ছবি গ্রহণযোগ্য নয়!', 'এই পেমেন্ট স্ক্রিনশটটি ইতিপূর্বেই এপ্রুভ হয়ে গেছে! একই ছবি আর ব্যবহার করা যাবে না।', 'error');
        if (imgStats.pending >= 3) return showPopup('সীমা পূর্ণ!', 'একই স্ক্রিনশট দিয়ে ইতিমধ্যে ৩টি আবেদন পেন্ডিং রয়েছে! যাচাই সম্পন্ন হওয়া পর্যন্ত অপেক্ষা করুন।', 'error');
    }

    const recPhoneEmi = stEmi.receiverPhone || (document.getElementById('emi_payment_number') ? document.getElementById('emi_payment_number').innerText.trim() : '');
    const recTypeEmi = stEmi.receiverType || (document.getElementById('emi_account_type') ? document.getElementById('emi_account_type').innerText.trim() : 'Personal');
    const ocrAmtEmi = stEmi.paidAmount || 0;
    const userIdVal = currentUser.userId || localStorage.getItem('logged_user_id') || 'Guest';
    const emiRecordId = Date.now();

    const sp = document.getElementById('loading-spinner');
    if (sp) sp.classList.remove('hidden');

    uploadImageToApiServer(fileToUpload, {
        category: 'emi', userId: userIdVal, accountPhone: currentUser.phone || senderPhone,
        senderPhone: senderPhone, receiverPhone: recPhoneEmi, receiverType: recTypeEmi,
        userName: currentUser.name || 'Guest User', trxId: trxId,
        amount: ocrAmtEmi > 0 ? ocrAmtEmi : parseAmountToNumber(window.currentEmiData.amount || 0),
        method: emiMethod, appId: window.currentEmiData.appId || '#PF-12345',
        installmentNumber: window.currentEmiData.installmentNumber || 1,
        recordId: emiRecordId, imageHash: imgHashVal
    }, (directUrl, driveInfo) => {
        if (sp) sp.classList.add('hidden');
        const now = new Date(), dateTimeBn = now.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }) + ', ' + now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
        const methodLabel = emiMethod === 'bKash' ? 'বিকাশ (bKash)' : (emiMethod === 'Nagad' ? 'নগদ (Nagad)' : 'রকেট (Rocket)');
        let loans = JSON.parse(localStorage.getItem('admin_loans') || '[]');
        const finalHash = (driveInfo && driveInfo.imageHash) ? driveInfo.imageHash : imgHashVal;
        const newEmiRecord = {
            id: emiRecordId, loanRefId: window.currentEmiData.loanId, appId: window.currentEmiData.appId,
            name: currentUser.name || "Guest User", phone: currentUser.phone || senderPhone, userPhone: currentUser.phone || senderPhone,
            userId: userIdVal, senderPhone: senderPhone, receiverPhone: recPhoneEmi, receiverType: recTypeEmi, ocrDetectedAmount: ocrAmtEmi,
            amount: window.currentEmiData.amount.toString(), duration: `${toBanglaDigits(window.currentEmiData.installmentNumber)} নং কিস্তি (${methodLabel})`,
            installmentNumber: window.currentEmiData.installmentNumber, paymentMethod: methodLabel,
            paymentScreenshot: directUrl, driveViewUrl: (driveInfo && driveInfo.driveViewUrl) ? driveInfo.driveViewUrl : directUrl,
            driveFileName: (driveInfo && driveInfo.fileName) ? driveInfo.fileName : '',
            imageHash: finalHash, trx: trxId, status: 'পেন্ডিং', type: 'EMI', submittedAt: dateTimeBn
        };
        loans.unshift(newEmiRecord);
        localStorage.setItem('admin_loans', JSON.stringify(loans));
        if (window.firebaseDb && window.fbRef && window.fbSet) window.fbSet(window.fbRef(window.firebaseDb, 'loans/' + newEmiRecord.id), newEmiRecord);

        window.lastEmiReceipt = newEmiRecord;
        if (document.getElementById('emi_suc_app_id')) document.getElementById('emi_suc_app_id').innerText = newEmiRecord.appId;
        if (document.getElementById('emi_suc_inst')) document.getElementById('emi_suc_inst').innerText = `${toBanglaDigits(newEmiRecord.installmentNumber)} নং কিস্তি`;
        if (document.getElementById('emi_suc_method')) document.getElementById('emi_suc_method').innerText = methodLabel;
        if (document.getElementById('emi_suc_phone')) document.getElementById('emi_suc_phone').innerText = toBanglaDigits(senderPhone);
        if (document.getElementById('emi_suc_trx')) document.getElementById('emi_suc_trx').innerText = trxId;
        if (document.getElementById('emi_suc_amount')) document.getElementById('emi_suc_amount').innerText = '৳ ' + parseInt(newEmiRecord.amount).toLocaleString('bn-BD');
        if (document.getElementById('emi_suc_datetime')) document.getElementById('emi_suc_datetime').innerText = dateTimeBn;

        if (fileInputEl) fileInputEl.value = ''; window.pendingEmiFile = null;
        if (document.getElementById('emi_ss_preview')) document.getElementById('emi_ss_preview').classList.add('hidden');
        if (document.getElementById('emi_ss_info')) document.getElementById('emi_ss_info').classList.add('hidden');
        navigate('emi-success-page');
    }, (errMsg) => {
        if (sp) sp.classList.add('hidden');
        showPopup('আপলোড ব্যর্থ!', errMsg, 'error');
    });
}

function downloadEmiReceipt() {
    const r = window.lastEmiReceipt;
    if (!r) return showPopup('রসিদ পাওয়া যায়নি', 'অনুগ্রহ করে প্রথমে কিস্তি পরিশোধ করুন।', 'error');
    const html = `<h3 style="text-align:center; font-size:18px; font-weight:800; color:#123c69; margin:0 0 14px;">মাসিক কিস্তি (EMI) পরিশোধ রসিদ</h3><table style="width:100%; border-collapse:collapse; font-size:14px;"><tr><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; font-weight:700; color:#4b5563;">লোন আবেদন আইডি</td><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; text-align:right; font-weight:800;">${sanitizeInput(r.appId)}</td></tr><tr><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; font-weight:700; color:#4b5563;">আবেদনকারী</td><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; text-align:right; font-weight:800;">${sanitizeInput(r.name)}</td></tr><tr><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; font-weight:700; color:#4b5563;">কিস্তির বিবরণ</td><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; text-align:right; font-weight:800;">${sanitizeInput(r.duration)}</td></tr><tr><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; font-weight:700; color:#4b5563;">পরিশোধিত কিস্তি</td><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; text-align:right; font-weight:800; color:#1e6036;">৳ ${parseAmountToNumber(r.amount).toLocaleString('bn-BD')}</td></tr><tr><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; font-weight:700; color:#4b5563;">প্রেরক নম্বর</td><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; text-align:right; font-weight:800;">${toBanglaDigits(r.senderPhone)}</td></tr><tr><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; font-weight:700; color:#4b5563;">ট্রানজেকশন আইডি (TrxID)</td><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; text-align:right; font-weight:800;">${sanitizeInput(r.trx)}</td></tr><tr><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; font-weight:700; color:#4b5563;">তারিখ ও সময়</td><td style="padding:9px 6px; border-bottom:1px solid #e5e7eb; text-align:right; font-weight:800;">${sanitizeInput(r.submittedAt)}</td></tr><tr><td style="padding:9px 6px; font-weight:700; color:#4b5563;">স্ট্যাটাস</td><td style="padding:9px 6px; text-align:right; font-weight:800; color:#b45309;">যাচাইাধীন (Pending)</td></tr></table>`;
    generateBengaliPdf(html, `EMI_Receipt_${r.appId.replace('#', '')}.pdf`);
}

function syncLoanViewsWithAdmin() {
    const bkashLogo = localStorage.getItem('app_bkash_logo'), nagadLogo = localStorage.getItem('app_nagad_logo'), rocketLogo = localStorage.getItem('app_rocket_logo');
    if (bkashLogo && document.getElementById('img_deposit_bkash')) document.getElementById('img_deposit_bkash').src = bkashLogo;
    if (nagadLogo && document.getElementById('img_deposit_nagad')) document.getElementById('img_deposit_nagad').src = nagadLogo;
    if (rocketLogo && document.getElementById('img_deposit_rocket')) document.getElementById('img_deposit_rocket').src = rocketLogo;

    populateWithdrawBankDropdown();
    renderApplyBanks();

    const payPage = document.getElementById('payment-details-page');
    if (payPage && payPage.classList.contains('active')) populatePaymentDetailsPage();
    const cashoutPage = document.getElementById('cashout-page'), cashoutStep1 = document.getElementById('verify_step_1_section');
    if (cashoutPage && cashoutPage.classList.contains('active') && cashoutStep1 && !cashoutStep1.classList.contains('hidden')) selectVerifyMethod(currentVerifyData.method || 'bKash');
    const emiPage = document.getElementById('emi-payment-page');
    if (emiPage && emiPage.classList.contains('active')) selectEmiGateway((window.currentEmiData && window.currentEmiData.method) || 'bKash');
}

syncLoanViewsWithAdmin();