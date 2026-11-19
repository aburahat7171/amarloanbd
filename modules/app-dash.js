// ====================================================================
// MODULE: app-dash.js (Dashboard, Loans, Transactions, Profile, Inbox, Settings, About)
// ====================================================================

(function injectDashTemplates() {
    const root = document.getElementById('dash-module-root');
    if (!root || document.getElementById('home-page')) return;

    root.innerHTML = `
    <!-- APP SEARCH MODAL -->
    <div id="app-search-modal" class="fixed inset-0 bg-black/55 z-[9998] hidden items-start justify-center pt-16 p-4">
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-4 border-2 border-[#b8c9d4]">
            <div class="flex items-center justify-between border-b border-[#d4e0e8] pb-2.5 mb-3">
                <h3 class="font-black text-gray-900 flex items-center gap-1.5 text-sm"><i class="bx bx-search-alt text-[#1e6036] text-xl"></i> ট্রানজেকশন ও সেবা খুঁজুন</h3>
                <button type="button" onclick="closeAppSearchModal()" class="w-8 h-8 rounded-full bg-[#eef4f8] text-gray-700 flex items-center justify-center hover:bg-red-50 hover:text-red-600"><i class="bx bx-x text-xl"></i></button>
            </div>
            <div class="relative mb-3">
                <i class="bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg"></i>
                <input type="text" id="user_app_search_input" oninput="performUserAppSearch()" placeholder="TrxID, টাকার পরিমাণ বা সেবার নাম লিখুন..." class="w-full pl-9 pr-3 py-2.5 bg-[#f0f4f7] border border-[#748490] rounded-xl text-xs font-bold text-gray-900 outline-none focus:bg-white focus:border-[#1e6036]">
            </div>
            <div id="user_app_search_results" class="max-h-72 overflow-y-auto space-y-2 pr-1 hide-scrollbar">
                <p class="text-xs font-bold text-gray-500 text-center py-6">আপনার লোন, উত্তোলন বা TrxID খুঁজতে উপরে টাইপ করুন।</p>
            </div>
        </div>
    </div>

    <!-- DASHBOARD POP-UP LOAN CALCULATOR -->
    <div id="dash-calculator-modal" class="fixed inset-0 bg-black/55 flex items-center justify-center z-[9999] hidden opacity-0 transition-opacity duration-200 p-4">
        <div class="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-5 relative border-2 border-[#b8c9d4] transform scale-95 transition-transform duration-200" id="dash-calc-content">
            <button type="button" onclick="closeCalculatorPopup()" class="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-[#eef4f8] text-gray-700 hover:bg-red-50 hover:text-red-600 flex items-center justify-center"><i class="bx bx-x text-xl"></i></button>
            <h3 class="text-center font-black text-gray-900 text-base mb-5 flex justify-center items-center gap-1.5"><i class="bx bx-calculator text-[#1e6036] text-xl"></i> লোন ক্যালকুলেটর</h3>
            <div class="mb-4">
                <div class="flex justify-between items-center mb-1.5">
                    <span class="text-xs font-bold text-gray-700">লোনের পরিমাণ</span>
                    <span id="dash_calc_amt_display" class="font-black text-[#123c69] text-sm">৳৩,০০,০০০</span>
                </div>
                <input type="range" id="dash_calc_amount" min="5000" max="1000000" step="5000" value="300000" oninput="calculateDashEMI()" class="w-full h-1.5 bg-[#d4e0e8] rounded-lg appearance-none cursor-pointer accent-[#1e6036]">
            </div>
            <div class="mb-4">
                <div class="flex justify-between items-center mb-1.5">
                    <span class="text-xs font-bold text-gray-700">মেয়াদ (মাস)</span>
                    <span id="dash_calc_tenure_display" class="font-black text-[#123c69] text-sm">২৪ মাস</span>
                </div>
                <input type="range" id="dash_calc_tenure" min="3" max="60" step="3" value="24" oninput="calculateDashEMI()" class="w-full h-1.5 bg-[#d4e0e8] rounded-lg appearance-none cursor-pointer accent-[#1e6036]">
            </div>
            <div class="bg-[#eef7f2] border border-[#a7d7bc] rounded-2xl p-3.5 text-center mb-4">
                <span class="block text-xs font-extrabold text-gray-800 mb-1">আনুমানিক মাসিক কিস্তি</span>
                <h2 id="dash_calc_emi_display" class="text-2xl font-black text-[#1e6036]">৳১৫,০০০</h2>
            </div>
            <button type="button" onclick="closeCalculatorPopup(); navigate('apply-page')" class="w-full bg-[#1e6036] hover:bg-[#164b29] text-white py-3 rounded-xl font-extrabold text-xs shadow-md active:scale-95 transition-transform">লোনের জন্য আবেদন করুন</button>
        </div>
    </div>

    <!-- CHANGE PASSWORD MODAL -->
    <div id="change-password-modal" class="fixed inset-0 bg-black/55 z-[9999] hidden items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border-2 border-[#b8c9d4]">
            <div class="bg-[#eef4f8] px-4 py-3 border-b border-[#d4e0e8] flex justify-between items-center">
                <h3 class="font-extrabold text-gray-900 text-sm flex items-center gap-1.5"><i class="bx bx-lock-alt text-[#1e6036] text-lg"></i> পাসওয়ার্ড পরিবর্তন করুন</h3>
                <button type="button" onclick="closePasswordModal()" class="w-7 h-7 rounded-full bg-white border border-[#b8c9d4] text-gray-700 flex items-center justify-center hover:bg-red-50 hover:text-red-600"><i class="bx bx-x text-lg"></i></button>
            </div>
            <form onsubmit="handlePasswordUpdate(event)" class="p-4 space-y-3">
                <div>
                    <label class="block text-xs font-extrabold text-gray-800 mb-1">বর্তমান পাসওয়ার্ড</label>
                    <input type="password" id="old_pass" placeholder="বর্তমান পাসওয়ার্ড লিখুন" required class="w-full bg-[#f0f4f7] border border-[#748490] rounded-xl px-3.5 py-2 text-sm font-bold text-gray-900 outline-none focus:bg-white focus:border-[#1e6036]">
                </div>
                <div>
                    <label class="block text-xs font-extrabold text-gray-800 mb-1">নতুন পাসওয়ার্ড</label>
                    <input type="password" id="new_pass" placeholder="সর্বনিম্ন ৬ অক্ষরের পাসওয়ার্ড" required minlength="6" class="w-full bg-[#f0f4f7] border border-[#748490] rounded-xl px-3.5 py-2 text-sm font-bold text-gray-900 outline-none focus:bg-white focus:border-[#1e6036]">
                </div>
                <div>
                    <label class="block text-xs font-extrabold text-gray-800 mb-1">পুনরায় নতুন পাসওয়ার্ড</label>
                    <input type="password" id="confirm_new_pass" placeholder="পুনরায় পাসওয়ার্ড দিন" required minlength="6" class="w-full bg-[#f0f4f7] border border-[#748490] rounded-xl px-3.5 py-2 text-sm font-bold text-gray-900 outline-none focus:bg-white focus:border-[#1e6036]">
                </div>
                <div class="grid grid-cols-2 gap-2.5 pt-1">
                    <button type="button" onclick="closePasswordModal()" class="bg-[#e8eff3] hover:bg-[#dce6ec] text-gray-900 border border-[#748490] py-2.5 rounded-xl font-extrabold text-xs active:scale-95 transition-transform">বাতিল</button>
                    <button type="submit" class="bg-[#1e6036] hover:bg-[#164b29] text-white py-2.5 rounded-xl font-extrabold text-xs shadow-md active:scale-95 transition-transform">আপডেট করুন</button>
                </div>
            </form>
        </div>
    </div>

    <!-- GLOBAL BOTTOM NAVIGATION BAR -->
    <nav id="app-bottom-nav" class="hidden fixed bottom-0 left-0 right-0 bg-white z-[80] border-t border-[#d4e0e8] px-2 pb-1 shadow-[0_-4px_15px_rgba(18,60,105,0.06)]">
        <div class="max-w-xl mx-auto grid grid-cols-4 items-center text-xs text-gray-600">
            <a id="bnav-home" href="javascript:void(0)" onclick="navigate('home-page')" class="py-2.5 flex flex-col items-center font-bold transition-colors"><i class="bx bx-home text-[24px]"></i><span class="text-[11px] mt-0.5">হোম</span></a>
            <a id="bnav-loans" href="javascript:void(0)" onclick="navigate('my-loans-page')" class="py-2.5 flex flex-col items-center font-bold transition-colors"><i class="bx bx-wallet-alt text-[24px]"></i><span class="text-[11px] mt-0.5">আমার লোন</span></a>
            <a id="bnav-tx" href="javascript:void(0)" onclick="navigate('transactions-page')" class="py-2.5 flex flex-col items-center font-bold transition-colors"><i class="bx bx-transfer-alt text-[24px]"></i><span class="text-[11px] mt-0.5">লেনদেন</span></a>
            <a id="bnav-profile" href="javascript:void(0)" onclick="navigate('profile-page')" class="py-2.5 flex flex-col items-center font-bold transition-colors"><i class="bx bx-user text-[24px]"></i><span class="text-[11px] mt-0.5">প্রোফাইল</span></a>
        </div>
    </nav>

    <!-- SIDEBAR -->
    <div id="sidebar-overlay" class="fixed inset-0 bg-black/60 z-[90] hidden transition-opacity backdrop-blur-sm" onclick="toggleSidebar()"></div>
    <aside id="sidebar" class="fixed inset-y-0 right-0 z-[100] w-[80%] max-w-[320px] bg-[#eef6fb] transform translate-x-full transition-transform duration-250 ease-out shadow-2xl flex flex-col">
        <div class="p-4 border-b border-[#d5e7f0] bg-[#e9f4f9] flex justify-between items-center">
            <div class="flex items-center gap-1.5">
                <div class="text-right leading-none pr-1.5 border-r border-gray-300"><span class="block text-xs font-black text-gray-900">আমার</span><span class="block text-xs font-black text-gray-900">লোন</span></div>
                <div class="flex items-center gap-1">
                    <div class="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-[#1e6036]"><i class="bx bxs-donate-heart text-base"></i></div>
                    <div class="leading-none"><span class="block text-xs font-black text-[#1e6036]">সুফল</span><span class="block text-[10px] font-bold text-[#2b7a78]">ফিন্যান্স</span></div>
                </div>
            </div>
            <button type="button" onclick="toggleSidebar()" class="text-gray-700 hover:text-red-600"><i class="bx bx-x text-3xl"></i></button>
        </div>
        <div class="flex-1 overflow-y-auto hide-scrollbar p-4 space-y-4">
            <div class="bg-[#d5eefc] rounded-2xl p-4 border border-[#bce0f8] flex items-center justify-between cursor-pointer active:scale-95 transition-transform" onclick="toggleSidebar(); navigate('profile-page')">
                <div class="flex items-center gap-3">
                    <img id="sidebar_avatar" src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" class="w-12 h-12 rounded-full border-2 border-white object-cover bg-white">
                    <div><h3 class="font-black text-gray-900 text-sm" id="sidebar_name">Guest</h3><p class="text-[10px] font-bold text-gray-600">আইডি: <span id="sidebar_userid">...</span></p></div>
                </div>
                <i class="bx bx-chevron-right text-gray-500 text-xl"></i>
            </div>
            <p class="text-[10px] font-bold text-gray-600 text-center -mt-2 mb-2">প্রোফাইল দেখুন ও এডিট করুন</p>
            <div class="bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
                <a href="javascript:void(0)" onclick="toggleSidebar(); navigate('home-page')" class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors"><div class="flex items-center gap-3"><i class="bx bxs-home text-[#00d061] text-lg"></i><span class="text-xs font-bold text-gray-800">ড্যাশবোর্ড</span></div><i class="bx bx-chevron-right text-gray-400"></i></a>
                <div class="w-full h-px bg-gray-50"></div>
                <a href="javascript:void(0)" onclick="toggleSidebar(); navigate('my-loans-page')" class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors"><div class="flex items-center gap-3"><i class="bx bxs-spreadsheet text-[#0a2540] text-lg"></i><span class="text-xs font-bold text-gray-800">আমার লোনসমূহ</span></div><i class="bx bx-chevron-right text-gray-400"></i></a>
                <div class="w-full h-px bg-gray-50"></div>
                <a href="javascript:void(0)" onclick="toggleSidebar(); navigate('apply-page')" class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors"><div class="flex items-center gap-3"><i class="bx bxs-plus-circle text-[#00d061] text-lg"></i><span class="text-xs font-bold text-gray-800">নতুন আবেদন করুন</span></div><i class="bx bx-chevron-right text-gray-400"></i></a>
                <div class="w-full h-px bg-gray-50"></div>
                <a href="javascript:void(0)" onclick="toggleSidebar(); navigate('transactions-page')" class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors"><div class="flex items-center gap-3"><i class="bx bx-history text-[#0a2540] text-lg"></i><span class="text-xs font-bold text-gray-800">পেমেন্ট ও কিস্তির ইতিহাস</span></div><i class="bx bx-chevron-right text-gray-400"></i></a>
                <div class="w-full h-px bg-gray-50"></div>
                <a href="javascript:void(0)" onclick="toggleSidebar(); handleCashoutClick()" class="flex items-center justify-between p-3 hover:bg-emerald-50 rounded-xl transition-colors"><div class="flex items-center gap-3"><i class="bx bx-money-withdraw text-[#15803d] text-lg"></i><span class="text-xs font-extrabold text-gray-900">টাকা উত্তোলন করুন</span></div><div class="flex items-center gap-1.5"><span id="sidebar_withdraw_badge" class="hidden text-[10px] font-black bg-emerald-100 text-[#15803d] px-2 py-0.5 rounded-full border border-emerald-200">৳ ০</span><i class="bx bx-chevron-right text-gray-400"></i></div></a>
                <div class="w-full h-px bg-gray-50"></div>
                <a href="javascript:void(0)" onclick="toggleSidebar(); navigate('transactions-page'); downloadFullTransactionsStatement()" class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors"><div class="flex items-center gap-3"><i class="bx bxs-download text-[#00d061] text-lg"></i><span class="text-xs font-bold text-gray-800">ডকুমেন্টস ও স্টেটমেন্ট</span></div><i class="bx bx-chevron-right text-gray-400"></i></a>
                <div class="w-full h-px bg-gray-50"></div>
                <a href="javascript:void(0)" onclick="toggleSidebar(); openCalculatorPopup()" class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors"><div class="flex items-center gap-3"><i class="bx bx-calculator text-[#0a2540] text-lg"></i><span class="text-xs font-bold text-gray-800">লোন ক্যালকুলেটর</span></div><i class="bx bx-chevron-right text-gray-400"></i></a>
                <div class="w-full h-px bg-gray-50"></div>
                <a href="javascript:void(0)" onclick="toggleSidebar(); navigate('settings-page')" class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors"><div class="flex items-center gap-3"><i class="bx bxs-cog text-[#0a2540] text-lg"></i><span class="text-xs font-bold text-gray-800">সেটিংস ও নিরাপত্তা</span></div><i class="bx bx-chevron-right text-gray-400"></i></a>
                <div class="w-full h-px bg-gray-50"></div>
                <a href="javascript:void(0)" onclick="toggleSidebar(); showCustomerCareModal()" class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors"><div class="flex items-center gap-3"><i class="bx bx-support text-[#00d061] text-lg"></i><span class="text-xs font-bold text-gray-800">গ্রাহক সেবা ও সমর্থন</span></div><i class="bx bx-chevron-right text-gray-400"></i></a>
                <div class="w-full h-px bg-gray-50"></div>
                <a href="javascript:void(0)" onclick="toggleSidebar(); navigate('about-page')" class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors"><div class="flex items-center gap-3"><i class="bx bx-info-circle text-[#0a2540] text-lg"></i><span class="text-xs font-bold text-gray-800">শর্তাবলী ও নীতিমালা</span></div><i class="bx bx-chevron-right text-gray-400"></i></a>
            </div>
            <button onclick="handleUserLogout()" class="w-full bg-[#fde8e8] text-[#c81e1e] py-3.5 rounded-xl font-bold text-sm flex justify-center items-center gap-2 hover:bg-red-200 transition-colors mt-6 border border-red-200">
                <i class="bx bx-log-out text-lg"></i> লগ আউট
            </button>
        </div>
    </aside>

    <!-- 3. HOME PAGE -->
    <div id="home-page" class="page flex-col min-h-screen bg-gradient-to-b from-[#e4f2f7] via-[#edf6fa] to-[#e2f0f6] pb-24">
        <header class="w-full bg-[#e9f4f9] sticky top-0 z-50 px-4 py-3 flex items-center justify-between border-b border-[#d5e7f0]">
            <div class="flex items-center gap-2.5 ml-2 cursor-pointer" onclick="refreshHomePage()">
                <div class="text-right leading-[1.1] pr-2.5 border-r-2 border-[#b8c9d4]"><span class="block text-[15px] font-black text-gray-900 tracking-tight">আমার</span><span class="block text-[15px] font-black text-gray-900 tracking-tight">লোন</span></div>
                <div class="flex items-center gap-1.5 pl-0.5">
                    <div class="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-[#1e6036] shrink-0 shadow-sm"><i class="bx bxs-donate-heart text-xl"></i></div>
                    <div class="leading-[1.1]"><span class="block text-[15px] font-black text-[#1e6036] tracking-tight">সুফল</span><span class="block text-[12px] font-black text-[#2b7a78]">ফিন্যান্স</span></div>
                </div>
            </div>
            <div class="flex items-center gap-3">
                <button type="button" onclick="toggleDarkMode()" class="text-gray-800 p-1 active:scale-95 transition-transform" title="ডার্ক / লাইট মোড"><i class="bx bx-moon text-2xl theme-toggle-icon"></i></button>
                <button type="button" onclick="openAppSearchModal()" class="text-gray-800 p-1 active:scale-95 transition-transform" title="খুঁজুন"><i class="bx bx-search text-2xl"></i></button>
                <button type="button" onclick="navigate('inbox-page')" class="relative text-gray-900 p-1 active:scale-95 transition-transform">
                    <i class="bx bxs-bell text-[24px]"></i>
                    <span id="inbox_badge_home" class="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm hidden">0</span>
                </button>
                <button type="button" onclick="toggleSidebar()" class="text-gray-900 p-1 active:scale-95 transition-transform"><i class="bx bx-menu text-3xl"></i></button>
            </div>
        </header>

        <main class="flex-1 overflow-x-hidden w-full max-w-md mx-auto">
            <div class="px-5 pt-6 pb-2">
                <div class="flex justify-between items-start">
                    <div>
                        <h2 class="text-[22px] font-black text-gray-900 leading-tight">স্বাগত, <span id="user_name_display_dash">Guest</span>!</h2>
                        <p class="text-[11px] font-extrabold text-gray-500 mt-1">ইউজার আইডি: <span id="user_id_display_dash" class="text-gray-800 tracking-wide">...</span></p>
                        <div x-data="{
                            isShowingBalance: false,
                            balance: '৳ ০',
                            showBalance() {
                                if (this.isShowingBalance) return;
                                const userBal = getUserBalance();
                                this.balance = '৳ ' + userBal.toLocaleString('bn-BD');
                                this.isShowingBalance = true;
                                setTimeout(() => { this.isShowingBalance = false; }, 5000);
                            }
                        }" class="mt-2.5">
                            <div @click="showBalance()" class="inline-flex items-center bg-gradient-to-r from-[#1e6036] to-[#123c69] text-white rounded-full shadow-md border border-[#a7d7bc]/50 cursor-pointer w-[162px] h-9 px-1 relative overflow-hidden active:scale-95 transition-all select-none">
                                <span class="absolute left-1 top-1/2 -translate-y-1/2 bg-white text-[#1e6036] rounded-full h-7 w-7 flex items-center justify-center font-black text-base leading-none pt-[2px] transition-all duration-500 shadow-sm" :class="isShowingBalance ? 'translate-x-[126px]' : 'translate-x-0'">৳</span>
                                <span class="w-full text-center pl-6 text-xs font-extrabold tracking-wide leading-none transition-opacity duration-300" x-show="!isShowingBalance">ব্যালেন্স দেখুন</span>
                                <span class="w-full text-center pr-6 text-[13px] font-black tracking-wider leading-none transition-opacity duration-300" x-show="isShowingBalance" x-text="balance"></span>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col items-end gap-2">
                        <img id="home_avatar" src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" class="w-14 h-14 rounded-full border-2 border-white shadow-md object-cover bg-white cursor-pointer" onclick="navigate('profile-page')">
                    </div>
                </div>
            </div>

            <div class="px-4 pt-2 pb-1">
                <div class="bg-[#e6f6ec] border border-[#9ae0b4] rounded-2xl p-2.5 shadow-sm space-y-2.5">
                    <div class="bg-gradient-to-r from-[#f3ebd3] via-[#fbf6e5] to-[#f3ebd3] border border-[#d6c28b] rounded-xl px-2 py-2.5 flex items-center justify-between gap-2 shadow-inner">
                        <div class="w-8 h-8 rounded-full bg-white border-2 border-[#15803d] flex items-center justify-center shrink-0 shadow-sm"><i class="bx bxs-bank text-[#15803d] text-lg"></i></div>
                        <div class="text-center flex-1 leading-snug">
                            <h4 class="text-[13.5px] sm:text-[14px] font-black text-gray-900">বাংলাদেশ ব্যাংক কর্তৃক নিবন্ধিত ও অনুমোদিত</h4>
                            <p class="text-[13.5px] sm:text-[14px] font-black text-gray-800 mt-1">আর্থিক প্রতিষ্ঠান লাইসেন্স নং: <span class="font-black text-[#15803d]">১০৩১৫৮২০৬৬</span></p>
                        </div>
                        <div class="w-8 h-8 rounded-full bg-white/80 border border-[#b8a572] flex items-center justify-center shrink-0 text-[#0f5132]"><i class="bx bxs-check-shield text-lg"></i></div>
                    </div>
                    <div id="home_live_timeline_box" class="hidden bg-white/95 rounded-xl p-3 border border-[#bce8cc] space-y-2.5">
                        <div class="flex items-center justify-between border-b border-gray-100 pb-1.5">
                            <span class="text-[11px] font-black text-gray-900 flex items-center gap-1"><i class="bx bx-pulse text-[#15803d] text-sm"></i> আপনার লোনের অবস্থা</span>
                            <span id="home_timeline_badge" class="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">পেন্ডিং</span>
                        </div>
                        <div id="home_timeline_steps" class="grid grid-cols-4 gap-1 text-center pt-0.5"></div>
                        <div id="home_final_approved_banner" class="hidden bg-emerald-50 border border-emerald-300 rounded-xl px-3 py-2.5 text-center">
                            <p class="text-xs font-black text-[#15803d] flex items-center justify-center gap-1.5"><i class="bx bxs-badge-check text-lg"></i> চূড়ান্ত অনুমোদিত (Approved) — লোন সম্পূর্ণ সক্রিয়!</p>
                        </div>
                    </div>
                    <button id="home_withdraw_btn" type="button" onclick="handleCashoutClick()" class="hidden w-full bg-gradient-to-r from-[#1d70d1] to-[#1155a8] hover:from-[#175eb3] hover:to-[#0d4387] text-white py-2.5 px-4 rounded-xl font-black text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2">
                        <span>টাকা উত্তোলন করুন (Withdraw)</span><i class="bx bxs-bank text-base"></i>
                    </button>
                    <button id="home_pay_emi_btn" type="button" onclick="openEmiPaymentPage()" class="hidden w-full bg-gradient-to-r from-[#1e6036] to-[#144726] hover:from-[#164b29] hover:to-[#0e341b] text-white py-2.5 px-4 rounded-xl font-black text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2">
                        <i class="bx bx-credit-card text-lg"></i><span>কিস্তি পরিশোধ করুন (Pay EMI)</span>
                    </button>
                </div>
            </div>

            <div class="px-4 py-4">
                <h3 class="text-[17px] font-black text-gray-900 mb-3 ml-1">আপনার অ্যাকাউন্ট ওভারভিউ</h3>
                <div id="dash_overview_alert" class="bg-[#fef4d8] border border-[#fde5a8] rounded-xl p-3 flex items-center gap-2.5 mb-4 shadow-sm">
                    <i class="bx bx-info-circle text-[#d97706] text-xl"></i>
                    <p class="text-[11px] font-bold text-[#92400e]">আপনার কোনো চলমান লোন নেই। সহজে লোন পেতে এখনই আবেদন করুন।</p>
                </div>
                <div class="grid grid-cols-3 gap-2">
                    <div class="bg-white rounded-xl p-3 shadow-sm border border-[#e1eaf4] flex flex-col justify-center"><span class="text-[9px] font-extrabold text-gray-500 leading-tight mb-1">মোট লোন পরিমাণ</span><h4 class="text-[13px] font-black text-gray-900" id="dash_total_loan">৳ ০</h4></div>
                    <div class="bg-white rounded-xl p-3 shadow-sm border border-[#e1eaf4] flex flex-col justify-center"><span class="text-[9px] font-extrabold text-gray-500 mb-1 leading-tight">পরবর্তী পেমেন্ট</span><h4 class="text-[13px] font-black text-gray-900" id="dash_next_payment">৳ ০</h4></div>
                    <div class="bg-white rounded-xl p-3 shadow-sm border border-[#e1eaf4] flex flex-col justify-center"><span class="text-[9px] font-extrabold text-gray-500 mb-1 leading-tight">বকেয়া পরিমাণ</span><h4 class="text-[13px] font-black text-[#dc2626]" id="dash_due_amount">৳ ০</h4></div>
                </div>
            </div>

            <div class="bg-white mt-1 py-5 border-y border-[#e1eaf4] shadow-sm">
                <h3 class="text-[17px] font-black text-gray-900 mb-4 px-5 border-b border-gray-100 pb-2">আমাদের সহযোগী ব্যাংক ও আর্থিক পার্টনারসমূহ</h3>
                <div id="home_partner_banks_container" class="flex overflow-x-auto snap-x snap-mandatory gap-3 px-5 pb-3 hide-scrollbar"></div>
                <p class="text-center text-[11px] font-extrabold text-gray-600 mt-2 px-4">আমাদের পার্টনার ব্যাংকগুলোর মাধ্যমে সরাসরি ও নিরাপদ লোন বিতরণ করা হয়।</p>
            </div>

            <div class="px-4 py-5">
                <h3 class="text-[17px] font-black text-gray-900 mb-3 ml-1">সক্রিয় লোনসমূহ (Active Loans)</h3>
                <div id="dash_active_loan_container"></div>
            </div>

            <div class="px-4 py-2">
                <div class="flex justify-between items-center mb-3 px-1">
                    <h3 class="text-[17px] font-black text-gray-900">সাম্প্রতিক লেনদেন</h3>
                    <a href="javascript:void(0)" onclick="navigate('my-loans-page')" class="text-[11px] font-extrabold text-[#00d061] hover:underline">সব দেখুন</a>
                </div>
                <div class="bg-white rounded-2xl shadow-sm border border-[#e1eaf4] overflow-hidden">
                    <table class="w-full text-left border-collapse">
                        <thead><tr class="bg-gray-50 text-[10px] text-gray-500 border-b border-gray-100"><th class="py-2.5 px-3 font-extrabold">তারিখ</th><th class="py-2.5 px-3 font-extrabold">বিবরণ</th><th class="py-2.5 px-3 font-extrabold">পরিমাণ</th><th class="py-2.5 px-3 font-extrabold">স্থিতি</th></tr></thead>
                        <tbody id="dash_recent_transactions_list" class="text-[11px] font-bold text-gray-800"></tbody>
                    </table>
                </div>
            </div>

            <div class="px-4 py-6 mb-4">
                <h3 class="text-[17px] font-black text-gray-900 mb-4 ml-1">Quick Actions</h3>
                <div class="grid grid-cols-3 gap-3">
                    <div onclick="openCalculatorPopup()" class="bg-white p-3 rounded-xl border border-[#e1eaf4] shadow-sm flex flex-col items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform text-center h-24 hover:border-[#00d061]"><i class="bx bx-calculator text-3xl text-[#0a2540]"></i><span class="text-[10px] font-extrabold text-gray-800">লোন ক্যালকুলেটর</span></div>
                    <div onclick="navigate('apply-page')" class="bg-white p-3 rounded-xl border border-[#e1eaf4] shadow-sm flex flex-col items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform text-center h-24 hover:border-[#00d061]"><div class="relative"><i class="bx bx-money text-3xl text-[#00d061]"></i><i class="bx bx-plus absolute -top-1 -right-2 text-lg text-amber-500 font-bold"></i></div><span class="text-[10px] font-extrabold text-gray-800">নতুন লোন আবেদন</span></div>
                    <div onclick="downloadStatementPDF()" class="bg-white p-3 rounded-xl border border-[#e1eaf4] shadow-sm flex flex-col items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform text-center h-24 hover:border-[#00d061]"><i class="bx bx-download text-3xl text-[#0a2540]"></i><span class="text-[10px] font-extrabold text-gray-800">ডাউনলোড স্টেটমেন্ট</span></div>
                </div>
            </div>

            <footer class="px-4 pt-3 pb-6 space-y-3 border-t border-[#d8e6f0] bg-[#e9f4f9]/70 mt-2">
                <div class="text-gray-700 py-2 text-[11px] font-extrabold flex flex-col sm:flex-row items-center justify-between gap-1.5 border-b border-[#d4e3ee]">
                    <div class="flex items-center gap-2">
                        <a href="javascript:void(0)" onclick="showCustomerCareModal()" class="hover:text-[#1e6036] transition-colors">যোগাযোগ</a><span class="text-gray-400">|</span>
                        <a href="javascript:void(0)" onclick="navigate('about-page')" class="hover:text-[#1e6036] transition-colors">প্রাইভেসি পলিসি</a><span class="text-gray-400">|</span>
                        <a href="javascript:void(0)" onclick="navigate('about-page')" class="hover:text-[#1e6036] transition-colors">শর্তাবলী</a>
                    </div>
                    <span class="text-[10px] text-gray-600">© ২০২৬ আমার লোন (amarloanbd.com) — সর্বস্বত্ব সংরক্ষিত ও ১০০% সুরক্ষিত।</span>
                </div>
                <div class="bg-white rounded-2xl p-4 border border-[#c8dbe6] shadow-sm space-y-2.5 text-left">
                    <h4 class="text-xs font-black text-gray-900 flex items-center gap-1.5 border-b border-gray-100 pb-2"><i class="bx bx-support text-[#1e6036] text-base"></i> কন্টাক্ট ইনফরমেশন ও গ্রাহক সেবা (Support)</h4>
                    <div class="space-y-1.5 text-[11px] font-bold text-gray-700">
                        <p class="flex items-center gap-2"><i class="bx bxs-phone-call text-[#1e6036] text-sm"></i><span>হেল্পলাইন: <strong class="text-gray-900">+৮৮ ০১৩০০০ ৯০০০০</strong> (সকাল ৯টা – রাত ১০টা)</span></p>
                        <p class="flex items-center gap-2"><i class="bx bxs-envelope text-[#123c69] text-sm"></i><span>সাপোর্ট ইমেইল: <a href="mailto:support@amarloanbd.com" class="text-[#123c69] underline">support@amarloanbd.com</a></span></p>
                        <p class="flex items-start gap-2"><i class="bx bxs-map text-red-600 text-sm mt-0.5"></i><span>অফিস ঠিকানা: হাউস ১৩২০, রোড ১২, গুলশান-১, ঢাকা-১২১২</span></p>
                        <p class="flex items-center gap-2 text-[#15803d]"><i class="bx bxs-check-shield text-sm"></i><span>SSL এনক্রিপ্টেড ও ২৪/৭ নিরাপদ লেনদেন সহায়তা</span></p>
                    </div>
                    <div class="grid grid-cols-2 gap-2 pt-1">
                        <button type="button" onclick="openWhatsApp()" class="bg-[#16a34a] hover:bg-[#15803d] text-white py-2 rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform"><i class="bx bxl-whatsapp text-base"></i> হোয়াটসঅ্যাপ সাপোর্ট</button>
                        <button type="button" onclick="showCustomerCareModal()" class="bg-[#123c69] hover:bg-[#0d2c4e] text-white py-2 rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform"><i class="bx bx-headphone text-base"></i> কাস্টমার কেয়ার</button>
                    </div>
                </div>
            </footer>
        </main>
    </div>

    <!-- 4. INBOX PAGE -->
    <div id="inbox-page" class="page min-h-screen flex-col pb-24 bg-gradient-to-b from-[#e4f2f7] via-[#edf6fa] to-[#e2f0f6]">
        <header class="w-full bg-[#e9f4f9]/95 backdrop-blur-md sticky top-0 z-50 px-4 py-3 flex items-center justify-between border-b border-[#d5e7f0]">
            <div class="flex items-center gap-2.5">
                <button type="button" onclick="navigate('home-page')" class="text-gray-900 p-1 active:scale-95 transition-transform"><i class="bx bx-arrow-back text-2xl font-bold"></i></button>
                <span class="font-extrabold text-lg text-gray-900 tracking-tight">নোটিফিকেশন</span>
            </div>
            <div class="flex items-center gap-2.5">
                <button type="button" onclick="openAppSearchModal()" class="text-gray-800 p-1 active:scale-95 transition-transform" title="খুঁজুন"><i class="bx bx-search text-2xl"></i></button>
                <div class="flex items-center gap-1.5 cursor-pointer" onclick="refreshHomePage()">
                    <div class="text-right leading-none pr-1.5 border-r border-gray-300"><span class="block text-[11px] font-black text-gray-900">আমার</span><span class="block text-[11px] font-black text-gray-900">লোন</span></div>
                    <div class="flex items-center gap-1"><div class="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-[#1e6036]"><i class="bx bxs-donate-heart text-base"></i></div><div class="leading-none"><span class="block text-[11px] font-black text-[#1e6036]">সুফল</span><span class="block text-[10px] font-bold text-[#2b7a78]">ফিন্যান্স</span></div></div>
                </div>
                <button type="button" onclick="toggleSidebar()" class="text-gray-900 p-1 active:scale-95 transition-transform"><i class="bx bx-menu text-3xl"></i></button>
            </div>
        </header>
        <main class="flex-1 w-full max-w-md mx-auto px-3.5 pt-4 space-y-3">
            <div id="inbox_header_count_bar" class="hidden items-center justify-between bg-white px-4 py-2.5 rounded-2xl border border-[#b8c9d4] shadow-sm">
                <span class="font-extrabold text-gray-900 text-xs flex items-center gap-1.5"><i class="bx bxs-bell-ring text-[#1e6036] text-base"></i> সাম্প্রতিক নোটিফিকেশন ও লেনদেন আপডেট</span>
                <span id="inbox_total_count_text" class="text-[11px] font-black text-[#1e6036] bg-[#eef7f2] px-2.5 py-0.5 rounded-full border border-[#a7d7bc]">০ টি</span>
            </div>
            <div id="inbox_notifications_list" class="space-y-2.5"></div>
        </main>
    </div>

    <!-- 5. TRANSACTIONS PAGE -->
    <div id="transactions-page" class="page min-h-screen flex-col pb-28 bg-gradient-to-b from-[#e4f2f7] via-[#edf6fa] to-[#e2f0f6]">
        <header class="w-full bg-[#e9f4f9]/95 backdrop-blur-md sticky top-0 z-50 px-4 py-3 flex items-center justify-between border-b border-[#d5e7f0]">
            <div class="flex items-center gap-2.5">
                <button type="button" onclick="navigate('home-page')" class="text-gray-900 p-1 active:scale-95 transition-transform"><i class="bx bx-arrow-back text-2xl font-bold"></i></button>
                <span class="font-extrabold text-lg text-gray-900 tracking-tight">লেনদেন ও পেমেন্ট হিস্ট্রি</span>
            </div>
            <div class="flex items-center gap-2.5">
                <div class="flex items-center gap-1.5 cursor-pointer" onclick="navigate('home-page')">
                    <div class="text-right leading-none pr-1.5 border-r border-gray-300"><span class="block text-[11px] font-black text-gray-900">আমার</span><span class="block text-[11px] font-black text-gray-900">লোন</span></div>
                    <div class="flex items-center gap-1"><div class="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-[#1e6036]"><i class="bx bxs-donate-heart text-base"></i></div><div class="leading-none"><span class="block text-[11px] font-black text-[#1e6036]">সুফল</span><span class="block text-[10px] font-bold text-[#2b7a78]">ফিন্যান্স</span></div></div>
                </div>
                <button type="button" onclick="toggleSidebar()" class="text-gray-900 p-1 active:scale-95 transition-transform"><i class="bx bx-menu text-3xl"></i></button>
            </div>
        </header>
        <main class="flex-1 w-full max-w-md mx-auto px-3.5 pt-4 space-y-3">
            <div class="bg-[#e3eff6] border border-[#8ea3b0] rounded-2xl p-3.5 shadow-sm space-y-1.5 text-sm">
                <div class="flex justify-between items-center"><span class="font-extrabold text-gray-900">মোট উত্তোলিত টাকা</span><span id="tx_total_withdrawn" class="font-black text-gray-900 text-base">৳ ০</span></div>
                <div class="flex justify-between items-center"><span class="font-extrabold text-gray-900">পরিশোধিত মোট টাকা</span><span id="tx_total_paid" class="font-black text-gray-900 text-base">৳ ০</span></div>
                <div class="flex justify-between items-center"><span class="font-extrabold text-gray-900">বকেয়া কিস্তি</span><span id="tx_due_emi" class="font-black text-gray-900 text-base">৳ ০</span></div>
            </div>
            <div class="flex overflow-x-auto gap-2 pb-0.5 hide-scrollbar">
                <button type="button" id="tx_tab_all" onclick="setTxFilter('all')" class="shrink-0 px-3 py-1.5 rounded-xl bg-[#1e6036] text-white font-extrabold text-xs shadow-sm transition-all">সকল লেনদেন</button>
                <button type="button" id="tx_tab_withdraw" onclick="setTxFilter('withdraw')" class="shrink-0 px-3 py-1.5 rounded-xl bg-white border border-[#8ea3b0] text-gray-900 font-extrabold text-xs transition-all">উত্তোলন</button>
                <button type="button" id="tx_tab_emi" onclick="setTxFilter('emi')" class="shrink-0 px-3 py-1.5 rounded-xl bg-white border border-[#8ea3b0] text-gray-900 font-extrabold text-xs transition-all">কিস্তি পরিশোধ</button>
                <button type="button" id="tx_tab_deposit" onclick="setTxFilter('deposit')" class="shrink-0 px-3 py-1.5 rounded-xl bg-white border border-[#8ea3b0] text-gray-900 font-extrabold text-xs transition-all">ব্যাংক ফি/সঞ্চয়</button>
            </div>
            <div class="grid grid-cols-2 gap-2">
                <div class="relative"><i class="bx bx-search text-gray-500 text-base absolute left-2.5 top-1/2 -translate-y-1/2"></i><input type="text" id="tx_search_input" oninput="renderTransactionsPage()" placeholder="সার্চ (TrxID / আইডি)" class="w-full bg-white border border-[#8ea3b0] rounded-xl pl-8 pr-2.5 py-1.5 text-xs font-bold text-gray-900 outline-none focus:border-[#1e6036]"></div>
                <div class="relative flex items-center gap-1"><input type="date" id="tx_date_input" onchange="renderTransactionsPage()" class="w-full bg-white border border-[#8ea3b0] rounded-xl px-2.5 py-1.5 text-xs font-bold text-gray-900 outline-none focus:border-[#1e6036]"><button type="button" id="tx_date_clear" onclick="document.getElementById('tx_date_input').value=''; renderTransactionsPage();" class="hidden bg-red-100 text-red-600 rounded-lg px-2 py-1.5 text-xs font-black shrink-0" title="তারিখ মুছুন">✕</button></div>
            </div>
            <div id="transactions_list_container" class="space-y-2.5"></div>
        </main>
        <button type="button" onclick="downloadFullTransactionsStatement()" class="fixed bottom-20 right-4 z-40 bg-white/95 hover:bg-gray-50 border-2 border-[#8ea3b0] rounded-2xl px-3.5 py-2 shadow-lg flex items-center gap-2 active:scale-95 transition-transform">
            <span class="text-xs font-black text-gray-900">স্টেটমেন্ট ডাউনলোড</span>
            <span class="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5"><i class="bx bxs-file-pdf text-sm"></i> PDF</span>
        </button>
        <div id="tx-details-modal" class="fixed inset-0 bg-black/60 z-[9999] hidden items-center justify-center p-4 backdrop-blur-sm">
            <div class="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 border border-gray-200 space-y-3">
                <div class="flex justify-between items-center border-b pb-2.5"><h3 class="font-extrabold text-gray-900 text-base flex items-center gap-1.5"><i class="bx bx-transfer-alt text-[#1e6036] text-xl"></i> লেনদেনের বিস্তারিত</h3><button type="button" onclick="closeTxDetailsModal()" class="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-red-50 hover:text-red-600"><i class="bx bx-x text-xl"></i></button></div>
                <div id="tx_details_modal_body" class="space-y-2 text-xs"></div>
                <button type="button" onclick="closeTxDetailsModal()" class="w-full bg-[#1e6036] text-white py-2.5 rounded-xl font-extrabold text-xs shadow active:scale-95 transition-transform">বন্ধ করুন</button>
            </div>
        </div>
    </div>

    <!-- 6. MY LOANS PAGE -->
    <div id="my-loans-page" class="page min-h-screen flex-col pb-24 bg-gradient-to-b from-[#e4f2f7] via-[#edf6fa] to-[#e2f0f6]">
        <header class="w-full bg-[#e9f4f9]/95 backdrop-blur-md sticky top-0 z-50 px-4 py-3 flex items-center justify-between border-b border-[#d5e7f0]">
            <div class="flex items-center gap-2.5">
                <button type="button" onclick="navigate('home-page')" class="text-gray-900 p-1 active:scale-95 transition-transform"><i class="bx bx-arrow-back text-2xl font-bold"></i></button>
                <span class="font-extrabold text-lg text-gray-900 tracking-tight">আমার লোনসমূহ</span>
            </div>
            <div class="flex items-center gap-2.5">
                <div class="flex items-center gap-1.5 cursor-pointer" onclick="navigate('home-page')">
                    <div class="text-right leading-none pr-1.5 border-r border-gray-300"><span class="block text-[11px] font-black text-gray-900">আমার</span><span class="block text-[11px] font-black text-gray-900">লোন</span></div>
                    <div class="flex items-center gap-1"><div class="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-[#1e6036]"><i class="bx bxs-donate-heart text-base"></i></div><div class="leading-none"><span class="block text-[11px] font-black text-[#1e6036]">সুফল</span><span class="block text-[10px] font-bold text-[#2b7a78]">ফিন্যান্স</span></div></div>
                </div>
                <button type="button" onclick="toggleSidebar()" class="text-gray-900 p-1 active:scale-95 transition-transform"><i class="bx bx-menu text-3xl"></i></button>
            </div>
        </header>
        <main class="flex-1 w-full max-w-md mx-auto px-3.5 pt-4 space-y-3.5">
            <div class="bg-white/95 border border-[#8ea3b0] rounded-xl px-3.5 py-2.5 shadow-sm text-center"><p id="my_loans_summary_bar" class="text-xs sm:text-sm font-black text-gray-900">মোট আবেদন: ০টি | চলমান: ০টি | সম্পন্ন: ০টি</p></div>
            <div class="grid grid-cols-3 gap-2">
                <button type="button" id="tab_loan_all" onclick="filterMyLoans('all')" class="py-1.5 px-2 rounded-xl border-2 border-[#3b82c4] bg-[#dbeafe] text-[#1e3a8a] font-extrabold text-xs shadow-sm transition-all">সব লোন (All)</button>
                <button type="button" id="tab_loan_active" onclick="filterMyLoans('active')" class="py-1.5 px-2 rounded-xl border border-[#8ea3b0] bg-white text-gray-800 font-extrabold text-xs transition-all">চলতি (Active)</button>
                <button type="button" id="tab_loan_closed" onclick="filterMyLoans('closed')" class="py-1.5 px-2 rounded-xl border border-[#8ea3b0] bg-white text-gray-800 font-extrabold text-xs transition-all">আগের (Closed)</button>
            </div>
            <div id="my_loans_list" class="space-y-3.5"></div>
        </main>
        <div id="loan-details-modal" class="fixed inset-0 bg-black/60 z-[9999] hidden items-center justify-center p-4 backdrop-blur-sm">
            <div class="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 border border-gray-200 space-y-3">
                <div class="flex justify-between items-center border-b pb-2.5"><h3 class="font-extrabold text-gray-900 text-base flex items-center gap-1.5"><i class="bx bx-receipt text-[#1e6036] text-xl"></i> লোনের বিস্তারিত তথ্য</h3><button type="button" onclick="closeLoanDetailsModal()" class="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-red-50 hover:text-red-600"><i class="bx bx-x text-xl"></i></button></div>
                <div id="loan_details_modal_body" class="space-y-2 text-xs"></div>
                <button type="button" onclick="closeLoanDetailsModal()" class="w-full bg-[#1e6036] text-white py-2.5 rounded-xl font-extrabold text-xs shadow active:scale-95 transition-transform">বন্ধ করুন</button>
            </div>
        </div>
    </div>

    <!-- 7. PROFILE PAGE -->
    <div id="profile-page" class="page min-h-screen flex-col pb-24 bg-gradient-to-b from-[#e4f2f7] via-[#edf6fa] to-[#e2f0f6]">
        <header class="w-full bg-[#e9f4f9]/95 backdrop-blur-md sticky top-0 z-50 px-4 py-3 flex items-center justify-between border-b border-[#d5e7f0]">
            <div class="flex items-center gap-2.5">
                <button type="button" onclick="navigate('home-page')" class="text-gray-900 p-1 active:scale-95 transition-transform"><i class="bx bx-arrow-back text-2xl font-bold"></i></button>
                <span class="font-extrabold text-lg text-gray-900 tracking-tight">প্রোফাইল সেটিংস</span>
            </div>
            <div class="flex items-center gap-2.5">
                <div class="flex items-center gap-1.5 cursor-pointer" onclick="navigate('home-page')">
                    <div class="text-right leading-none pr-1.5 border-r border-gray-300"><span class="block text-[11px] font-black text-gray-900">আমার</span><span class="block text-[11px] font-black text-gray-900">লোন</span></div>
                    <div class="flex items-center gap-1"><div class="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-[#1e6036]"><i class="bx bxs-donate-heart text-base"></i></div><div class="leading-none"><span class="block text-[11px] font-black text-[#1e6036]">সুফল</span><span class="block text-[10px] font-bold text-[#2b7a78]">ফিন্যান্স</span></div></div>
                </div>
                <button type="button" onclick="toggleSidebar()" class="text-gray-900 p-1 active:scale-95 transition-transform"><i class="bx bx-menu text-3xl"></i></button>
            </div>
        </header>
        <main class="flex-1 w-full max-w-md mx-auto px-3.5 pt-4 space-y-3.5">
            <div class="bg-white/95 rounded-2xl p-4 shadow-sm border border-[#d6e4ec] flex items-center gap-4">
                <div class="flex flex-col items-center shrink-0">
                    <div class="relative w-[88px] h-[88px]">
                        <img id="profile_avatar" src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" class="w-full h-full rounded-full object-cover border-2 border-[#d4e5ee] bg-[#dcebf2] shadow-sm" alt="Profile">
                        <label class="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#1e6036] text-white w-8 h-6 rounded-full flex items-center justify-center cursor-pointer border-2 border-white shadow-md hover:bg-[#164b29] transition-colors"><i class="bx bxs-camera text-sm"></i><input type="file" class="hidden" accept="image/*" onchange="updateProfilePicture(this)"></label>
                    </div>
                    <label class="mt-2.5 text-[11px] font-extrabold text-[#1e6036] cursor-pointer hover:underline">ছবি পরিবর্তন করুন<input type="file" class="hidden" accept="image/*" onchange="updateProfilePicture(this)"></label>
                </div>
                <div class="flex-1 min-w-0 text-left">
                    <h2 id="prof_name_display" class="text-[22px] font-black text-gray-900 leading-tight truncate">Guest User</h2>
                    <p class="text-xs font-bold text-gray-700 mt-1.5">সদস্যপদ: <span id="prof_join_date" class="text-gray-900">আজ</span> থেকে</p>
                    <p class="text-xs font-bold text-gray-700 mt-0.5">ইউজার আইডি: <span id="prof_userid_display" class="text-gray-900 font-extrabold">...</span></p>
                </div>
            </div>
            <form id="profile_edit_form" onsubmit="updateProfile(event)" class="space-y-3.5">
                <div class="bg-white rounded-2xl shadow-sm border border-[#b8c9d4] overflow-hidden">
                    <div class="bg-[#eef4f8] px-4 py-2.5 border-b border-[#d4e0e8] flex items-center justify-between">
                        <h3 class="font-extrabold text-gray-900 text-base">ব্যক্তিগত তথ্য</h3>
                        <button type="button" id="btn_enable_edit" onclick="enableProfileEdit()" class="text-[#1d5ec4] font-extrabold text-sm flex items-center gap-1 hover:underline active:scale-95 transition-transform"><i class="bx bxs-pencil text-base"></i> <span id="btn_edit_label">এডিট</span></button>
                    </div>
                    <div class="p-4 space-y-3">
                        <div class="grid grid-cols-12 items-center gap-2"><label class="col-span-5 text-[13px] font-bold text-gray-800">পূর্ণ নাম</label><div class="col-span-7 relative"><input type="text" id="prof_name" disabled required placeholder="আপনার পূর্ণ নাম" class="w-full bg-[#f0f4f7] disabled:text-gray-900 enabled:bg-white border border-[#748490] rounded-lg pl-3 pr-8 py-1.5 text-[13px] font-extrabold outline-none focus:border-[#1e6036] transition-colors"><i class="bx bxs-pencil text-gray-400 text-sm absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"></i></div></div>
                        <div class="grid grid-cols-12 items-center gap-2"><label class="col-span-5 text-[13px] font-bold text-gray-800">মোবাইল নম্বর</label><div class="col-span-7 relative"><input type="tel" id="prof_phone" disabled placeholder="01XXXXXXXXX" class="w-full bg-[#f0f4f7] disabled:text-gray-900 enabled:bg-white border border-[#748490] rounded-lg pl-3 pr-8 py-1.5 text-[13px] font-extrabold outline-none focus:border-[#1e6036] transition-colors"><i class="bx bx-check text-[#1e6036] text-lg font-bold absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"></i></div></div>
                        <div class="grid grid-cols-12 items-center gap-2"><label class="col-span-5 text-[13px] font-bold text-gray-800">ইমেইল ঠিকানা</label><div class="col-span-7"><input type="email" id="prof_email" disabled placeholder="example@email.com" class="w-full bg-[#f0f4f7] disabled:text-gray-900 enabled:bg-white border border-[#748490] rounded-lg px-3 py-1.5 text-[12px] font-bold outline-none focus:border-[#1e6036] transition-colors"></div></div>
                        <div class="grid grid-cols-12 items-center gap-2"><label class="col-span-5 text-[13px] font-bold text-gray-800">জাতীয় পরিচয়পত্র (NID)</label><div class="col-span-7"><input type="text" id="prof_nid" disabled placeholder="এনআইডি নম্বর দিন" class="w-full bg-[#f0f4f7] disabled:text-gray-900 enabled:bg-white border border-[#748490] rounded-lg px-3 py-1.5 text-[13px] font-bold outline-none focus:border-[#1e6036] transition-colors"></div></div>
                        <div class="grid grid-cols-12 items-center gap-2"><label class="col-span-5 text-[13px] font-bold text-gray-800">বর্তমান ঠিকানা</label><div class="col-span-7"><input type="text" id="prof_address" disabled placeholder="আপনার বর্তমান ঠিকানা" class="w-full bg-[#f0f4f7] disabled:text-gray-900 enabled:bg-white border border-[#748490] rounded-lg px-3 py-1.5 text-[12px] font-bold outline-none focus:border-[#1e6036] transition-colors"></div></div>
                        <div class="grid grid-cols-12 items-center gap-2"><label class="col-span-5 text-[13px] font-bold text-gray-800">পেশা / কর্মস্থল</label><div class="col-span-7"><input type="text" id="prof_occupation" disabled placeholder="আপনার পেশা / কর্মস্থল" class="w-full bg-[#f0f4f7] disabled:text-gray-900 enabled:bg-white border border-[#748490] rounded-lg px-3 py-1.5 text-[12px] font-bold outline-none focus:border-[#1e6036] transition-colors"></div></div>
                    </div>
                </div>
                <div class="bg-white rounded-2xl shadow-sm border border-[#b8c9d4] overflow-hidden">
                    <div class="bg-[#eef4f8] px-4 py-2 border-b border-[#d4e0e8]"><h3 class="font-extrabold text-gray-900 text-sm">অ্যাকাউন্ট ও লোন স্ট্যাটাস</h3></div>
                    <div class="p-4 space-y-2.5 text-[13px]">
                        <div class="grid grid-cols-12 items-start gap-2">
                            <span class="col-span-5 font-extrabold text-gray-800">ব্যাংক অ্যাকাউন্ট</span>
                            <div class="col-span-7">
                                <div id="prof_bank_view" class="text-gray-900 font-bold leading-snug"><span id="prof_bank_name_display" class="block">সোনালী ব্যাংক লিমিটেড</span><span id="prof_bank_acc_display" class="text-xs text-gray-700 font-bold">(হিসাব নং: যুক্ত করুন)</span></div>
                                <div id="prof_bank_edit_fields" class="hidden space-y-1.5"><input type="text" id="prof_bank_name" placeholder="ব্যাংকের নাম" class="w-full bg-white border border-[#748490] rounded-lg px-2.5 py-1 text-xs font-bold outline-none focus:border-[#1e6036]"><input type="text" id="prof_bank_account" placeholder="হিসাব নম্বর" class="w-full bg-white border border-[#748490] rounded-lg px-2.5 py-1 text-xs font-bold outline-none focus:border-[#1e6036]"></div>
                            </div>
                        </div>
                        <div class="grid grid-cols-12 items-center gap-2"><span class="col-span-5 font-extrabold text-gray-800">বর্তমান লোন লিমিট</span><span id="prof_loan_limit" class="col-span-7 font-black text-gray-900">৳ ৫,০০,০০০</span></div>
                        <div class="grid grid-cols-12 items-center gap-2 pt-0.5"><span class="col-span-5 font-extrabold text-gray-800">ক্রেডিট স্কোর</span><div class="col-span-7 flex flex-col items-end"><div class="flex items-center gap-1 font-black text-gray-900 text-sm"><i class="bx bx-trending-up text-[#1e6036] text-lg"></i><span id="prof_credit_score">৭৫০</span></div><div class="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1"><div id="prof_credit_bar" class="h-full bg-[#1e6036] rounded-full transition-all duration-500" style="width: 83%"></div></div></div></div>
                    </div>
                </div>
                <div class="flex items-center justify-between gap-3 pt-1 pb-2">
                    <button type="button" onclick="openPasswordModal()" class="text-[#115e78] font-extrabold text-[13px] hover:underline active:scale-95 transition-transform text-left">পাসওয়ার্ড পরিবর্তন করুন</button>
                    <button type="submit" id="btn_save_profile" disabled class="bg-[#1e6036] hover:bg-[#164b29] disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold text-[13px] px-4 py-3 rounded-xl shadow-md active:scale-95 transition-all">তথ্য পরিবর্তন সেভ করুন</button>
                </div>
            </form>
        </main>
    </div>

    <!-- 8. SETTINGS PAGE -->
    <div id="settings-page" class="page min-h-screen flex-col pb-24 bg-gradient-to-b from-[#e4f2f7] via-[#edf6fa] to-[#e2f0f6]">
        <header class="w-full bg-[#e9f4f9]/95 backdrop-blur-md sticky top-0 z-50 px-4 py-3 flex items-center justify-between border-b border-[#d5e7f0]">
            <div class="flex items-center gap-2.5"><button type="button" onclick="navigate('home-page')" class="text-gray-900 p-1 active:scale-95 transition-transform"><i class="bx bx-arrow-back text-2xl font-bold"></i></button><span class="font-extrabold text-lg text-gray-900 tracking-tight">সেটিংস ও নিরাপত্তা</span></div>
            <div class="flex items-center gap-2.5">
                <div class="flex items-center gap-1.5 cursor-pointer" onclick="refreshHomePage()"><div class="text-right leading-none pr-1.5 border-r border-gray-300"><span class="block text-[11px] font-black text-gray-900">আমার</span><span class="block text-[11px] font-black text-gray-900">লোন</span></div><div class="flex items-center gap-1"><div class="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-[#1e6036]"><i class="bx bxs-donate-heart text-base"></i></div><div class="leading-none"><span class="block text-[11px] font-black text-[#1e6036]">সুফল</span><span class="block text-[10px] font-bold text-[#2b7a78]">ফিন্যান্স</span></div></div></div>
                <button type="button" onclick="toggleSidebar()" class="text-gray-900 p-1 active:scale-95 transition-transform"><i class="bx bx-menu text-3xl"></i></button>
            </div>
        </header>
        <div class="max-w-md mx-auto pt-4 px-3.5 space-y-4 w-full">
            <div>
                <h3 class="font-extrabold text-gray-900 text-sm mb-2 ml-1">নিরাপত্তা সেটিংস</h3>
                <div class="bg-white rounded-2xl p-1.5 shadow-sm border border-[#b8c9d4]">
                    <a href="javascript:void(0)" onclick="openPasswordModal()" class="flex items-center justify-between p-3 border-b border-gray-100 hover:bg-[#eef7f2] rounded-xl transition-colors"><div class="flex items-center gap-3"><div class="w-8 h-8 rounded-full bg-[#eef7f2] flex items-center justify-center text-[#1e6036]"><i class="bx bxs-lock-alt text-lg"></i></div><span class="text-xs font-extrabold text-gray-800">পাসওয়ার্ড পরিবর্তন</span></div><i class="bx bx-chevron-right text-gray-400"></i></a>
                    <div class="flex items-center justify-between p-3 border-b border-gray-100"><div class="flex items-center gap-3"><div class="w-8 h-8 rounded-full bg-[#eef7f2] flex items-center justify-center text-[#123c69]"><i class="bx bx-fingerprint text-xl"></i></div><span class="text-xs font-extrabold text-gray-800">বায়োমেট্রিক লগইন (ফিঙ্গারপ্রিন্ট/ফেস)</span></div><label class="relative inline-flex items-center cursor-pointer"><input type="checkbox" class="sr-only peer"><div class="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1e6036]"></div></label></div>
                    <div class="flex items-center justify-between p-3"><div class="flex items-center gap-3"><div class="w-8 h-8 rounded-full bg-[#eef7f2] flex items-center justify-center text-[#123c69]"><i class="bx bx-shield-quarter text-lg"></i></div><span class="text-xs font-extrabold text-gray-800">দ্বি-স্তর বিশিষ্ট যাচাইকরণ (2FA)</span></div><label class="relative inline-flex items-center cursor-pointer"><input type="checkbox" class="sr-only peer"><div class="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1e6036]"></div></label></div>
                </div>
            </div>
            <div>
                <h3 class="font-extrabold text-gray-900 text-sm mb-2 ml-1">অ্যাকাউন্ট সেটিংস</h3>
                <div class="bg-white rounded-2xl p-1.5 shadow-sm border border-[#b8c9d4]">
                    <div class="flex items-center justify-between p-3 border-b border-gray-100"><div class="flex items-center gap-3"><div class="w-8 h-8 rounded-full bg-[#eef7f2] flex items-center justify-center text-[#123c69]"><i class="bx bx-moon text-lg theme-toggle-icon"></i></div><span class="text-xs font-extrabold text-gray-800">ডার্ক মোড (Dark Mode)</span></div><label class="relative inline-flex items-center cursor-pointer"><input type="checkbox" id="settings_dark_mode_toggle" onchange="toggleDarkMode()" class="sr-only peer"><div class="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1e6036]"></div></label></div>
                    <div class="flex items-center justify-between p-3 border-b border-gray-100"><div class="flex items-center gap-3"><div class="w-8 h-8 rounded-full bg-[#eef7f2] flex items-center justify-center text-[#1e6036]"><i class="bx bxs-bell text-lg"></i></div><span class="text-xs font-extrabold text-gray-800">নোটিফিকেশন নিয়ন্ত্রণ</span></div><label class="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked class="sr-only peer"><div class="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1e6036]"></div></label></div>
                    <div class="flex items-center justify-between p-3 border-b border-gray-100"><div class="flex items-center gap-3"><div class="w-8 h-8 rounded-full bg-[#eef7f2] flex items-center justify-center text-[#123c69]"><i class="bx bx-globe text-lg"></i></div><span class="text-xs font-extrabold text-gray-800">ভাষা (Language)</span></div><span class="bg-[#eef7f2] border border-[#a7d7bc] text-[#1e6036] text-xs rounded-lg px-2.5 py-1 font-extrabold">বাংলা</span></div>
                    <a href="javascript:void(0)" class="flex items-center justify-between p-3"><div class="flex items-center gap-3"><div class="w-8 h-8 rounded-full bg-[#eef7f2] flex items-center justify-center text-[#123c69]"><i class="bx bx-devices text-lg"></i></div><span class="text-xs font-extrabold text-gray-800">অ্যাক্টিভ ডিভাইসসমূহ</span></div><span class="text-[10px] font-bold text-gray-600">১টি ডিভাইস সক্রিয়</span></a>
                </div>
            </div>
            <div>
                <h3 class="font-extrabold text-gray-900 text-sm mb-2 ml-1">প্রাইভেসি ও অন্যান্য</h3>
                <div class="bg-white rounded-2xl p-1.5 shadow-sm border border-[#b8c9d4]">
                    <a href="javascript:void(0)" onclick="navigate('about-page')" class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors"><div class="flex items-center gap-3"><div class="w-8 h-8 rounded-full bg-[#eef7f2] flex items-center justify-center text-[#1e6036]"><i class="bx bxs-file-doc text-lg"></i></div><span class="text-xs font-extrabold text-gray-800">গোপনীয়তা নীতিমালা ও লাইসেন্স</span></div><i class="bx bx-chevron-right text-gray-400"></i></a>
                </div>
            </div>
            <div class="bg-amber-50 border border-amber-200 p-3 rounded-xl"><p class="text-[11px] text-amber-900 font-bold leading-relaxed"><span class="font-black">সতর্কতা:</span> আপনার অ্যাকাউন্টের পাসওয়ার্ড বা ওটিপি কখনোই কারো সাথে শেয়ার করবেন না। আমার লোন কখনোই আপনার গোপন পাসওয়ার্ড জানতে চাইবে না।</p></div>
        </div>
    </div>

    <!-- 9. ABOUT PAGE -->
    <div id="about-page" class="page min-h-screen flex-col pb-24 bg-gradient-to-b from-[#e4f2f7] via-[#edf6fa] to-[#e2f0f6]">
        <header class="w-full bg-[#e9f4f9]/95 backdrop-blur-md sticky top-0 z-50 px-4 py-3 flex items-center justify-between border-b border-[#d5e7f0]">
            <div class="flex items-center gap-2.5"><button type="button" onclick="goBackFromAbout()" class="text-gray-900 p-1 active:scale-95 transition-transform"><i class="bx bx-arrow-back text-2xl font-bold"></i></button><span class="font-extrabold text-lg text-gray-900 tracking-tight">আমাদের সম্পর্কে</span></div>
            <div class="flex items-center gap-2.5"><div class="flex items-center gap-1.5 cursor-pointer" onclick="goBackFromAbout()"><div class="text-right leading-none pr-1.5 border-r border-gray-300"><span class="block text-[11px] font-black text-gray-900">আমার</span><span class="block text-[11px] font-black text-gray-900">লোন</span></div><div class="flex items-center gap-1"><div class="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-[#1e6036]"><i class="bx bxs-donate-heart text-base"></i></div><div class="leading-none"><span class="block text-[11px] font-black text-[#1e6036]">সুফল</span><span class="block text-[10px] font-bold text-[#2b7a78]">ফিন্যান্স</span></div></div></div><div class="w-8"></div></div>
        </header>
        <div class="max-w-md mx-auto pt-4 pb-8 px-3.5 space-y-4 w-full">
            <div class="bg-white p-4 rounded-2xl shadow-sm border border-[#b8c9d4] text-xs sm:text-sm text-gray-800 leading-relaxed">
                <div class="flex items-center gap-3 mb-3 border-b border-gray-100 pb-2.5">
                    <div class="w-10 h-10 bg-[#eef7f2] border border-[#a7d7bc] rounded-full flex items-center justify-center"><i class="bx bx-buildings text-[#1e6036] text-2xl"></i></div>
                    <div><h2 class="text-lg font-black text-gray-900">আমার লোন | সুফল ফিন্যান্স</h2><p class="text-[11px] font-bold text-[#1e6036]">লাইসেন্স নং: ১০৩১৫৮২০৬৬</p></div>
                </div>
                <div id="about_text_content" class="space-y-2.5 text-xs font-medium text-gray-700 leading-relaxed">
                    <p><strong>আমার লোন (amarloanbd.com)</strong> একটি সম্পূর্ণ আধুনিক, নির্ভরযোগ্য এবং দ্রুত অনলাইন লোন সেবাদানকারী প্রতিষ্ঠান। সহজ শর্তে ও স্বচ্ছ প্রক্রিয়ায় আমরা দেশের সাধারণ মানুষ ও ক্ষুদ্র উদ্যোক্তাদের আর্থিক সহায়তা প্রদান করে থাকি।</p>
                    <p><strong>প্রাইভেসি পলিসি:</strong> ব্যবহারকারীদের প্রদানকৃত এনআইডি (NID) এবং ব্যক্তিগত তথ্য সম্পূর্ণ এনক্রিপ্টেড অবস্থায় সুরক্ষিত রাখা হয় এবং কোনো তৃতীয় পক্ষের সাথে শেয়ার করা হয় না।</p>
                    <p><strong>যোগাযোগের ঠিকানা:</strong><br>ইমেইল: <a href="mailto:support@amarloanbd.com" class="text-[#1e6036] font-bold underline">support@amarloanbd.com</a><br>অফিস: হাউস ১৩২০, রোড ১২, গুলশান-১, ঢাকা-১২১২</p>
                </div>
            </div>
            <div class="bg-white p-4 rounded-2xl shadow-sm border border-[#b8c9d4] space-y-3">
                <div class="flex items-center justify-between border-b border-gray-100 pb-2"><h3 class="font-black text-gray-900 text-sm flex items-center gap-1.5"><i class="bx bx-certification text-[#1e6036] text-xl"></i> লাইসেন্স ও অনুমোদন সনদসমূহ</h3><span class="text-[10px] font-bold text-[#1e6036] bg-[#eef7f2] px-2 py-0.5 rounded-full">বামে/ডানে সোয়াইপ করুন →</span></div>
                <div id="about_certificates_container" class="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-1 hide-scrollbar"></div>
            </div>
            <div class="bg-white p-4 rounded-2xl shadow-sm border border-[#b8c9d4] space-y-3">
                <div class="flex items-center justify-between border-b border-gray-100 pb-2"><h3 class="font-black text-gray-900 text-sm flex items-center gap-1.5"><i class="bx bxs-photo-album text-[#123c69] text-xl"></i> সরকারি ও বাংলাদেশ ব্যাংক গ্যালারি</h3><span class="text-[10px] font-bold text-[#123c69] bg-blue-50 px-2 py-0.5 rounded-full">সোয়াইপ করে দেখুন →</span></div>
                <div id="about_photo_gallery_container" class="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-1 hide-scrollbar"></div>
            </div>
        </div>
        <div id="gallery-lightbox-modal" class="fixed inset-0 bg-black/80 z-[9999] hidden items-center justify-center p-4 backdrop-blur-sm" onclick="closeGalleryLightbox()">
            <div class="bg-white rounded-2xl max-w-md w-full p-3 space-y-2.5 shadow-2xl" onclick="event.stopPropagation()">
                <div class="flex items-center justify-between border-b pb-2"><h4 id="lightbox_title" class="font-extrabold text-gray-900 text-sm truncate">ছবি প্রিভিউ</h4><button type="button" onclick="closeGalleryLightbox()" class="w-8 h-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center hover:bg-red-50 hover:text-red-600"><i class="bx bx-x text-xl"></i></button></div>
                <img id="lightbox_img" src="" class="w-full max-h-[70vh] object-contain rounded-xl bg-gray-50 border border-gray-200" alt="Preview">
            </div>
        </div>
    </div>`;
})();

