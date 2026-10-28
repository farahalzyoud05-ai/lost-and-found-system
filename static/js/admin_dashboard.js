document.addEventListener("DOMContentLoaded", () => {
    const dropdownToggle = document.querySelector(".dropdown-toggle");
    const dropdownMenu = document.querySelector(".dropdown-menu");
    const langToggle = document.getElementById("langToggle");
    const themeToggle = document.getElementById("themeToggle");
    const body = document.body;

    // افتراضياً الصفحة Light Mode والزر يظهر Dark Mode
    body.classList.add("light-mode");
    themeToggle.textContent = body.getAttribute("data-lang") === "ar" ? "🌙 الوضع الداكن" : "🌙 Dark Mode";

    // فتح/إغلاق القائمة
    dropdownToggle.addEventListener("click", (e) => {
        e.preventDefault();
        dropdownMenu.classList.toggle("show");
    });

    document.addEventListener("click", (e) => {
        if (!dropdownToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.remove("show");
        }
    });

    // ===== الرسوم البيانية =====
    const ctx1 = document.getElementById('categoryChart');
    const categoryChart = new Chart(ctx1, {
        type: 'pie',
        data: {
            labels: ['Bags', 'Electronics', 'Documents'],
            datasets: [{
                data: [40, 30, 30],
                backgroundColor: ['#283F55', '#E57D29', '#93A489']
            }]
        }
    });

    const ctx2 = document.getElementById('reportsChart');
    const reportsChart = new Chart(ctx2, {
        type: 'line',
        data: {
            labels: ['Feb 8', 'Feb 9', 'Feb 10', 'Feb 11', 'Feb 12'],
            datasets: [{
                label: 'Reports',
                data: [5, 8, 12, 7, 10],
                borderColor: '#283F55',
                fill: false
            }]
        }
    });

    // ===== فلتر البحث =====
    document.getElementById('searchInput').addEventListener('keyup', function() {
        const filter = this.value.toLowerCase();
        const rows = document.querySelectorAll('#reportTable tr');
        rows.forEach(row => {
            row.style.display = row.textContent.toLowerCase().includes(filter) ? '' : 'none';
        });
    });

    // ===== تصدير (Demo) =====
    window.exportReports = function() {
        alert("Reports exported successfully!");
    };

    // ===== تبديل اللغة =====
    langToggle.addEventListener("click", (e) => {
        e.preventDefault();

        if (body.getAttribute("data-lang") === "en") {
            body.setAttribute("data-lang", "ar");
            langToggle.textContent = "🌐 EN";

            // Sidebar
            document.querySelector(".sidebar h2").textContent = "المفقودات والمعثورات";
            document.querySelectorAll(".sidebar ul li a")[0].textContent = "لوحة التحكم";
            document.querySelectorAll(".sidebar ul li a")[1].textContent = "بلاغات المفقودات";
            document.querySelectorAll(".sidebar ul li a")[2].textContent = "بلاغات المعثورات";
            document.querySelectorAll(".sidebar ul li a")[3].textContent = "الموظفون";
            document.querySelectorAll(".sidebar ul li a")[4].textContent = "المطابقات";
            dropdownToggle.textContent = "⚙️ الإعدادات";

            // Header
            document.querySelector("header h2").textContent = "لوحة الإدارة";

            // Cards
            document.querySelectorAll(".card")[0].innerHTML = "بلاغات المفقودات <h3>120</h3>";
            document.querySelectorAll(".card")[1].innerHTML = "بلاغات المعثورات <h3>95</h3>";
            document.querySelectorAll(".card")[2].innerHTML = "المطابقات <h3>45</h3>";
            document.querySelectorAll(".card")[3].innerHTML = "التسليمات <h3>30</h3>";

            // Table
            document.querySelector(".table-section h3").textContent = "البلاغات الأخيرة";
            document.getElementById("searchInput").placeholder = "ابحث في البلاغات...";
            document.querySelectorAll("table th")[0].textContent = "المعرف";
            document.querySelectorAll("table th")[1].textContent = "الغرض";
            document.querySelectorAll("table th")[2].textContent = "الفئة";
            document.querySelectorAll("table th")[3].textContent = "الحالة";
            document.querySelectorAll("table th")[4].textContent = "التاريخ";

            // ترجمة الصفوف داخل الجدول
            const rows = document.querySelectorAll("#reportTable tr");
            rows.forEach(row => {
                const cells = row.querySelectorAll("td");
                if (cells[2].textContent === "Bags") cells[2].textContent = "حقائب";
                if (cells[2].textContent === "Electronics") cells[2].textContent = "إلكترونيات";
                if (cells[2].textContent === "Documents") cells[2].textContent = "وثائق";

                if (cells[3].textContent === "Lost") cells[3].textContent = "مفقود";
                if (cells[3].textContent === "Found") cells[3].textContent = "معثور عليه";
            });

            // Export
            document.querySelector(".export button").textContent = "تصدير البلاغات (PDF)";

            // Charts labels
            categoryChart.data.labels = ['حقائب', 'إلكترونيات', 'وثائق'];
            reportsChart.data.datasets[0].label = "البلاغات";
            reportsChart.data.labels = ['8 فبراير', '9 فبراير', '10 فبراير', '11 فبراير', '12 فبراير'];
            categoryChart.update();
            reportsChart.update();

            // زر المود
            themeToggle.textContent = body.classList.contains("light-mode") ? "🌙 الوضع الداكن" : "💡 الوضع الفاتح";

        } else {
            body.setAttribute("data-lang", "en");
            langToggle.textContent = "🌐 AR";

            // Sidebar
            document.querySelector(".sidebar h2").textContent = "Lost & Found";
            document.querySelectorAll(".sidebar ul li a")[0].textContent = "Dashboard";
            document.querySelectorAll(".sidebar ul li a")[1].textContent = "Lost Reports";
            document.querySelectorAll(".sidebar ul li a")[2].textContent = "Found Reports";
            document.querySelectorAll(".sidebar ul li a")[3].textContent = "Staff";
            document.querySelectorAll(".sidebar ul li a")[4].textContent = "Matches";
            dropdownToggle.textContent = "⚙️ Settings";

            // Header
            document.querySelector("header h2").textContent = "Admin Dashboard";

            // Cards
            document.querySelectorAll(".card")[0].innerHTML = "Lost Reports <h3>120</h3>";
            document.querySelectorAll(".card")[1].innerHTML = "Found Reports <h3>95</h3>";
            document.querySelectorAll(".card")[2].innerHTML = "Matches <h3>45</h3>";
            document.querySelectorAll(".card")[3].innerHTML = "Handovers <h3>30</h3>";

            // Table
            document.querySelector(".table-section h3").textContent = "Recent Reports";
            document.getElementById("searchInput").placeholder = "Search reports...";
            document.querySelectorAll("table th")[0].textContent = "ID";
            document.querySelectorAll("table th")[1].textContent = "Item";
            document.querySelectorAll("table th")[2].textContent = "Category";
            document.querySelectorAll("table th")[3].textContent = "Status";
            document.querySelectorAll("table th")[4].textContent = "Date";

            // ترجمة الصفوف داخل الجدول للإنجليزية
            const rows = document.querySelectorAll("#reportTable tr");
            rows.forEach(row => {
                const cells = row.querySelectorAll("td");
                if (cells[2].textContent === "حقائب") cells[2].textContent = "Bags";
                if (cells[2].textContent === "إلكترونيات") cells[2].textContent = "Electronics";
                if (cells[2].textContent === "وثائق") cells[2].textContent = "Documents";

                if (cells[3].textContent === "مفقود") cells[3].textContent = "Lost";
                if (cells[3].textContent === "معثور عليه") cells[3].textContent = "Found";
            });

            // Export
            document.querySelector(".export button").textContent = "Export Reports (PDF)";

            // Charts labels
            categoryChart.data.labels = ['Bags', 'Electronics', 'Documents'];
            reportsChart.data.datasets[0].label = "Reports";
            reportsChart.data.labels = ['Feb 8', 'Feb 9', 'Feb 10', 'Feb 11', 'Feb 12'];
            categoryChart.update();
            reportsChart.update();

            // زر المود
            themeToggle.textContent = body.classList.contains("light-mode") ? "🌙 Dark Mode" : "💡 Light Mode";
        }
    });

    // ===== تبديل الثيم =====
    themeToggle.addEventListener("click", (e) => {
        e.preventDefault();

        if (body.classList.contains("light-mode")) {
            body.classList.remove("light-mode");
            body.classList.add("dark-mode");

            if (body.getAttribute("data-lang") === "ar") {
                themeToggle.textContent = "💡 الوضع الفاتح";
            } else {
                themeToggle.textContent = "💡 Light Mode";
            }
        } else {
            body.classList.remove("dark-mode");
            body.classList.add("light-mode");

            if (body.getAttribute("data-lang") === "ar") {
                themeToggle.textContent = "🌙 الوضع الداكن";
            } else {
                themeToggle.textContent = "🌙 Dark Mode";
            }
        }
    });
});