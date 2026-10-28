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

            // Main Content
            document.querySelector(".login-container h2").textContent = "إدارة الموظفين";
            document.querySelector(".input-group label").textContent = "البريد الإلكتروني للموظف";
            document.getElementById("staffEmail").placeholder = "أدخل بريد الموظف";
            document.getElementById("addStaffBtn").textContent = "➕ إضافة موظف";
            document.getElementById("removeStaffBtn").textContent = "✖ إزالة موظف";

            // Table
            document.querySelector(".table-section h3").textContent = "قائمة الموظفين";
            document.querySelectorAll("table th")[0].textContent = "البريد الإلكتروني";
            document.querySelectorAll("table th")[1].textContent = "الحالة";
            document.querySelectorAll("table th")[2].textContent = "آخر تحديث";
            document.querySelectorAll("table th")[3].textContent = "الإجراء";

            // حالات الموظف
            document.querySelectorAll(".status-active").forEach(el => el.textContent = "نشط");
            document.querySelectorAll(".status-removed").forEach(el => el.textContent = "محذوف");

            // أزرار الجدول
            document.querySelectorAll(".remove-btn").forEach(el => el.textContent = "✖ إزالة");
            document.querySelectorAll(".add-btn").forEach(el => el.textContent = "➕ إضافة");

            // زر المود حسب اللغة
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

            // Main Content
            document.querySelector(".login-container h2").textContent = "Manage Staff";
            document.querySelector(".input-group label").textContent = "Staff Email";
            document.getElementById("staffEmail").placeholder = "Enter staff email";
            document.getElementById("addStaffBtn").textContent = "➕ Add Staff";
            document.getElementById("removeStaffBtn").textContent = "✖ Remove Staff";

            // Table
            document.querySelector(".table-section h3").textContent = "Employees List";
            document.querySelectorAll("table th")[0].textContent = "Email";
            document.querySelectorAll("table th")[1].textContent = "Status";
            document.querySelectorAll("table th")[2].textContent = "Last Update";
            document.querySelectorAll("table th")[3].textContent = "Action";

            // حالات الموظف
            document.querySelectorAll(".status-active").forEach(el => el.textContent = "Active");
            document.querySelectorAll(".status-removed").forEach(el => el.textContent = "Removed");

            // أزرار الجدول
            document.querySelectorAll(".remove-btn").forEach(el => el.textContent = "✖ Remove");
            document.querySelectorAll(".add-btn").forEach(el => el.textContent = "➕ Add");

            // زر المود حسب اللغة
            themeToggle.textContent = body.classList.contains("light-mode") ? "🌙 Dark Mode" : "💡 Light Mode";
        }
    });

    // ===== تبديل الثيم =====
    themeToggle.addEventListener("click", (e) => {
        e.preventDefault();

        if (body.classList.contains("light-mode")) {
            body.classList.remove("light-mode");
            body.classList.add("dark-mode");

            // النص حسب اللغة
            if (body.getAttribute("data-lang") === "ar") {
                themeToggle.textContent = "💡 الوضع الفاتح";
            } else {
                themeToggle.textContent = "💡 Light Mode";
            }
        } else {
            body.classList.remove("dark-mode");
            body.classList.add("light-mode");

            // النص حسب اللغة
            if (body.getAttribute("data-lang") === "ar") {
                themeToggle.textContent = "🌙 الوضع الداكن";
            } else {
                themeToggle.textContent = "🌙 Dark Mode";
            }
        }
    });

    // ===== الأكشن داخل جدول الموظفين =====
    const staffTable = document.getElementById("staffTable");

    staffTable.addEventListener("click", (e) => {
        if (e.target.classList.contains("remove-btn")) {
            const row = e.target.closest("tr");
            const statusCell = row.querySelector("td:nth-child(2)");

            // تبديل الحالة حسب اللغة
            if (body.getAttribute("data-lang") === "ar") {
                statusCell.textContent = "محذوف";
            } else {
                statusCell.textContent = "Removed";
            }
            statusCell.classList.remove("status-active");
            statusCell.classList.add("status-removed");

            // تحديث الزر حسب اللغة
            if (body.getAttribute("data-lang") === "ar") {
                e.target.textContent = "➕ إضافة";
            } else {
                e.target.textContent = "➕ Add";
            }
            e.target.classList.remove("remove-btn");
            e.target.classList.add("add-btn");

            // تحديث الوقت
            row.querySelector("td:nth-child(3)").textContent = new Date().toLocaleString();

        } else if (e.target.classList.contains("add-btn")) {
            const row = e.target.closest("tr");
            const statusCell = row.querySelector("td:nth-child(2)");

            // تبديل الحالة حسب اللغة
            if (body.getAttribute("data-lang") === "ar") {
                statusCell.textContent = "نشط";
            } else {
                statusCell.textContent = "Active";
            }
            statusCell.classList.remove("status-removed");
            statusCell.classList.add("status-active");

            // تحديث الزر حسب اللغة
            if (body.getAttribute("data-lang") === "ar") {
                e.target.textContent = "✖ إزالة";
            } else {
                e.target.textContent = "✖ Remove";
            }
            e.target.classList.remove("add-btn");
            e.target.classList.add("remove-btn");

            // تحديث الوقت
            row.querySelector("td:nth-child(3)").textContent = new Date().toLocaleString();
        }
    });
}); 