function goBackFromAbout() {
    navigate(isUserLoggedIn() ? 'home-page' : 'landing-page');
}

function updateGlobalBottomNav(pageId) {
    const nav = document.getElementById('app-bottom-nav');
    if (!nav) return;
    const hideOnPages = [
        'landing-page', 'login-page', 'register-page', 'about-page', 'settings-page',
        'apply-page', 'nid-verify-page', 'summary-page', 'deposit-page',
        'payment-details-page', 'payment-success-page', 'emi-payment-page', 'emi-success-page', 'cashout-page'
    ];
    if (hideOnPages.includes(pageId) || !isUserLoggedIn()) { nav.classList.add('hidden'); return; }
    nav.classList.remove('hidden');
    const tabMap = [
        { id: 'bnav-home', active: pageId === 'home-page', iconOn: 'bxs-home', iconOff: 'bx-home' },
        { id: 'bnav-loans', active: pageId === 'my-loans-page', iconOn: 'bxs-wallet-alt', iconOff: 'bx-wallet-alt' },
        { id: 'bnav-tx', active: (pageId === 'transactions-page' || pageId === 'cashout-page'), iconOn: 'bx-transfer-alt', iconOff: 'bx-transfer-alt' },
        { id: 'bnav-profile', active: pageId === 'profile-page', iconOn: 'bxs-user', iconOff: 'bx-user' }
    ];
    tabMap.forEach(t => {
        const el = document.getElementById(t.id);
        if (!el) return;
        const icon = el.querySelector('i');
        if (t.active) { el.className = 'py-2.5 flex flex-col items-center text-[#1e6036] font-black transition-colors'; if (icon) icon.className = `bx ${t.iconOn} text-[24px]`; }
        else { el.className = 'py-2.5 flex flex-col items-center text-gray-600 hover:text-[#1e6036] font-bold transition-colors'; if (icon) icon.className = `bx ${t.iconOff} text-[24px]`; }
    });
}

