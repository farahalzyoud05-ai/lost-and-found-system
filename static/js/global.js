document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const langToggles = document.querySelectorAll(".lang-toggle, #langToggle, #langToggleBtn");
    const themeToggles = document.querySelectorAll(".theme-toggle, #themeToggle");

    let currentLang = localStorage.getItem("appLang") || "ar";
    let currentTheme = localStorage.getItem("appTheme") || "light";

    // 🔴 جعلنا الدالة عامة لكي تستدعيها نوافذ التفاصيل (Modals) بعد جلب البيانات
    window.applyCurrentLanguage = function () {
        applyLanguage(currentLang);
    };

    applyLanguage(currentLang);
    if (currentTheme === "dark") body.classList.add("dark-mode");

    langToggles.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            currentLang = currentLang === "en" ? "ar" : "en";
            localStorage.setItem("appLang", currentLang);
            applyLanguage(currentLang);
        });
    });

    themeToggles.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            body.classList.toggle("dark-mode");
            localStorage.setItem("appTheme", body.classList.contains("dark-mode") ? "dark" : "light");
            applyLanguage(currentLang);
        });
    });

    document.querySelectorAll('input[type="file"]').forEach(input => {
        if (!input.parentElement.classList.contains('custom-file-upload')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'custom-file-upload';
            wrapper.style.position = 'relative';
            wrapper.style.display = 'inline-block';
            wrapper.style.width = '100%';

            const label = document.createElement('label');
            label.className = 'btn btn-outline-primary w-100 file-btn-text';
            label.style.cursor = 'pointer';
            label.style.padding = '10px';
            label.style.borderRadius = '8px';
            label.style.textAlign = 'center';
            label.style.border = '2px dashed var(--primary)';
            label.style.color = 'var(--primary)';
            label.style.fontWeight = 'bold';

            label.innerHTML = currentLang === 'ar'
                ? '<i class="fa-solid fa-cloud-arrow-up"></i> اختر ملف (صورة الغرض)'
                : '<i class="fa-solid fa-cloud-arrow-up"></i> Choose File (Item Image)';

            input.style.display = 'none';
            input.parentNode.insertBefore(wrapper, input);
            wrapper.appendChild(input);
            wrapper.appendChild(label);

            label.addEventListener('click', () => input.click());
            input.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    label.innerHTML = `<i class="fa-solid fa-check"></i> ${e.target.files[0].name}`;
                    label.style.borderColor = '#2ecc71';
                    label.style.color = '#2ecc71';
                }
            });
        }
    });

    function applyLanguage(lang) {
        body.setAttribute("data-lang", lang);
        document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
        document.documentElement.lang = lang;

        langToggles.forEach(btn => {
            if (btn.classList.contains('text-only')) {
                btn.innerHTML = lang === "ar" ? 'EN' : 'AR';
            } else {
                btn.innerHTML = lang === "ar" ? '<i class="fa-solid fa-globe"></i> English' : '<i class="fa-solid fa-globe"></i> العربية';
            }
        });

        themeToggles.forEach(btn => {
            const isDark = body.classList.contains("dark-mode");
            if (lang === "ar") {
                btn.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i> الوضع النهاري' : '<i class="fa-solid fa-moon"></i> الوضع الليلي';
            } else {
                btn.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i> Light Mode' : '<i class="fa-solid fa-moon"></i> Dark Mode';
            }
        });

        // 🔴 الحل الجذري لمشكلة الأيقونات في القائمة الجانبية (Sidebar)
        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.getAttribute("data-i18n");
            if (translations[lang] && translations[lang][key]) {
                if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
                    el.placeholder = translations[lang][key];
                } else {
                    // إذا كان العنصر يحتوي على أيقونة (مثل الروابط في القائمة الجانبية)
                    let iconHTML = '';
                    let iconElement = el.querySelector('i');
                    if (iconElement) {
                        iconHTML = iconElement.outerHTML + ' ';
                    }

                    // نستخرج النص فقط من الترجمة (بدون الأيقونة المدمجة في المتغير)
                    let translatedText = translations[lang][key];
                    let tempDiv = document.createElement("div");
                    tempDiv.innerHTML = translatedText;
                    let plainText = tempDiv.textContent || tempDiv.innerText || translatedText;

                    // ندمج الأيقونة الأصلية مع النص المترجم
                    el.innerHTML = iconHTML + plainText.trim();
                }
            }
        });

        document.querySelectorAll('.file-btn-text').forEach(label => {
            if (!label.innerHTML.includes('fa-check')) {
                label.innerHTML = lang === 'ar'
                    ? '<i class="fa-solid fa-cloud-arrow-up"></i> اختر ملف (صورة الغرض)'
                    : '<i class="fa-solid fa-cloud-arrow-up"></i> Choose File (Item Image)';
            }
        });

        // 🔴 الترجمة القوية للبيانات الديناميكية
        document.querySelectorAll('.auto-trans, [data-ar]').forEach(el => {
            let originalText = el.getAttribute('data-ar');
            if (originalText) {
                let translatedText = (dynamicDBTerms[lang] && dynamicDBTerms[lang][originalText]) ? dynamicDBTerms[lang][originalText] : (lang === 'en' ? originalText : originalText);

                if (!dynamicDBTerms[lang] || !dynamicDBTerms[lang][originalText]) {
                    if (lang === 'en') {
                        for (const key in translations['ar']) {
                            if (translations['ar'][key] === originalText || (el.innerHTML && el.innerHTML.includes(translations['ar'][key]))) {
                                translatedText = translations['en'][key];
                                const tempDiv = document.createElement("div");
                                tempDiv.innerHTML = translatedText;
                                translatedText = tempDiv.textContent || tempDiv.innerText || translatedText;
                                break;
                            }
                        }
                    }
                }

                if (el.childNodes.length > 0) {
                    let textChanged = false;
                    el.childNodes.forEach(child => {
                        if (child.nodeType === Node.TEXT_NODE && child.nodeValue.trim().length > 0) {
                            child.nodeValue = translatedText;
                            textChanged = true;
                        }
                    });
                    if (!textChanged && translatedText !== originalText && translatedText.length > 0 && !el.innerHTML.includes(translatedText)) {
                        el.innerHTML += ' ' + translatedText;
                    }
                } else {
                    el.innerText = translatedText;
                }
            }
        });

        // ترجمة العناصر البسيطة
        document.querySelectorAll('td, span, option, p, label, th, h2, h3, h4, button').forEach(el => {
            if (el.classList.contains('auto-trans') || el.hasAttribute('data-ar')) return;

            el.childNodes.forEach(child => {
                if (child.nodeType === Node.TEXT_NODE) {
                    let text = child.nodeValue.trim();
                    if (text.length > 0) {
                        let cleanText = text;
                        if (dynamicDBTerms[lang] && dynamicDBTerms[lang][cleanText]) {
                            child.nodeValue = child.nodeValue.replace(text, dynamicDBTerms[lang][cleanText]);
                        } else {
                            if (lang === 'ar' && dynamicDBTerms['en']) {
                                for (let key in dynamicDBTerms['en']) {
                                    if (dynamicDBTerms['en'][key] === cleanText) {
                                        child.nodeValue = child.nodeValue.replace(text, key);
                                        break;
                                    }
                                }
                            }
                            else if (lang === 'en' && dynamicDBTerms['ar']) {
                                for (let key in dynamicDBTerms['ar']) {
                                    if (dynamicDBTerms['ar'][key] === cleanText) {
                                        child.nodeValue = child.nodeValue.replace(text, key);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            });
        });

        let searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.placeholder = lang === 'en' ? 'Search by name, item, or report ID...' : 'ابحث بالاسم، الغرض، أو رقم البلاغ...';
        }
    }

    const togglePasswordIcons = document.querySelectorAll('.toggle-password, .password-wrapper i');
    togglePasswordIcons.forEach(icon => {
        icon.removeAttribute('onclick');
        icon.replaceWith(icon.cloneNode(true));
        const newIcon = document.querySelector('.password-wrapper i') || icon;

        newIcon.addEventListener('click', function () {
            const input = this.parentElement.querySelector('input');
            if (input) {
                if (input.type === 'password') {
                    input.type = 'text';
                    this.classList.remove('fa-eye');
                    this.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    this.classList.remove('fa-eye-slash');
                    this.classList.add('fa-eye');
                }
            }
        });
    });
});

const translations = {
    "en": {
        "nav_dash": '<i class="fa-solid fa-chart-pie"></i> Dashboard',
        "nav_lost": '<i class="fa-solid fa-box-open"></i> Lost Reports',
        "nav_found": '<i class="fa-solid fa-warehouse"></i> Found Reports',
        "nav_matches": '<i class="fa-solid fa-robot"></i> Matches',
        "nav_staff": '<i class="fa-solid fa-users-gear"></i> Staff Mgmt',
        "nav_staff_map": '<i class="fa-solid fa-tower-broadcast"></i> Field Radar',
        "nav_staff_reports": '<i class="fa-solid fa-clipboard-list"></i> Operations Log',
        "nav_brand": "Lost & Found System",
        "nav_home": "Home",
        "my_profile": "My Profile",
        "btn_logout": "Logout",
        "theme_dark": "Dark Mode",
        "home_title": "Did you lose something at the airport?",
        "home_desc": "Integrated and secure electronic system to manage lost & found items.",
        "ph_search": "Describe what you lost...",
        "btn_search": "General Search",
        "btn_report_lost": "Report Lost Item",
        "btn_report_found": "Report Found Item",
        "cat_bags": "Bags & Luggage",
        "cat_elec": "Electronics",
        "cat_docs": "Official Documents",
        "cat_personal": "Personal Belongings",
        "auth_login_title": "Passenger Login",
        "auth_emp_title": "Staff Portal",
        "auth_admin_title": "Admin Access",
        "auth_reg_title": "Create New Account",
        "auth_otp_title": "Verify Your Email",
        "auth_reset_title": "Recover Password",
        "auth_forgot_title": "Recover Password",
        "auth_forgot_desc": "Enter your email and we will send you a verification link.",
        "auth_btn_send": "Send Link",
        "auth_email": "Email Address",
        "auth_pass": "Password",
        "auth_name": "Full Name",
        "auth_pass_conf": "Confirm Password",
        "auth_emp_id": "Employee ID",
        "auth_admin_id": "Admin ID",
        "auth_email_ph": "example@airport.com",
        "auth_pass_ph": "••••••••",
        "auth_name_ph": "John Doe",
        "auth_emp_id_ph": "e.g. EMP-101",
        "auth_admin_id_ph": "e.g. 1001",
        "auth_btn_login": "Login to System",
        "auth_btn_emp_login": "Access My Tasks",
        "auth_btn_admin_login": "Login to Dashboard",
        "auth_btn_reg": "Register Account",
        "auth_btn_otp": "Verify & Proceed",
        "auth_btn_reset": "Update Password",
        "auth_forgot": "Forgot Password?",
        "auth_create": "Don't have an account? Sign Up",
        "auth_have_acc": "Already have an account? Login",
        "auth_remember": "Remembered your password? Login",
        "auth_otp_desc": "Enter the 4-digit code sent to your email.",
        "auth_reset_desc": "Enter your new password below.",
        "auth_otp_timer": "Resend in:",
        "auth_otp_seconds": "seconds",
        "auth_otp_resend": "Resend Code",
        "rep_lost_title": "Report Lost Item",
        "rep_found_title": "Report Found Item",
        "rep_lost_desc": "Provide details to help us match your item.",
        "sec_personal": "Contact Information",
        "sec_lost_item": "Lost Item Details",
        "sec_item": "Item Details",
        "lbl_fullname": "Full Name",
        "lbl_phone": "Phone Number",
        "lbl_item_name": "Item Name",
        "lbl_category": "Category",
        "lbl_color": "Item Color",
        "lbl_location": "Location",
        "lbl_location_lost": "Where did you lose it?",
        "lbl_location_found": "Where did you find it?",
        "lbl_date": "Date",
        "lbl_date_lost": "Date of Loss",
        "lbl_date_found": "Date Found",
        "lbl_time": "Approximate Time",
        "lbl_desc": "Additional Description",
        "lbl_upload": "Upload Image (Optional)",
        "ph_item_name": "e.g. Black Leather Wallet",
        "ph_desc": "Any marks, brand, or content...",
        "ph_fullname": "Ahmad Mohammad",
        "ph_phone": "079XXXXXXX",
        "opt_select_ph": "--- Select ---",
        "btn_submit_report": "Submit Report",
        "btn_submit_found": "Submit Found Item",
        "btn_export_pdf": "Export as PDF",
        "btn_expand": "Expand Map",
        "btn_close": "Close Map",
        "welcome": "Welcome Back",
        "welcome_desc": "System statistics for today",
        "stat_lost": "Total Lost",
        "stat_found": "Total Found",
        "stat_matches": "Active Matches",
        "lost_admin_title": "Lost Reports Management",
        "lost_admin_desc": "Track search operations and delivery status.",
        "found_admin_title": "Storage & Found Items",
        "found_admin_desc": "Manage items currently in the warehouse.",
        "lost_table_title": "Current Lost Records",
        "found_table_title": "Storage Inventory",
        "staff_title": "Staff & Permissions",
        "staff_desc": "Add, suspend, or manage employee accounts.",
        "matches_admin_title": "AI Smart Matches",
        "matches_admin_desc": "System suggestions for matching reports.",
        "matches_table_title": "Proposed Matches",
        "th_report_id": "Report ID",
        "th_name": "Name",
        "th_contact": "Contact",
        "th_lost_item": "Lost Item",
        "th_found_item": "Found Item",
        "th_location_date": "Location & Date",
        "th_status": "Search Status",
        "th_delivery": "Delivery",
        "th_actions": "Actions",
        "th_match_id": "Match ID",
        "th_match_score": "Score",
        "th_review_status": "Review",
        "th_decision": "Decision",
        "th_staff_name": "Employee Name",
        "th_credentials": "Login (ID/Pass)",
        "th_role": "Position",
        "th_zone": "Assigned Area",
        "th_duty_status": "Status",
        "status_searching": "Searching",
        "status_in_storage": "Stored",
        "status_not_found_yet": "Not Found",
        "status_not_delivered": "Pending Delivery",
        "status_delivered": "Delivered",
        "status_on_duty": "On Duty",
        "status_suspended": "Suspended",
        "status_under_review": "Under Review",
        "role_security": "Security",
        "role_luggage": "Baggage Staff",
        "role_warehouse": "Storekeeper",
        "btn_add_staff": "Add Employee",
        "btn_export_excel": "Export to Excel",
        "btn_reset": "Reset Filters",
        "staff_portal_title": "Staff Portal",
        "staff_welcome_field": "Field Operations",
        "staff_map_desc": "Live tracking - respond to alarms immediately.",
        "staff_idle": "Waiting for tasks...",
        "alarm_title": "🚨 NEW ALARM!",
        "alarm_body": "Item detected at:",
        "alarm_action": "Head to location now.",
        "btn_on_my_way": "Respond Now",
        "btn_heading": "Heading to Site",
        "btn_picked": "Item Picked Up",
        "btn_stored": "Deposited",
        "staff_rep_header": "Staff Activity Log",
        "staff_rep_desc": "Update status as you process items.",
        "staff_assigned_items": "My Assigned Tasks",
        "label_lost_rep": "Lost (Passenger)",
        "status_waiting_pickup": "Waiting Pickup",
        "opt_select_new_status": "--- Select Status ---",
        "opt_received_way": "Received & En-route",
        "opt_deposited_success": "Deposited",
        "opt_delivered_to_person": "Handed to Owner",
        "btn_save_update": "Save Changes",
        "zone_security": "Security Checkpoint",
        "zone_gates": "Boarding Gates",
        "zone_warehouse": "Main Storage",
        "zone_dutyfree": "Duty Free",
        "map_title": "<i class=\"fa-solid fa-map-location-dot\"></i> Official Airport Map",
        "map_pin_runway": "Runways",
        "map_pin_apron": "Apron",
        "map_pin_tower": "Control Tower",
        "map_pin_hangars": "Hangars",
        "map_pin_gates": "Gates",
        "map_pin_departure": "Departure Hall",
        "map_pin_checkin": "Check-in Desks",
        "map_pin_security": "Security Checkpoint",
        "map_pin_passport": "Passport Control",
        "map_pin_storage": "Main Storage",
        "map_pin_dutyfree": "Duty Free",
        "map_pin_baggage": "Baggage Claim",
        "map_pin_food": "Food Court",
        "map_pin_arrival": "Arrival Hall",
        "map_pin_vip": "VIP Lounge",
        "map_pin_info": "Info Desk",
        "map_pin_mosque": "Mosque",
        "map_pin_parking": "Parking",
        "map_pin_taxi": "Taxi/Bus Stand",
        "map_pin_entrance": "Main Entrance",
        "legend_lost": "Lost Item",
        "legend_found": "Found Item",
        "legend_storage": "Warehouse",
        "legend_security": "Security Guard",
        "sec_guard_1": "Guard 1",
        "sec_guard_2": "Guard 2",
        "sec_guard_3": "Guard 3",
        "sec_luggage": "Baggage Staff",
        "sec_recovery": "Recovery Team",
        "sec_manager": "Field Manager",
        "footer_desc": "A secure system for airport item management.",
        "footer_rights": "© 2026 Lost & Found Management.",
        "footer_copy": "© 2026 All Rights Reserved."
    },
    "ar": {
        "nav_dash": '<i class="fa-solid fa-chart-pie"></i> لوحة القيادة',
        "nav_lost": '<i class="fa-solid fa-box-open"></i> المفقودات',
        "nav_found": '<i class="fa-solid fa-warehouse"></i> المعثورات',
        "nav_matches": '<i class="fa-solid fa-robot"></i> المطابقات',
        "nav_staff": '<i class="fa-solid fa-users-gear"></i> إدارة الموظفين',
        "nav_staff_map": '<i class="fa-solid fa-tower-broadcast"></i> الرادار الميداني',
        "nav_staff_reports": '<i class="fa-solid fa-clipboard-list"></i> سجل العمليات',
        "nav_brand": "نظام المفقودات والمعثورات",
        "nav_home": "الرئيسية",
        "my_profile": "حسابي",
        "btn_logout": "تسجيل خروج",
        "theme_dark": "الوضع الليلي",
        "home_title": "هل فقدت شيئاً في المطار؟",
        "home_desc": "نظام إلكتروني متكامل وآمن لإدارة المفقودات والمعثورات في المطار.",
        "ph_search": "اكتب وصف ما فقدته...",
        "btn_search": "بحث عام",
        "btn_report_lost": "الإبلاغ عن مفقود",
        "btn_report_found": "الإبلاغ عن معثور عليه",
        "cat_bags": "الحقائب والأمتعة",
        "cat_elec": "الإلكترونيات",
        "cat_docs": "الوثائق الرسمية",
        "cat_personal": "متعلقات شخصية",
        "auth_login_title": "دخول المسافرين",
        "auth_emp_title": "بوابة الموظفين",
        "auth_admin_title": "بوابة الإدارة",
        "auth_reg_title": "إنشاء حساب جديد",
        "auth_otp_title": "التحقق من البريد",
        "auth_reset_title": "استعادة كلمة المرور",
        "auth_forgot_title": "استعادة كلمة المرور",
        "auth_forgot_desc": "أدخل بريدك الإلكتروني وسنقوم بإرسال رابط التحقق إليك.",
        "auth_btn_send": "إرسال الرابط",
        "auth_email": "البريد الإلكتروني",
        "auth_pass": "كلمة المرور",
        "auth_name": "الاسم الكامل",
        "auth_pass_conf": "تأكيد المرور",
        "auth_emp_id": "الرقم الوظيفي",
        "auth_admin_id": "الرقم الوظيفي للمدير",
        "auth_email_ph": "example@airport.com",
        "auth_pass_ph": "••••••••",
        "auth_name_ph": "أحمد محمد",
        "auth_emp_id_ph": "مثال: 101",
        "auth_admin_id_ph": "مثال: 1001",
        "auth_btn_login": "دخول النظام",
        "auth_btn_emp_login": "دخول لمهامي",
        "auth_btn_admin_login": "دخول للوحة التحكم",
        "auth_btn_reg": "تسجيل الحساب",
        "auth_btn_otp": "التحقق والمتابعة",
        "auth_btn_reset": "تحديث كلمة المرور",
        "auth_forgot": "نسيت كلمة المرور؟",
        "auth_create": "ليس لديك حساب؟ سجل الآن",
        "auth_have_acc": "لديك حساب؟ تسجيل الدخول",
        "auth_remember": "تذكرت كلمة المرور؟ دخول",
        "auth_otp_desc": "أدخل الرمز المرسل إلى بريدك الإلكتروني.",
        "auth_reset_desc": "أدخل كلمة المرور الجديدة أدناه.",
        "auth_otp_timer": "إعادة الإرسال خلال:",
        "auth_otp_seconds": "ثانية",
        "auth_otp_resend": "إعادة إرسال الرمز",
        "rep_lost_title": "الإبلاغ عن مفقود",
        "rep_found_title": "الإبلاغ عن معثور عليه",
        "rep_lost_desc": "يرجى تعبئة التفاصيل بدقة لمساعدتنا في العثور عليه.",
        "sec_personal": "معلومات التواصل",
        "sec_lost_item": "تفاصيل الغرض المفقود",
        "sec_item": "تفاصيل الغرض",
        "lbl_fullname": "الاسم الكامل",
        "lbl_phone": "رقم الهاتف",
        "lbl_item_name": "اسم الغرض",
        "lbl_category": "الفئة",
        "lbl_color": "اللون",
        "lbl_location": "الموقع",
        "lbl_location_lost": "أين فقدته تقريباً؟",
        "lbl_location_found": "أين وجدته؟",
        "lbl_date": "التاريخ",
        "lbl_date_lost": "تاريخ الفقدان",
        "lbl_date_found": "تاريخ العثور",
        "lbl_time": "الوقت التقريبي",
        "lbl_desc": "وصف إضافي",
        "lbl_upload": "إرفاق صورة (اختياري)",
        "ph_item_name": "مثال: محفظة جلد سوداء",
        "ph_desc": "علامات مميزة أو محتويات...",
        "ph_fullname": "أحمد محمد",
        "ph_phone": "079XXXXXXX",
        "opt_select_ph": "--- اختر ---",
        "btn_submit_report": "إرسال البلاغ",
        "btn_submit_found": "تسليم المعثورات",
        "btn_export_pdf": "تصدير كـ PDF",
        "btn_expand": "تكبير الخريطة",
        "btn_close": "إغلاق الخريطة",
        "welcome": "مرحباً بك، مدير النظام",
        "welcome_desc": "إليك إحصائيات النظام اليوم",
        "stat_lost": "إجمالي المفقودات",
        "stat_found": "إجمالي المعثورات",
        "stat_matches": "المطابقات النشطة",
        "lost_admin_title": "إدارة بلاغات المفقودات",
        "lost_admin_desc": "متابعة عمليات البحث وتسليم الأغراض.",
        "found_admin_title": "إدارة المعثورات والمستودع",
        "found_admin_desc": "سجل الأغراض الموجودة في المستودع حالياً.",
        "lost_table_title": "سجل المفقودات الحالي",
        "found_table_title": "المعثورات في المستودع",
        "staff_title": "إدارة الموظفين والصلاحيات",
        "staff_desc": "إضافة وتجميد وإدارة حسابات الموظفين.",
        "matches_admin_title": "المطابقات الذكية",
        "matches_admin_desc": "اقتراحات النظام لربط المفقودات بالمعثورات.",
        "matches_table_title": "المطابقات المقترحة",
        "th_report_id": "رقم البلاغ",
        "th_name": "الاسم",
        "th_contact": "التواصل",
        "th_lost_item": "الغرض المفقود",
        "th_found_item": "الغرض المعثور",
        "th_location_date": "المكان / التاريخ",
        "th_status": "حالة البحث",
        "th_delivery": "التسليم",
        "th_actions": "الإجراءات",
        "th_match_id": "رقم المطابقة",
        "th_match_score": "النسبة",
        "th_review_status": "المراجعة",
        "th_decision": "القرار",
        "th_staff_name": "اسم الموظف",
        "th_credentials": "بيانات الدخول",
        "th_role": "المنصب",
        "th_zone": "موقع التعيين",
        "th_duty_status": "الحالة",
        "status_searching": "جاري البحث",
        "status_in_storage": "في المستودع",
        "status_not_found_yet": "لم يتم العثور",
        "status_not_delivered": "لم يتم التسليم",
        "status_delivered": "تم التسليم",
        "status_on_duty": "على رأس عمله",
        "status_suspended": "حساب مجمد",
        "status_under_review": "قيد المراجعة",
        "role_security": "موظف أمن",
        "role_luggage": "موظف أمتعة",
        "role_warehouse": "أمين مستودع",
        "btn_add_staff": "إضافة موظف",
        "btn_export_excel": "تصدير إلى Excel",
        "btn_reset": "إعادة ضبط",
        "staff_portal_title": "بوابة الموظف",
        "staff_welcome_field": "مرحباً بك في الميدان",
        "staff_map_desc": "الرادار الميداني المباشر - استجب للإنذارات فوراً.",
        "staff_idle": "بانتظار بلاغات جديدة...",
        "alarm_title": "🚨 إنذار استلام جديد!",
        "alarm_body": "غرض مكتشف في:",
        "alarm_action": "توجه للموقع الآن.",
        "btn_on_my_way": "تأكيد الاستجابة",
        "btn_heading": "توجه للموقع",
        "btn_picked": "تم الاستلام",
        "btn_stored": "تم الإيداع",
        "staff_rep_header": "سجل العمليات والتقارير",
        "staff_rep_desc": "تحديث الحالات أثناء العمل الميداني.",
        "staff_assigned_items": "المهام المسندة إليك",
        "label_lost_rep": "مفقود (راكب)",
        "status_waiting_pickup": "بانتظار الاستلام",
        "opt_select_new_status": "--- اختر الحالة ---",
        "opt_received_way": "مستلم (في الطريق)",
        "opt_deposited_success": "تم الإيداع",
        "opt_delivered_to_person": "سلم للمالك",
        "btn_save_update": "حفظ التحديث",
        "zone_security": "نقطة التفتيش",
        "zone_gates": "بوابات الصعود",
        "zone_warehouse": "المستودع",
        "zone_dutyfree": "السوق الحرة",
        "map_title": "<i class=\"fa-solid fa-map-location-dot\"></i> خريطة المطار الرسمية",
        "map_pin_runway": "مدرج الطائرات (Runway)",
        "map_pin_apron": "ساحة الطائرات (Apron)",
        "map_pin_tower": "برج المراقبة",
        "map_pin_hangars": "حظائر الطائرات",
        "map_pin_gates": "بوابات الصعود (Gates)",
        "map_pin_departure": "صالة المغادرة",
        "map_pin_checkin": "مكاتب تسجيل الدخول",
        "map_pin_security": "نقطة التفتيش الأمني",
        "map_pin_passport": "الجوازات / الهجرة",
        "map_pin_storage": "مستودع المفقودات الرئيسي",
        "map_pin_dutyfree": "السوق الحرة",
        "map_pin_baggage": "استلام الأمتعة",
        "map_pin_food": "مطاعم ومقاهي",
        "map_pin_arrival": "صالة الوصول",
        "map_pin_vip": "صالة كبار الزوار (VIP)",
        "map_pin_info": "مكتب معلومات",
        "map_pin_mosque": "مسجد / مصلى",
        "map_pin_parking": "مواقف سيارات",
        "map_pin_taxi": "موقف تكسي / باص",
        "map_pin_entrance": "مدخل ومخرج المطار",
        "legend_lost": "مفقود",
        "legend_found": "معثور عليه",
        "legend_storage": "المستودع",
        "legend_security": "موظف أمن",
        "sec_guard_1": "موظف أمن 1",
        "sec_guard_2": "موظف أمن 2",
        "sec_guard_3": "موظف أمن 3",
        "sec_luggage": "موظف أمتعة",
        "sec_recovery": "فريق استرجاع",
        "sec_manager": "مدير الساحة",
        "footer_desc": "نظام آمن ومنظم لإدارة المفقودات بكفاءة.",
        "footer_rights": "© 2026 جميع الحقوق محفوظة.",
        "footer_copy": "© 2026 جميع الحقوق محفوظة."
    }
};

const dynamicDBTerms = {
    "en": {
        "الإلكترونيات": "Electronics", "متعلقات شخصية": "Personal Items", "الوثائق الرسمية": "Official Documents", "الحقائب والأمتعة": "Bags & Luggage",
        "منطقة الجوازات": "Passport Control", "السوق الحرة": "Duty Free", "بوابة 14": "Gate 14", "قاعة الانتظار": "Waiting Lounge",
        "نقطة التفتيش الأمنية": "Security Checkpoint", "الكافتيريا": "Cafeteria", "بوابة 32": "Gate 32", "بوابة 10": "Gate 10", "بوابة 5": "Gate 5",
        "مواقف السيارات": "Parking", "استلام الأمتعة": "Baggage Claim", "قاعة المغادرين": "Departure Hall", "الحمام الرئيسي": "Main Restroom", "الصراف الآلي": "ATM", "قاعة رجال الأعمال": "VIP Lounge", "منطقة التفتيش": "Inspection Area",

        "أبيض": "White", "أسود": "Black", "رمادي": "Grey", "أزرق": "Blue", "بني": "Brown", "فضي": "Silver", "ذهبي": "Gold", "أحمر": "Red",

        "خطأ في البريد الإلكتروني أو كلمة المرور": "Invalid email or password",
        "تم تفعيل حسابك بنجاح! يمكنك الآن تسجيل الدخول": "Account activated successfully! You can now login",
        "البريد الإلكتروني مسجل مسبقاً!": "Email is already registered!",
        "كلمات المرور غير متطابقة!": "Passwords do not match!",
        "رمز التحقق غير صحيح": "Invalid OTP code",
        "تم إرسال رمز التحقق إلى بريدك الإلكتروني": "Verification code sent to your email",
        "البريد الإلكتروني غير مسجل في النظام": "Email is not registered in the system",
        "تم التحقق بنجاح. (هذه نسخة تجريبية، سيتم تفعيل تغيير كلمة المرور لاحقاً)": "Verification successful. (Demo mode)",
        "حدث خطأ أثناء إرسال البريد الإلكتروني. يرجى التأكد من الإعدادات.": "Failed to send email. Please check SMTP settings.",
        "رقم الموظف أو كلمة المرور غير صحيحة": "Invalid Employee ID or Password",
        "بيانات دخول المسؤول غير صحيحة": "Invalid Admin Credentials",

        "جاري البحث": "Searching", "في المستودع": "Stored", "تم التسليم": "Delivered", "Searching": "Searching", "Stored": "Stored", "Delivered": "Delivered", "Found": "Found", "قيد البحث": "Searching", "تم التأكد من المالك": "Claimed", "تم التأكد من المالك (بانتظار التسليم)": "Claimed (Pending Delivery)", "تم التسليم للمالك": "Delivered to Owner",
        "موظف أمن": "Security Guard", "موظف أمتعة": "Luggage Staff", "فريق الاسترجاع": "Recovery Team", "أمين مستودع": "Storekeeper",
        "نشط": "Active", "مجمد": "Suspended", "محذوف": "Deleted", "active": "Active", "suspended": "Suspended",

        // 🚨 الأسماء والمفقودات الأردنية كاملة 🚨
        "نور عبد الله": "Noor Abdullah", "عمر الخطيب": "Omar Al-Khateeb", "سارة منصور": "Sara Mansour", "طارق الحديد": "Tareq Al-Hadid", "رؤى بني هاني": "Roaa Bani Hani", "عبدالله العبادي": "Abdullah Al-Abbadi", "سارة الحياري": "Sara Al-Hayari", "محمد خالد": "Mohammad Khaled", "لينا المومني": "Lina Al-Momani", "يوسف الشوابكة": "Yousef Al-Shawabkeh", "عمر الزعبي": "Omar Al-Zoubi", "زيد الفايز": "Zaid Al-Fayez", "بهاء بني ارشيد": "Bahaa Bani Irsheid", "هدى النعيمات": "Huda Al-Naimat", "محمد المجالي": "Mohammad Al-Majali", "رائد طه": "Raed Taha", "ريم الخصاونة": "Reem Al-Khasawneh", "سامر العدوان": "Samer Al-Adwan", "محمود الخلايلة": "Mahmoud Al-Khalayleh", "أنس (أمن)": "Anas (Security)", "موظف الخطوط": "Airline Staff", "عامل النظافة": "Cleaner", "مشرف صالة": "Hall Supervisor", "رائد (أمن)": "Raed (Security)", "سامي (خدمات)": "Sami (Services)", "عامل كافتيريا": "Cafeteria Worker", "مسافر": "Passenger", "سائق تكسي": "Taxi Driver", "حارس أمن": "Security Guard",

        "iPhone 17 أبيض": "White iPhone 17", "حقيبة يد سوداء صغيرة": "Small Black Handbag", "سماعات AirPods برو": "AirPods Pro", "لابتوب Dell رمادي": "Grey Dell Laptop", "جواز سفر أردني": "Jordanian Passport", "ساعة ذكية Apple Watch": "Apple Watch", "حقيبة سفر كبيرة لون أزرق": "Large Blue Suitcase", "هاتف سامسونج Galaxy S23": "Samsung Galaxy S23", "نظارة شمس Ray-Ban": "Ray-Ban Sunglasses", "محفظة جلد بني تحتوي على هوية ورخصة ومبلغ مالي": "Brown Leather Wallet with ID, License & Cash", "جهاز iPad فضي": "Silver iPad", "حقيبة ظهر رمادية": "Grey Backpack", "سماعات رأس كبيرة سوداء من نوع Sony": "Sony Black Headphones", "خاتم ذهب بسيط": "Simple Gold Ring", "باور بانك أسود من نوع Anker": "Anker Black Power Bank", "كاميرا Canon احترافية مع عدسة": "Professional Canon Camera", "حقيبة ظهر تحتوي على كتب وجهاز إلكتروني.": "Backpack containing books and an electronic device",

        "تم العثور على هاتف ايفون أبيض حديث": "Modern White iPhone Found", "حقيبة نسائية صغيرة سوداء": "Small Black Women's Bag", "علبة سماعات لاسلكية بيضاء": "White Wireless Earbuds Case", "جهاز لابتوب": "Laptop Device", "وثيقة سفر (Passport)": "Travel Document (Passport)", "ساعة يد ذكية سوداء": "Black Smartwatch", "شنطة سفر زرقاء كبيرة": "Large Blue Suitcase", "هاتف ذكي أسود": "Black Smartphone", "نظارات شمسية داكنة": "Dark Sunglasses", "حقيبة ظهر": "Backpack",

        "عليه كفر شفاف فيه خدوش خفيفة.": "Clear case with minor scratches.", "تحتوي على محفظة وبطاقات بنكية.": "Contains wallet and bank cards.", "داخل علبة بيضاء.": "Inside a white case.", "داخل شنطة سوداء.": "Inside a black bag.", "باسم محمد خالد.": "Under the name Mohammad Khaled.", "سوداء اللون.": "Black colored.", "عليها شريط أحمر.": "Has a red ribbon.", "أسود.": "Black.", "سوداء.": "Black.", "تحتوي على هوية ورخصة.": "Contains ID and license.", "جهاز أيباد.": "iPad device.", "تحتوي على لابتوب وكتب.": "Contains laptop and books.", "سماعات سوني.": "Sony headphones.", "خاتم ذهب.": "Gold ring.", "باور بانك أسود.": "Black power bank.", "كاميرا كانون مع عدسة.": "Canon camera with lens.", "داخل كفر شفاف.": "Inside a clear case.", "تحتوي على بطاقات ومحفظة.": "Contains cards and wallet.", "سماعات لاسلكية.": "Wireless earbuds.", "باسم شخص.": "Under a person's name.", "ساعة ذكية.": "Smartwatch.", "مع شريط ملون.": "With colored ribbon.", "هاتف ذكي أسود.": "Black smartphone.", "نظارة شمس.": "Sunglasses.", "تابلت فضي.": "Silver tablet.", "حقيبة ظهر.": "Backpack.", "محفظة جلد بني.": "Brown Leather Wallet.",

        // إضافات لشاشة المفقودات للمدير
        "تفاصيل المفقود": "Lost Item Details", "اسم الغرض:": "Item Name:", "الفئة:": "Category:", "اللون:": "Color:", "مكان الفقدان:": "Lost Location:", "تاريخ الفقدان:": "Lost Date:", "اسم المُبلِغ:": "Reporter Name:", "رقم هاتف المُبلِغ:": "Reporter Phone:", "الوصف الإضافي:": "Additional Description:", "تعديل حالة المفقود": "Edit Lost Item Status", "حالة البحث والتسليم": "Search & Delivery Status", "حفظ التعديل": "Save Changes", "إلغاء": "Cancel", "إغلاق": "Close", "لا توجد بلاغات مفقودات حالياً.": "No lost reports currently available.", "تصدير إلى Excel": "Export to Excel", "سجل المفقودات الحالي": "Current Lost Records", "إدارة المفقودات": "Lost Items Management", "تتبع عمليات البحث وتسليم الأغراض المفقودة لأصحابها": "Track search operations and delivery of lost items to their owners."
    },
    "ar": {
        "Electronics": "الإلكترونيات", "Personal Items": "متعلقات شخصية", "Official Documents": "الوثائق الرسمية", "Bags & Luggage": "الحقائب والأمتعة",
        "Passport Control": "منطقة الجوازات", "Duty Free": "السوق الحرة", "Gate 14": "بوابة 14", "Waiting Lounge": "قاعة الانتظار",
        "Security Checkpoint": "نقطة التفتيش الأمنية", "Cafeteria": "الكافتيريا", "Gate 32": "بوابة 32", "Gate 10": "بوابة 10", "Gate 5": "بوابة 5",
        "Parking": "مواقف السيارات", "Baggage Claim": "استلام الأمتعة", "Departure Hall": "قاعة المغادرين", "Main Restroom": "الحمام الرئيسي", "ATM": "الصراف الآلي", "VIP Lounge": "قاعة رجال الأعمال", "Inspection Area": "منطقة التفتيش",

        "White": "أبيض", "Black": "أسود", "Grey": "رمادي", "Blue": "أزرق", "Brown": "بني", "Silver": "فضي", "Gold": "ذهبي", "Red": "أحمر",

        "Searching": "جاري البحث", "Stored": "في المستودع", "Delivered": "تم التسليم", "Found": "تم العثور",
        "Security Guard": "موظف أمن", "Luggage Staff": "موظف أمتعة", "Recovery Team": "فريق الاسترجاع", "Storekeeper": "أمين مستودع",
        "Active": "نشط", "Suspended": "مجمد", "Deleted": "محذوف", "active": "نشط", "suspended": "مجمد",

        "Noor Abdullah": "نور عبد الله", "Omar Al-Khateeb": "عمر الخطيب", "Sara Mansour": "سارة منصور", "Tareq Al-Hadid": "طارق الحديد", "Roaa Bani Hani": "رؤى بني هاني", "Abdullah Al-Abbadi": "عبدالله العبادي", "Sara Al-Hayari": "سارة الحياري", "Mohammad Khaled": "محمد خالد", "Lina Al-Momani": "لينا المومني", "Yousef Al-Shawabkeh": "يوسف الشوابكة", "Omar Al-Zoubi": "عمر الزعبي", "Zaid Al-Fayez": "زيد الفايز", "Bahaa Bani Irsheid": "بهاء بني ارشيد", "Huda Al-Naimat": "هدى النعيمات", "Mohammad Al-Majali": "محمد المجالي", "Raed Taha": "رائد طه", "Reem Al-Khasawneh": "ريم الخصاونة", "Samer Al-Adwan": "سامر العدوان", "Mahmoud Al-Khalayleh": "محمود الخلايلة", "Anas (Security)": "أنس (أمن)", "Airline Staff": "موظف الخطوط", "Cleaner": "عامل النظافة", "Hall Supervisor": "مشرف صالة", "Raed (Security)": "رائد (أمن)", "Sami (Services)": "سامي (خدمات)", "Cafeteria Worker": "عامل كافتيريا", "Passenger": "مسافر", "Taxi Driver": "سائق تكسي", "Security Guard": "حارس أمن",

        "White iPhone 17": "iPhone 17 أبيض", "Small Black Handbag": "حقيبة يد سوداء صغيرة", "AirPods Pro": "سماعات AirPods برو", "Grey Dell Laptop": "لابتوب Dell رمادي", "Jordanian Passport": "جواز سفر أردني", "Apple Watch": "ساعة ذكية Apple Watch", "Large Blue Suitcase": "حقيبة سفر كبيرة لون أزرق", "Samsung Galaxy S23": "هاتف سامسونج Galaxy S23", "Ray-Ban Sunglasses": "نظارة شمس Ray-Ban", "Brown Leather Wallet with ID, License & Cash": "محفظة جلد بني تحتوي على هوية ورخصة ومبلغ مالي", "Silver iPad": "جهاز iPad فضي", "Grey Backpack": "حقيبة ظهر رمادية", "Sony Black Headphones": "سماعات رأس كبيرة سوداء من نوع Sony", "Simple Gold Ring": "خاتم ذهب بسيط", "Anker Black Power Bank": "باور بانك أسود من نوع Anker", "Professional Canon Camera": "كاميرا Canon احترافية مع عدسة", "Backpack containing books and an electronic device": "حقيبة ظهر تحتوي على كتب وجهاز إلكتروني.",

        "Modern White iPhone Found": "تم العثور على هاتف ايفون أبيض حديث", "Small Black Women's Bag": "حقيبة نسائية صغيرة سوداء", "White Wireless Earbuds Case": "علبة سماعات لاسلكية بيضاء", "Laptop Device": "جهاز لابتوب", "Travel Document (Passport)": "وثيقة سفر (Passport)", "Black Smartwatch": "ساعة يد ذكية سوداء", "Large Blue Suitcase": "شنطة سفر زرقاء كبيرة", "Black Smartphone": "هاتف ذكي أسود", "Dark Sunglasses": "نظارات شمسية داكنة", "Backpack": "حقيبة ظهر"
    }
};