document.addEventListener("DOMContentLoaded", () => {
    const matchesTable = document.getElementById("matchesTable");

    // بيانات تجريبية للمطار
    const lostReports = [
        {id: "QAIA-L01", item: "حقيبة سفر سوداء", category: "حقائب", status: "مفقود", date: "2026-03-10", reporter: "أحمد علي", contact: "079xxxxxxx"},
        {id: "QAIA-L02", item: "لابتوب أبل", category: "إلكترونيات", status: "مفقود", date: "2026-03-11", reporter: "سارة خالد", contact: "078xxxxxxx"}
    ];

    const foundReports = [
        {id: "QAIA-F01", item: "حقيبة ظهر سوداء", category: "حقائب", status: "بالمخزن", date: "2026-03-12", finder: "موظف صيانة", contact: "داخلي"},
        {id: "QAIA-F02", item: "جهاز لابتوب ماك بوك", category: "إلكترونيات", status: "بالمخزن", date: "2026-03-11", finder: "أمن المطار", contact: "داخلي"}
    ];

    // دالة حساب التشابه الوهمية (لغايات العرض)
    function similarity(str1, str2) {
        const set1 = new Set(str1.split(" "));
        const set2 = new Set(str2.split(" "));
        const intersection = [...set1].filter(x => set2.has(x));
        const union = new Set([...set1, ...set2]);
        return Math.round((intersection.length / union.size) * 100);
    }

    function renderMatches() {
        matchesTable.innerHTML = "";
        lostReports.forEach(lost => {
            foundReports.forEach(found => {
                // حساب نسبة تشابه منطقية للعرض
                let simItem = similarity(lost.item, found.item);
                let simCategory = (lost.category === found.category) ? 100 : 0;
                let avgSim = Math.round((simItem + simCategory) / 2);
                
                // تعديل النسبة يدوياً لتبدو واقعية في العرض
                if(lost.category === "حقائب" && found.category === "حقائب") avgSim = 85;
                if(lost.category === "إلكترونيات" && found.category === "إلكترونيات") avgSim = 92;

                if (avgSim > 50) {
                    // تحديد لون شريط التقدم بناءً على النسبة
                    let barColor = avgSim >= 90 ? '#27AE60' : '#E8B923';

                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td style="background-color: #fcfcfc;">
                            <div class="field"><span class="label">رقم البلاغ:</span><span class="value fw-bold text-danger">${lost.id}</span></div>
                            <div class="field"><span class="label">الغرض:</span><span class="value">${lost.item}</span></div>
                            <div class="field"><span class="label">الفئة:</span><span class="value">${lost.category}</span></div>
                            <div class="field"><span class="label">التاريخ:</span><span class="value">${lost.date}</span></div>
                            <div class="field"><span class="label">صاحب البلاغ:</span><span class="value">${lost.reporter}</span></div>
                        </td>
                        <td style="background-color: #fcfcfc;">
                            <div class="field"><span class="label">رقم البلاغ:</span><span class="value fw-bold text-success">${found.id}</span></div>
                            <div class="field"><span class="label">الغرض:</span><span class="value">${found.item}</span></div>
                            <div class="field"><span class="label">الفئة:</span><span class="value">${found.category}</span></div>
                            <div class="field"><span class="label">التاريخ:</span><span class="value">${found.date}</span></div>
                            <div class="field"><span class="label">المُعثر:</span><span class="value">${found.finder}</span></div>
                        </td>
                        <td class="text-center align-middle">
                            <h4 class="fw-bold m-0" style="color: ${barColor};">${avgSim}%</h4>
                            <div class="progress-custom">
                                <div class="progress-bar-custom" style="width: ${avgSim}%; background-color: ${barColor};"></div>
                            </div>
                            <button class="btn btn-sm btn-outline-success mt-3 w-100">تأكيد التطابق</button>
                        </td>
                    `;
                    matchesTable.appendChild(row);
                }
            });
        });
    }

    renderMatches();

    document.getElementById("exportBtn").addEventListener("click", () => {
        window.print();
    });
});