function toggleSidebar(forceClose = false) {
    const sidebar = document.getElementById('sidebar'), overlay = document.getElementById('sidebar-overlay');
    if (!sidebar || !overlay) return;
    const scrollBox = sidebar.querySelector('.overflow-y-auto');
    if (scrollBox) scrollBox.scrollTop = 0;
    if (forceClose || !sidebar.classList.contains('translate-x-full')) {
        sidebar.classList.add('translate-x-full'); overlay.classList.add('hidden');
    } else {
        sidebar.classList.remove('translate-x-full'); overlay.classList.remove('hidden');
        if (scrollBox) setTimeout(() => { scrollBox.scrollTop = 0; }, 10);
    }
}

function refreshHomePage() {
    navigate('home-page', false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    syncWithAdminPanel();
    renderDashboard();
}

function openAppSearchModal() {
    const modal = document.getElementById('app-search-modal');
    if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); document.getElementById('user_app_search_input').focus(); performUserAppSearch(); }
}
function closeAppSearchModal() {
    const modal = document.getElementById('app-search-modal');
    if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
}

function performUserAppSearch() {
    const query = (document.getElementById('user_app_search_input').value || '').toLowerCase().trim();
    const container = document.getElementById('user_app_search_results');
    const allLoans = JSON.parse(localStorage.getItem('admin_loans') || '[]');
    const myLoans = allLoans.filter(l => l && !(l.isAutoDraft || l.status === 'অসম্পূর্ণ') && ((currentUser.userId && l.userId === currentUser.userId) || (currentUser.phone && (l.phone === currentUser.phone || l.userPhone === currentUser.phone))));
    const quickServices = [
        { name: 'লোন আবেদন করুন', page: 'apply-page', icon: 'bx-shield-plus' },
        { name: 'ক্যাশ আউট / টাকা উত্তোলন', page: 'cashout-page', icon: 'bx-money-withdraw' },
        { name: 'বাংলাদেশ ব্যাংক কর্তৃক ফি', page: 'deposit-page', icon: 'bx-wallet' },
        { name: 'আমার লোনসমূহ', page: 'my-loans-page', icon: 'bx-spreadsheet' },
        { name: 'প্রোফাইল ও এনআইডি ভেরিফিকেশন', page: 'profile-page', icon: 'bx-id-card' }
    ];
    let html = '';
    quickServices.filter(s => s.name.toLowerCase().includes(query)).forEach(s => {
        html += `<div onclick="closeAppSearchModal(); navigate('${s.page}')" class="flex items-center justify-between p-3 bg-primary-50/60 hover:bg-primary-50 rounded-xl border border-primary-100 cursor-pointer"><div class="flex items-center gap-2.5"><i class="bx ${s.icon} text-lg text-primary-600"></i><span class="text-xs font-bold text-gray-800">${s.name}</span></div><i class="bx bx-chevron-right text-gray-400"></i></div>`;
    });
    myLoans.filter(l => !query || (l.trx && l.trx.toLowerCase().includes(query)) || (l.amount && l.amount.toString().includes(query)) || (l.status && l.status.toLowerCase().includes(query))).forEach(tx => {
        const isCashout = tx.type === 'CASHOUT';
        html += `<div onclick="closeAppSearchModal(); navigate('my-loans-page')" class="p-3 bg-white rounded-xl border border-gray-200 flex items-center justify-between cursor-pointer hover:border-primary-400"><div><p class="text-xs font-bold text-gray-800">${isCashout ? 'ক্যাশ আউট' : 'লোন আবেদন'} — ৳ ${sanitizeInput(tx.amount)}</p><p class="text-[10px] text-gray-500 font-mono">TrxID: ${sanitizeInput(tx.trx)}</p></div><span class="text-[10px] font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">${sanitizeInput(tx.status)}</span></div>`;
    });
    container.innerHTML = html || '<p class="text-xs text-gray-400 text-center py-6">কোনো তথ্য খুঁজে পাওয়া যায়নি।</p>';
}

