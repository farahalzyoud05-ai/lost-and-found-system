document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    const rows = document.querySelectorAll("#foundReportsTable tr");
    const langToggle = document.getElementById("langToggle");
    const themeToggle = document.getElementById("themeToggle");
    const body = document.body;

    // افتراضياً Light Mode + لغة إنجليزية
    body.classList.add("light-mode");
    body.setAttribute("data-lang", "en");
    themeToggle.textContent = "🌙 Dark Mode";

    // فلتر البحث
    searchInput.addEventListener("keyup", () => {
        const filter = searchInput.value.toLowerCase();
        rows.forEach(row => {
            row.style.display = row.textContent.toLowerCase().includes(filter) ? "" : "none";
        });
    });

    // تبديل اللغة
    langToggle.addEventListener("click", (e) => {
        e.preventDefault();

        if (body.getAttribute("data-lang") === "en") {
            body.setAttribute("data-lang", "ar");
            langToggle.textContent = "🌐 EN";

            // ترجمة النصوص للعربية
            document.querySelector(".sidebar h2").textContent = "المفقودات والمعثورات";
            document.querySelectorAll(".sidebar ul li a")[0].textContent = "لوحة التحكم";
            document.querySelectorAll(".sidebar ul li a")[1].textContent = "بلاغات المفقودات";
            document.querySelectorAll(".sidebar ul li a")[2].textContent = "بلاغات المعثورات";
            document.querySelectorAll(".sidebar ul li a")[3].textContent = "الموظفون";
            document.querySelectorAll(".sidebar ul li a")[4].textContent = "المطابقات";
            document.querySelector(".dropdown-toggle").textContent = "⚙️ الإعدادات";

            document.getElementById("pageTitle").textContent = "بلاغات المعثورات (للمسؤول)";
            document.getElementById("tableTitle").textContent = "كل البلاغات المعثورة";
            searchInput.placeholder = "ابحث في البلاغات...";

            document.getElementById("thId").textContent = "المعرف";
            document.getElementById("thItem").textContent = "الغرض";
            document.getElementById("thCategory").textContent = "الفئة";
            document.getElementById("thStatus").textContent = "الحالة";
            document.getElementById("thDate").textContent = "التاريخ";
            document.getElementById("thFinder").textContent = "المُعثر";
            document.getElementById("thContact").textContent = "التواصل";

            rows.forEach(row => {
                const cells = row.querySelectorAll("td");
                if (cells[2].textContent === "Bags") cells[2].textContent = "حقائب";
                if (cells[2].textContent === "Electronics") cells[2].textContent = "إلكترونيات";
                if (cells[2].textContent === "Documents") cells[2].textContent = "وثائق";

                if (cells[3].textContent === "Pending") cells[3].textContent = "قيد المراجعة";
                if (cells[3].textContent === "Verified") cells[3].textContent = "تم التحقق";
                if (cells[3].textContent === "Closed") cells[3].textContent = "مغلق";
            });

            themeToggle.textContent = body.classList.contains("light-mode") ? "🌙 الوضع الداكن" : "💡 الوضع الفاتح";

        } else {
            body.setAttribute("data-lang", "en");
            langToggle.textContent = "🌐 AR";

            // ترجمة النصوص للإنجليزية
            document.querySelector(".sidebar h2").textContent = "Lost & Found";
            document.querySelectorAll(".sidebar ul li a")[0].textContent = "Dashboard";
            document.querySelectorAll(".sidebar ul li a")[1].textContent = "Lost Reports";
            document.querySelectorAll(".sidebar ul li a")[2].textContent = "Found Reports";
            document.querySelectorAll(".sidebar ul li a")[3].textContent = "Staff";
            document.querySelectorAll(".sidebar ul li a")[4].textContent = "Matches";
            document.querySelector(".dropdown-toggle").textContent = "⚙️ Settings";

            document.getElementById("pageTitle").textContent = "Found Reports (Admin)";
            document.getElementById("tableTitle").textContent = "All Found Reports";
            searchInput.placeholder = "Search found reports...";

            document.getElementById("thId").textContent = "ID";
            document.getElementById("thItem").textContent = "Item";
            document.getElementById("thCategory").textContent = "Category";
            document.getElementById("thStatus").textContent = "Status";
            document.getElementById("thDate").textContent = "Date";
            document.getElementById("thFinder").textContent = "Finder";
            document.getElementById("thContact").textContent = "Contact";

            rows.forEach(row => {
                const cells = row.querySelectorAll("td");
                if (cells[2].textContent === "حقائب") cells[2].textContent = "Bags";
                if (cells[2].textContent === "إلكترونيات") cells[2].textContent = "Electronics";
                if (cells[2].textContent === "وثائق") cells[2].textContent = "Documents";

                if (cells[3].textContent === "قيد المراجعة") cells[3].textContent = "Pending";
                if (cells[3].textContent === "تم التحقق") cells[3].textContent = "Verified";
                if (cells[3].textContent === "مغلق") cells[3].textContent = "Closed";
            });

            themeToggle.textContent = body.classList.contains("light-mode") ? "🌙 Dark Mode" : "💡 Light Mode";
        }
    });

    // ===== تبديل الثيم =====
    themeToggle.addEventListener("click", (e) => {
        e.preventDefault();

        if (body.classList.contains("light-mode")) {
            body.classList.remove("light-mode");
            body.classList.add("dark-mode");

            themeToggle.textContent = body.getAttribute("data-lang") === "ar" ? "💡 الوضع الفاتح" : "💡 Light Mode";
        } else {
            body.classList.remove("dark-mode");
            body.classList.add("light-mode");

            themeToggle.textContent = body.getAttribute("data-lang") === "ar" 
                ? "🌙 الوضع الداكن" 
                : "🌙 Dark Mode";
        }
    });

    // ===== فتح/إغلاق قائمة الإعدادات =====
    const dropdownToggle = document.querySelector(".dropdown-toggle");
    const dropdownMenu = document.querySelector(".dropdown-menu");

    dropdownToggle.addEventListener("click", (e) => {
        e.preventDefault();
        dropdownMenu.classList.toggle("show");
    });
});