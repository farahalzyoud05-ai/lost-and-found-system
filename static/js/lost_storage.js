document.addEventListener("DOMContentLoaded", () => {

  const reports = document.querySelectorAll("#reportsContainer .card");

  const locationFilter = document.getElementById("locationFilter");
  const categoryFilter = document.getElementById("categoryFilter");
  const dateFrom = document.getElementById("dateFrom");
  const dateTo = document.getElementById("dateTo");
  const keywordFilter = document.getElementById("keywordFilter");
  const resetBtn = document.getElementById("resetFilters");
  const exportBtn = document.getElementById("exportBtn");
  const exportExcelBtn = document.getElementById("exportExcelBtn");

  const settingsToggle = document.getElementById("settingsToggle");
  const settingsMenu = document.querySelector(".dropdown-menu");
  const darkModeToggle = document.getElementById("themeToggle");
  const langSwitch = document.getElementById("langToggle");

  // ================= FILTER =================
  function applyFilters() {
    reports.forEach(report => {
      const location = report.dataset.location;
      const category = report.dataset.category;
      const date = report.dataset.date;
      const text = report.textContent.toLowerCase();

      let visible = true;

      if (locationFilter.value && location !== locationFilter.value) visible = false;
      if (categoryFilter.value && category !== categoryFilter.value) visible = false;
      if (dateFrom.value && new Date(date) < new Date(dateFrom.value)) visible = false;
      if (dateTo.value && new Date(date) > new Date(dateTo.value)) visible = false;
      if (keywordFilter.value && !text.includes(keywordFilter.value.toLowerCase())) visible = false;

      report.style.display = visible ? "" : "none";
    });
  }

  [locationFilter, categoryFilter, dateFrom, dateTo, keywordFilter]
    .forEach(el => el.addEventListener("input", applyFilters));

  resetBtn.addEventListener("click", () => {
    locationFilter.value = "";
    categoryFilter.value = "";
    dateFrom.value = "";
    dateTo.value = "";
    keywordFilter.value = "";
    applyFilters();
  });

  // ================= DROPDOWN =================
  settingsToggle.addEventListener("click", (e) => {
    e.preventDefault();
    settingsMenu.classList.toggle("show");
  });

  document.addEventListener("click", (e) => {
    if (!settingsToggle.contains(e.target) && !settingsMenu.contains(e.target)) {
      settingsMenu.classList.remove("show");
    }
  });

  // ================= DARK MODE =================
  darkModeToggle.addEventListener("click", (e) => {
    e.preventDefault();
    document.body.classList.toggle("dark-mode");
    updateDarkModeText();
  });

  function updateDarkModeText() {
    const isArabic = document.documentElement.lang === "ar";
    darkModeToggle.textContent =
      document.body.classList.contains("dark-mode")
        ? (isArabic ? "☀️ الوضع الفاتح" : "☀️ Light Mode")
        : (isArabic ? "🌙 الوضع الداكن" : "🌙 Dark Mode");
  }

  // ================= LANGUAGE SWITCH =================
  langSwitch.addEventListener("click", (e) => {
    e.preventDefault();

    const isArabic = document.documentElement.lang === "ar";

    if (!isArabic) {
      switchToArabic();
    } else {
      switchToEnglish();
    }

    updateDarkModeText();
  });

  function switchToArabic() {

    document.documentElement.lang = "ar";
    langSwitch.textContent = "EN";

    document.title = "مخزن المفقودات";
    document.getElementById("headerTitle").textContent = "🏷️ مخزن المفقودات";
    document.getElementById("sidebarTitle").textContent = "لوحة التحكم";

    document.getElementById("navLost").innerHTML = '<i class="fa-solid fa-box"></i> مخزن المفقودات';
    document.getElementById("navFound").innerHTML = '<i class="fa-solid fa-warehouse"></i> مخزن المعثور عليه';
    document.getElementById("navAI").innerHTML = '<i class="fa-solid fa-robot"></i> التطابقات الذكية';
    document.getElementById("navDelivery").innerHTML = '<i class="fa-solid fa-truck"></i> عملية التسليم';
    settingsToggle.textContent = "⚙️ الإعدادات";

    document.getElementById("labelLocation").textContent = " الموقع";
    document.getElementById("labelCategory").textContent = " الفئة";
    document.getElementById("labelDateFrom").textContent = "من تاريخ";
    document.getElementById("labelDateTo").textContent = "إلى تاريخ";
    document.getElementById("labelKeyword").textContent = " كلمة مفتاحية";
    keywordFilter.placeholder = "ابحث...";

    resetBtn.textContent = "إعادة التصفية";
    exportBtn.textContent = "تصدير CSV";
    exportExcelBtn.textContent = "تصدير Excel";

    // Options AR
    const locationMap = {
      "Terminal A": "المبنى A",
      "Lounge": "الاستراحة",
      "Gate 12": "البوابة 12",
      "Storage Room 2": "غرفة التخزين 2"
    };

    const categoryMap = {
      "Bags": "حقائب",
      "Electronics": "إلكترونيات",
      "Documents": "وثائق",
      "Clothes": "ملابس"
    };

    document.getElementById("optLocationAll").textContent = "الكل";
    document.getElementById("optCategoryAll").textContent = "الكل";

    Object.keys(locationMap).forEach(key => {
      const option = [...locationFilter.options].find(o => o.value === key);
      if (option) option.textContent = locationMap[key];
    });

    Object.keys(categoryMap).forEach(key => {
      const option = [...categoryFilter.options].find(o => o.value === key);
      if (option) option.textContent = categoryMap[key];
    });

    reports.forEach(card => {

      card.querySelector(".reportTitle").textContent =
        card.querySelector(".reportTitle").textContent.replace("Lost:", "مفقود:");

      card.querySelector(".lblLocation").textContent = " الموقع:";
      card.querySelector(".valLocation").textContent =
        locationMap[card.dataset.location] || card.dataset.location;

      card.querySelector(".lblCategory").textContent = " الفئة:";
      card.querySelector(".valCategory").textContent =
        categoryMap[card.dataset.category] || card.dataset.category;

      card.querySelector(".lblDate").textContent = " التاريخ:";
      card.querySelector(".valDate").textContent = formatDateArabic(card.dataset.date);

      card.querySelector(".lblDescription").textContent = " الوصف:";
    });
  }

  function switchToEnglish() {

    document.documentElement.lang = "en";
    langSwitch.textContent = "AR";

    document.title = "Lost Storage";
    document.getElementById("headerTitle").textContent = "🏷️ Lost Storage";
    document.getElementById("sidebarTitle").textContent = "Dashboard";

    document.getElementById("navLost").innerHTML = '<i class="fa-solid fa-box"></i> Lost Storage';
    document.getElementById("navFound").innerHTML = '<i class="fa-solid fa-warehouse"></i> Found Storage';
    document.getElementById("navAI").innerHTML = '<i class="fa-solid fa-robot"></i> AI Matches';
    document.getElementById("navDelivery").innerHTML = '<i class="fa-solid fa-truck"></i> Delivery Process';
    settingsToggle.textContent = "⚙️ Settings";

    document.getElementById("labelLocation").textContent = "Location";
    document.getElementById("labelCategory").textContent = "Category";
    document.getElementById("labelDateFrom").textContent = "Date From";
    document.getElementById("labelDateTo").textContent = "Date To";
    document.getElementById("labelKeyword").textContent = "Keyword";
    keywordFilter.placeholder = "Search...";

    resetBtn.textContent = "Reset Filters";
    exportBtn.textContent = "Export CSV";
    exportExcelBtn.textContent = "Export Excel";

    locationFilter.options[0].textContent = "All";
    categoryFilter.options[0].textContent = "All";

    [...locationFilter.options].forEach(option => {
      option.textContent = option.value || "All";
    });

    [...categoryFilter.options].forEach(option => {
      option.textContent = option.value || "All";
    });

    reports.forEach(card => {

      card.querySelector(".reportTitle").textContent =
        card.querySelector(".reportTitle").textContent.replace("مفقود:", "Lost:");

      card.querySelector(".lblLocation").textContent = "Location:";
      card.querySelector(".valLocation").textContent = card.dataset.location;

      card.querySelector(".lblCategory").textContent = "Category:";
      card.querySelector(".valCategory").textContent = card.dataset.category;

      card.querySelector(".lblDate").textContent = "Date:";
      card.querySelector(".valDate").textContent = card.dataset.date;

      card.querySelector(".lblDescription").textContent = "Description:";
    });
  }

  function formatDateArabic(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ar-EG");
  }

});