function openCalculatorPopup() {
    const modal = document.getElementById('dash-calculator-modal'), content = document.getElementById('dash-calc-content');
    calculateDashEMI();
    modal.classList.remove('hidden');
    setTimeout(() => { modal.classList.remove('opacity-0'); content.classList.remove('scale-90', 'scale-95'); }, 10);
}
function closeCalculatorPopup() {
    const modal = document.getElementById('dash-calculator-modal'), content = document.getElementById('dash-calc-content');
    modal.classList.add('opacity-0'); content.classList.add('scale-95');
    setTimeout(() => modal.classList.add('hidden'), 200);
}
function calculateDashEMI() {
    const amountInput = document.getElementById('dash_calc_amount'), tenureInput = document.getElementById('dash_calc_tenure');
    if (!amountInput || !tenureInput) return;
    const amount = parseFloat(amountInput.value), tenure = parseFloat(tenureInput.value), monthlyRate = (9.5 / 100) / 12;
    const emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);
    document.getElementById('dash_calc_emi_display').innerText = '৳' + Math.ceil(emi).toLocaleString('bn-BD');
    document.getElementById('dash_calc_amt_display').innerText = '৳' + amount.toLocaleString('bn-BD');
    document.getElementById('dash_calc_tenure_display').innerText = tenure + ' মাস';
}

function getUserBalance() {
    if (!currentUser || (!currentUser.phone && !currentUser.userId)) return 0;
    const allLoans = JSON.parse(localStorage.getItem('admin_loans') || '[]');
    const allUsers = JSON.parse(localStorage.getItem('admin_users') || '[]');
    const isMine = (l) => (currentUser.phone && (l.phone === currentUser.phone || l.userPhone === currentUser.phone)) || (currentUser.userId && l.userId === currentUser.userId);
    let totalApproved = 0;
    allLoans.filter(l => isMine(l) && l.status === 'এপ্রুভড' && (!l.type || l.type === 'LOAN')).forEach(l => {
        totalApproved += (parseAmountToNumber(l.amount) + (l.depositFee ? parseAmountToNumber(l.depositFee) : parseAmountToNumber(localStorage.getItem('app_loan_fee') || '500')));
    });
    let totalCashout = 0;
    allLoans.filter(c => isMine(c) && c.type === 'CASHOUT' && c.status === 'এপ্রুভড').forEach(c => { totalCashout += parseAmountToNumber(c.amount); });
    const matchedUser = allUsers.find(u => (currentUser.userId && u.userId === currentUser.userId) || (currentUser.phone && u.phone === currentUser.phone));
    const manualBalance = matchedUser && matchedUser.manualBalance ? Number(matchedUser.manualBalance) : 0;
    return Math.max(0, totalApproved - totalCashout + manualBalance);
}

function renderDashboard() {
    if (!currentUser || (!currentUser.phone && !currentUser.userId)) return;
    const allLoans = JSON.parse(localStorage.getItem('admin_loans') || '[]');
    const myLoans = allLoans.filter(l => l && !(l.isAutoDraft || l.status === 'অসম্পূর্ণ') && ((currentUser.phone && (l.phone === currentUser.phone || l.userPhone === currentUser.phone)) || (currentUser.userId && l.userId === currentUser.userId)));
    const loanApps = myLoans.filter(l => !l.type || l.type === 'LOAN');
    const approvedLoans = loanApps.filter(l => l.status === 'এপ্রুভড'), pendingLoans = loanApps.filter(l => l.status === 'পেন্ডিং');
    const cashoutApps = myLoans.filter(l => l.type === 'CASHOUT');
    const approvedCashouts = cashoutApps.filter(c => c.status === 'এপ্রুভড'), pendingCashouts = cashoutApps.filter(c => c.status === 'পেন্ডিং');
    const approvedEmis = myLoans.filter(l => l.type === 'EMI' && l.status === 'এপ্রুভড');
    const activeLoan = approvedLoans.length > 0 ? approvedLoans[0] : null;
    const bal = getUserBalance();

    const sidebarBadge = document.getElementById('sidebar_withdraw_badge');
    if (sidebarBadge) {
        if (bal > 0) { sidebarBadge.innerText = '৳ ' + bal.toLocaleString('bn-BD'); sidebarBadge.classList.remove('hidden'); }
        else sidebarBadge.classList.add('hidden');
    }

    const timelineBox = document.getElementById('home_live_timeline_box'), timelineStepsEl = document.getElementById('home_timeline_steps'), timelineBadge = document.getElementById('home_timeline_badge'), finalApprovedBanner = document.getElementById('home_final_approved_banner'), withdrawBtn = document.getElementById('home_withdraw_btn'), payEmiBtn = document.getElementById('home_pay_emi_btn');
    if (timelineBox && timelineStepsEl) {
        if (loanApps.length === 0) {
            timelineBox.classList.add('hidden'); if (withdrawBtn) withdrawBtn.classList.add('hidden'); if (payEmiBtn) payEmiBtn.classList.add('hidden');
        } else {
            timelineBox.classList.remove('hidden');
            const isLoanApproved = approvedLoans.length > 0, isLoanPending = pendingLoans.length > 0 && !isLoanApproved, isSavingsApproved = approvedCashouts.length > 0, isSavingsPending = pendingCashouts.length > 0 && !isSavingsApproved;
            if (isSavingsApproved) {
                timelineStepsEl.classList.add('hidden'); if (finalApprovedBanner) finalApprovedBanner.classList.remove('hidden'); if (withdrawBtn) withdrawBtn.classList.add('hidden'); if (payEmiBtn) payEmiBtn.classList.remove('hidden');
                if (timelineBadge) { timelineBadge.className = "text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#15803d] border border-emerald-300"; timelineBadge.innerText = "চূড়ান্ত অনুমোদিত (Approved) ✓"; }
            } else {
                timelineStepsEl.classList.remove('hidden'); if (finalApprovedBanner) finalApprovedBanner.classList.add('hidden'); if (payEmiBtn) payEmiBtn.classList.add('hidden');
                const step1Html = `<div class="flex flex-col items-center"><div class="w-6 h-6 rounded-full bg-[#15803d] text-white flex items-center justify-center text-xs font-black shadow-sm"><i class="bx bx-check"></i></div><span class="text-[9px] font-extrabold text-gray-800 mt-1 leading-tight">আবেদন ও ব্যাংক ফি</span></div>`;
                const step2Html = isLoanApproved ? `<div class="flex flex-col items-center"><div class="w-6 h-6 rounded-full bg-[#15803d] text-white flex items-center justify-center text-xs font-black shadow-sm"><i class="bx bx-check"></i></div><span class="text-[9px] font-extrabold text-[#15803d] mt-1 leading-tight">লোন অনুমোদিত</span></div>` : (isLoanPending ? `<div class="flex flex-col items-center"><div class="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs animate-pulse shadow-sm"><i class="bx bx-time-five"></i></div><span class="text-[9px] font-extrabold text-amber-700 mt-1 leading-tight">অ্যাপ্রুভ পেন্ডিং</span></div>` : `<div class="flex flex-col items-center"><div class="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs shadow-sm"><i class="bx bx-x"></i></div><span class="text-[9px] font-extrabold text-red-600 mt-1 leading-tight">আবেদন বাতিল</span></div>`);
                const step3Html = isSavingsPending ? `<div class="flex flex-col items-center"><div class="w-6 h-6 rounded-full bg-[#15803d] text-white flex items-center justify-center text-xs font-black shadow-sm"><i class="bx bx-check"></i></div><span class="text-[9px] font-extrabold text-[#15803d] mt-1 leading-tight">উত্তোলন সাবমিট</span></div>` : (isLoanApproved ? `<div class="flex flex-col items-center"><div class="w-6 h-6 rounded-full bg-[#1d70d1] text-white flex items-center justify-center text-xs animate-bounce shadow-sm"><i class="bx bx-down-arrow-alt"></i></div><span class="text-[9px] font-extrabold text-[#1d70d1] mt-1 leading-tight">উত্তোলন প্রস্তুত</span></div>` : `<div class="flex flex-col items-center opacity-60"><div class="w-6 h-6 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-xs"><i class="bx bx-lock-alt"></i></div><span class="text-[9px] font-bold text-gray-500 mt-1 leading-tight">টাকা উত্তোলন</span></div>`);
                const step4Html = isSavingsPending ? `<div class="flex flex-col items-center"><div class="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs animate-pulse shadow-sm"><i class="bx bx-time-five"></i></div><span class="text-[9px] font-extrabold text-amber-700 mt-1 leading-tight">সঞ্চয় পেন্ডিং</span></div>` : `<div class="flex flex-col items-center opacity-60"><div class="w-6 h-6 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-xs"><i class="bx bx-lock-alt"></i></div><span class="text-[9px] font-bold text-gray-500 mt-1 leading-tight">চূড়ান্ত অনুমোদন</span></div>`;
                timelineStepsEl.innerHTML = step1Html + step2Html + step3Html + step4Html;
                if (timelineBadge) {
                    if (isSavingsPending) { timelineBadge.className = "text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200"; timelineBadge.innerText = "সঞ্চয় যাচাইাধীন ⏳"; }
                    else if (isLoanApproved) { timelineBadge.className = "text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 text-[#1d70d1] border border-blue-200"; timelineBadge.innerText = "লোন অনুমোদিত ✓"; }
                    else if (isLoanPending) { timelineBadge.className = "text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200"; timelineBadge.innerText = "পেন্ডিং ⏳"; }
                    else { timelineBadge.className = "text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200"; timelineBadge.innerText = "বাতিল"; }
                }
                if (withdrawBtn) {
                    if (isLoanApproved && bal > 0 && !isSavingsPending) withdrawBtn.classList.remove('hidden');
                    else withdrawBtn.classList.add('hidden');
                }
            }
        }
    }

    const alertBox = document.getElementById('dash_overview_alert'), totalLoanEl = document.getElementById('dash_total_loan'), nextPayEl = document.getElementById('dash_next_payment'), dueAmtEl = document.getElementById('dash_due_amount');
    if (activeLoan) {
        const loanAmt = parseAmountToNumber(activeLoan.amount), durMonths = parseAmountToNumber(activeLoan.duration) || 12, rate = activeLoan.interestRate ? parseFloat(activeLoan.interestRate) : 3;
        const totalWithInterest = Math.round(loanAmt * (1 + rate / 100)), emi = activeLoan.monthlyInstallment ? Number(activeLoan.monthlyInstallment) : Math.ceil(totalWithInterest / durMonths);
        const emisForThisLoan = approvedEmis.filter(e => !e.loanRefId || e.loanRefId === activeLoan.id), paidCount = emisForThisLoan.length, paidEmiMoney = emisForThisLoan.reduce((sum, e) => sum + parseAmountToNumber(e.amount), 0);
        const isFullyPaid = paidCount >= durMonths || paidEmiMoney >= totalWithInterest, remainingTotalDue = isFullyPaid ? 0 : Math.max(0, totalWithInterest - paidEmiMoney);
        const nextDate = new Date(Number(activeLoan.approvedAt || activeLoan.id) || Date.now());
        nextDate.setMonth(nextDate.getMonth() + 1 + paidCount);
        const nextDateBn = nextDate.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }), diffDays = Math.ceil((nextDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

        if (isFullyPaid) {
            if (alertBox) { alertBox.className = "bg-[#eef7f2] border border-[#a7d7bc] rounded-xl p-3 flex items-center gap-2.5 mb-4 shadow-sm"; alertBox.innerHTML = `<i class="bx bxs-check-circle text-[#15803d] text-xl shrink-0"></i><p class="text-[11px] font-bold text-[#14532d]">অভিনন্দন! আপনার এই লোনের সকল কিস্তি পরিশোধ সম্পন্ন হয়েছে।</p>`; }
            if (dueAmtEl) { dueAmtEl.className = "text-[13px] font-black text-[#15803d]"; dueAmtEl.innerText = '৳ ০'; }
            if (nextPayEl) nextPayEl.innerText = 'পরিশোধিত ✓';
        } else {
            if (diffDays > 0) {
                if (alertBox) { alertBox.className = "bg-[#eef7f2] border border-[#a7d7bc] rounded-xl p-3 flex items-center gap-2.5 mb-4 shadow-sm"; alertBox.innerHTML = `<i class="bx bx-calendar-check text-[#15803d] text-xl shrink-0"></i><p class="text-[11px] font-bold text-[#14532d]">আপনার পরবর্তী কিস্তির তারিখ <strong>${nextDateBn}</strong> (আর ${toBanglaDigits(diffDays)} দিন বাকি আছে)।</p>`; }
                if (nextPayEl) nextPayEl.innerHTML = '৳ ' + emi.toLocaleString('bn-BD') + '<span class="block text-[9px] font-bold text-gray-500 mt-0.5">' + nextDateBn + '</span>';
            } else {
                const overdueDays = Math.max(1, Math.abs(diffDays));
                if (alertBox) { alertBox.className = "bg-[#fef2f2] border border-[#fecaca] rounded-xl p-3 flex items-center gap-2.5 mb-4 shadow-sm"; alertBox.innerHTML = `<i class="bx bxs-bell-ring text-[#dc2626] text-xl shrink-0"></i><p class="text-[11px] font-bold text-[#991b1b]">আপনার কিস্তি পরিশোধের ১ মাস সময় অতিক্রান্ত হয়েছে (${toBanglaDigits(overdueDays)} দিন ধরে কিস্তি বকেয়া রয়েছে)।</p>`; }
                if (nextPayEl) nextPayEl.innerHTML = '৳ ' + emi.toLocaleString('bn-BD') + '<span class="block text-[9px] font-bold text-red-500 mt-0.5">' + nextDateBn + '</span>';
            }
            if (dueAmtEl) { dueAmtEl.className = "text-[13px] font-black text-[#dc2626]"; dueAmtEl.innerHTML = '৳ ' + remainingTotalDue.toLocaleString('bn-BD') + '<span class="block text-[8px] font-bold text-gray-500 mt-0.5">সুদসহ অবশিষ্ট</span>'; }
        }
        if (totalLoanEl) totalLoanEl.innerHTML = '৳ ' + loanAmt.toLocaleString('bn-BD') + ' <span class="bg-[#dcfce7] text-[#16a34a] text-[8px] px-1.5 py-0.5 rounded font-black ml-1">অনুমোদিত</span>';
        const appIdStr = activeLoan.appId || ('#PF-' + activeLoan.id.toString().slice(-5)), progressPct = Math.min(100, Math.max(10, Math.round((paidCount / durMonths) * 100)));
        document.getElementById('dash_active_loan_container').innerHTML = `<div class="bg-white rounded-2xl p-4 shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-[#e1eaf4]"><div class="flex justify-between items-start border-b border-gray-100 pb-3 mb-3"><div class="flex items-center gap-2"><div class="w-10 h-10 rounded-full bg-[#f0f9f6] flex items-center justify-center"><img src="https://cdn-icons-png.flaticon.com/512/1055/1055644.png" class="w-6 h-6 opacity-80"></div><div><h4 class="font-extrabold text-gray-900 text-[13px]">${sanitizeInput(activeLoan.loanType || 'পার্সোনাল লোন')}</h4><p class="text-[10px] font-bold text-gray-500 mt-0.5">লোন আইডি: ${sanitizeInput(appIdStr)} <span class="bg-[#dcfce7] text-[#16a34a] px-1.5 py-0.5 rounded font-black ml-1">Approved</span></p></div></div><div class="text-right"><p class="text-[10px] font-extrabold text-gray-500 mb-1">সুদের হার: <span class="text-gray-900">${toBanglaDigits(rate)}%</span></p><p class="text-[10px] font-extrabold text-gray-500">কিস্তি: <span class="text-gray-900">${toBanglaDigits(paidCount)}/${toBanglaDigits(durMonths)}</span></p></div></div><div class="flex justify-between items-end"><div><p class="text-[11px] font-bold text-gray-500 mb-1">মঞ্জুরকৃত পরিমাণ: <span class="text-gray-900 text-sm font-black ml-1">৳ ${loanAmt.toLocaleString('bn-BD')}</span></p></div><button onclick="openEmiPaymentPage()" class="bg-[#1e6036] hover:bg-[#164b29] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md active:scale-95 transition-all">কিস্তি দিন</button></div><div class="w-full h-1.5 bg-gray-100 rounded-full mt-4 overflow-hidden"><div class="h-full bg-[#00d061] rounded-full" style="width:${progressPct}%"></div></div></div>`;
    } else {
        if (alertBox) {
            if (pendingLoans.length > 0) { alertBox.className = "bg-[#fef4d8] border border-[#fde5a8] rounded-xl p-3 flex items-center justify-between gap-2.5 mb-4 shadow-sm"; alertBox.innerHTML = `<div class="flex items-center gap-2"><i class="bx bx-time-five text-[#d97706] text-xl shrink-0"></i><p class="text-[11px] font-bold text-[#92400e]">আপনার লোন আবেদনটি বর্তমানে যাচাইাধীন (Pending) রয়েছে।</p></div>`; }
            else { alertBox.className = "bg-white border border-[#cce8d7] rounded-xl p-3 flex items-center justify-between gap-2.5 mb-4 shadow-sm"; alertBox.innerHTML = `<p class="text-[11px] font-bold text-gray-700">আপনার কোনো চলমান লোন নেই।</p><button type="button" onclick="navigate('apply-page')" class="bg-[#1e6036] hover:bg-[#164b29] text-white px-3.5 py-2 rounded-lg text-[11px] font-extrabold shrink-0 shadow-sm active:scale-95 transition-all">লোনের জন্য আবেদন করুন</button>`; }
        }
        if (totalLoanEl) totalLoanEl.innerText = '৳ ০';
        if (nextPayEl) nextPayEl.innerText = '৳ ০';
        if (dueAmtEl) { dueAmtEl.className = "text-[13px] font-black text-gray-900"; dueAmtEl.innerText = '৳ ০'; }
        document.getElementById('dash_active_loan_container').innerHTML = `<div class="bg-white rounded-2xl p-6 text-center shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-[#e1eaf4]"><div class="w-12 h-12 bg-[#f8f9fb] rounded-full flex items-center justify-center mx-auto mb-3 border border-gray-100"><i class="bx bx-shield-plus text-2xl text-[#00d061]"></i></div><p class="text-[11px] font-bold text-gray-500 mb-4 px-4 leading-relaxed">আপনার বর্তমানে কোনো সক্রিয় লোন নেই। আপনার যেকোনো প্রয়োজনে সহজ শর্তে লোনের জন্য আবেদন করুন।</p><button onclick="navigate('apply-page')" class="bg-[#00d061] text-white px-6 py-2.5 rounded-lg text-xs font-extrabold shadow-sm active:scale-95 transition-all">নতুন লোন আবেদন</button></div>`;
    }

    if (myLoans.length > 0) {
        let txHtml = '';
        myLoans.slice(0, 4).forEach(tx => {
            const statusColor = tx.status === 'এপ্রুভড' ? 'text-[#16a34a] bg-[#dcfce7]' : (tx.status === 'বাতিল' ? 'text-red-600 bg-red-50' : 'text-amber-600 bg-amber-50');
            const desc = tx.type === 'CASHOUT' ? 'উত্তোলন ও সঞ্চয়' : (tx.type === 'EMI' ? 'কিস্তি পরিশোধ' : 'লোন আবেদন');
            txHtml += `<tr class="border-b border-gray-50 last:border-0"><td class="py-3 px-3 text-[9px] text-gray-500">${new Date(tx.id).toLocaleDateString('bn-BD')}</td><td class="py-3 px-3 text-gray-700">${desc}</td><td class="py-3 px-3 font-black text-[#0a2540]">৳ ${parseAmountToNumber(tx.amount).toLocaleString('bn-BD')}</td><td class="py-3 px-3"><span class="${statusColor} px-2 py-0.5 rounded font-black text-[9px]">${tx.status}</span></td></tr>`;
        });
        document.getElementById('dash_recent_transactions_list').innerHTML = txHtml;
    } else {
        document.getElementById('dash_recent_transactions_list').innerHTML = `<tr><td colspan="4" class="text-center py-8 text-xs text-gray-400 font-bold bg-gray-50/50">এখনো কোনো লেনদেন করা হয়নি।</td></tr>`;
    }
}

