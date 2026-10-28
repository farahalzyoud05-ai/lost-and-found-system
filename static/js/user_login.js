document.addEventListener("DOMContentLoaded", () => {
  const settingsDropdown = document.getElementById("settingsDropdown");
  const settingsMenu = document.getElementById("settingsMenu");
  const langSwitch = document.getElementById("langSwitch");
  const darkModeBtn = document.getElementById("darkMode");

  
  
  settingsDropdown.addEventListener("click", (e) => {
    e.preventDefault();
    settingsMenu.classList.toggle("show");
  });

  langSwitch.addEventListener("click", (e) => {
    e.preventDefault();
    if (langSwitch.textContent.trim() === "AR") {
      document.documentElement.lang = "ar";
      langSwitch.textContent = "EN";

      // Navbar
      document.querySelectorAll(".nav-link").forEach(link => {
        if (link.textContent.trim() === "Home") link.textContent = "الرئيسية";
        if (link.textContent.trim() === "Log Out") link.textContent = "تسجيل خروج";
        if (link.textContent.trim() === "Setting") link.textContent = "الإعدادات";
        if (link.textContent.trim() === "Login") link.textContent = "تسجيل دخول";
      });
     

      // Hero
      document.querySelector(".portal-title").innerHTML = '<i class="fa-solid fa-location-dot"></i> البوابة الرسمية للمفقودات';
      document.querySelector(".hero-content h2").innerHTML = 'هل فقدت شيئاً؟ <span class="highlight">نحن هنا لمساعدتك.</span>';
      document.querySelector(".hero-content p").textContent = "تتبع واسترجع المقتنيات المفقودة في مطار سكاي بورت الدولي. فريقنا المتخصص يعالج آلاف المقتنيات يومياً لإعادتها إلى أصحابها.";
      document.querySelector(".btn-lost").innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> الإبلاغ عن مفقود';
      document.querySelector(".btn-found").innerHTML = '<i class="fa-solid fa-plus"></i> الإبلاغ عن لُقيَة';

      // Filters
      document.querySelector(".latest-reports h3").innerHTML = '<i class="fa-solid fa-clock-rotate-left me-2"></i> أحدث البلاغات';
      document.querySelector("label[for='typeFilter']").innerHTML = '<i class="fa-solid fa-list me-1"></i> النوع';
      document.querySelector("label[for='locationFilter']").innerHTML = '<i class="fa-solid fa-location-dot me-1"></i> الموقع';
      document.querySelector("label[for='categoryFilter']").innerHTML = '<i class="fa-solid fa-tags me-1"></i> الفئة';
      document.querySelector("label[for='dateFrom']").innerHTML = '<i class="fa-solid fa-calendar me-1"></i> من تاريخ';
      document.querySelector("label[for='dateTo']").innerHTML = '<i class="fa-solid fa-calendar me-1"></i> إلى تاريخ';
      document.querySelector("label[for='keywordFilter']").innerHTML = '<i class="fa-solid fa-search me-1"></i> كلمة مفتاحية';
      document.getElementById("resetFilters").innerHTML = '<i class="fa-solid fa-rotate-left"></i> إعادة التصفية';

      document.querySelector("#typeFilter").innerHTML = `
        <option value="">الكل</option>
        <option value="Lost">مفقود</option>
        <option value="Found">لُقيَة</option>
      `;
      document.querySelector("#locationFilter").innerHTML = `
        <option value="">الكل</option>
        <option value="Terminal A">المبنى A</option>
        <option value="Lounge">الصالة</option>
        <option value="Gate 12">البوابة 12</option>
      `;
      document.querySelector("#categoryFilter").innerHTML = `
        <option value="">الكل</option>
        <option value="Bags">حقائب</option>
        <option value="Electronics">إلكترونيات</option>
        <option value="Documents">وثائق</option>
      `;

      // Reports Arabic
      document.querySelectorAll(".report-card-wrapper").forEach(card => {
        const type = card.dataset.type;
        const category = card.dataset.category;
        const location = card.dataset.location;
        const date = card.dataset.date;

        card.querySelector(".report-title").textContent = (type === "Lost" ? "مفقود: " : "لُقيَة: ") + translateCategory(category);
        card.querySelector(".report-date").innerHTML = '<i class="fa-solid fa-calendar me-2"></i> ' + formatDateArabic(date);
        card.querySelector(".report-location").innerHTML = '<i class="fa-solid fa-location-dot me-2"></i> ' + translateLocation(location);
        card.querySelector(".report-category").innerHTML = '<i class="fa-solid fa-tags me-2"></i> الفئة: ' + translateCategory(category);
      });

      // Footer Arabic
      document.querySelector(".footer-title").textContent = "نظام المفقودات";
      document.querySelector(".footer-desc").textContent = "نظام آمن ومنظم لإدارة المفقودات بكفاءة.";
      document.querySelector(".footer-links-title").textContent = "روابط سريعة";
      document.querySelectorAll(".footer-links li a")[0].textContent = "الرئيسية";
      document.querySelectorAll(".footer-links li a")[1].textContent = "إبلاغ عن مفقود";
      document.querySelectorAll(".footer-links li a")[2].textContent = "إبلاغ عن لُقيَة";
      document.querySelectorAll(".footer-links li a")[3].textContent = "اتصل بنا";
      document.querySelector(".footer-contact-title").textContent = "تواصل معنا";
      document.querySelector(".footer-copy").textContent = "© 2026 نظام إدارة المفقودات. جميع الحقوق محفوظة.";

    } else {
      document.documentElement.lang = "en";
      langSwitch.textContent = "AR";

      // Navbar
      document.querySelectorAll(".nav-link").forEach(link => {
        if (link.textContent.trim() === "الرئيسية") link.textContent = "Home";
        if (link.textContent.trim() === "تسجيل خروج") link.textContent = "Log Out";
        if (link.textContent.trim() === "الإعدادات") link.textContent = "Setting";
        if (link.textContent.trim() === "تسجيل دخول") link.textContent = "Login";
      });

      // Hero
      document.querySelector(".portal-title").innerHTML = '<i class="fa-solid fa-location-dot"></i> OFFICIAL LOST & FOUND PORTAL';
      document.querySelector(".hero-content h2").innerHTML = 'Lost Something? <span class="highlight">We\'re Here to Help.</span>';
      document.querySelector(".hero-content p").textContent = "Track and recover items lost at SkyPort International. Our dedicated recovery team processes thousands of items daily to reunite them with their owners.";
      document.querySelector(".btn-lost").innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Report Lost Item';
      document.querySelector(".btn-found").innerHTML = '<i class="fa-solid fa-plus"></i> Report Found Item';

      // Filters English
      document.querySelector(".latest-reports h3").innerHTML = '<i class="fa-solid fa-clock-rotate-left me-2"></i> Latest Reports';
      document.querySelector("label[for='typeFilter']").innerHTML = '<i class="fa-solid fa-list me-1"></i> Type';
      document.querySelector("label[for='locationFilter']").innerHTML = '<i class="fa-solid fa-location-dot me-1"></i> Location';
      document.querySelector("label[for='categoryFilter']").innerHTML = '<i class="fa-solid fa-tags me-1"></i> Category';
      document.querySelector("label[for='dateFrom']").innerHTML = '<i class="fa-solid fa-calendar me-1"></i> Date From';
      document.querySelector("label[for='dateTo']").innerHTML = '<i class="fa-solid fa-calendar me-1"></i> Date To';
      document.querySelector("label[for='keywordFilter']").innerHTML = '<i class="fa-solid fa-search me-1"></i> Keyword';
      document.getElementById("resetFilters").innerHTML = '<i class="fa-solid fa-rotate-left"></i> Reset Filters';

      document.querySelector("#typeFilter").innerHTML = `
        <option value="">All</option>
        <option value="Lost">Lost</option>
        <option value="Found">Found</option>
      `;
      document.querySelector("#locationFilter").innerHTML = `
      <option value="">All</option>
      <option value="Terminal A">Terminal A</option>
      <option value="Lounge">Lounge</option>
      <option value="Gate 12">Gate 12</option>
    `;
    document.querySelector("#categoryFilter").innerHTML = `
      <option value="">All</option>
      <option value="Bags">Bags</option>
      <option value="Electronics">Electronics</option>
      <option value="Documents">Documents</option>
    `;

    // Reports English
    document.querySelectorAll(".report-card-wrapper").forEach(card => {
      const type = card.dataset.type;
      const category = card.dataset.category;
      const location = card.dataset.location;
      const date = card.dataset.date;

      card.querySelector(".report-title").textContent = (type === "Lost" ? "Lost Item: " : "Found Item: ") + category;
      card.querySelector(".report-date").innerHTML = '<i class="fa-solid fa-calendar me-2"></i> ' + formatDateEnglish(date);
      card.querySelector(".report-location").innerHTML = '<i class="fa-solid fa-location-dot me-2"></i> SkyPort ' + location;
      card.querySelector(".report-category").innerHTML = '<i class="fa-solid fa-tags me-2"></i> Category: ' + category;
    });

    // Footer English
    document.querySelector(".footer-title").textContent = "Lost & Found";
    document.querySelector(".footer-desc").textContent = "A secure and organized system to manage lost and found items efficiently.";
    document.querySelector(".footer-links-title").textContent = "Quick Links";
    document.querySelectorAll(".footer-links li a")[0].textContent = "Home";
    document.querySelectorAll(".footer-links li a")[1].textContent = "Report Lost";
    document.querySelectorAll(".footer-links li a")[2].textContent = "Report Found";
    document.querySelectorAll(".footer-links li a")[3].textContent = "Contact";
    document.querySelector(".footer-contact-title").textContent = "Contact";
    document.querySelector(".footer-copy").textContent = "© 2026 Lost & Found Management System. All rights reserved.";
  }
});

// ===== Dark Mode Switch =====
darkModeBtn.addEventListener("click", (e) => {
  e.preventDefault();
  document.body.classList.toggle("dark-mode");

  if (document.body.classList.contains("dark-mode")) {
    darkModeBtn.innerHTML = '<i class="fa-solid fa-sun me-2"></i> Light Mode';
  } else {
    darkModeBtn.innerHTML = '<i class="fa-solid fa-moon me-2"></i> Dark Mode';
  }
});

// ===== Helper Functions =====
function translateCategory(cat) {
  switch(cat) {
    case "Bags": return "حقائب";
    case "Electronics": return "إلكترونيات";
    case "Documents": return "وثائق";
    default: return cat;
  }
}

function translateLocation(loc) {
  switch(loc) {
    case "Terminal A": return "المبنى A";
    case "Lounge": return "الصالة";
    case "Gate 12": return "البوابة 12";
    default: return loc;
  }
}

function formatDateArabic(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
}

function formatDateEnglish(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
});