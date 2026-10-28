document.addEventListener("DOMContentLoaded", () => {
  const reports = Array.from(document.querySelectorAll("#reportsContainer .card"));

  const locationFilter = document.getElementById("locationFilter");
  const categoryFilter = document.getElementById("categoryFilter");
  const dateFrom = document.getElementById("dateFrom");
  const dateTo = document.getElementById("dateTo");
  const keywordFilter = document.getElementById("keywordFilter");
  const resetBtn = document.getElementById("resetFilters");

  const exportCSVBtn = document.getElementById("exportBtn");
  const exportExcelBtn = document.getElementById("exportExcelBtn");

  const langToggle = document.getElementById("langToggle");
  const themeToggle = document.getElementById("themeToggle");
  const settingsToggle = document.getElementById("settingsToggle");
  const settingsMenu = document.getElementById("settingsMenu");

  // ------------------ فلترة التقارير ------------------
  function filterReports() {
    const locationValue = locationFilter.value.toLowerCase();
    const categoryValue = categoryFilter.value.toLowerCase();
    const fromDate = dateFrom.value ? new Date(dateFrom.value) : null;
    const toDate = dateTo.value ? new Date(dateTo.value) : null;
    const keywordValue = keywordFilter.value.toLowerCase();

    reports.forEach(report => {
      const reportLocation = report.dataset.location.toLowerCase();
      const reportCategory = report.dataset.category.toLowerCase();
      const reportDate = new Date(report.dataset.date);
      const reportText = report.textContent.toLowerCase();

      let visible = true;
      if (locationValue && reportLocation !== locationValue) visible = false;
      if (categoryValue && reportCategory !== categoryValue) visible = false;
      if (fromDate && reportDate < fromDate) visible = false;
      if (toDate && reportDate > toDate) visible = false;
      if (keywordValue && !reportText.includes(keywordValue)) visible = false;

      report.style.display = visible ? "" : "none";
    });
  }

  [locationFilter, categoryFilter, dateFrom, dateTo, keywordFilter].forEach(input => {
    input.addEventListener("input", filterReports);
    input.addEventListener("change", filterReports);
  });

  resetBtn.addEventListener("click", () => {
    locationFilter.value = "";
    categoryFilter.value = "";
    dateFrom.value = "";
    dateTo.value = "";
    keywordFilter.value = "";
    filterReports();
  });

  filterReports();

  // ------------------ تصدير CSV ------------------
  function downloadCSV() {
    const visibleReports = reports.filter(r => r.style.display !== "none");
    let csvContent = "data:text/csv;charset=utf-8,Title,Location,Category,Date,Description\n";

    visibleReports.forEach(r => {
      const title = r.querySelector("h5")?.textContent || "";
      const location = r.dataset.location;
      const category = r.dataset.category;
      const date = r.dataset.date;
      const desc = r.querySelector("p:last-of-type")?.textContent.replace(/,/g, " ") || "";
      csvContent += `${title},${location},${category},${date},${desc}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "found_reports.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  exportCSVBtn.addEventListener("click", downloadCSV);

  // ------------------ تصدير Excel ------------------
  function downloadExcel() {
    const visibleReports = reports.filter(r => r.style.display !== "none");
    const data = visibleReports.map(r => ({
      Title: r.querySelector("h5")?.textContent || "",
      Location: r.dataset.location,
      Category: r.dataset.category,
      Date: r.dataset.date,
      Description: r.querySelector("p:last-of-type")?.textContent || ""
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Found Reports");
    XLSX.writeFile(wb, "found_reports.xlsx");
  }

  exportExcelBtn.addEventListener("click", downloadExcel);

  // ------------------ Language Toggle ------------------
  const translations = {
    ar: {
      "Dashboard": "لوحة التحكم",
      "Lost Storage": "الموجودات",
      "Found Storage": "المفقودات",
      "AI Matches": "مطابقة الذكاء الاصطناعي",
      "Delivery Process": "عملية التوصيل",
      "Settings": "الإعدادات",
      "Location": "الموقع",
      "Category": "الفئة",
      "Date From": "من تاريخ",
      "Date To": "إلى تاريخ",
      "Keyword": "كلمة البحث",
      "Reset Filters": "إعادة ضبط الفلاتر",
      "Export CSV": "تصدير CSV",
      "Export Excel": "تصدير Excel",
      "Found: Laptop": "تم العثور: لابتوب",
      "Found: Jacket": "تم العثور: جاكيت",
      "Storage Room 1": "المخزن 1",
      "Lounge": "الصالة",
      "Electronics": "إلكترونيات",
      "Clothes": "ملابس",
      "Date": "التاريخ",
      "Description": "الوصف",
      "Silver Dell laptop with charger.": "لابتوب ديل فضي مع الشاحن.",
      "Black leather jacket, size M.": "جاكيت جلد أسود، مقاس M."
    },
    en: {}
  };

  let currentLang = "en";
  langToggle.addEventListener("click", () => {
    currentLang = currentLang === "en" ? "ar" : "en";
    document.documentElement.lang = currentLang;
    document.body.dir = currentLang === "ar" ? "rtl" : "ltr";
    langToggle.textContent = currentLang === "ar" ? "EN" : "AR";

    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (currentLang === "ar" && translations.ar[key]) {
        el.textContent = translations.ar[key];
      } else {
        el.textContent = key;
      }
    });
  });

  // ------------------ Theme Toggle ------------------
  let darkMode = false;
  themeToggle.addEventListener("click", () => {
    darkMode = !darkMode;
    if (darkMode) {
      document.body.classList.add("dark-mode");
      themeToggle.textContent = "☀️ Light Mode";
    } else {
      document.body.classList.remove("dark-mode");
      themeToggle.textContent = "🌙 Dark Mode";
    }
  });

  // ------------------ Settings Dropdown ------------------
  settingsToggle.addEventListener("click", (e) => {
    e.preventDefault();
    settingsMenu.classList.toggle("show");
  });

  document.addEventListener("click", (e) => {
    if (!settingsToggle.contains(e.target) && !settingsMenu.contains(e.target)) {
      settingsMenu.classList.remove("show");
    }
  });
});