function getVisibleInboxItems() {
    const items = [];
    const myPhone = (currentUser && currentUser.phone) ? String(currentUser.phone).trim() : '';
    const myUserId = (currentUser && currentUser.userId) ? String(currentUser.userId).trim() : (localStorage.getItem('logged_user_id') || '');
    let rawNotifs = [];
    try {
        const stored = localStorage.getItem('user_notifications');
        if (stored) { rawNotifs = typeof stored === 'string' ? JSON.parse(stored) : stored; if (!Array.isArray(rawNotifs)) rawNotifs = []; }
    } catch(e) { rawNotifs = []; }
    rawNotifs.forEach(n => {
        if (!n || (!n.title && !n.message)) return;
        const target = n.target ? String(n.target).trim() : 'ALL';
        if (target === 'ALL' || (myPhone && target === myPhone) || (myUserId && target === myUserId)) {
            items.push({ uid: 'notif_' + (n.id || n.title), kind: 'ADMIN_NOTIF', title: n.title || 'সিস্টেম নোটিফিকেশন', message: n.message || '', time: n.time || '', sortTime: Number(n.id) || 0 });
        }
    });
    let allLoans = [];
    try { allLoans = JSON.parse(localStorage.getItem('admin_loans') || '[]'); if (!Array.isArray(allLoans)) allLoans = []; } catch(e) { allLoans = []; }
    if (myPhone || myUserId) {
        allLoans.filter(l => l && !(l.isAutoDraft || l.status === 'অসম্পূর্ণ') && ((myPhone && (String(l.phone).trim() === myPhone || String(l.userPhone).trim() === myPhone)) || (myUserId && String(l.userId || '').trim() === myUserId))).forEach(item => {
            items.push({ uid: 'loan_' + item.id + '_' + (item.status || 'পেন্ডিং'), kind: 'LOAN_TX', type: item.type || 'LOAN', appId: item.appId || ('#PF-' + String(item.id).slice(-5)), amount: item.amount || '0', trx: item.rawTrx || item.trx || 'N/A', status: item.status || 'পেন্ডিং', bankName: item.bankName || '', submittedAt: item.submittedAt || new Date(item.id).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }), sortTime: Number(item.id) || 0 });
        });
    }
    items.sort((a, b) => b.sortTime - a.sortTime);
    return items;
}

function renderInboxNotifications() {
    const container = document.getElementById('inbox_notifications_list'), headerBar = document.getElementById('inbox_header_count_bar'), countText = document.getElementById('inbox_total_count_text');
    if (!container) return;
    const visibleItems = getVisibleInboxItems();
    if (visibleItems.length === 0) {
        if (headerBar) { headerBar.classList.add('hidden'); headerBar.classList.remove('flex'); }
        container.innerHTML = `<div class="bg-white p-8 rounded-2xl text-center border border-[#b8c9d4] shadow-sm"><i class="bx bx-bell-off text-4xl text-gray-400 mb-2"></i><p class="text-xs font-bold text-gray-600">আপাতত কোনো নোটিফিকেশন নেই।</p></div>`;
        return;
    }
    if (headerBar && countText) { headerBar.classList.remove('hidden'); headerBar.classList.add('flex'); countText.innerText = toBanglaDigits(visibleItems.length) + ' টি'; }
    let html = '';
    visibleItems.forEach(item => {
        if (item.kind === 'ADMIN_NOTIF') {
            html += `<div class="bg-white p-3.5 rounded-2xl shadow-sm border border-[#b8c9d4] flex items-start gap-3"><div class="w-10 h-10 rounded-full bg-[#eef7f2] border border-[#a7d7bc] text-[#1e6036] flex items-center justify-center shrink-0"><i class="bx bxs-bell-ring text-xl"></i></div><div class="flex-1 text-left"><div class="flex items-center justify-between gap-2"><h4 class="font-extrabold text-gray-900 text-xs sm:text-sm">${sanitizeInput(item.title)}</h4>${item.time ? `<span class="text-[10px] font-bold text-gray-500 shrink-0">${sanitizeInput(item.time)}</span>` : ''}</div><p class="text-xs font-medium text-gray-700 mt-1 leading-relaxed">${sanitizeInput(item.message)}</p></div></div>`;
        } else {
            const amtBn = parseAmountToNumber(item.amount).toLocaleString('bn-BD');
            let titleTxt = `লোন আবেদন (${sanitizeInput(item.appId)}) — ৳ ${amtBn}`, iconCls = 'bx bxs-wallet', iconBg = 'bg-[#1e6036]', targetPage = 'my-loans-page';
            if (item.type === 'CASHOUT') { titleTxt = `উত্তোলন ও সঞ্চয় (${sanitizeInput(item.appId)}) — ৳ ${amtBn}`; iconCls = 'bx bx-money-withdraw'; iconBg = 'bg-[#123c69]'; targetPage = 'transactions-page'; }
            else if (item.type === 'EMI') { titleTxt = `কিস্তি পরিশোধ (${sanitizeInput(item.appId)}) — ৳ ${amtBn}`; iconCls = 'bx bx-credit-card'; iconBg = 'bg-orange-600'; targetPage = 'transactions-page'; }
            const statusColor = item.status === 'এপ্রুভড' ? 'text-[#15803d] bg-emerald-50 border-emerald-300' : (item.status === 'বাতিল' ? 'text-red-700 bg-red-50 border-red-200' : 'text-amber-800 bg-amber-50 border-amber-300');
            const statusText = item.status === 'এপ্রুভড' ? 'অনুমোদিত ✓' : (item.status === 'বাতিল' ? 'বাতিল' : 'যাচাইাধীন');
            html += `<div onclick="navigate('${targetPage}')" class="bg-white p-3.5 rounded-2xl shadow-sm border border-[#b8c9d4] flex items-center justify-between gap-3 cursor-pointer hover:border-[#1e6036] transition-all"><div class="flex items-center gap-3 text-left min-w-0"><div class="w-10 h-10 rounded-full ${iconBg} text-white flex items-center justify-center shrink-0 shadow-sm"><i class="${iconCls} text-xl"></i></div><div class="min-w-0"><h4 class="font-extrabold text-gray-900 text-xs sm:text-sm truncate">${titleTxt}</h4><p class="text-[11px] font-bold text-gray-600 truncate">TrxID: ${sanitizeInput(String(item.trx))} | ${sanitizeInput(item.submittedAt)}</p></div></div><span class="text-[10px] font-extrabold px-2.5 py-1 rounded-full border shrink-0 ${statusColor}">${statusText}</span></div>`;
        }
    });
    container.innerHTML = html;
}

function updateUnreadInboxCount() {
    const visibleItems = getVisibleInboxItems();
    let readIds = [];
    try { readIds = JSON.parse(localStorage.getItem('read_notification_ids') || '[]'); if (!Array.isArray(readIds)) readIds = []; } catch(e) { readIds = []; }
    const unreadCount = visibleItems.filter(item => !readIds.includes(item.uid)).length;
    const badge = document.getElementById('inbox_badge_home');
    if (badge) {
        if (unreadCount > 0 && visibleItems.length > 0) { badge.innerText = unreadCount > 9 ? '9+' : unreadCount; badge.classList.remove('hidden'); }
        else { badge.innerText = '0'; badge.classList.add('hidden'); }
    }
}

function markAllNotificationsAsRead() {
    const visibleItems = getVisibleInboxItems();
    let readIds = [];
    try { readIds = JSON.parse(localStorage.getItem('read_notification_ids') || '[]'); if (!Array.isArray(readIds)) readIds = []; } catch(e) { readIds = []; }
    visibleItems.forEach(item => { if (!readIds.includes(item.uid)) readIds.push(item.uid); });
    localStorage.setItem('read_notification_ids', JSON.stringify(readIds));
    updateUnreadInboxCount();
}

function makeCleanBankFallbackSvg(code, bgColor) {
    const safeCode = (code || 'BANK').substring(0, 12);
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="60" viewBox="0 0 120 60"><rect width="120" height="60" rx="6" fill="${bgColor || '#1e3a8a'}"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-weight="800" font-size="16">${safeCode}</text></svg>`);
}

function getDynamicBanksForUser() {
    try {
        const raw = localStorage.getItem('app_banks_list');
        if (raw) { const parsed = JSON.parse(raw); if (Array.isArray(parsed) && parsed.length > 0) return parsed; }
    } catch(e) {}
    return [
        { id: 'bank_brac', name: 'ব্র্যাক ব্যাংক', code: 'BRAC', rate: '3', color: '#e11d48', logo: '' },
        { id: 'bank_sonali', name: 'সোনালী ব্যাংক', code: 'SONALI', rate: '3.1', color: '#0f2c59', logo: '' },
        { id: 'bank_dbbl', name: 'ডাচ-বাংলা ব্যাংক', code: 'DBBL', rate: '3.15', color: '#16a34a', logo: '' },
        { id: 'bank_islami', name: 'ইসলামী ব্যাংক', code: 'IBBL', rate: '3.2', color: '#059669', logo: '' },
        { id: 'bank_agrani', name: 'অগ্রণী ব্যাংক', code: 'AGRANI', rate: '3.2', color: '#ea580c', logo: '' },
        { id: 'bank_eastern', name: 'ইস্টার্ন ব্যাংক', code: 'EBL', rate: '3.25', color: '#7e22ce', logo: '' },
        { id: 'bank_city', name: 'সিটি ব্যাংক', code: 'CITY', rate: '3.3', color: '#dc2626', logo: '' },
        { id: 'bank_prime', name: 'প্রাইম ব্যাংক', code: 'PRIME', rate: '3.3', color: '#2563eb', logo: '' },
        { id: 'bank_pubali', name: 'পূবালী ব্যাংক', code: 'PUBALI', rate: '3.35', color: '#0f766e', logo: '' },
        { id: 'bank_janata', name: 'জনতা ব্যাংক', code: 'JANATA', rate: '3.4', color: '#0284c7', logo: '' },
        { id: 'bank_ucb', name: 'ইউসিবি ব্যাংক', code: 'UCB', rate: '3.45', color: '#be123c', logo: '' },
        { id: 'bank_asha', name: 'আশা ব্যাংক', code: 'ASA', rate: '3.5', color: '#1e3a8a', logo: '' }
    ];
}

function renderHomePartnerBanks() {
    const container = document.getElementById('home_partner_banks_container');
    if (!container) return;
    const banks = getDynamicBanksForUser();
    let html = '';
    banks.forEach(b => {
        const imgSrc = (b.logo && b.logo.trim()) ? b.logo.trim() : makeCleanBankFallbackSvg(b.code, b.color);
        const safeName = sanitizeInput(b.name || 'ব্যাংক');
        html += `<div class="shrink-0 snap-center w-[94px] h-[62px] bg-white border border-gray-200 rounded-xl flex flex-col items-center justify-center overflow-hidden shadow-sm"><div class="h-9 w-full flex items-center justify-center p-1 bg-white"><img src="${sanitizeInput(imgSrc)}" class="max-h-full max-w-full object-contain" alt="${safeName}"></div><div class="h-6 w-full flex items-center justify-center bg-[#f8f9fb] border-t border-gray-200 px-1"><span class="text-[9px] font-black text-gray-800 truncate">${safeName}</span></div></div>`;
    });
    [
        { name: 'বিকাশ', code: 'bKash', color: '#e2136e', logo: localStorage.getItem('app_bkash_logo') },
        { name: 'নগদ', code: 'Nagad', color: '#ed1c24', logo: localStorage.getItem('app_nagad_logo') },
        { name: 'রকেট', code: 'Rocket', color: '#8c159e', logo: localStorage.getItem('app_rocket_logo') }
    ].forEach(m => {
        const imgSrc = (m.logo && m.logo.trim()) ? m.logo.trim() : makeCleanBankFallbackSvg(m.code, m.color);
        html += `<div class="shrink-0 snap-center w-[94px] h-[62px] bg-white border border-gray-200 rounded-xl flex flex-col items-center justify-center overflow-hidden shadow-sm"><div class="h-9 w-full flex items-center justify-center p-1 bg-white"><img src="${sanitizeInput(imgSrc)}" class="max-h-full max-w-full object-contain" alt="${m.name}"></div><div class="h-6 w-full flex items-center justify-center bg-[#f8f9fb] border-t border-gray-200 px-1"><span class="text-[9px] font-black text-gray-800 truncate">${m.name}</span></div></div>`;
    });
    container.innerHTML = html;
}
// ====================================================================
// PART 2: PDF Loader, Shared Upload Helpers, Profile, My Loans, Transactions, Gallery
// ====================================================================

let _pdfLibsPromise = null;
function ensurePdfLibsLoaded() {
    if (typeof html2canvas !== 'undefined' && typeof window.jspdf !== 'undefined') {
        return Promise.resolve();
    }
    if (_pdfLibsPromise) return _pdfLibsPromise;
    _pdfLibsPromise = loadExternalScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js')
        .then(() => loadExternalScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'))
        .catch((err) => {
            _pdfLibsPromise = null;
            throw err;
        });
    return _pdfLibsPromise;
}

async function generateBengaliPdf(innerHtml, fileName) {
    const sp = document.getElementById('loading-spinner');
    if (sp) sp.classList.remove('hidden');

    try {
        await ensurePdfLibsLoaded();
        if (document.fonts && document.fonts.ready) await document.fonts.ready;
        if (typeof html2canvas === 'undefined' || typeof window.jspdf === 'undefined') throw new Error('PDF library missing');

        const wrapper = document.createElement('div');
        wrapper.style.position = 'fixed';
        wrapper.style.left = '-99999px';
        wrapper.style.top = '0';
        wrapper.style.width = '794px';
        wrapper.style.background = '#ffffff';
        wrapper.style.padding = '32px';
        wrapper.style.fontFamily = "'Noto Serif Bengali', serif";
        wrapper.style.color = '#111827';
        wrapper.innerHTML = `<div style="font-family: 'Noto Serif Bengali', serif; border: 2px solid #1e6036; border-radius: 16px; padding: 24px; background: #ffffff;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 16px;">
                <div>
                    <h2 style="margin:0; font-size:22px; font-weight:800; color:#1e6036;">আমার লোন | সুফল ফিন্যান্স</h2>
                    <p style="margin:2px 0 0; font-size:12px; color:#4b5563; font-weight:700;">আর্থিক প্রতিষ্ঠান লাইসেন্স নং: ১০৩১৫৮২০৬৬</p>
                </div>
                <div style="text-align:right; font-size:11px; color:#4b5563; font-weight:700;">
                    <p style="margin:0;">ইস্যু তারিখ:</p>
                    <p style="margin:2px 0 0; color:#111827;">${new Date().toLocaleDateString('bn-BD', { day:'numeric', month:'long', year:'numeric' })}</p>
                </div>
            </div>
            ${innerHtml}
            <p style="margin-top:20px; padding-top:10px; border-top:1px dashed #d1d5db; text-align:center; font-size:11px; color:#6b7280; font-weight:700;">
                এটি সিস্টেম কর্তৃক স্বয়ংক্রিয়ভাবে তৈরি ডিজিটাল ডকুমেন্ট। সাপোর্ট: support@amarloanbd.com
            </p>
        </div>`;

        document.body.appendChild(wrapper);
        const canvas = await html2canvas(wrapper, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
        document.body.removeChild(wrapper);

        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth - 16;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight, position = 8;
        pdf.addImage(imgData, 'PNG', 8, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - 16);
        while (heightLeft > 0) {
            position = heightLeft - imgHeight + 8;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 8, position, imgWidth, imgHeight);
            heightLeft -= (pdfHeight - 16);
        }

        pdf.save(fileName.endsWith('.pdf') ? fileName : (fileName + '.pdf'));
        if (sp) sp.classList.add('hidden');
        showPopup('PDF ডাউনলোড সফল!', 'আপনার বাংলা PDF ফাইলটি সফলভাবে ডাউনলোড হয়েছে।', 'success');
    } catch (err) {
        if (sp) sp.classList.add('hidden');
        const win = window.open('', '_blank');
        if (win) {
            win.document.write(`<!DOCTYPE html><html lang="bn"><head><meta charset="UTF-8"><title>${fileName}</title>
                <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@400;600;700;800&display=swap" rel="stylesheet">
                <style>body{font-family:'Noto Serif Bengali',serif;padding:24px;}</style></head>
                <body>${innerHtml}<script>setTimeout(()=>window.print(),500);<\/script></body></html>`);
            win.document.close();
        } else {
            showPopup('ত্রুটি', 'PDF তৈরি করতে সমস্যা হয়েছে, আবার চেষ্টা করুন।', 'error');
        }
    }
}

function downloadStatementPDF() {
    if (typeof downloadFullTransactionsStatement === 'function') downloadFullTransactionsStatement();
}

// ==============================================
// SHARED UPLOAD HELPERS (Profile + Loan + OCR)
// ==============================================
const DEFAULT_IMAGE_API_URL = 'https://script.google.com/macros/s/AKfycbwf9o3tJghsczkv-NAsIEzX8nISKdKdSqbK9dSwnIlxOjX_rBamKpjSlq44mg_XU1QPoA/exec';

function resolveImageUploadApiUrl() {
    const customDriveUrl = localStorage.getItem('app_drive_api_url');
    if (customDriveUrl && customDriveUrl.trim().startsWith('https://script.google.com/')) return customDriveUrl.trim();
    return DEFAULT_IMAGE_API_URL;
}

function uploadFileSilent(fileInput, successCallback) {
    const file = fileInput.files ? fileInput.files[0] : fileInput;
    if (!file) return;
    setTimeout(() => { successCallback(URL.createObjectURL(file)); }, 1500);
}

function fileToBase64Pure(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result || '';
            resolve(dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl);
        };
        reader.onerror = () => reject(new Error('ফাইল পড়তে সমস্যা হয়েছে।'));
        reader.readAsDataURL(file);
    });
}

function compressProfileImageUnder100KB(file) {
    return new Promise((resolve) => {
        if (!file || file.size <= 95 * 1024) { resolve(file); return; }
        const img = new Image(), objUrl = URL.createObjectURL(file);
        img.onload = function() {
            URL.revokeObjectURL(objUrl);
            const compressWithMaxDim = (maxDim, initialQuality) => {
                let w = img.width, h = img.height;
                if (w > maxDim || h > maxDim) {
                    if (w > h) { h = Math.round((h * maxDim) / w); w = maxDim; }
                    else { w = Math.round((w * maxDim) / h); h = maxDim; }
                }
                const canvas = document.createElement('canvas');
                canvas.width = w; canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                let quality = initialQuality;
                const tryCompress = () => {
                    canvas.toBlob((blob) => {
                        if (!blob) { resolve(file); return; }
                        if (blob.size > 95 * 1024 && quality > 0.18) { quality -= 0.12; tryCompress(); }
                        else if (blob.size > 95 * 1024 && maxDim > 260) compressWithMaxDim(260, 0.55);
                        else resolve(new File([blob], (file.name || 'avatar').replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' }));
                    }, 'image/jpeg', quality);
                };
                tryCompress();
            };
            compressWithMaxDim(420, 0.65);
        };
        img.onerror = () => { URL.revokeObjectURL(objUrl); resolve(file); };
        img.src = objUrl;
    });
}

async function computeFileSha256(file) {
    if (!file || !window.crypto || !window.crypto.subtle) return '';
    try {
        const buffer = await file.arrayBuffer();
        const digest = await window.crypto.subtle.digest('SHA-256', buffer);
        return Array.from(new Uint8Array(digest))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('')
            .toLowerCase();
    } catch (e) {
        return '';
    }
}

async function uploadImageToApiServer(file, metadataOrOnSuccess, onSuccessOrOnError, maybeOnError) {
    let metadata = {}, onSuccess = null, onError = null;
    if (typeof metadataOrOnSuccess === 'function') { onSuccess = metadataOrOnSuccess; onError = onSuccessOrOnError; }
    else { metadata = metadataOrOnSuccess || {}; onSuccess = onSuccessOrOnError; onError = maybeOnError; }

    const isFinalizeAction = (metadata && metadata.action === 'finalizePayment');
    if (!file && !isFinalizeAction) return;

    try {
        const loggedUid = (currentUser && currentUser.userId) ? currentUser.userId : (localStorage.getItem('logged_user_id') || 'Guest');
        const loggedPhone = (currentUser && currentUser.phone) ? currentUser.phone : (localStorage.getItem('logged_user_phone') || '');
        const loggedName = (currentUser && currentUser.name) ? currentUser.name : 'User';

        let payload;
        if (isFinalizeAction) {
            payload = {
                action: 'finalizePayment',
                category: metadata.category || 'other',
                userId: metadata.userId || loggedUid,
                accountPhone: metadata.accountPhone || loggedPhone,
                senderPhone: metadata.senderPhone || loggedPhone || '',
                userName: metadata.userName || loggedName,
                trxId: metadata.trxId || '',
                amount: metadata.amount || 0,
                method: metadata.method || '',
                appId: metadata.appId || '',
                installmentNumber: metadata.installmentNumber || '',
                recordId: metadata.recordId || '',
                imageHash: metadata.imageHash || '',
                fileId: metadata.fileId || '',
                url: metadata.url || '',
                driveViewUrl: metadata.driveViewUrl || '',
                fileName: metadata.fileName || ''
            };
        } else {
            const base64Str = await fileToBase64Pure(file);
            const imgHash = metadata.imageHash || await computeFileSha256(file);
            payload = {
                imageBase64: base64Str,
                mimeType: file.type || 'image/jpeg',
                category: metadata.category || 'other',
                userId: metadata.userId || loggedUid,
                accountPhone: metadata.accountPhone || loggedPhone,
                senderPhone: metadata.senderPhone || loggedPhone || '',
                userName: metadata.userName || loggedName,
                trxId: metadata.trxId || '',
                amount: metadata.amount || 0,
                method: metadata.method || '',
                appId: metadata.appId || '',
                installmentNumber: metadata.installmentNumber || '',
                recordId: metadata.recordId || '',
                imageHash: imgHash,
                isDraftOnly: !!(metadata._isAutoDraftUpload || metadata.isDraftOnly)
            };
        }

        const response = await fetch(resolveImageUploadApiUrl(), {
            method: 'POST', redirect: 'follow',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
        });
        const rawText = await response.text();
        let result = null;
        try { result = JSON.parse(rawText); } catch (e) {}
        if (result && result.success && result.url) {
            if (onSuccess) onSuccess(result.url, result);
        } else {
            const serverErrMsg = (result && result.error)
                ? result.error
                : 'ছবিটি প্রসেস করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।';
            if (onError) onError(serverErrMsg, result);
        }
    } catch (err) {
        if (onError) onError('ছবি আপলোড সম্পন্ন হয়নি। অনুগ্রহ করে ইন্টারনেট সংযোগ চেক করে পুনরায় চেষ্টা করুন।');
    }
}

function uploadFileToHostinger(fileInput, successCallback) {
    const file = fileInput.files ? fileInput.files[0] : fileInput;
    if (!file) return;
    const sp = document.getElementById('loading-spinner');
    if (sp) sp.classList.remove('hidden');
    compressProfileImageUnder100KB(file).then((smallFile) => {
        uploadImageToApiServer(smallFile, { category: 'profile' }, (directUrl, driveInfo) => {
            if (sp) sp.classList.add('hidden');
            if (successCallback) successCallback(directUrl, driveInfo);
        }, (errMsg) => {
            if (sp) sp.classList.add('hidden');
            showPopup('আপলোড ব্যর্থ', errMsg, 'error');
        });
    });
}

function formatFileSizeText(bytes) {
    if (bytes < 1024) return bytes + ' B';
    let kb = (bytes / 1024).toFixed(0);
    if (kb >= 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return kb + ' KB';
}

// ==============================================
// PROFILE & ACCOUNT MANAGEMENT
// ==============================================
function maskBankAccount(acc) {
    if (!acc || acc.trim() === '') return '(হিসাব নং: যুক্ত করুন)';
    const clean = acc.trim();
    if (clean.length <= 4) return '(হিসাব নং: ' + toBanglaDigits(clean) + ')';
    return '(হিসাব নং: *******' + toBanglaDigits(clean.slice(-4)) + ')';
}

function updateUserUIDisplay(name, phone, profilePic = null) {
    let users = JSON.parse(localStorage.getItem('admin_users') || '[]');
    let uId = currentUser.userId || localStorage.getItem('logged_user_id') || '';
    let matchedUser = users.find(u => (uId && u.userId === uId) || (phone && u.phone === phone));
    const displayName = (matchedUser && matchedUser.name) ? matchedUser.name : name;
    const displayPhone = (matchedUser && matchedUser.phone) ? matchedUser.phone : (phone || '');
    const displayUserId = (matchedUser && matchedUser.userId) ? matchedUser.userId : (uId || displayPhone);

    if (document.getElementById('user_name_display_dash')) document.getElementById('user_name_display_dash').innerText = sanitizeInput(displayName);
    if (document.getElementById('user_id_display_dash')) document.getElementById('user_id_display_dash').innerText = sanitizeInput(displayUserId);
    if (document.getElementById('sidebar_name')) document.getElementById('sidebar_name').innerText = sanitizeInput(displayName);
    if (document.getElementById('sidebar_userid')) document.getElementById('sidebar_userid').innerText = sanitizeInput(displayUserId);
    if (document.getElementById('prof_name_display')) document.getElementById('prof_name_display').innerText = sanitizeInput(displayName);
    if (document.getElementById('prof_userid_display')) document.getElementById('prof_userid_display').innerText = sanitizeInput(displayUserId);

    if (document.getElementById('prof_join_date')) {
        const ts = (matchedUser && (matchedUser.createdAt || matchedUser.id)) ? Number(matchedUser.createdAt || matchedUser.id) : Date.now();
        document.getElementById('prof_join_date').innerText = new Date(ts).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });
    }
    if (document.getElementById('prof_name')) document.getElementById('prof_name').value = displayName || '';
    if (document.getElementById('prof_phone')) document.getElementById('prof_phone').value = displayPhone || '';
    if (document.getElementById('prof_email')) document.getElementById('prof_email').value = (matchedUser && matchedUser.email) ? matchedUser.email : '';
    if (document.getElementById('prof_nid')) document.getElementById('prof_nid').value = (matchedUser && matchedUser.nid) ? matchedUser.nid : '';
    if (document.getElementById('prof_address')) document.getElementById('prof_address').value = (matchedUser && matchedUser.address) ? matchedUser.address : '';
    if (document.getElementById('prof_occupation')) document.getElementById('prof_occupation').value = (matchedUser && matchedUser.occupation) ? matchedUser.occupation : '';

    const bName = (matchedUser && matchedUser.bankName) ? matchedUser.bankName : 'সোনালী ব্যাংক লিমিটেড';
    const bAcc = (matchedUser && matchedUser.bankAccount) ? matchedUser.bankAccount : '';
    if (document.getElementById('prof_bank_name_display')) document.getElementById('prof_bank_name_display').innerText = bName;
    if (document.getElementById('prof_bank_acc_display')) document.getElementById('prof_bank_acc_display').innerText = maskBankAccount(bAcc);
    if (document.getElementById('prof_bank_name')) document.getElementById('prof_bank_name').value = bName;
    if (document.getElementById('prof_bank_account')) document.getElementById('prof_bank_account').value = bAcc;

    const limitVal = (matchedUser && matchedUser.loanLimit) ? Number(matchedUser.loanLimit) : 500000;
    if (document.getElementById('prof_loan_limit')) document.getElementById('prof_loan_limit').innerText = '৳ ' + limitVal.toLocaleString('bn-BD');
    const scoreVal = (matchedUser && matchedUser.creditScore) ? Number(matchedUser.creditScore) : 750;
    if (document.getElementById('prof_credit_score')) document.getElementById('prof_credit_score').innerText = toBanglaDigits(scoreVal);
    if (document.getElementById('prof_credit_bar')) document.getElementById('prof_credit_bar').style.width = Math.min(100, Math.max(10, Math.round((scoreVal / 900) * 100))) + '%';

    const picToUse = (matchedUser && matchedUser.profilePic) ? matchedUser.profilePic : (profilePic || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png');
    if (document.getElementById('home_avatar')) document.getElementById('home_avatar').src = picToUse;
    if (document.getElementById('sidebar_avatar')) document.getElementById('sidebar_avatar').src = picToUse;
    if (document.getElementById('profile_avatar')) document.getElementById('profile_avatar').src = picToUse;
}

function setProfileEditMode(isEditing) {
    ['prof_name', 'prof_phone', 'prof_email', 'prof_nid', 'prof_address', 'prof_occupation'].forEach(id => {
        const el = document.getElementById(id); if (el) el.disabled = !isEditing;
    });
    const bankView = document.getElementById('prof_bank_view'), bankEdit = document.getElementById('prof_bank_edit_fields');
    if (bankView && bankEdit) {
        bankView.classList.toggle('hidden', isEditing);
        bankEdit.classList.toggle('hidden', !isEditing);
    }
    const saveBtn = document.getElementById('btn_save_profile'); if (saveBtn) saveBtn.disabled = !isEditing;
    const editLabel = document.getElementById('btn_edit_label'); if (editLabel) editLabel.innerText = isEditing ? 'বাতিল' : 'এডিট';
}

function enableProfileEdit() {
    const nameInput = document.getElementById('prof_name');
    if (nameInput && nameInput.disabled) { setProfileEditMode(true); nameInput.focus(); }
    else { setProfileEditMode(false); updateUserUIDisplay(currentUser.name, currentUser.phone); }
}

function updateProfile(e) {
    e.preventDefault();
    const newName = sanitizeInput(document.getElementById('prof_name').value.trim());
    const newPhone = sanitizeInput(document.getElementById('prof_phone').value.trim());
    const newEmail = sanitizeInput(document.getElementById('prof_email').value.trim());
    const newNid = sanitizeInput(document.getElementById('prof_nid').value.trim());
    const newAddress = sanitizeInput(document.getElementById('prof_address').value.trim());
    const newOccupation = sanitizeInput(document.getElementById('prof_occupation').value.trim());
    const newBankName = sanitizeInput(document.getElementById('prof_bank_name').value.trim()) || 'সোনালী ব্যাংক লিমিটেড';
    const newBankAccount = sanitizeInput(document.getElementById('prof_bank_account').value.trim());
    if (!newName) return showPopup('ত্রুটি!', 'অনুগ্রহ করে আপনার পূর্ণ নাম লিখুন।', 'error');
    if (newPhone && !/^(\+?88)?01[3-9]\d{8}$/.test(newPhone.replace(/[\s-]/g, ''))) return showPopup('ত্রুটি!', 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন।', 'error');

    const oldPhone = currentUser.phone, uId = currentUser.userId || localStorage.getItem('logged_user_id');
    let users = JSON.parse(localStorage.getItem('admin_users') || '[]');
    let matchedUser = users.find(u => (uId && u.userId === uId) || (oldPhone && u.phone === oldPhone));
    const updatedFields = { name: newName, phone: newPhone, email: newEmail, nid: newNid, address: newAddress, occupation: newOccupation, bankName: newBankName, bankAccount: newBankAccount };

    users = users.map(u => ((uId && u.userId === uId) || (oldPhone && u.phone === oldPhone)) ? { ...u, ...updatedFields } : u);
    localStorage.setItem('admin_users', JSON.stringify(users));
    currentUser.name = newName; currentUser.phone = newPhone;
    localStorage.setItem('logged_user_phone', newPhone);

    if (matchedUser && matchedUser.id && window.firebaseDb && window.fbRef && window.fbUpdate) {
        window.fbUpdate(window.fbRef(window.firebaseDb, 'users/' + matchedUser.id), updatedFields);
    }
    setProfileEditMode(false);
    updateUserUIDisplay(newName, newPhone, matchedUser ? matchedUser.profilePic : null);
    showPopup('আপডেট সফল!', 'আপনার প্রোফাইলের সকল তথ্য সফলভাবে সেভ করা হয়েছে!', 'success');
}

function updateProfilePicture(input) {
    if (input.files && input.files[0]) {
        uploadFileToHostinger(input.files[0], (directUrl, driveInfo) => {
            if (document.getElementById('profile_avatar')) document.getElementById('profile_avatar').src = directUrl;
            if (document.getElementById('home_avatar')) document.getElementById('home_avatar').src = directUrl;
            if (document.getElementById('sidebar_avatar')) document.getElementById('sidebar_avatar').src = directUrl;

            const uId = currentUser.userId || localStorage.getItem('logged_user_id');
            let users = JSON.parse(localStorage.getItem('admin_users') || '[]');
            let matchedUser = users.find(u => (uId && u.userId === uId) || (currentUser.phone && u.phone === currentUser.phone));
            const profileUpdates = { profilePic: directUrl, profilePicDriveLink: (driveInfo && driveInfo.driveViewUrl) ? driveInfo.driveViewUrl : directUrl };
            if (matchedUser) {
                matchedUser.profilePic = directUrl; matchedUser.profilePicDriveLink = profileUpdates.profilePicDriveLink;
                localStorage.setItem('admin_users', JSON.stringify(users));
                if (matchedUser.id && window.firebaseDb && window.fbRef && window.fbUpdate) {
                    window.fbUpdate(window.fbRef(window.firebaseDb, 'users/' + matchedUser.id), profileUpdates);
                }
            }
            showPopup('সফল!', 'আপনার প্রোফাইল ছবি সফলভাবে আপডেট ও সেভ করা হয়েছে!', 'success');
        });
    }
}

function openPasswordModal() {
    const modal = document.getElementById('change-password-modal');
    if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
}
function closePasswordModal() {
    const modal = document.getElementById('change-password-modal');
    if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
}
function handlePasswordUpdate(e) {
    e.preventDefault();
    const oldPass = document.getElementById('old_pass').value, newPass = document.getElementById('new_pass').value, confirmPass = document.getElementById('confirm_new_pass').value;
    if (newPass.length < 6) return showPopup('ত্রুটি', 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।', 'error');
    if (newPass !== confirmPass) return showPopup('ত্রুটি', 'নতুন পাসওয়ার্ড দুটি মিলছে না।', 'error');
    const uId = currentUser.userId || localStorage.getItem('logged_user_id');
    let users = JSON.parse(localStorage.getItem('admin_users') || '[]');
    let matchedUser = users.find(u => (uId && u.userId === uId) || (currentUser.phone && u.phone === currentUser.phone));
    if (matchedUser && matchedUser.pass !== oldPass) return showPopup('ত্রুটি', 'বর্তমান পাসওয়ার্ডটি সঠিক নয়।', 'error');

    users = users.map(u => ((uId && u.userId === uId) || (currentUser.phone && u.phone === currentUser.phone)) ? { ...u, pass: newPass } : u);
    localStorage.setItem('admin_users', JSON.stringify(users));
    if (matchedUser && matchedUser.id && window.firebaseDb && window.fbRef && window.fbUpdate) {
        window.fbUpdate(window.fbRef(window.firebaseDb, 'users/' + matchedUser.id), { pass: newPass });
    }
    document.getElementById('old_pass').value = ''; document.getElementById('new_pass').value = ''; document.getElementById('confirm_new_pass').value = '';
    closePasswordModal();
    showPopup('সফল!', 'পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে!', 'success');
}

function syncUserVerificationStatus() {
    if (!currentUser || (!currentUser.phone && !currentUser.userId)) return;
    const users = JSON.parse(localStorage.getItem('admin_users') || '[]');
    const matched = users.find(u => (currentUser.userId && u.userId === currentUser.userId) || (currentUser.phone && u.phone === currentUser.phone));
    const isVerified = matched ? matched.verified === true : false;
    const badgeContainer = document.getElementById('user_verification_badge');
    if (badgeContainer) {
        if (isVerified) {
            badgeContainer.className = "mt-3 inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-xs px-4 py-1.5 rounded-full font-bold border border-emerald-200";
            badgeContainer.innerHTML = `<i class="bx bx-check-shield text-base"></i> ভেরিফাইড ইউজার`;
        } else {
            badgeContainer.className = "mt-3 inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs px-4 py-1.5 rounded-full font-bold border border-amber-200";
            badgeContainer.innerHTML = `<i class="bx bx-time text-base"></i> আনভেরিফাইড (যাচাইাধীন)`;
        }
    }
}

// ==============================================
// MY LOANS PAGE
// ==============================================
window.activeLoanFilter = 'all';

function filterMyLoans(filterType) {
    window.activeLoanFilter = filterType;
    const tabs = { all: document.getElementById('tab_loan_all'), active: document.getElementById('tab_loan_active'), closed: document.getElementById('tab_loan_closed') };
    Object.keys(tabs).forEach(k => {
        if (!tabs[k]) return;
        tabs[k].className = (k === filterType)
            ? "py-1.5 px-2 rounded-xl border-2 border-[#3b82c4] bg-[#dbeafe] text-[#1e3a8a] font-extrabold text-xs shadow-sm transition-all"
            : "py-1.5 px-2 rounded-xl border border-[#8ea3b0] bg-white text-gray-800 font-extrabold text-xs transition-all";
    });
    renderMyLoans();
}

function renderMyLoans() {
    const loansContainer = document.getElementById('my_loans_list'), summaryBar = document.getElementById('my_loans_summary_bar');
    if (!loansContainer) return;
    const allLoans = JSON.parse(localStorage.getItem('admin_loans') || '[]');
    const myAllRecords = allLoans.filter(l => l && !(l.isAutoDraft || l.status === 'অসম্পূর্ণ') && ((currentUser.phone && (l.phone === currentUser.phone || l.userPhone === currentUser.phone)) || (currentUser.userId && l.userId === currentUser.userId)));
    const myLoanApps = myAllRecords.filter(l => !l.type || l.type === 'LOAN'), myCashouts = myAllRecords.filter(l => l.type === 'CASHOUT'), myEmis = myAllRecords.filter(l => l.type === 'EMI' && l.status === 'এপ্রুভড');
    const hasApprovedCashout = myCashouts.some(c => c.status === 'এপ্রুভড'), hasPendingCashout = myCashouts.some(c => c.status === 'পেন্ডিং');
    let totalCount = myLoanApps.length, activeCount = 0, closedCount = 0;

    const processedLoans = myLoanApps.map(loan => {
        const durMonths = parseAmountToNumber(loan.duration) || 12, paidEmis = myEmis.filter(e => !e.loanRefId || e.loanRefId === loan.id).length;
        const isCompleted = (loan.status === 'এপ্রুভড' && paidEmis >= durMonths) || loan.status === 'পরিশোধিত', isRejected = loan.status === 'বাতিল';
        if (isCompleted || isRejected) closedCount++; else if (loan.status === 'এপ্রুভড') activeCount++;
        return { ...loan, durMonths, paidEmis, isCompleted, isRejected };
    });

    if (summaryBar) summaryBar.innerText = `মোট আবেদন: ${toBanglaDigits(totalCount)}টি | চলমান: ${toBanglaDigits(activeCount)}টি | সম্পন্ন: ${toBanglaDigits(closedCount)}টি`;
    const filter = window.activeLoanFilter || 'all';
    const filtered = processedLoans.filter(l => filter === 'active' ? (l.status === 'এপ্রুভড' && !l.isCompleted) : (filter === 'closed' ? (l.isCompleted || l.isRejected) : true));

    if (filtered.length === 0) {
        loansContainer.innerHTML = `<div class="text-center text-gray-500 mt-8 bg-white p-8 rounded-2xl shadow-sm border border-[#b8c9d4]"><div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-gray-200"><i class="bx bx-file-blank text-4xl text-gray-400"></i></div><p class="font-bold text-sm text-gray-700 mb-3">এই তালিকায় কোনো ঋণের তথ্য নেই।</p><button type="button" onclick="navigate('apply-page')" class="bg-[#1e6036] text-white px-5 py-2.5 rounded-xl font-extrabold text-xs shadow">নতুন লোন আবেদন করুন</button></div>`;
        return;
    }

    let html = '';
    filtered.forEach(loan => {
        const appIdStr = loan.appId || ('#PF-' + loan.id.toString().slice(-5)), loanAmt = parseAmountToNumber(loan.amount);
        const applyDate = loan.submittedAt ? loan.submittedAt.split(',')[0] : new Date(loan.id).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });
        if (loan.isCompleted || loan.isRejected) {
            const badgeText = loan.isRejected ? 'বাতিল<br><span class="text-[10px]">(Rejected)</span>' : 'পরিশোধিত<br><span class="text-[10px]">(Completed)</span>';
            const badgeBg = loan.isRejected ? 'bg-red-600' : 'bg-[#647d8c]';
            html += `<div class="bg-white rounded-2xl shadow-sm border border-[#b8c9d4] p-3.5 space-y-2.5"><div class="flex items-start justify-between gap-2"><div><h3 class="text-xl font-black text-gray-900 leading-none">${sanitizeInput(appIdStr)}</h3><p class="text-sm font-extrabold text-gray-900 mt-1">${sanitizeInput(loan.loanType || 'ব্যক্তিগত লোন')}</p><p class="text-xs font-bold text-gray-800 mt-0.5">লোন পরিমাণ: ৳ ${loanAmt.toLocaleString('bn-BD')}</p><p class="text-[11px] font-bold text-gray-600 mt-0.5">আবেদনের তারিখ: ${applyDate}</p></div><div class="${badgeBg} text-white px-3 py-1.5 rounded-xl text-center font-extrabold text-xs leading-tight shrink-0 shadow-sm">${badgeText}</div></div><div class="flex items-center justify-between gap-2 pt-1 border-t border-gray-200"><span class="text-xs font-extrabold text-gray-800 flex items-center gap-1">${loan.isRejected ? 'আবেদনটি বাতিল হয়েছে' : 'লোন পরিশোধ সম্পন্ন (<span class="text-[#1e6036] font-black">✓</span>)'}</span><button type="button" onclick="downloadSingleLoanStatement(${loan.id})" class="bg-[#e8eff3] hover:bg-[#dce6ec] border border-[#748490] text-gray-900 px-3 py-1.5 rounded-xl font-extrabold text-xs active:scale-95">স্টেটমেন্ট ডাউনলোড</button></div></div>`;
        } else if (loan.status === 'এপ্রুভড') {
            const badgeHtml = hasApprovedCashout ? `<div class="bg-[#16a34a] text-white px-3 py-1.5 rounded-xl text-center font-extrabold text-xs leading-tight shrink-0 shadow-sm">চূড়ান্ত<br>অনুমোদিত<br><span class="text-[10px]">(Approved)</span></div>` : (hasPendingCashout ? `<div class="bg-[#d97706] text-white px-3 py-1.5 rounded-xl text-center font-extrabold text-xs leading-tight shrink-0 shadow-sm">সঞ্চয় যাচাইাধীন<br><span class="text-[10px]">(Pending)</span></div>` : `<div class="bg-[#1d70d1] text-white px-3 py-1.5 rounded-xl text-center font-extrabold text-xs leading-tight shrink-0 shadow-sm">অনুমোদিত<br><span class="text-[10px]">(উত্তোলন প্রস্তুত)</span></div>`);
            const savStepStatus = hasApprovedCashout ? '<span class="text-[#16a34a]">✓ সম্পন্ন</span>' : (hasPendingCashout ? '<span class="text-amber-600">● যাচাইাধীন</span>' : '<span class="text-[#1d70d1]">● অপেক্ষমান</span>');
            const bankStepDot = hasApprovedCashout ? '<span class="w-2 h-2 rounded-full bg-[#16a34a] inline-block"></span> ব্যাংকে প্রেরণ' : '<span class="w-2 h-2 rounded-full bg-gray-400 inline-block"></span> ব্যাংকে প্রেরণ';
            const rightActionBtn = hasApprovedCashout ? `<button type="button" onclick="openEmiPaymentPage(${loan.id})" class="bg-[#1e6036] hover:bg-[#164b29] text-white py-2 rounded-xl font-extrabold text-xs shadow-sm active:scale-95">পেমেন্ট করুন (Pay Now)</button>` : (!hasPendingCashout && getUserBalance() > 0 ? `<button type="button" onclick="handleCashoutClick()" class="bg-[#1d70d1] hover:bg-[#1559a8] text-white py-2 rounded-xl font-extrabold text-xs shadow-sm active:scale-95">টাকা উত্তোলন করুন</button>` : `<button type="button" onclick="showCustomerCareModal()" class="bg-[#e8eff3] border border-[#748490] text-gray-900 py-2 rounded-xl font-extrabold text-xs active:scale-95">যোগাযোগ করুন</button>`);
            html += `<div class="bg-white rounded-2xl shadow-sm border border-[#b8c9d4] p-3.5 space-y-2.5"><div class="flex items-start justify-between gap-2"><div><h3 class="text-xl font-black text-gray-900 leading-none">${sanitizeInput(appIdStr)}</h3><p class="text-sm font-extrabold text-gray-900 mt-1 flex items-center gap-1"><i class="bx bxs-donate-heart text-[#1e6036]"></i> ${sanitizeInput(loan.loanType || 'ব্যক্তিগত লোন')}</p><p class="text-xs font-bold text-gray-800 mt-0.5">লোন পরিমাণ: ৳ ${loanAmt.toLocaleString('bn-BD')} | মেয়াদ: ${sanitizeInput(loan.duration)}</p><p class="text-[11px] font-bold text-gray-600 mt-0.5">আবেদনের তারিখ: ${applyDate}</p></div>${badgeHtml}</div><div class="border border-dashed border-[#8ea3b0] bg-[#eef5fa] rounded-xl p-2.5 space-y-1"><p class="text-[11px] font-black text-gray-900">স্ট্যাটাস ট্র্যাকার</p><div class="flex items-center justify-between text-[10px] font-bold text-gray-900"><div class="text-center">আবেদন জমা<br><span class="text-[#16a34a]">✓ সম্পন্ন</span></div><span>→</span><div class="text-center">নথিপত্র যাচাই<br><span class="text-[#16a34a]">✓ সম্পন্ন</span></div><span>→</span><div class="text-center">ব্যাংক ফি ও সঞ্চয়<br>${savStepStatus}</div><span>→</span><div class="text-center">${bankStepDot}</div></div></div><div class="grid grid-cols-2 gap-2.5"><button type="button" onclick="openLoanDetailsModal(${loan.id})" class="bg-[#e8eff3] hover:bg-[#dce6ec] border border-[#748490] text-gray-900 py-2 rounded-xl font-extrabold text-xs active:scale-95">বিস্তারিত</button>${rightActionBtn}</div></div>`;
        } else {
            html += `<div class="bg-white rounded-2xl shadow-sm border border-[#b8c9d4] p-3.5 space-y-2.5"><div class="flex items-start justify-between gap-2"><div><h3 class="text-xl font-black text-gray-900 leading-none">${sanitizeInput(appIdStr)}</h3><p class="text-sm font-extrabold text-gray-900 mt-1 flex items-center gap-1"><i class="bx bx-store text-[#123c69]"></i> ${sanitizeInput(loan.loanType || 'ব্যবসায়িক লোন')}</p><p class="text-xs font-bold text-gray-800 mt-0.5">লোন পরিমাণ: ৳ ${loanAmt.toLocaleString('bn-BD')} | মেয়াদ: ${sanitizeInput(loan.duration)}</p><p class="text-[11px] font-bold text-gray-600 mt-0.5">আবেদনের তারিখ: ${applyDate}</p></div><div class="bg-[#eab308] text-white px-2.5 py-1.5 rounded-xl text-center font-extrabold text-[11px] leading-tight shrink-0 shadow-sm">যাচাইকরণ চলছে<br><span class="text-[9px]">(Pending/In Review)</span></div></div><div class="border border-dashed border-[#8ea3b0] bg-[#eef5fa] rounded-xl p-2.5 space-y-1"><p class="text-[11px] font-black text-gray-900">স্ট্যাটাস ট্র্যাকার</p><div class="flex items-center justify-between text-[10px] font-bold text-gray-900 px-1"><div class="text-center">আবেদন জমা<br><span class="text-[#16a34a]">✓ সম্পন্ন</span></div><span>───→</span><div class="text-center">নথিপত্র যাচাই <span class="w-2 h-2 rounded-full bg-[#eab308] inline-block"></span><br>চলমান</div><span>───→</span><div class="text-center text-gray-400">অনুমোদন</div></div></div><div class="grid grid-cols-2 gap-2.5"><button type="button" onclick="openLoanDetailsModal(${loan.id})" class="bg-[#e8eff3] hover:bg-[#dce6ec] border border-[#748490] text-gray-900 py-2 rounded-xl font-extrabold text-xs active:scale-95">বিস্তারিত দেখুন</button><button type="button" onclick="showCustomerCareModal()" class="bg-[#e8eff3] hover:bg-[#dce6ec] border border-[#748490] text-gray-900 py-2 rounded-xl font-extrabold text-xs active:scale-95">যোগাযোগ করুন</button></div></div>`;
        }
    });
    loansContainer.innerHTML = html;
}

function openLoanDetailsModal(loanId) {
    const allLoans = JSON.parse(localStorage.getItem('admin_loans') || '[]'), loan = allLoans.find(l => l.id === loanId);
    if (!loan) return;
    const appIdStr = loan.appId || ('#PF-' + loan.id.toString().slice(-5)), loanAmt = parseAmountToNumber(loan.amount), durMonths = parseAmountToNumber(loan.duration) || 12, rate = loan.interestRate ? parseFloat(loan.interestRate) : 3;
    const emi = loan.monthlyInstallment ? Number(loan.monthlyInstallment) : Math.ceil((loanAmt * (1 + rate / 100)) / durMonths);
    const body = document.getElementById('loan_details_modal_body');
    if (body) {
        body.innerHTML = `<div class="flex justify-between py-1 border-b border-gray-100"><span class="text-gray-600 font-bold">লোন আইডি:</span><span class="font-black text-gray-900">${sanitizeInput(appIdStr)}</span></div><div class="flex justify-between py-1 border-b border-gray-100"><span class="text-gray-600 font-bold">লোনের ধরন:</span><span class="font-extrabold text-gray-900">${sanitizeInput(loan.loanType || 'ব্যক্তিগত লোন')}</span></div><div class="flex justify-between py-1 border-b border-gray-100"><span class="text-gray-600 font-bold">ব্যাংক / মাধ্যম:</span><span class="font-extrabold text-[#123c69]">${sanitizeInput(loan.bankName || 'নির্ধারিত ব্যাংক')} (${toBanglaDigits(rate)}%)</span></div><div class="flex justify-between py-1 border-b border-gray-100"><span class="text-gray-600 font-bold">লোনের পরিমাণ:</span><span class="font-black text-gray-900">৳ ${loanAmt.toLocaleString('bn-BD')}</span></div><div class="flex justify-between py-1 border-b border-gray-100"><span class="text-gray-600 font-bold">মেয়াদ:</span><span class="font-extrabold text-gray-900">${sanitizeInput(loan.duration)}</span></div><div class="flex justify-between py-1 border-b border-gray-100"><span class="text-gray-600 font-bold">মাসিক কিস্তি:</span><span class="font-black text-[#1e6036]">৳ ${emi.toLocaleString('bn-BD')}</span></div><div class="flex justify-between py-1 border-b border-gray-100"><span class="text-gray-600 font-bold">ব্যাংক ফি TrxID:</span><span class="font-mono font-bold text-gray-900">${sanitizeInput(loan.trx || 'N/A')}</span></div><div class="flex justify-between py-1"><span class="text-gray-600 font-bold">বর্তমান স্ট্যাটাস:</span><span class="font-black text-gray-900">${sanitizeInput(loan.status)}</span></div>`;
    }
    const modal = document.getElementById('loan-details-modal');
    if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
}

function closeLoanDetailsModal() {
    const modal = document.getElementById('loan-details-modal');
    if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
}
function downloadSingleLoanStatement(loanId) {
    const allLoans = JSON.parse(localStorage.getItem('admin_loans') || '[]'), loan = allLoans.find(l => l.id === loanId);
    if (!loan) return;
    const appIdStr = loan.appId || ('#PF-' + loan.id.toString().slice(-5));
    const html = `<h3 style="text-align:center; font-size:18px; font-weight:800; color:#123c69; margin:0 0 14px;">লোন অ্যাকাউন্ট স্টেটমেন্ট</h3><table style="width:100%; border-collapse:collapse; font-size:14px;"><tr><td style="padding:10px 6px; border-bottom:1px solid #e5e7eb; font-weight:700; color:#4b5563;">লোন আইডি</td><td style="padding:10px 6px; border-bottom:1px solid #e5e7eb; text-align:right; font-weight:800;">${sanitizeInput(appIdStr)}</td></tr><tr><td style="padding:10px 6px; border-bottom:1px solid #e5e7eb; font-weight:700; color:#4b5563;">আবেদনকারী</td><td style="padding:10px 6px; border-bottom:1px solid #e5e7eb; text-align:right; font-weight:800;">${sanitizeInput(loan.name)}</td></tr><tr><td style="padding:10px 6px; border-bottom:1px solid #e5e7eb; font-weight:700; color:#4b5563;">লোনের ধরন</td><td style="padding:10px 6px; border-bottom:1px solid #e5e7eb; text-align:right; font-weight:800;">${sanitizeInput(loan.loanType || 'ব্যক্তিগত লোন')}</td></tr><tr><td style="padding:10px 6px; border-bottom:1px solid #e5e7eb; font-weight:700; color:#4b5563;">ব্যাংক / মাধ্যম</td><td style="padding:10px 6px; border-bottom:1px solid #e5e7eb; text-align:right; font-weight:800;">${sanitizeInput(loan.bankName || 'নির্ধারিত ব্যাংক')}</td></tr><tr><td style="padding:10px 6px; border-bottom:1px solid #e5e7eb; font-weight:700; color:#4b5563;">লোনের পরিমাণ</td><td style="padding:10px 6px; border-bottom:1px solid #e5e7eb; text-align:right; font-weight:800; color:#1e6036;">৳ ${parseAmountToNumber(loan.amount).toLocaleString('bn-BD')}</td></tr><tr><td style="padding:10px 6px; border-bottom:1px solid #e5e7eb; font-weight:700; color:#4b5563;">মেয়াদ</td><td style="padding:10px 6px; border-bottom:1px solid #e5e7eb; text-align:right; font-weight:800;">${sanitizeInput(loan.duration)}</td></tr><tr><td style="padding:10px 6px; font-weight:700; color:#4b5563;">বর্তমান স্ট্যাটাস</td><td style="padding:10px 6px; text-align:right; font-weight:800;">${sanitizeInput(loan.status)}</td></tr></table>`;
    generateBengaliPdf(html, `Loan_Statement_${appIdStr.replace('#', '')}.pdf`);
}

// ==============================================
// TRANSACTIONS PAGE
// ==============================================
window.activeTxFilter = 'all';
window.lastRenderedTxList = [];

function setTxFilter(filterType) {
    window.activeTxFilter = filterType;
    const tabs = { all: document.getElementById('tx_tab_all'), withdraw: document.getElementById('tx_tab_withdraw'), emi: document.getElementById('tx_tab_emi'), deposit: document.getElementById('tx_tab_deposit') };
    Object.keys(tabs).forEach(k => {
        if (!tabs[k]) return;
        tabs[k].className = (k === filterType)
            ? "shrink-0 px-3 py-1.5 rounded-xl bg-[#1e6036] text-white font-extrabold text-xs shadow-sm transition-all"
            : "shrink-0 px-3 py-1.5 rounded-xl bg-white border border-[#8ea3b0] text-gray-900 font-extrabold text-xs transition-all";
    });
    renderTransactionsPage();
}

function buildUserTransactionHistory() {
    const allLoans = JSON.parse(localStorage.getItem('admin_loans') || '[]');
    const myRecords = allLoans.filter(l => l && !(l.isAutoDraft || l.status === 'অসম্পূর্ণ') && ((currentUser.phone && (l.phone === currentUser.phone || l.userPhone === currentUser.phone)) || (currentUser.userId && l.userId === currentUser.userId)));
    const txItems = [];
    myRecords.forEach(item => {
        const appIdStr = item.appId || ('#PF-' + item.id.toString().slice(-5)), dateStr = item.submittedAt || new Date(item.id).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }), statusLabel = item.status === 'এপ্রুভড' ? 'সফল' : (item.status === 'বাতিল' ? 'বাতিল' : 'পেন্ডিং');
        if (item.type === 'CASHOUT') {
            const savAmt = parseAmountToNumber(item.savingsFee || '0');
            if (savAmt > 0) txItems.push({ timestamp: Number(item.id) + 1, category: 'deposit', title: 'সঞ্চয় আমানত জমা', sign: '+', amount: savAmt, amountColor: 'text-[#16a34a]', iconBg: 'bg-[#16a34a]', iconClass: 'bx bxs-donate-heart', appId: appIdStr, dateStr, beneficiary: item.savingsMethod || 'মোবাইল ব্যাংকিং', senderPhone: item.savingsSenderPhone || item.phone || '-', trx: item.rawTrx || item.trx || 'N/A', detailsText: `TrxID: ${item.rawTrx || item.trx || 'N/A'}`, status: item.status, statusLabel });
            txItems.push({ timestamp: Number(item.id), category: 'withdraw', title: item.withdrawChannel === 'mobile' ? 'লোন মোবাইল উত্তোলন (Withdraw)' : 'লোন ব্যাংক উত্তোলন (Withdraw)', sign: '-', amount: parseAmountToNumber(item.amount), amountColor: 'text-[#b91c1c]', iconBg: 'bg-[#123c69]', iconClass: item.withdrawChannel === 'mobile' ? 'bx bx-mobile-alt' : 'bx bxs-bank', appId: appIdStr, dateStr, beneficiary: item.duration || 'ব্যাংক / মোবাইল অ্যাকাউন্ট', senderPhone: item.phone || '-', trx: item.rawTrx || item.trx || 'N/A', detailsText: item.duration || 'অ্যাকাউন্টে প্রেরণ', status: item.status, statusLabel });
        } else if (item.type === 'EMI') {
            txItems.push({ timestamp: Number(item.id), category: 'emi', title: 'ইএমআই কিস্তি পরিশোধ (EMI Payment)', sign: '-', amount: parseAmountToNumber(item.amount), amountColor: 'text-[#b91c1c]', iconBg: 'bg-gradient-to-br from-orange-500 to-red-500', iconClass: 'bx bx-rupee', isTakaIcon: true, appId: appIdStr, dateStr, beneficiary: `অনলাইন গেটওয়ে (${item.paymentMethod || 'বিকাশ'})`, senderPhone: item.senderPhone || item.phone || '-', trx: item.trx || 'N/A', detailsText: `${item.duration || 'কিস্তি'} | TrxID: ${item.trx || 'N/A'}`, status: item.status, statusLabel });
        } else {
            const depAmt = parseAmountToNumber(item.depositFee || '0');
            if (depAmt > 0) txItems.push({ timestamp: Number(item.id), category: 'deposit', title: 'বাংলাদেশ ব্যাংক কর্তৃক ফি', sign: '-', amount: depAmt, amountColor: 'text-[#b91c1c]', iconBg: 'bg-[#16a34a]', iconClass: 'bx bxs-wallet', appId: appIdStr, dateStr, beneficiary: `${item.paymentMethod || 'বিকাশ'} (${item.bankName || 'সুফল ফিন্যান্স'})`, senderPhone: item.senderPhone || item.phone || '-', trx: item.trx || 'N/A', detailsText: `TrxID: ${item.trx || 'N/A'}`, status: item.status, statusLabel });
        }
    });
    txItems.sort((a, b) => b.timestamp - a.timestamp);
    return { txItems, myRecords };
}

function renderTransactionsPage() {
    const container = document.getElementById('transactions_list_container');
    if (!container) return;
    const { txItems, myRecords } = buildUserTransactionHistory();
    const totalWithdrawn = myRecords.filter(r => r.type === 'CASHOUT' && r.status === 'এপ্রুভড').reduce((s, r) => s + parseAmountToNumber(r.amount), 0);
    const approvedEmis = myRecords.filter(r => r.type === 'EMI' && r.status === 'এপ্রুভড');
    const totalEmiPaid = approvedEmis.reduce((s, r) => s + parseAmountToNumber(r.amount), 0);
    const activeLoans = myRecords.filter(r => (!r.type || r.type === 'LOAN') && r.status === 'এপ্রুভড');
    let dueAmountTotal = 0, remainingInstCount = 0;
    if (activeLoans.length > 0) {
        const loan = activeLoans[0], loanAmt = parseAmountToNumber(loan.amount), durMonths = parseAmountToNumber(loan.duration) || 12, rate = loan.interestRate ? parseFloat(loan.interestRate) : 3;
        const emi = loan.monthlyInstallment ? Number(loan.monthlyInstallment) : Math.ceil((loanAmt * (1 + rate / 100)) / durMonths);
        remainingInstCount = Math.max(0, durMonths - approvedEmis.filter(e => !e.loanRefId || e.loanRefId === loan.id).length);
        dueAmountTotal = remainingInstCount * emi;
    }
    if (document.getElementById('tx_total_withdrawn')) document.getElementById('tx_total_withdrawn').innerText = '৳ ' + totalWithdrawn.toLocaleString('bn-BD');
    if (document.getElementById('tx_total_paid')) document.getElementById('tx_total_paid').innerText = '৳ ' + totalEmiPaid.toLocaleString('bn-BD');
    if (document.getElementById('tx_due_emi')) document.getElementById('tx_due_emi').innerText = remainingInstCount > 0 ? `৳ ${dueAmountTotal.toLocaleString('bn-BD')} (${toBanglaDigits(remainingInstCount)}টি বাকি)` : '৳ ০';

    const filter = window.activeTxFilter || 'all', query = (document.getElementById('tx_search_input') ? document.getElementById('tx_search_input').value : '').toLowerCase().trim(), dateVal = document.getElementById('tx_date_input') ? document.getElementById('tx_date_input').value : '';
    const clearDateBtn = document.getElementById('tx_date_clear'); if (clearDateBtn) clearDateBtn.classList.toggle('hidden', !dateVal);

    const filtered = txItems.filter(item => {
        if (filter !== 'all' && item.category !== filter) return false;
        if (dateVal) {
            const d = new Date(item.timestamp), iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
            if (iso !== dateVal) return false;
        }
        if (query && !`${item.title} ${item.appId} ${item.trx} ${item.beneficiary} ${item.detailsText} ${item.amount}`.toLowerCase().includes(query)) return false;
        return true;
    });
    window.lastRenderedTxList = filtered;
    if (filtered.length === 0) { container.innerHTML = `<div class="bg-white rounded-2xl p-8 text-center border border-[#b8c9d4] shadow-sm"><i class="bx bx-transfer-alt text-4xl text-gray-400 mb-2"></i><p class="text-xs font-bold text-gray-600">কোনো লেনদেনের তথ্য পাওয়া যায়নি।</p></div>`; return; }

    let html = '';
    filtered.forEach((tx, idx) => {
        const statusBadgeCls = tx.status === 'এপ্রুভড' ? 'bg-[#16a34a] text-white' : (tx.status === 'বাতিল' ? 'bg-red-600 text-white' : 'bg-[#eab308] text-white');
        const iconInner = tx.isTakaIcon ? '<span class="font-black text-base">৳</span>' : `<i class="${tx.iconClass} text-xl"></i>`;
        html += `<div onclick="openTxDetailsModal(${idx})" class="bg-white rounded-2xl p-3 shadow-sm border border-[#b8c9d4] flex items-center gap-3 cursor-pointer hover:border-[#1e6036] transition-all"><div class="w-10 h-10 rounded-full ${tx.iconBg} text-white flex items-center justify-center shrink-0 shadow-sm">${iconInner}</div><div class="flex-1 min-w-0"><div class="flex items-start justify-between gap-2"><h4 class="font-black text-gray-900 text-xs sm:text-sm truncate">${sanitizeInput(tx.title)}</h4><span class="font-black text-xs sm:text-sm ${tx.amountColor} shrink-0">${tx.sign} ৳ ${tx.amount.toLocaleString('bn-BD')}</span></div><p class="text-[11px] font-bold text-gray-700 mt-0.5 truncate">তারিখ: ${sanitizeInput(tx.dateStr)} | আইডি: ${sanitizeInput(tx.appId)}</p><div class="flex items-center justify-between gap-2 mt-0.5"><p class="text-[11px] font-bold text-gray-800 truncate">বিবরণ: ${sanitizeInput(tx.detailsText)}</p><span class="text-[10px] font-extrabold text-gray-800 shrink-0 flex items-center gap-1">স্থিতি: <span class="${statusBadgeCls} px-2 py-0.5 rounded font-black text-[10px]">${tx.statusLabel}</span></span></div></div></div>`;
    });
    container.innerHTML = html;
}

function openTxDetailsModal(idx) {
    const tx = (window.lastRenderedTxList || [])[idx]; if (!tx) return;
    const body = document.getElementById('tx_details_modal_body');
    if (body) body.innerHTML = `<div class="flex justify-between py-1 border-b border-gray-100"><span class="text-gray-600 font-bold">লেনদেনের ধরন:</span><span class="font-black text-gray-900">${sanitizeInput(tx.title)}</span></div><div class="flex justify-between py-1 border-b border-gray-100"><span class="text-gray-600 font-bold">টাকার পরিমাণ:</span><span class="font-black ${tx.amountColor}">${tx.sign} ৳ ${tx.amount.toLocaleString('bn-BD')}</span></div><div class="flex justify-between py-1 border-b border-gray-100"><span class="text-gray-600 font-bold">লোন আইডি:</span><span class="font-black text-gray-900">${sanitizeInput(tx.appId)}</span></div><div class="flex justify-between py-1 border-b border-gray-100 gap-2"><span class="text-gray-600 font-bold shrink-0">বেনিফিশিয়ারি / মাধ্যম:</span><span class="font-extrabold text-[#123c69] text-right">${sanitizeInput(tx.beneficiary)}</span></div><div class="flex justify-between py-1 border-b border-gray-100"><span class="text-gray-600 font-bold">প্রেরক / নম্বর:</span><span class="font-bold text-gray-900">${sanitizeInput(tx.senderPhone)}</span></div><div class="flex justify-between py-1 border-b border-gray-100"><span class="text-gray-600 font-bold">TrxID:</span><span class="font-mono font-bold text-gray-900">${sanitizeInput(tx.trx)}</span></div><div class="flex justify-between py-1 border-b border-gray-100"><span class="text-gray-600 font-bold">তারিখ ও সময়:</span><span class="font-bold text-gray-900 text-right">${sanitizeInput(tx.dateStr)}</span></div><div class="flex justify-between py-1"><span class="text-gray-600 font-bold">অবস্থা:</span><span class="font-black text-gray-900">${sanitizeInput(tx.status)} (${tx.statusLabel})</span></div>`;
    const modal = document.getElementById('tx-details-modal'); if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
}
function closeTxDetailsModal() { const modal = document.getElementById('tx-details-modal'); if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); } }

function downloadFullTransactionsStatement() {
    const { txItems, myRecords } = buildUserTransactionHistory();
    const list = (window.lastRenderedTxList && window.lastRenderedTxList.length > 0) ? window.lastRenderedTxList : txItems;
    if (!list || list.length === 0) return showPopup('কোনো তথ্য নেই', 'ডাউনলোড করার মতো কোনো লেনদেনের ইতিহাস পাওয়া যায়নি।', 'error');
    const totalWithdrawn = myRecords.filter(r => r.type === 'CASHOUT' && r.status === 'এপ্রুভড').reduce((s, r) => s + parseAmountToNumber(r.amount), 0);
    const totalEmiPaid = myRecords.filter(r => r.type === 'EMI' && r.status === 'এপ্রুভড').reduce((s, r) => s + parseAmountToNumber(r.amount), 0);
    let rows = '';
    list.forEach(tx => { rows += `<tr><td style="border:1px solid #d1d5db; padding:7px;">${sanitizeInput(tx.dateStr)}</td><td style="border:1px solid #d1d5db; padding:7px;">${sanitizeInput(tx.title)} (${sanitizeInput(tx.appId)})</td><td style="border:1px solid #d1d5db; padding:7px;">${sanitizeInput(tx.beneficiary)}</td><td style="border:1px solid #d1d5db; padding:7px;">${sanitizeInput(tx.trx)}</td><td style="border:1px solid #d1d5db; padding:7px; font-weight:800;">${tx.sign} ৳ ${tx.amount.toLocaleString('bn-BD')}</td><td style="border:1px solid #d1d5db; padding:7px; font-weight:800;">${tx.statusLabel}</td></tr>`; });
    const html = `<h3 style="text-align:center; font-size:18px; font-weight:800; color:#123c69; margin:0 0 8px;">পূর্ণাঙ্গ লেনদেন ও পেমেন্ট স্টেটমেন্ট</h3><p style="text-align:center; font-size:13px; margin:0 0 12px; font-weight:700;">গ্রাহক: ${sanitizeInput(currentUser.name || '')} | আইডি: ${sanitizeInput(currentUser.userId || currentUser.phone || '')}</p><div style="display:flex; justify-content:space-between; background:#eef7f2; border:1px solid #a7d7bc; padding:10px 14px; border-radius:8px; margin-bottom:14px; font-size:13px; font-weight:800;"><span>মোট উত্তোলিত: ৳ ${totalWithdrawn.toLocaleString('bn-BD')}</span><span>মোট পরিশোধিত: ৳ ${totalEmiPaid.toLocaleString('bn-BD')}</span></div><table style="width:100%; border-collapse:collapse; font-size:12px;"><thead><tr style="background:#1e6036; color:#ffffff;"><th style="border:1px solid #1e6036; padding:8px; text-align:left;">তারিখ ও সময়</th><th style="border:1px solid #1e6036; padding:8px; text-align:left;">বিবরণ</th><th style="border:1px solid #1e6036; padding:8px; text-align:left;">বেনিফিশিয়ারি / মাধ্যম</th><th style="border:1px solid #1e6036; padding:8px; text-align:left;">TrxID</th><th style="border:1px solid #1e6036; padding:8px; text-align:left;">পরিমাণ</th><th style="border:1px solid #1e6036; padding:8px; text-align:left;">স্থিতি</th></tr></thead><tbody>${rows}</tbody></table>`;
    generateBengaliPdf(html, `Transactions_Statement_${Date.now()}.pdf`);
}

// ==============================================
// ABOUT CERTIFICATES & GALLERY
// ==============================================
window._renderedCertsList = [];
window._renderedGalleryList = [];

function makeGalleryFallbackSvg(label, bg) {
    const safeTxt = (label || 'Document').substring(0, 22);
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="500" height="320" viewBox="0 0 500 320"><rect width="500" height="320" fill="${bg || '#1e6036'}"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-weight="800" font-size="22">${safeTxt}</text></svg>`);
}

function renderAboutCertificates() {
    const container = document.getElementById('about_certificates_container');
    if (!container) return;
    let certsList = [];
    try { const raw = localStorage.getItem('app_certs_list'); if (raw) { const p = JSON.parse(raw); if (Array.isArray(p) && p.length > 0) certsList = p; } } catch(e) {}
    if (certsList.length === 0) {
        certsList = [
            { title: 'ই-টিন (TIN) সার্টিফিকেট', img: localStorage.getItem('app_tin_cert') || '' },
            { title: 'সরকারি ট্রেড লাইসেন্স ও অনুমোদন', img: localStorage.getItem('app_gov_cert') || '' },
            { title: 'ইসলামিক শরীয়াহ অনুমোদন সনদ', img: localStorage.getItem('app_cert_3') || '' }
        ];
    }
    window._renderedCertsList = certsList.map((c, idx) => ({ title: c.title || `অনুমোদন সনদ #${toBanglaDigits(idx + 1)}`, img: (c.img && c.img.trim()) ? c.img.trim() : makeGalleryFallbackSvg(`Certificate #${idx + 1}`, idx % 2 === 0 ? '#1e6036' : '#123c69') }));
    let html = '';
    window._renderedCertsList.forEach((c, idx) => {
        const safeTitle = sanitizeInput(c.title);
        html += `<div onclick="openCertLightboxByIndex(${idx})" class="shrink-0 snap-center w-[260px] border border-[#b8c9d4] rounded-xl p-2.5 bg-[#f4f8fa] cursor-pointer hover:border-[#1e6036] transition-all"><p class="text-xs font-extrabold text-gray-900 mb-2 flex items-center gap-1.5 truncate"><i class="bx bx-badge-check text-[#1e6036] text-base shrink-0"></i> ${safeTitle}</p><img src="${sanitizeInput(c.img)}" class="w-full h-40 rounded-lg object-cover border border-gray-200 shadow-sm" alt="${safeTitle}"></div>`;
    });
    container.innerHTML = html;
}

function renderAboutGallery() {
    const container = document.getElementById('about_photo_gallery_container');
    if (!container) return;
    let galleryList = [];
    try {
        const raw = localStorage.getItem('app_gallery_images');
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) parsed.forEach((item, idx) => {
                if (typeof item === 'string' && item.trim()) galleryList.push({ title: `সরকারি অনুমোদন নথি #${toBanglaDigits(idx + 1)}`, date: '', url: item.trim() });
                else if (item && (item.url || item.title)) galleryList.push({ title: item.title || `সরকারি অনুমোদন নথি #${toBanglaDigits(idx + 1)}`, date: item.date || '', url: item.url || '' });
            });
        }
    } catch(e) {}
    for (let i = 1; i <= 12; i++) {
        const singleUrl = localStorage.getItem('app_gallery_' + i);
        if (singleUrl && singleUrl.trim()) galleryList.push({ title: localStorage.getItem('app_gallery_title_' + i) || `অনুমোদন ও অফিসিয়াল ডকুমেন্ট #${toBanglaDigits(i)}`, date: '', url: singleUrl.trim() });
    }
    if (galleryList.length === 0) {
        galleryList = [
            { title: 'বাংলাদেশ ব্যাংক প্রধান কার্যালয়', date: '১৫ জানুয়ারি ২০২৬', url: '' },
            { title: 'আর্থিক প্রতিষ্ঠান লাইসেন্স (১০৩১৫৮২০৬৬)', date: '২০ ফেব্রুয়ারি ২০২৬', url: '' },
            { title: 'সরকার অনুমোদিত কর্পোরেট সনদ', date: '১০ মার্চ ২০২৬', url: '' }
        ];
    }
    window._renderedGalleryList = galleryList.map((item, idx) => ({ title: item.title || `গ্যালারি #${toBanglaDigits(idx + 1)}`, date: item.date || '', url: (item.url && item.url.trim()) ? item.url.trim() : makeGalleryFallbackSvg(`Gallery #${idx + 1}`, idx % 2 === 0 ? '#123c69' : '#15803d') }));
    let html = '';
    window._renderedGalleryList.forEach((item, idx) => {
        const safeTitle = sanitizeInput(item.title);
        const dateHtml = item.date ? `<p class="text-[10px] font-bold text-[#1e6036] truncate text-center mt-0.5 flex items-center justify-center gap-1"><i class="bx bx-calendar text-[11px]"></i> ${sanitizeInput(item.date)}</p>` : '';
        html += `<div onclick="openGalleryLightboxByIndex(${idx})" class="shrink-0 snap-center w-[235px] border border-[#b8c9d4] rounded-xl p-2.5 bg-[#f4f8fa] cursor-pointer hover:border-[#1e6036] transition-all"><img src="${sanitizeInput(item.url)}" class="w-full h-36 rounded-lg object-cover border border-gray-200 shadow-sm mb-2" alt="${safeTitle}"><p class="text-[11px] font-extrabold text-gray-900 truncate text-center">${safeTitle}</p>${dateHtml}</div>`;
    });
    container.innerHTML = html;
}

function openCertLightboxByIndex(idx) { const item = window._renderedCertsList[idx]; if (item) openGalleryLightbox(item.img, item.title, ''); }
function openGalleryLightboxByIndex(idx) { const item = window._renderedGalleryList[idx]; if (item) openGalleryLightbox(item.url, item.title, item.date); }
function openGalleryLightbox(url, title, dateStr = '') {
    const modal = document.getElementById('gallery-lightbox-modal'), img = document.getElementById('lightbox_img'), lbl = document.getElementById('lightbox_title');
    if (img) img.src = url;
    if (lbl) lbl.innerText = title || 'ছবি প্রিভিউ';
    if (modal && lbl) {
        let dateEl = document.getElementById('lightbox_date');
        if (!dateEl) { dateEl = document.createElement('p'); dateEl.id = 'lightbox_date'; dateEl.className = 'text-[11px] font-bold text-[#1e6036] mt-0.5'; lbl.parentNode.appendChild(dateEl); }
        if (dateStr && dateStr.trim() !== '') { dateEl.innerHTML = `<i class="bx bx-calendar"></i> ${sanitizeInput(dateStr)}`; dateEl.classList.remove('hidden'); }
        else dateEl.classList.add('hidden');
    }
    if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
}
function closeGalleryLightbox() { const modal = document.getElementById('gallery-lightbox-modal'); if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); } }

function syncModuleViewsWithAdmin() {
    const appLogo = localStorage.getItem('app_logo');
    if (appLogo) document.querySelectorAll('.app-logo-img').forEach(img => img.src = appLogo);

    const aboutText = localStorage.getItem('app_about');
    if (aboutText && document.getElementById('about_text_content')) {
        document.getElementById('about_text_content').innerHTML = `<p>${aboutText.replace(/\n/g, '<br>')}</p>`;
    }

    renderHomePartnerBanks();
    syncUserVerificationStatus();
    renderAboutCertificates();
    renderAboutGallery();
    updateUnreadInboxCount();

    if (typeof syncLoanViewsWithAdmin === 'function') syncLoanViewsWithAdmin();
}

// মডিউল লোড হওয়া মাত্র ডার্ক মোড আইকন ও অ্যাডমিন ডেটা সিঙ্ক
updateThemeIcon(document.body.classList.contains('dark-mode'));
syncModuleViewsWithAdmin();