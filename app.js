// ==========================================
// STATE MANAGEMENT & DATA MODELS
// ==========================================
let habits = JSON.parse(localStorage.getItem('habits')) || [
  {
    id: "default-1",
    name: "2 Litre Su İç",
    category: "Health",
    color: "primary-container",
    frequency: "daily",
    targetCount: 1,
    reminderEnabled: true,
    history: []
  },
  {
    id: "default-2",
    name: "15 Dakika Meditasyon",
    category: "Mind",
    color: "tertiary-container",
    frequency: "daily",
    targetCount: 1,
    reminderEnabled: true,
    history: []
  },
  {
    id: "default-3",
    name: "Kitap Oku (10 sayfa)",
    category: "Book",
    color: "#67558c",
    frequency: "daily",
    targetCount: 1,
    reminderEnabled: true,
    history: []
  },
  {
    id: "default-4",
    name: "Günün Önemli Görevlerini Yap",
    category: "Productivity",
    color: "secondary-container",
    frequency: "daily",
    targetCount: 1,
    reminderEnabled: true,
    history: []
  }
];

let journal = JSON.parse(localStorage.getItem('journal')) || {};

// Selection states
let selectedJournalDate = getTodayString();
let selectedHabitsDate = getTodayString(); // Alışkanlıklar takvim seçimi
let selectedCategory = 'Health'; // Default Category
let selectedFrequency = 'daily'; // Default Frequency
let customFrequencyValue = 3; // Default custom goal day count (Sayaç)
let selectedColor = '#006b5a'; // Default Color accent
let activeTab = 'dashboard';
let editingHabitId = null; // Track if we're inline editing a habit's name
let selectedPerformanceRange = 'weekly'; // Toggles 'weekly', 'monthly' or 'yearly' performance grid
let selectedActivityRange = 'weekly'; // Toggles 'weekly', 'monthly' or 'yearly' activity chart
let selectedMoodRange = 'weekly'; // Toggles 'weekly', 'monthly' or 'yearly' mood chart
let goals = JSON.parse(localStorage.getItem('goals')) || [];
let username = localStorage.getItem('username') || 'Kullanıcı Adı';
let activityViewDate = getTodayString();
let moodViewDate = getTodayString();
let performanceViewDate = getTodayString();

function getLast12Months() {
    const months = [];
    const d = new Date();
    for (let i = 11; i >= 0; i--) {
        const temp = new Date(d.getFullYear(), d.getMonth() - i, 1);
        months.push({
            year: temp.getFullYear(),
            month: temp.getMonth(), // 0..11
            label: temp.toLocaleDateString('tr-TR', { month: 'short' }), // "Oca", "Şub", etc.
            str: `${temp.getFullYear()}-${String(temp.getMonth() + 1).padStart(2, '0')}` // "2026-05"
        });
    }
    return months;
}

// ==========================================
// MOTIVATION QUOTES POOL (15 Items)
// ==========================================
const MOTIVATIONAL_QUOTES = [
    { title: "İstikrar Anahtardır", quote: "İstikrar, hedefleri gerçeğe dönüştüren en sağlam köprüdür." },
    { title: "Küçük Adımlar", quote: "Büyük işler, sabırla atılan küçük adımların bir araya gelmesiyle oluşur." },
    { title: "Geleceğin Gücü", quote: "Alışkanlıklar başlangıçta örümcek ağı gibidir, zamanla kalın bir halat olur." },
    { title: "%1 Kuralı", quote: "Her gün sadece %1 daha iyi olmak, yıl sonunda seni 37 kat daha güçlü kılar." },
    { title: "Disiplin Değerlidir", quote: "Başarı, her gün bıkmadan tekrarlanan küçük disiplinlerin toplamıdır." },
    { title: "Bugünün Önemi", quote: "Geleceğiniz, yarın ne yapacağınızla değil, bugün ne yaptığınızla şekillenir." },
    { title: "Doğru Seçim", quote: "Disiplin; şu an en çok istediğin şey ile uzun vadede en çok istediğin şey arasındaki seçimdir." },
    { title: "Kolay Başlangıç", quote: "Başlamanın sırrı, devasa hedefleri küçük ve yapılabilir adımlara bölmektir." },
    { title: "İçsel Güç", quote: "Karşılaştığın zorluklar, elde edeceğin başarının en değerli süsleridir." },
    { title: "Sonsuz Yolculuk", quote: "Bin kilometrelik en uzun yolculuklar bile tek bir adımla başlar." },
    { title: "Ekinini Seç", quote: "Bugün sabırla ektiğin alışkanlık tohumları, yarın biçeceğin zaferlerindir." },
    { title: "Asla Kırma", quote: "İstikrarlı bir şekilde devam et, o kutsal zinciri asla kırma!" },
    { title: "Kimliğini Yaşa", quote: "Ne yapacağına değil kim olacağına odaklan. Davranışlar kimliğini takip eder." },
    { title: "Engelleri Azalt", quote: "Karar yorgunluğunu önlemek için ortamı tasarla. Hazırlık, engelleri yok eder." },
    { title: "Devam Et", quote: "Motivasyon sadece başlamanı sağlar; seni hedefe ulaştıracak olan alışkanlıklardır." }
];

// Pick random quote on launch
let currentQuoteIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
let currentSessionQuote = MOTIVATIONAL_QUOTES[currentQuoteIndex];

// ==========================================
// DYNAMIC ADVICE POOL (15 Items)
// ==========================================
const ANALYTICAL_ADVICE = [
    { title: "Sabahın Gücü", desc: "Alışkanlıklarınızı sabah saatlerine yerleştirin. Gün içindeki irade gücü tükenmeden görevlerinizi aradan çıkarın." },
    { title: "Alışkanlık Zincirleme", desc: "Yeni alışkanlığı, halihazırda yaptığınız bir rutinin ardına ekleyin (örn: kahve aldıktan sonra 5 dk kitap okumak)." },
    { title: "2 Dakika Kuralı", desc: "Yeni bir alışkanlığı ilk başta 2 dakikadan az sürecek küçük bir adımla başlatın. Başlamak, sürdürmekten zordur." },
    { title: "Çevreni Tasarla", desc: "Su içmek istiyorsanız masanızda her zaman dolu sürahi tutun. Görsel tetikleyiciler eylemi kolaylaştırır." },
    { title: "Üst Üste Aksamama", desc: "Bir gün kaçırmak kazadır; ancak üst üste iki gün aksatmak yeni ve kötü bir alışkanlığın başlangıcıdır." },
    { title: "Ödül Mekanizması", desc: "Her 7 günlük seride kendinize küçük bir ödül verin. Beyin, zincir kurmayı olumlu ödülle eşleştirecektir." },
    { title: "Az Ama Sürekli", desc: "Haftada 1 gün 2 saat spor yapmak yerine her gün 15 dakika egzersiz yapmak zihinsel istikrarı daha hızlı pekiştirir." },
    { title: "Kimlik Odaklı Takip", desc: "'Kitap okumak istiyorum' yerine 'Ben bir kitap okuruyum' kimliğini benimseyin. Davranışlar inançları izler." },
    { title: "Sürtünmeyi Azalt", desc: "Sabah spor yapacaksanız spor kıyafetlerinizi akşamdan yatağınızın yanına hazırlayın." },
    { title: "Sosyal Sorumluluk", desc: "Hedeflerinizi sevdiklerinizle paylaşın. Sosyal taahhüt, yalnız başınayken yapacağınız ertelemeleri engeller." },
    { title: "Zihinsel Prova", desc: "Güne başlarken kendinizi alışkanlığı yaparken hayal edin. Zihinsel ön hazırlık eyleme geçişi %40 kolaylaştırır." },
    { title: "Haftalık Analiz", desc: "Her Pazar akşamı grafiğinizi inceleyin. En başarılı olduğunuz günlerdeki tetikleyicileri sonraki haftaya taşıyın." },
    { title: "Kendine Şefkat Göster", desc: "Bazen haftalık grafiğiniz düşebilir. Bu başarısızlık değil, insan olmanın bir parçasıdır. Kaldığınız yerden devam edin." },
    { title: "Duygu Kaydı", desc: "Günlük not yazma alanını aksatmayın. Yazmak, alışkanlıklarınızın ardındaki duygusal engelleri keşfetmenizi sağlar." },
    { title: "Tekil Odaklanma", desc: "Aynı anda 5 yeni alışkanlık edinmek iradeyi tüketir. Her ay sadece 1 veya 2 yeni alışkanlığa öncelik verin." }
];

// Pick random advice on launch
let currentAdviceIndex = Math.floor(Math.random() * ANALYTICAL_ADVICE.length);
let currentSessionAdvice = ANALYTICAL_ADVICE[currentAdviceIndex];

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

// Get actual hex color for a habit (handles legacy classes)
function getHabitColor(habit) {
    const col = habit.color;
    if (!col) return '#006b5a';
    if (col.startsWith('#')) return col;
    const map = {
        'primary': '#006b5a',
        'primary-container': '#006b5a',
        'tertiary': '#67558c',
        'tertiary-container': '#67558c',
        'secondary': '#9e4037',
        'secondary-container': '#fe8a7c',
        'outline': '#bdc9c4',
        'sunny-yellow': '#FFD966',
        'lavender-soft': '#67558c'
    };
    return map[col] || '#006b5a';
}

// Populate reminder day selector dynamically based on frequency
function populateReminderDays(selectElement, freq, selectedVal = '') {
    if (!selectElement) return;
    selectElement.innerHTML = '';
    
    if (freq === 'weekly') {
        const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
        days.forEach(day => {
            const opt = document.createElement('option');
            opt.value = day;
            opt.textContent = day;
            if (day === selectedVal) opt.selected = true;
            selectElement.appendChild(opt);
        });
    } else if (freq === 'monthly') {
        for (let i = 1; i <= 28; i++) {
            const val = `${i}. Gün`;
            const opt = document.createElement('option');
            opt.value = val;
            opt.textContent = val;
            if (val === selectedVal) opt.selected = true;
            selectElement.appendChild(opt);
        }
    }
}

// Color Picker Button trigger for new habit
window.selectColorBtn = function(btn, color) {
    selectedColor = color;
    const container = btn.parentElement;
    if (container) {
        const buttons = container.querySelectorAll('button');
        buttons.forEach(b => {
            b.classList.remove('active-habit-ring');
        });
    }
    btn.classList.add('active-habit-ring');
};

// Color Picker Button trigger for inline editing
window.selectEditColorBtn = function(btn, id, color) {
    const container = document.getElementById(`edit-color-picker-container-${id}`);
    if (container) {
        container.setAttribute('data-selected-color', color);
        const buttons = container.querySelectorAll('button');
        buttons.forEach(b => {
            b.classList.remove('active-habit-ring');
        });
    }
    btn.classList.add('active-habit-ring');
};

// Toggle single habit reminder time fields on checkbox change
window.toggleReminderTimeGroup = function() {
    const toggle = document.getElementById('add-habit-reminder-toggle');
    const timeGroup = document.getElementById('add-habit-reminder-time-group');
    if (toggle && timeGroup) {
        if (toggle.checked) {
            timeGroup.classList.remove('hidden');
        } else {
            timeGroup.classList.add('hidden');
        }
    }
};

// Toggle inline editing reminder time fields on checkbox change
window.toggleEditReminderTimeGroup = function(id) {
    const toggle = document.getElementById(`edit-habit-reminder-toggle-${id}`);
    const timeGroup = document.getElementById(`edit-habit-reminder-time-group-${id}`);
    if (toggle && timeGroup) {
        if (toggle.checked) {
            timeGroup.classList.remove('hidden');
        } else {
            timeGroup.classList.add('hidden');
        }
    }
};

// Get Date String (YYYY-MM-DD)
function getTodayString() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

// Get Last 7 Days (including today)
function getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push({
            str: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
            label: d.toLocaleDateString('tr-TR', { weekday: 'short' }), // "Pzt", "Sal", vb.
            dayNum: d.getDate()
        });
    }
    return days;
}

// Get 7 Days around a specific center date, clamped to not show future dates
function get7DaysAround(centerDateStr) {
    const days = [];
    const parts = centerDateStr.split('-');
    const centerDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const today = new Date();
    today.setHours(0,0,0,0);
    
    let endDate = new Date(centerDate);
    endDate.setDate(endDate.getDate() + 3); // Center date in the middle of 7 days
    if (endDate > today) {
        endDate = new Date(today); // Clamped to today
    }
    
    for (let i = 6; i >= 0; i--) {
        const d = new Date(endDate);
        d.setDate(d.getDate() - i);
        days.push({
            str: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
            label: d.toLocaleDateString('tr-TR', { weekday: 'short' }),
            dayNum: d.getDate()
        });
    }
    return days;
}

// Get Last 30 Days (including today)
function getLast30Days() {
    const days = [];
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push({
            str: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
            label: d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }), // "25 May", vb.
            dayNum: d.getDate()
        });
    }
    return days;
}

// Get Past 365 Days (including today) — used internally only
function getPast365Days() {
    const days = [];
    const today = new Date();
    for (let i = 364; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        days.push({
            str: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
            label: d.toLocaleDateString('tr-TR', { weekday: 'short' }),
            dayNum: d.getDate()
        });
    }
    return days;
}

// CHART DATE HELPERS —————————————————————————

// Current week: Monday → today
function getThisWeekDays() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dow = today.getDay(); // 0=Sun
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));

    const days = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        if (d > today) break; // do not include future days
        days.push({
            str: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
            label: d.toLocaleDateString('tr-TR', { weekday: 'short' }),
            dayNum: d.getDate()
        });
    }
    return days;
}

// Current month: 1st → today
function getThisMonthDays() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = [];
    const d = new Date(today.getFullYear(), today.getMonth(), 1);
    while (d <= today) {
        days.push({
            str: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
            label: d.toLocaleDateString('tr-TR', { weekday: 'short' }),
            dayNum: d.getDate()
        });
        d.setDate(d.getDate() + 1);
    }
    return days;
}

// Current year: January → current month (aggregated by month)
function getThisYearMonths() {
    const today = new Date();
    const months = [];
    const TR_MONTH_LABELS = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
    for (let m = 0; m <= today.getMonth(); m++) {
        months.push({
            year: today.getFullYear(),
            month: m,
            label: TR_MONTH_LABELS[m],
            str: `${today.getFullYear()}-${String(m + 1).padStart(2, '0')}`
        });
    }
    return months;
}

// ————————————————————————————————————————————

function getMonthDaysForDate(dateStr) {
    const parts = dateStr.split('-');
    const base = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const year = base.getFullYear();
    const month = base.getMonth(); // 0-indexed
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month, d);
        days.push({
            str: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
            label: date.toLocaleDateString('tr-TR', { weekday: 'short' }),
            dayNum: d,
            isFuture: date > today
        });
    }
    return days;
}

function getYearMonthsForDate(dateStr) {
    const parts = dateStr.split('-');
    const base = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const year = base.getFullYear();
    
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    const months = [];
    const TR_MONTH_LABELS = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
    for (let m = 0; m < 12; m++) {
        months.push({
            year: year,
            month: m,
            label: TR_MONTH_LABELS[m],
            str: `${year}-${String(m + 1).padStart(2, '0')}`,
            isFuture: (year > currentYear) || (year === currentYear && m > currentMonth)
        });
    }
    return months;
}

function getYearDaysForDate(dateStr) {
    const parts = dateStr.split('-');
    const year = parseInt(parts[0]);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = [];
    for (let m = 0; m < 12; m++) {
        const daysInMonth = new Date(year, m + 1, 0).getDate();
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, m, d);
            days.push({
                str: `${year}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
                isFuture: date > today,
                dayNum: d,
                monthNum: m
            });
        }
    }
    return days;
}

function getWeekRangeLabel(days) {
    if (!days || days.length === 0) return '';
    const partsFirst = days[0].str.split('-');
    const first = new Date(parseInt(partsFirst[0]), parseInt(partsFirst[1]) - 1, parseInt(partsFirst[2]));
    const partsLast = days[days.length - 1].str.split('-');
    const last = new Date(parseInt(partsLast[0]), parseInt(partsLast[1]) - 1, parseInt(partsLast[2]));
    
    const firstDay = first.getDate();
    const firstMonth = first.toLocaleDateString('tr-TR', { month: 'short' });
    const firstYear = first.getFullYear();
    
    const lastDay = last.getDate();
    const lastMonth = last.toLocaleDateString('tr-TR', { month: 'short' });
    const lastYear = last.getFullYear();
    
    if (firstYear !== lastYear) {
        return `${firstDay} ${firstMonth} ${firstYear} - ${lastDay} ${lastMonth} ${lastYear}`;
    } else if (firstMonth !== lastMonth) {
        return `${firstDay} ${firstMonth} - ${lastDay} ${lastMonth} ${firstYear}`;
    } else {
        return `${firstDay}-${lastDay} ${firstMonth} ${firstYear}`;
    }
}

function getMonthRangeLabel(dateStr) {
    const parts = dateStr.split('-');
    const base = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return base.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
}

function getYearRangeLabel(dateStr) {
    const parts = dateStr.split('-');
    const base = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return base.getFullYear().toString();
}

window.goToTodayHabits = function() {
    if (selectedHabitsDate === getTodayString()) return;
    selectedHabitsDate = getTodayString();
    renderDashboard();
    setTimeout(scrollToActiveDay, 120);
};

window.goToTodayJournal = function() {
    if (selectedJournalDate === getTodayString()) return;
    selectedJournalDate = getTodayString();
    selectJournalDate(selectedJournalDate);
    renderDashboard();
    setTimeout(() => {
        const activeBtn = document.querySelector('#journal-timeline-row button.bg-secondary');
        if (activeBtn) activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }, 120);
};

window.navigateActivityDate = function(direction) {
    const range = selectedActivityRange || 'weekly';
    const parts = activityViewDate.split('-');
    const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    if (range === 'weekly') {
        date.setDate(date.getDate() + direction * 7);
    } else if (range === 'monthly') {
        date.setMonth(date.getMonth() + direction);
    } else if (range === 'yearly') {
        date.setFullYear(date.getFullYear() + direction);
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const firstDayOfNav = new Date(date);
    if (range === 'weekly') {
        const dow = firstDayOfNav.getDay();
        firstDayOfNav.setDate(firstDayOfNav.getDate() - (dow === 0 ? 6 : dow - 1));
    } else if (range === 'monthly') {
        firstDayOfNav.setDate(1);
    } else if (range === 'yearly') {
        firstDayOfNav.setMonth(0, 1);
    }
    if (firstDayOfNav > today) return; // block entirely in the future

    activityViewDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    renderWaveChart();
};

window.navigateMoodDate = function(direction) {
    const range = selectedMoodRange || 'weekly';
    const parts = moodViewDate.split('-');
    const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    if (range === 'weekly') {
        date.setDate(date.getDate() + direction * 7);
    } else if (range === 'monthly') {
        date.setMonth(date.getMonth() + direction);
    } else if (range === 'yearly') {
        date.setFullYear(date.getFullYear() + direction);
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const firstDayOfNav = new Date(date);
    if (range === 'weekly') {
        const dow = firstDayOfNav.getDay();
        firstDayOfNav.setDate(firstDayOfNav.getDate() - (dow === 0 ? 6 : dow - 1));
    } else if (range === 'monthly') {
        firstDayOfNav.setDate(1);
    } else if (range === 'yearly') {
        firstDayOfNav.setMonth(0, 1);
    }
    if (firstDayOfNav > today) return;

    moodViewDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    renderMoodChart();
};

window.navigatePerformanceDate = function(direction) {
    const range = selectedPerformanceRange || 'weekly';
    const parts = performanceViewDate.split('-');
    const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    if (range === 'weekly') {
        date.setDate(date.getDate() + direction * 7);
    } else if (range === 'monthly') {
        date.setMonth(date.getMonth() + direction);
    } else if (range === 'yearly') {
        date.setFullYear(date.getFullYear() + direction);
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const firstDayOfNav = new Date(date);
    if (range === 'weekly') {
        const dow = firstDayOfNav.getDay();
        firstDayOfNav.setDate(firstDayOfNav.getDate() - (dow === 0 ? 6 : dow - 1));
    } else if (range === 'monthly') {
        firstDayOfNav.setDate(1);
    } else if (range === 'yearly') {
        firstDayOfNav.setMonth(0, 1);
    }
    if (firstDayOfNav > today) return;

    performanceViewDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    renderHabitsPerformanceGrid();
};

// ————————————————————————————————————————————

function enableDragToScroll(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let isDown = false;
    let startX;
    let scrollLeft;
    let totalDragDistance = 0;

    // Apply grab cursor
    container.style.cursor = 'grab';
    container.style.userSelect = 'none';
    container.style.webkitUserSelect = 'none';

    container.addEventListener('pointerdown', (e) => {
        // Only handle left mouse button or touch
        if (e.button && e.button !== 0) return;
        isDown = true;
        totalDragDistance = 0;
        container.style.cursor = 'grabbing';
        container.setPointerCapture(e.pointerId);
        startX = e.clientX;
        scrollLeft = container.scrollLeft;
    });

    container.addEventListener('pointermove', (e) => {
        if (!isDown) return;
        const dx = e.clientX - startX;
        totalDragDistance = Math.abs(dx);
        container.scrollLeft = scrollLeft - dx;
    });

    container.addEventListener('pointerup', (e) => {
        isDown = false;
        container.style.cursor = 'grab';
        container.releasePointerCapture(e.pointerId);
    });

    container.addEventListener('pointercancel', () => {
        isDown = false;
        totalDragDistance = 0;
        container.style.cursor = 'grab';
    });

    // Block click only when user dragged more than 8px — real taps are <8px
    container.addEventListener('click', (e) => {
        if (totalDragDistance > 8) {
            e.preventDefault();
            e.stopImmediatePropagation();
            // Reset so next tap works
            totalDragDistance = 0;
        }
    }, true);
}

function scrollToActiveDay(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const activeBtn = container.querySelector('.bg-primary');
    if (activeBtn) {
        const containerWidth = container.offsetWidth;
        const btnOffsetLeft = activeBtn.offsetLeft;
        const btnWidth = activeBtn.offsetWidth;
        container.scrollLeft = btnOffsetLeft - (containerWidth / 2) + (btnWidth / 2);
    }
}

/**
 * Swipe-to-navigate-week gesture for timeline rows.
 * - Swipe RIGHT (>50px) → go back 7 days (previous week)
 * - Swipe LEFT  (>50px) → go forward 7 days (next week, capped at today)
 * - Short tap            → click fires normally on the button
 *
 * IMPORTANT: We do NOT use setPointerCapture because it steals all
 * pointer events from child buttons, preventing their click from firing.
 */
function enableWeekGesture(containerId, onNavigate) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let startX = 0;
    let wasSwiped = false;
    let isDragging = false;
    const SWIPE_THRESHOLD = 50;

    container.style.userSelect = 'none';
    container.style.webkitUserSelect = 'none';
    container.style.touchAction = 'pan-y'; // Prevent native horizontal scroll interference on mobile

    container.addEventListener('pointerdown', (e) => {
        if (e.button && e.button !== 0) return;
        isDragging = true;
        wasSwiped = false;
        startX = e.clientX;
    });

    container.addEventListener('pointermove', (e) => {
        // No action needed during pointer move, we track final delta in pointerup
    });

    container.addEventListener('pointerup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        const dx = e.clientX - startX;

        if (dx > SWIPE_THRESHOLD) {
            wasSwiped = true;
            onNavigate(-7); // swipe right → previous week
        } else if (dx < -SWIPE_THRESHOLD) {
            wasSwiped = true;
            onNavigate(+7); // swipe left → next week
        } else {
            wasSwiped = false; // no significant swipe occurred, keep as click
        }
    });

    container.addEventListener('pointercancel', () => {
        isDragging = false;
        wasSwiped = false;
    });

    // Block click only when a real successful swipe navigation happened
    container.addEventListener('click', (e) => {
        if (wasSwiped) {
            e.preventDefault();
            e.stopImmediatePropagation();
            wasSwiped = false;
        }
    }, true);
}

// Calculate Habit Streak
function calculateStreak(habit) {
    let streak = 0;
    const checkDate = new Date();
    
    const toStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    let currentStr = toStr(checkDate);
    
    // If today is not done, check if yesterday was done. If yesterday is also not done, streak is 0.
    if (!habit.history.includes(currentStr)) {
        checkDate.setDate(checkDate.getDate() - 1);
        currentStr = toStr(checkDate);
        if (!habit.history.includes(currentStr)) {
            return 0;
        }
    }
    
    // Count backwards
    while (habit.history.includes(currentStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
        currentStr = toStr(checkDate);
    }
    
    return streak;
}

// Generate Smooth SVG Bezier Path
function getSplinePath(points) {
    if (points.length === 0) return '';
    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
        const curr = points[i];
        const next = points[i + 1];
        const cp1x = curr.x + 30;
        const cp1y = curr.y;
        const cp2x = next.x - 30;
        const cp2y = next.y;
        d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${next.x},${next.y}`;
    }
    return d;
}

// Save State to LocalStorage
function saveState() {
    localStorage.setItem('habits', JSON.stringify(habits));
    localStorage.setItem('journal', JSON.stringify(journal));
}

// Premium System Toast Alerts
// Premium System Toast Alerts (Disabled as per user request)
function showToast(message, type = 'info') {
    // Toast alerts are disabled to prevent feedback popups
    return;
}

// Interactive Cycle Quotes
window.cycleQuote = function() {
    currentQuoteIndex = (currentQuoteIndex + 1) % MOTIVATIONAL_QUOTES.length;
    currentSessionQuote = MOTIVATIONAL_QUOTES[currentQuoteIndex];
    
    const titleEl = document.getElementById('inspo-title');
    const quoteEl = document.getElementById('inspo-quote');
    if (titleEl && quoteEl) {
        titleEl.textContent = currentSessionQuote.title;
        quoteEl.textContent = currentSessionQuote.quote;
    }
};

// Interactive Cycle Advice
window.cycleAdvice = function() {
    currentAdviceIndex = (currentAdviceIndex + 1) % ANALYTICAL_ADVICE.length;
    currentSessionAdvice = ANALYTICAL_ADVICE[currentAdviceIndex];
    
    const titleEl = document.getElementById('insight-box-title');
    const descEl = document.getElementById('insight-box-desc');
    if (titleEl && descEl) {
        titleEl.textContent = currentSessionAdvice.title;
        descEl.textContent = currentSessionAdvice.desc;
    }
};

// ==========================================
// THEME SWITCHER & INITIALIZATION
// ==========================================
function initTheme() {
    // Force light theme as requested by user and disabled dark mode features
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
    
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) themeColorMeta.setAttribute('content', '#f8f9fa');
}

// ==========================================
// TAB SWITCHER (Supports 5 Screens Symmetrically)
// ==========================================
window.switchTab = function(tabId) {
    activeTab = tabId;
    
    // Select all screens
    const screens = {
        'dashboard': document.getElementById('screen-dashboard'),
        'progress': document.getElementById('screen-progress'),
        'add-habit': document.getElementById('screen-add-habit'),
        'profile': document.getElementById('screen-profile'),
        'settings': document.getElementById('screen-settings')
    };

    // Toggle screen visibility
    Object.keys(screens).forEach(key => {
        if (screens[key]) {
            if (key === tabId) {
                screens[key].classList.remove('hidden');
                // Trigger screen-specific rendering
                if (key === 'dashboard') {
                    renderDashboard();
                } else if (key === 'progress') {
                    renderProgress();
                } else if (key === 'profile') {
                    renderProfile();
                } else if (key === 'settings') {
                    initTheme(); // Settings load fires theme binder
                    initGlobalNotificationToggle(); // Bind global settings Switch
                }
            } else {
                screens[key].classList.add('hidden');
            }
        }
    });

    // Update bottom nav active classes
    const navButtons = {
        'dashboard': document.getElementById('nav-btn-dashboard'),
        'progress': document.getElementById('nav-btn-progress'),
        'add-habit': document.getElementById('nav-btn-add-habit'),
        'profile': document.getElementById('nav-btn-profile'),
        'settings': document.getElementById('nav-btn-settings')
    };

    Object.keys(navButtons).forEach(key => {
        const btn = navButtons[key];
        if (!btn) return;
        
        if (key === 'add-habit') {
            const childDiv = btn.querySelector('div');
            if (childDiv) {
                if (tabId === 'add-habit') {
                    childDiv.className = "w-11 h-11 bg-primary text-white rounded-full flex items-center justify-center shadow-lg ring-4 ring-primary/20 scale-110 transition-all";
                } else {
                    childDiv.className = "w-11 h-11 bg-primary-container text-primary rounded-full flex items-center justify-center shadow-lg hover:shadow-primary/30 transition-all";
                }
            }
            return;
        }

        if (key === tabId) {
            btn.className = "nav-btn flex-1 flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-2xl py-1.5 scale-110 active:scale-95 transition-all duration-200";
        } else {
            btn.className = "nav-btn flex-1 flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container rounded-2xl py-1.5 active:scale-95 transition-all duration-200";
        }
    });
};

// ==========================================
// ADD HABIT SCREEN & OTHER CUSTOMIZATION
// ==========================================
window.selectCategoryChip = function(btn, category) {
    selectedCategory = category;
    
    const chips = document.querySelectorAll('.category-chip');
    chips.forEach(chip => {
        chip.className = "category-chip flex items-center gap-xs bg-surface-container-lowest p-3 rounded-xl shadow-[0_10px_20px_-5px_rgba(45,52,54,0.03)] border-l-4 transition-all duration-300";
        const onclickAttr = chip.getAttribute('onclick');
        if (onclickAttr.includes("'Health'")) chip.classList.add('border-primary');
        else if (onclickAttr.includes("'Mind'")) chip.classList.add('border-tertiary');
        else if (onclickAttr.includes("'Productivity'")) chip.classList.add('border-secondary-container');
        else if (onclickAttr.includes("'Book'")) chip.classList.add('border-[#67558c]');
        else if (onclickAttr.includes("'Software'")) chip.classList.add('border-[#bdc9c4]');
        else if (onclickAttr.includes("'Sport'")) chip.classList.add('border-[#9e4037]');
        else if (onclickAttr.includes("'Sleep'")) chip.classList.add('border-[#7ed9c3]');
        else if (onclickAttr.includes("'Social'")) chip.classList.add('border-[#fe8a7c]');
        else if (onclickAttr.includes("'Other'")) chip.classList.add('border-outline');
    });

    btn.classList.remove('bg-surface-container-lowest');
    btn.classList.add('bg-primary-container', 'text-on-primary-container');

    const customGrp = document.getElementById('custom-category-group');
    if (customGrp) {
        if (category === 'Other') {
            customGrp.classList.remove('hidden');
            document.getElementById('add-habit-custom-category').focus();
        } else {
            customGrp.classList.add('hidden');
        }
    }
};

window.setAddHabitFrequency = function(freq) {
    selectedFrequency = freq;
    const btnDaily = document.getElementById('freqDaily');
    const btnWeekly = document.getElementById('freqWeekly');
    const btnMonthly = document.getElementById('freqMonthly');
    const customGrp = document.getElementById('custom-frequency-count-group');
    const customLabel = document.getElementById('custom-freq-label');
    const customVal = document.getElementById('custom-freq-value');
    
    if (!btnDaily || !btnWeekly || !btnMonthly) return;

    // Reset active button styles
    [btnDaily, btnWeekly, btnMonthly].forEach(b => {
        b.className = "flex-1 py-2 font-label-md text-label-md rounded-xl transition-all duration-300 text-on-surface-variant font-semibold";
    });

    const dayContainer = document.getElementById('add-habit-reminder-day-container');
    const daySelect = document.getElementById('add-habit-reminder-day');

    if (freq === 'daily') {
        btnDaily.className = "flex-1 py-2 font-label-md text-label-md rounded-xl transition-all duration-300 bg-primary-container text-on-primary-container font-semibold";
        if (customGrp) customGrp.classList.add('hidden');
        if (dayContainer) dayContainer.classList.add('hidden');
    } else if (freq === 'weekly') {
        btnWeekly.className = "flex-1 py-2 font-label-md text-label-md rounded-xl transition-all duration-300 bg-primary-container text-on-primary-container font-semibold";
        if (customGrp) {
            customGrp.classList.remove('hidden');
            if (customLabel) customLabel.textContent = "Haftalık hedef gün sayısı:";
            customFrequencyValue = Math.max(1, Math.min(7, customFrequencyValue));
            if (customVal) customVal.textContent = customFrequencyValue;
        }
        if (dayContainer) dayContainer.classList.remove('hidden');
        populateReminderDays(daySelect, freq);
    } else {
        btnMonthly.className = "flex-1 py-2 font-label-md text-label-md rounded-xl transition-all duration-300 bg-primary-container text-on-primary-container font-semibold";
        if (customGrp) {
            customGrp.classList.remove('hidden');
            if (customLabel) customLabel.textContent = "Aylık hedef gün sayısı:";
            if (customFrequencyValue <= 7) {
                customFrequencyValue = 10;
            }
            customFrequencyValue = Math.max(1, Math.min(30, customFrequencyValue));
            if (customVal) customVal.textContent = customFrequencyValue;
        }
        if (dayContainer) dayContainer.classList.remove('hidden');
        populateReminderDays(daySelect, freq);
    }
};

window.adjustCustomFreq = function(direction) {
    const valSpan = document.getElementById('custom-freq-value');
    if (!valSpan) return;

    if (selectedFrequency === 'weekly') {
        customFrequencyValue = Math.max(1, Math.min(7, customFrequencyValue + direction));
    } else if (selectedFrequency === 'monthly') {
        customFrequencyValue = Math.max(1, Math.min(30, customFrequencyValue + direction));
    }
    valSpan.textContent = customFrequencyValue;
};

function initAddHabitForm() {
    const submitBtn = document.getElementById('btn-create-submit');
    const nameInput = document.getElementById('add-habit-name-input');
    const customCatInput = document.getElementById('add-habit-custom-category');
    const customEmojiInput = document.getElementById('add-habit-custom-emoji');
    const reminderToggle = document.getElementById('add-habit-reminder-toggle');
    
    if (submitBtn) {
        submitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const name = nameInput.value.trim();
            if (!name) {
                alert('Lütfen bir alışkanlık ismi girin!');
                return;
            }

            // Set target count depending on selection
            let target = 1;
            if (selectedFrequency === 'weekly' || selectedFrequency === 'monthly') {
                target = customFrequencyValue;
            }

            const reminderTimeInput = document.getElementById('add-habit-reminder-time');
            const reminderDayInput = document.getElementById('add-habit-reminder-day');

            let newHabit = {
                id: Date.now().toString(),
                name: name,
                category: selectedCategory,
                color: selectedColor,
                frequency: selectedFrequency,
                targetCount: target,
                reminderEnabled: reminderToggle ? reminderToggle.checked : true,
                reminderTime: reminderTimeInput ? reminderTimeInput.value : '09:00',
                reminderDay: (selectedFrequency !== 'daily' && reminderDayInput) ? reminderDayInput.value : '',
                history: []
            };

            // Custom category fields
            if (selectedCategory === 'Other') {
                newHabit.customCategoryName = customCatInput.value.trim() || 'Diğer';
                newHabit.customEmoji = customEmojiInput.value.trim() || 'more_horiz';
            }

            habits.push(newHabit);
            saveState();
            
            // Reset Form Fields
            nameInput.value = '';
            customCatInput.value = '';
            customEmojiInput.value = '';
            if (reminderToggle) reminderToggle.checked = true;
            
            const customGrp = document.getElementById('custom-category-group');
            if (customGrp) customGrp.classList.add('hidden');

            const defaultCategoryChip = document.querySelector('.category-chip');
            if (defaultCategoryChip) {
                selectCategoryChip(defaultCategoryChip, 'Health');
            }
            setAddHabitFrequency('daily');
            
            const firstColorBtn = document.querySelector('#screen-add-habit button[onclick*="#006b5a"]');
            if (firstColorBtn) {
                selectColorBtn(firstColorBtn, '#006b5a');
            }

            showToast(`"${newHabit.name}" alışkanlığı eklendi! 🚀`, 'success');

            // Redirect
            switchTab('dashboard');
        });
    }
}

// ==========================================
// DASHBOARD RENDERING & TIMELINE MOTOR
// ==========================================
function updateHeader() {
    const titleEl = document.getElementById('header-welcome-title');
    const subtitleEl = document.getElementById('header-date-subtitle');
    if (!titleEl || !subtitleEl) return;

    const hour = new Date().getHours();
    let greeting = `Merhaba, ${username}`;
    if (hour >= 5 && hour < 12) {
        greeting = `Günaydın, ${username}`;
    } else if (hour >= 12 && hour < 18) {
        greeting = `Merhaba, ${username}`;
    } else if (hour >= 18 && hour < 22) {
        greeting = `İyi Akşamlar, ${username}`;
    } else {
        greeting = `İyi Geceler, ${username}`;
    }
    titleEl.textContent = greeting;

    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    subtitleEl.textContent = new Date().toLocaleDateString('tr-TR', options);
}

function renderTodayProgress() {
    const summaryTitle = document.querySelector('#screen-dashboard h2');
    const summaryDesc = document.getElementById('progress-summary-desc');
    const circlePercent = document.getElementById('progress-circle-percent');
    const circleRing = document.getElementById('progress-circle-ring');

    if (!summaryDesc || !circlePercent || !circleRing) return;

    const todayStr = getTodayString();
    const isSelectedToday = selectedHabitsDate === todayStr;

    // Calculate details for selected date
    const total = habits.length;
    const completedOnDate = habits.filter(h => h.history.includes(selectedHabitsDate)).length;
    const ratio = total > 0 ? completedOnDate / total : 0;
    const percent = Math.round(ratio * 100);

    // Dynamic title text based on date selection
    if (summaryTitle) {
        if (isSelectedToday) {
            summaryTitle.textContent = "Bugünkü Durum";
        } else {
            const d = new Date(selectedHabitsDate);
            const dateLabel = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
            summaryTitle.textContent = `${dateLabel} Günü Durumu`;
        }
    }

    summaryDesc.textContent = total === 0
        ? "Henüz hiç alışkanlık eklemedin. Bugün başlamak için yeni bir tane oluştur!"
        : `${total} alışkanlıktan ${completedOnDate} tanesini tamamladın!`;
    circlePercent.textContent = `${percent}%`;
    
    const offset = 176 - (176 * ratio);
    circleRing.style.strokeDashoffset = offset;
}

// Habits Timeline Slider Rendering
/**
 * Returns 7 days of the week (Mon-Sun) that contains dateStr,
 * clamping any future dates so only up to today is shown.
 */
function getWeekDaysForDate(dateStr) {
    const parts = dateStr.split('-');
    const base = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    base.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dow = base.getDay();
    const monday = new Date(base);
    monday.setDate(base.getDate() - (dow === 0 ? 6 : dow - 1));

    const days = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        days.push({
            str: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
            label: d.toLocaleDateString('tr-TR', { weekday: 'short' }),
            dayNum: d.getDate(),
            isFuture: d > today
        });
    }
    return days;
}

function renderHabitsTimeline() {
    const timelineRow = document.getElementById('habits-timeline-row');
    if (!timelineRow) return;

    timelineRow.innerHTML = '';
    const days = getWeekDaysForDate(selectedHabitsDate);

    days.forEach(day => {
        const completedCount = habits.filter(h => h.history.includes(day.str)).length;
        const hasCompletions = completedCount > 0;
        const isSelected = day.str === selectedHabitsDate;
        const isToday = day.str === getTodayString();
        const isFuture = day.isFuture;

        const btn = document.createElement('button');
        btn.type = "button";

        if (isFuture) {
            btn.className = "flex flex-col items-center justify-center w-10 h-10 rounded-full text-on-surface-variant/30 font-label-sm cursor-not-allowed shrink-0 relative";
        } else if (isSelected) {
            btn.className = "flex flex-col items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-label-sm font-bold shadow-md shadow-primary/20 scale-105 transition-all shrink-0 relative";
        } else if (isToday) {
            btn.className = "flex flex-col items-center justify-center w-10 h-10 rounded-full border-2 border-primary text-primary font-label-sm font-semibold hover:bg-surface-container shrink-0 relative";
        } else {
            btn.className = "flex flex-col items-center justify-center w-10 h-10 rounded-full text-on-surface-variant font-label-sm hover:bg-surface-container shrink-0 relative";
        }

        btn.innerHTML = `
            <span class="text-[11px] leading-none uppercase text-opacity-70">${day.label.substring(0, 1)}</span>
            <span class="text-xs font-bold leading-none mt-0.5">${day.dayNum}</span>
            ${!isFuture && hasCompletions ? `<span class="w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-primary'} absolute -bottom-0.5 left-1/2 -translate-x-1/2"></span>` : ''}
        `;

        if (!isFuture) {
            btn.onclick = () => {
                selectedHabitsDate = day.str;
                renderTodayProgress();
                renderHabitsList();
                renderHabitsTimeline();
            };
        }
        timelineRow.appendChild(btn);
    });
}

function getWeeklyCompletionsCount(habit, dateStr) {
    const parts = dateStr.split('-');
    const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const day = date.getDay();
    // Monday of this week
    const monday = new Date(date);
    monday.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
    monday.setHours(0,0,0,0);
    
    // Sunday of this week
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23,59,59,999);
    
    let count = 0;
    habit.history.forEach(hStr => {
        const hParts = hStr.split('-');
        if (hParts.length === 3) {
            const hDate = new Date(parseInt(hParts[0]), parseInt(hParts[1]) - 1, parseInt(hParts[2]));
            if (hDate >= monday && hDate <= sunday) {
                count++;
            }
        }
    });
    return count;
}

function getMonthlyCompletionsCount(habit, dateStr) {
    const monthStr = dateStr.substring(0, 7); // "YYYY-MM"
    let count = 0;
    habit.history.forEach(hStr => {
        if (hStr.startsWith(monthStr)) {
            count++;
        }
    });
    return count;
}

function renderHabitsList() {
    const listContainer = document.getElementById('dashboard-habits-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    if (habits.length === 0) {
        listContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center p-lg text-center bg-white rounded-3xl shadow-[0_15px_20px_rgba(45,52,54,0.02)] border border-surface-container">
                <span class="material-symbols-outlined text-5xl text-primary/40 mb-sm">list_alt</span>
                <h4 class="font-headline-sm text-headline-sm text-on-surface-variant">Henüz Alışkanlık Yok</h4>
                <p class="font-body-md text-on-surface-variant/60 max-w-xs mt-xs">Hemen ilk alışkanlığını ekle ve zinciri kırmaya başla!</p>
                <button class="bg-primary text-white font-label-md px-gutter py-2.5 rounded-full mt-md hover:opacity-90 active:scale-95 transition-all" onclick="switchTab('add-habit')">Alışkanlık Ekle</button>
            </div>
        `;
        return;
    }

    habits.forEach(habit => {
        const isCompletedOnDate = habit.history.includes(selectedHabitsDate);
        const streak = calculateStreak(habit);
        const isEditing = editingHabitId === habit.id;
        const habitColor = getHabitColor(habit);

        // Map Category details
        let bgLight = 'bg-surface-container';
        let textCategory = 'Diğer';
        let categoryElement = `<span class="material-symbols-outlined text-[14px]">more_horiz</span>`;

        if (habit.category === 'Health') {
            bgLight = 'bg-primary-container/10';
            textCategory = 'Sağlık';
            categoryElement = `<span class="material-symbols-outlined text-[14px]" style="color: ${habitColor}">favorite</span>`;
        } else if (habit.category === 'Mind') {
            bgLight = 'bg-tertiary-container/10';
            textCategory = 'Zihin';
            categoryElement = `<span class="material-symbols-outlined text-[14px]" style="color: ${habitColor}">psychology</span>`;
        } else if (habit.category === 'Productivity') {
            bgLight = 'bg-secondary-container/10';
            textCategory = 'Üretkenlik';
            categoryElement = `<span class="material-symbols-outlined text-[14px]" style="color: ${habitColor}">bolt</span>`;
        } else if (habit.category === 'Book') {
            bgLight = 'bg-surface-container';
            textCategory = 'Kitap';
            categoryElement = `<span class="material-symbols-outlined text-[14px]" style="color: ${habitColor}">book</span>`;
        } else if (habit.category === 'Software') {
            bgLight = 'bg-surface-container';
            textCategory = 'Yazılım';
            categoryElement = `<span class="material-symbols-outlined text-[14px]" style="color: ${habitColor}">code</span>`;
        } else if (habit.category === 'Sport') {
            bgLight = 'bg-surface-container';
            textCategory = 'Spor';
            categoryElement = `<span class="material-symbols-outlined text-[14px]" style="color: ${habitColor}">fitness_center</span>`;
        } else if (habit.category === 'Sleep') {
            bgLight = 'bg-surface-container';
            textCategory = 'Uyku';
            categoryElement = `<span class="material-symbols-outlined text-[14px]" style="color: ${habitColor}">bedtimes</span>`;
        } else if (habit.category === 'Social') {
            bgLight = 'bg-surface-container';
            textCategory = 'Sosyal';
            categoryElement = `<span class="material-symbols-outlined text-[14px]" style="color: ${habitColor}">group</span>`;
        } else if (habit.category === 'Other') {
            textCategory = habit.customCategoryName || 'Diğer';
            if (habit.customEmoji) {
                categoryElement = `<span class="text-sm shrink-0 leading-none">${habit.customEmoji}</span>`;
            }
        }

        // Target Success / Failure Indicators logic
        let successBadge = '';
        if (habit.frequency === 'daily') {
            if (isCompletedOnDate) {
                successBadge = `<span class="text-[11px] font-bold text-primary flex items-center gap-0.5 bg-primary-container/20 px-2.5 py-0.5 rounded-full"><span class="material-symbols-outlined text-[12px] font-bold">check</span>Bugün Yapıldı!</span>`;
            } else {
                successBadge = `<span class="text-[11px] font-bold text-[#ba1a1a] flex items-center gap-0.5 bg-[#ffdad6]/40 px-2.5 py-0.5 rounded-full"><span class="material-symbols-outlined text-[12px] font-bold">close</span>Bugün Yapılmadı</span>`;
            }
        } else if (habit.frequency === 'weekly') {
            const target = habit.targetCount || 3;
            const completedCount = getWeeklyCompletionsCount(habit, selectedHabitsDate);
            if (completedCount >= target) {
                successBadge = `<span class="text-[11px] font-bold text-primary flex items-center gap-0.5 bg-[#7ed9c3]/20 px-2.5 py-0.5 rounded-full shadow-[0_4px_6px_rgba(0,107,90,0.05)]"><span class="material-symbols-outlined text-[12px] font-bold">workspace_premium</span>🏆 Hedef Başarıldı! (${completedCount}/${target})</span>`;
            } else {
                successBadge = `<span class="text-[11px] font-bold text-on-surface-variant/80 flex items-center gap-0.5 bg-surface-container px-2.5 py-0.5 rounded-full"><span class="material-symbols-outlined text-[12px]">hourglass_empty</span>⏳ Hedef: ${completedCount}/${target} Gün</span>`;
            }
        } else if (habit.frequency === 'monthly') {
            const target = habit.targetCount || 10;
            const completedCount = getMonthlyCompletionsCount(habit, selectedHabitsDate);
            if (completedCount >= target) {
                successBadge = `<span class="text-[11px] font-bold text-primary flex items-center gap-0.5 bg-[#7ed9c3]/20 px-2.5 py-0.5 rounded-full shadow-[0_4px_6px_rgba(0,107,90,0.05)]"><span class="material-symbols-outlined text-[12px] font-bold">workspace_premium</span>🏆 Hedef Başarıldı! (${completedCount}/${target})</span>`;
            } else {
                successBadge = `<span class="text-[11px] font-bold text-on-surface-variant/80 flex items-center gap-0.5 bg-surface-container px-2.5 py-0.5 rounded-full"><span class="material-symbols-outlined text-[12px]">hourglass_empty</span>⏳ Hedef: ${completedCount}/${target} Gün</span>`;
            }
        }

        // Notification Bell Icon layout & Reminder badge text next to Category
        const isReminderOn = habit.reminderEnabled !== false;
        const bellIcon = isReminderOn ? 'notifications_active' : 'notifications_off';
        const bellColor = isReminderOn ? 'text-primary' : 'text-on-surface-variant/30';

        let reminderBadge = '';
        if (isReminderOn) {
            const timeStr = habit.reminderTime || '09:00';
            const dayStr = habit.reminderDay ? `${habit.reminderDay.replace('gün', 'Gün')}, ` : '';
            const freqStr = habit.frequency === 'daily' ? 'Her Gün' : '';
            reminderBadge = `
                <div class="flex items-center gap-xs px-2 py-0.5 rounded-full bg-surface-container/60 text-[11px] text-on-surface-variant font-medium">
                    <span class="material-symbols-outlined text-[14px]">notifications</span>
                    <span>${dayStr || freqStr ? (dayStr + freqStr) : ''} ${timeStr}</span>
                </div>
            `;
        } else {
            reminderBadge = `
                <div class="flex items-center gap-xs px-2 py-0.5 rounded-full bg-surface-container/30 text-[11px] text-on-surface-variant/40 font-medium">
                    <span class="material-symbols-outlined text-[14px]">notifications_off</span>
                    <span>Kapalı</span>
                </div>
            `;
        }

        const card = document.createElement('div');
        card.className = `soft-card p-4 sm:p-md shadow-[0_15px_20px_rgba(45,52,54,0.03)] border-l-4 flex flex-col gap-sm bg-white relative overflow-hidden group transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_25px_rgba(45,52,54,0.05)]`;
        card.style.borderLeftColor = habitColor;

        if (isEditing) {
            card.innerHTML = `
                <div class="flex flex-col gap-md w-full text-left">
                    <span class="font-label-sm text-label-sm text-on-surface-variant font-bold">Alışkanlık Bilgilerini Düzenle</span>
                    
                    <!-- Habit Name Input -->
                    <div class="flex flex-col gap-xs">
                        <label class="text-xs font-bold text-on-surface-variant">Alışkanlık İsmi</label>
                        <input type="text" id="edit-habit-input-${habit.id}" value="${habit.name}" class="bg-surface-container-low border-none rounded-xl py-2 px-3 font-body-md text-on-surface focus:ring-2 focus:ring-primary-container outline-none" autocomplete="off" />
                    </div>

                    <!-- Category Dropdown -->
                    <div class="flex flex-col gap-xs">
                        <label class="text-xs font-bold text-on-surface-variant">Kategori</label>
                        <select id="edit-habit-category-${habit.id}" onchange="toggleEditCustomFields('${habit.id}')" class="bg-surface-container-low border-none rounded-xl py-2 px-3 font-body-md text-on-surface focus:ring-2 focus:ring-primary-container outline-none">
                            <option value="Health" ${habit.category === 'Health' ? 'selected' : ''}>Sağlık</option>
                            <option value="Mind" ${habit.category === 'Mind' ? 'selected' : ''}>Zihin</option>
                            <option value="Productivity" ${habit.category === 'Productivity' ? 'selected' : ''}>Üretkenlik</option>
                            <option value="Book" ${habit.category === 'Book' ? 'selected' : ''}>Kitap</option>
                            <option value="Software" ${habit.category === 'Software' ? 'selected' : ''}>Yazılım</option>
                            <option value="Sport" ${habit.category === 'Sport' ? 'selected' : ''}>Spor</option>
                            <option value="Sleep" ${habit.category === 'Sleep' ? 'selected' : ''}>Uyku</option>
                            <option value="Social" ${habit.category === 'Social' ? 'selected' : ''}>Sosyal</option>
                            <option value="Other" ${habit.category === 'Other' ? 'selected' : ''}>Diğer</option>
                        </select>
                    </div>

                    <!-- Custom Category Fields -->
                    <div id="edit-custom-category-group-${habit.id}" class="${habit.category === 'Other' ? '' : 'hidden'} grid grid-cols-2 gap-sm p-3 bg-surface-container-low rounded-xl border border-surface-container-high shadow-sm">
                        <div class="flex flex-col gap-xs">
                            <label class="text-[11px] font-bold text-on-surface-variant">Özel Kategori Adı</label>
                            <input type="text" id="edit-habit-custom-category-${habit.id}" value="${habit.customCategoryName || ''}" class="bg-white border-none rounded-lg py-1.5 px-3 font-body-md text-on-surface focus:ring-2 focus:ring-primary-container outline-none" placeholder="Örn: Hobi" autocomplete="off" />
                        </div>
                        <div class="flex flex-col gap-xs">
                            <label class="text-[11px] font-bold text-on-surface-variant">Emoji</label>
                            <input type="text" id="edit-habit-custom-emoji-${habit.id}" value="${habit.customEmoji || 'more_horiz'}" class="bg-white border-none rounded-lg py-1.5 px-3 font-body-md text-on-surface focus:ring-2 focus:ring-primary-container outline-none" placeholder="Örn: 📚" autocomplete="off" />
                        </div>
                    </div>

                    <!-- Frequency & Target Selection -->
                    <div class="flex flex-col gap-xs">
                        <label class="text-xs font-bold text-on-surface-variant">Hedef Sıklığı & Sayaç</label>
                        <div class="flex gap-2">
                            <select id="edit-habit-frequency-${habit.id}" onchange="onEditFrequencyChange('${habit.id}')" class="flex-1 bg-surface-container-low border-none rounded-xl py-2 px-3 font-body-md text-on-surface focus:ring-2 focus:ring-primary-container outline-none">
                                <option value="daily" ${habit.frequency === 'daily' ? 'selected' : ''}>Her Gün</option>
                                <option value="weekly" ${habit.frequency === 'weekly' ? 'selected' : ''}>Haftalık</option>
                                <option value="monthly" ${habit.frequency === 'monthly' ? 'selected' : ''}>Aylık</option>
                            </select>
                            <div id="edit-habit-target-group-${habit.id}" class="${habit.frequency === 'daily' ? 'hidden' : ''} flex items-center gap-xs bg-surface-container-low px-3 rounded-xl">
                                <span class="text-xs text-on-surface-variant font-bold">Gün:</span>
                                <input type="number" id="edit-habit-target-${habit.id}" value="${habit.targetCount || 1}" min="1" max="${habit.frequency === 'weekly' ? 7 : 30}" class="w-12 bg-transparent border-none p-0 text-center font-bold text-on-surface focus:ring-0 outline-none" />
                            </div>
                        </div>
                    </div>

                    <!-- Reminder Notification Toggle, Time & Day Selector -->
                    <div class="flex flex-col gap-sm bg-surface-container-low p-3 rounded-xl border border-surface-container-high">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-bold text-on-surface-variant">Hatırlatıcı Bildirimi</span>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="edit-habit-reminder-toggle-${habit.id}" class="sr-only peer" ${habit.reminderEnabled !== false ? 'checked' : ''} onchange="toggleEditReminderTimeGroup('${habit.id}')">
                                <div class="w-9 h-5 bg-surface-container rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-surface-variant after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>
                        <div id="edit-habit-reminder-time-group-${habit.id}" class="${habit.reminderEnabled !== false ? '' : 'hidden'} flex flex-col gap-2">
                            <div class="flex items-center justify-between">
                                <span class="text-[11px] font-bold text-on-surface-variant">Bildirim Saati</span>
                                <input type="time" id="edit-habit-reminder-time-${habit.id}" value="${habit.reminderTime || '09:00'}" class="bg-white border-none rounded-lg py-1 px-2 text-xs font-body-md text-on-surface focus:ring-2 focus:ring-primary-container outline-none" />
                            </div>
                            <div id="edit-habit-reminder-day-container-${habit.id}" class="${habit.frequency === 'daily' ? 'hidden' : ''} flex items-center justify-between">
                                <span class="text-[11px] font-bold text-on-surface-variant">Bildirim Günü</span>
                                <select id="edit-habit-reminder-day-${habit.id}" class="bg-white border-none rounded-lg py-1 px-2 text-xs font-body-md text-on-surface focus:ring-2 focus:ring-primary-container outline-none">
                                    <!-- Populated by JS -->
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Accent Color Picker -->
                    <div class="flex flex-col gap-xs">
                        <span class="text-xs font-bold text-on-surface-variant">Renk Seçimi</span>
                        <div class="grid grid-cols-5 gap-2 bg-surface-container-low p-3 rounded-xl justify-items-center" id="edit-color-picker-container-${habit.id}" data-selected-color="${habit.color || '#006b5a'}">
                            <button type="button" class="w-6 h-6 rounded-full bg-[#006b5a] ${habitColor === '#006b5a' ? 'active-habit-ring' : ''}" onclick="selectEditColorBtn(this, '${habit.id}', '#006b5a')"></button>
                            <button type="button" class="w-6 h-6 rounded-full bg-[#FFD966] ${habitColor === '#FFD966' ? 'active-habit-ring' : ''}" onclick="selectEditColorBtn(this, '${habit.id}', '#FFD966')"></button>
                            <button type="button" class="w-6 h-6 rounded-full bg-[#9e4037] ${habitColor === '#9e4037' ? 'active-habit-ring' : ''}" onclick="selectEditColorBtn(this, '${habit.id}', '#9e4037')"></button>
                            <button type="button" class="w-6 h-6 rounded-full bg-[#67558c] ${habitColor === '#67558c' ? 'active-habit-ring' : ''}" onclick="selectEditColorBtn(this, '${habit.id}', '#67558c')"></button>
                            <button type="button" class="w-6 h-6 rounded-full bg-[#fe8a7c] ${habitColor === '#fe8a7c' ? 'active-habit-ring' : ''}" onclick="selectEditColorBtn(this, '${habit.id}', '#fe8a7c')"></button>
                            <button type="button" class="w-6 h-6 rounded-full bg-[#bdc9c4] ${habitColor === '#bdc9c4' ? 'active-habit-ring' : ''}" onclick="selectEditColorBtn(this, '${habit.id}', '#bdc9c4')"></button>
                            <button type="button" class="w-6 h-6 rounded-full bg-[#4f94e8] ${habitColor === '#4f94e8' ? 'active-habit-ring' : ''}" onclick="selectEditColorBtn(this, '${habit.id}', '#4f94e8')"></button>
                            <button type="button" class="w-6 h-6 rounded-full bg-[#e25c80] ${habitColor === '#e25c80' ? 'active-habit-ring' : ''}" onclick="selectEditColorBtn(this, '${habit.id}', '#e25c80')"></button>
                            <button type="button" class="w-6 h-6 rounded-full bg-[#e88d30] ${habitColor === '#e88d30' ? 'active-habit-ring' : ''}" onclick="selectEditColorBtn(this, '${habit.id}', '#e88d30')"></button>
                            <button type="button" class="w-6 h-6 rounded-full bg-[#14b8a6] ${habitColor === '#14b8a6' ? 'active-habit-ring' : ''}" onclick="selectEditColorBtn(this, '${habit.id}', '#14b8a6')"></button>
                        </div>
                    </div>

                    <!-- Save / Cancel Actions -->
                    <div class="flex justify-end gap-2 pt-2">
                        <button class="bg-primary text-white font-label-md px-5 py-2.5 rounded-xl active:scale-95 transition-all text-sm" onclick="saveHabitName('${habit.id}')">Kaydet</button>
                        <button class="bg-surface-container text-on-surface-variant font-label-md px-5 py-2.5 rounded-xl active:scale-95 transition-all text-sm" onclick="cancelEditHabit()">İptal</button>
                    </div>
                </div>
            `;
        } else {
            card.innerHTML = `
                <!-- Top Row: Title, Streak & Check Button -->
                <div class="flex items-center justify-between gap-2 sm:gap-md">
                    <!-- Left: Info & Title -->
                    <div class="flex-1 min-w-0 space-y-1">
                        <div class="flex items-center gap-2 flex-wrap">
                            <span class="font-headline-sm text-base sm:text-[18px] text-on-surface font-bold leading-snug truncate max-w-full" title="${habit.name}">${habit.name}</span>
                            ${streak > 0 ? `
                                <div class="flex items-center gap-0.5 text-secondary font-label-sm font-bold bg-secondary-container/20 px-2 py-0.5 rounded-full scale-90 shrink-0" title="Mevcut Zincir">
                                    <span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1; color: #9e4037">local_fire_department</span>
                                    <span style="color: #9e4037">${streak} Gün</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Right: Big Round Check Button -->
                    <div class="flex-shrink-0">
                        <button class="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                            isCompletedOnDate
                                ? 'border-primary text-white shadow-md shadow-primary/20 scale-110 active:scale-95'
                                : 'border-surface-container-highest hover:border-primary bg-white text-transparent active:scale-95'
                        }" style="background-color: ${isCompletedOnDate ? '#006b5a' : 'transparent'}; border-color: ${isCompletedOnDate ? '#006b5a' : ''};" onclick="toggleHabitDay('${habit.id}', '${selectedHabitsDate}')">
                            <span class="material-symbols-outlined text-xl sm:text-2xl font-bold transition-all duration-300" style="font-variation-settings: 'wght' 700; color: ${isCompletedOnDate ? '#ffffff' : 'transparent'};">
                                check
                            </span>
                        </button>
                    </div>
                </div>

                <!-- Bottom Row: Divider, Badges & Action Buttons -->
                <div class="flex flex-col gap-sm xs:flex-row xs:items-center justify-between border-t border-surface-container-high/40 pt-3 mt-1">
                    <!-- Badges (Category, Reminder, successBadge) -->
                    <div class="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
                        <div class="flex items-center gap-xs px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold shrink-0" style="background-color: ${habitColor}1A; color: ${habitColor};">
                            ${categoryElement}
                            <span>${textCategory}</span>
                        </div>
                        ${reminderBadge}
                        ${successBadge}
                    </div>

                    <!-- Action Icons (Reminder Toggle, Edit, Delete) -->
                    <div class="flex items-center gap-1.5 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 self-end xs:self-auto shrink-0">
                        <!-- Toggle Reminder Bell -->
                        <button class="p-1 sm:p-1.5 rounded-full hover:bg-surface-container ${bellColor} active:scale-90 transition-colors" onclick="toggleHabitReminder('${habit.id}', event)" title="Hatırlatıcıyı Aç/Kapat">
                            <span class="material-symbols-outlined text-[16px] sm:text-[18px]">${bellIcon}</span>
                        </button>
                        <button class="p-1 sm:p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant/60 hover:text-on-surface transition-colors" onclick="editHabitName('${habit.id}')" title="Düzenle">
                            <span class="material-symbols-outlined text-[16px] sm:text-[18px]">edit</span>
                        </button>
                        <button class="p-1 sm:p-1.5 rounded-full hover:bg-error-container text-on-surface-variant/60 hover:text-error transition-colors" onclick="deleteHabit('${habit.id}')" title="Sil">
                            <span class="material-symbols-outlined text-[16px] sm:text-[18px]">delete</span>
                        </button>
                    </div>
                </div>
            `;
        }

        listContainer.appendChild(card);
    });
}

// Inline Editing & Toggle Triggers
window.editHabitName = function(id) {
    editingHabitId = id;
    renderDashboard();
    
    // Populate form fields & select input
    setTimeout(() => {
        const habit = habits.find(h => h.id === id);
        if (habit) {
            const input = document.getElementById(`edit-habit-input-${id}`);
            if (input) {
                input.focus();
                input.select();
            }
            if (habit.frequency !== 'daily') {
                populateEditReminderDays(id, habit.frequency, habit.reminderDay);
            }
        }
    }, 50);
};

window.cancelEditHabit = function() {
    editingHabitId = null;
    renderDashboard();
};

window.toggleEditCustomFields = function(id) {
    const categorySelect = document.getElementById(`edit-habit-category-${id}`);
    const customGrp = document.getElementById(`edit-custom-category-group-${id}`);
    if (categorySelect && customGrp) {
        if (categorySelect.value === 'Other') {
            customGrp.classList.remove('hidden');
        } else {
            customGrp.classList.add('hidden');
        }
    }
};

window.onEditFrequencyChange = function(id) {
    const freqSelect = document.getElementById(`edit-habit-frequency-${id}`);
    const targetGroup = document.getElementById(`edit-habit-target-group-${id}`);
    const targetInput = document.getElementById(`edit-habit-target-${id}`);
    const dayContainer = document.getElementById(`edit-habit-reminder-day-container-${id}`);
    
    if (freqSelect) {
        const freq = freqSelect.value;
        if (freq === 'daily') {
            if (targetGroup) targetGroup.classList.add('hidden');
            if (dayContainer) dayContainer.classList.add('hidden');
        } else {
            if (targetGroup) targetGroup.classList.remove('hidden');
            if (dayContainer) dayContainer.classList.remove('hidden');
            
            if (targetInput) {
                if (freq === 'weekly') {
                    targetInput.max = 7;
                    if (parseInt(targetInput.value) > 7) targetInput.value = 7;
                } else {
                    targetInput.max = 30;
                }
            }
            populateEditReminderDays(id, freq);
        }
    }
};

window.populateEditReminderDays = function(id, freq, currentDay = '') {
    const daySelect = document.getElementById(`edit-habit-reminder-day-${id}`);
    if (daySelect) {
        populateReminderDays(daySelect, freq, currentDay);
    }
};

window.saveHabitName = function(id) {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;
    
    const nameInput = document.getElementById(`edit-habit-input-${id}`);
    const categorySelect = document.getElementById(`edit-habit-category-${id}`);
    const customCatInput = document.getElementById(`edit-custom-category-group-${id}`) ? document.getElementById(`edit-habit-custom-category-${id}`) : null;
    const customEmojiInput = document.getElementById(`edit-custom-category-group-${id}`) ? document.getElementById(`edit-habit-custom-emoji-${id}`) : null;
    const freqSelect = document.getElementById(`edit-habit-frequency-${id}`);
    const targetInput = document.getElementById(`edit-habit-target-${id}`);
    const reminderToggle = document.getElementById(`edit-habit-reminder-toggle-${id}`);
    const reminderTimeInput = document.getElementById(`edit-habit-reminder-time-${id}`);
    const reminderDaySelect = document.getElementById(`edit-habit-reminder-day-${id}`);
    
    const colorContainer = document.getElementById(`edit-color-picker-container-${id}`);
    const selectedColorHex = colorContainer ? colorContainer.getAttribute('data-selected-color') : habit.color;

    if (nameInput) {
        const newName = nameInput.value.trim();
        if (!newName) {
            alert('Alışkanlık ismi boş bırakılamaz!');
            return;
        }
        habit.name = newName;
    }
    
    if (categorySelect) {
        habit.category = categorySelect.value;
        if (habit.category === 'Other') {
            habit.customCategoryName = customCatInput ? (customCatInput.value.trim() || 'Diğer') : 'Diğer';
            habit.customEmoji = customEmojiInput ? (customEmojiInput.value.trim() || 'more_horiz') : 'more_horiz';
        } else {
            delete habit.customCategoryName;
            delete habit.customEmoji;
        }
    }
    
    if (freqSelect) {
        habit.frequency = freqSelect.value;
        if (habit.frequency === 'daily') {
            habit.targetCount = 1;
            habit.reminderDay = '';
        } else {
            habit.targetCount = targetInput ? Math.max(1, parseInt(targetInput.value) || 1) : 1;
            if (reminderDaySelect) {
                habit.reminderDay = reminderDaySelect.value;
            }
        }
    }
    
    if (reminderToggle) {
        habit.reminderEnabled = reminderToggle.checked;
    }
    
    if (reminderTimeInput) {
        habit.reminderTime = reminderTimeInput.value;
    }
    
    if (selectedColorHex) {
        habit.color = selectedColorHex;
    }
    
    saveState();
    editingHabitId = null;
    renderDashboard();
    
    if (activeTab === 'progress') {
        renderProgress();
    }
    
    showToast('Alışkanlık başarıyla güncellendi! ✏️', 'success');
};

window.deleteHabit = function(id) {
    if (confirm('Bu alışkanlığı silmek istediğinize emin misiniz?')) {
        const habit = habits.find(h => h.id === id);
        habits = habits.filter(h => h.id !== id);
        saveState();
        renderDashboard();
        showToast(`"${habit.name}" başarıyla silindi.`, 'info');
    }
};

window.toggleHabitDay = function(id, dateStr) {
    const habit = habits.find(h => h.id === id);
    if (habit) {
        const index = habit.history.indexOf(dateStr);
        if (index > -1) {
            habit.history.splice(index, 1);
        } else {
            habit.history.push(dateStr);
        }
        saveState();
        renderDashboard();
        
        if (activeTab === 'progress') {
            renderProgress();
        }
    }
};

// Habit Bell Reminder Toggle
window.toggleHabitReminder = function(id, event) {
    if (event) event.stopPropagation(); // prevent card container clicks
    
    const habit = habits.find(h => h.id === id);
    if (habit) {
        habit.reminderEnabled = habit.reminderEnabled === false ? true : false;
        saveState();
        renderDashboard();
        
        const status = habit.reminderEnabled !== false ? 'aktif edildi 🔔' : 'kapatıldı 🔕';
        showToast(`"${habit.name}" hatırlatıcıları ${status}`, 'success');
    }
};

// ==========================================
// DAILY NOTES (JOURNAL) TIMELINE
// ==========================================
function renderJournalTimeline() {
    const timelineRow = document.getElementById('journal-timeline-row');
    if (!timelineRow) return;

    timelineRow.innerHTML = '';
    const days = getWeekDaysForDate(selectedJournalDate);

    days.forEach(day => {
        const entry = journal[day.str];
        const hasNote = entry && (typeof entry === 'string' ? entry.trim().length > 0 : (entry.note && entry.note.trim().length > 0));
        const isSelected = day.str === selectedJournalDate;
        const isToday = day.str === getTodayString();
        const isFuture = day.isFuture;

        const btn = document.createElement('button');
        btn.type = "button";

        if (isFuture) {
            btn.className = "flex flex-col items-center justify-center w-10 h-10 rounded-full text-on-surface-variant/30 font-label-sm cursor-not-allowed shrink-0 relative";
        } else if (isSelected) {
            btn.className = "flex flex-col items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-label-sm font-bold shadow-md shadow-primary/20 scale-105 transition-all shrink-0 relative";
        } else if (isToday) {
            btn.className = "flex flex-col items-center justify-center w-10 h-10 rounded-full border-2 border-primary text-primary font-label-sm font-semibold hover:bg-surface-container shrink-0 relative";
        } else {
            btn.className = "flex flex-col items-center justify-center w-10 h-10 rounded-full text-on-surface-variant font-label-sm hover:bg-surface-container shrink-0 relative";
        }

        btn.innerHTML = `
            <span class="text-[11px] leading-none uppercase text-opacity-70">${day.label.substring(0, 1)}</span>
            <span class="text-xs font-bold leading-none mt-0.5">${day.dayNum}</span>
            ${!isFuture && hasNote ? `<span class="w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-primary'} absolute -bottom-0.5 left-1/2 -translate-x-1/2"></span>` : ''}
        `;

        if (!isFuture) {
            btn.onclick = () => {
                selectJournalDate(day.str);
                renderJournalTimeline();
            };
        }
        timelineRow.appendChild(btn);
    });
}

window.selectJournalDate = function(dateStr) {
    selectedJournalDate = dateStr;

    const titleEl = document.getElementById('journal-selected-title');
    const inputEl = document.getElementById('dashboard-journal-input');
    const saveBtn = document.getElementById('btn-save-reflection');

    if (!titleEl || !inputEl || !saveBtn) return;

    const todayStr = getTodayString();
    if (dateStr === todayStr) {
        titleEl.textContent = "Bugünkü Düşüncelerim";
    } else {
        const d = new Date(dateStr);
        const label = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
        titleEl.textContent = `${label} Günü Düşüncelerim`;
    }

    const val = journal[dateStr];
    let noteText = '';
    let moodRating = null;

    if (val) {
        if (typeof val === 'string') {
            noteText = val;
        } else {
            noteText = val.note || '';
            moodRating = val.mood || null;
        }
    }

    inputEl.value = noteText;
    highlightMoodButtons(moodRating);

    if (noteText.trim().length > 0) {
        saveBtn.textContent = "Notu Güncelle";
    } else {
        saveBtn.textContent = "Notu Kaydet";
    }

    renderJournalTimeline();

    // Sync input date element
    const picker = document.getElementById('journal-date-picker');
    if (picker) picker.value = dateStr;
};

function initJournalSection() {
    const saveBtn = document.getElementById('btn-save-reflection');
    const inputEl = document.getElementById('dashboard-journal-input');

    if (saveBtn && inputEl) {
        saveBtn.addEventListener('click', () => {
            const note = inputEl.value.trim();
            const dateStr = selectedJournalDate;
            const currentVal = journal[dateStr];
            
            let currentMood = null;
            if (currentVal && typeof currentVal === 'object') {
                currentMood = currentVal.mood || null;
            }
            
            if (note || currentMood) {
                journal[dateStr] = {
                    note: note,
                    mood: currentMood
                };
            } else {
                delete journal[dateStr];
            }

            saveState();
            selectJournalDate(dateStr); // Refresh notes timeline
            showToast('Notunuz başarıyla kaydedildi! ✍️', 'success');
        });
    }
}

// Hook up Header Calendar Button to trigger Date picker
function initCalendarAction() {
    const calendarBtn = document.getElementById('btn-header-calendar');
    if (calendarBtn) {
        calendarBtn.onclick = () => {
            switchTab('dashboard');
            
            const dateInput = document.createElement('input');
            dateInput.type = 'date';
            dateInput.style.display = 'none';
            document.body.appendChild(dateInput);
            
            dateInput.onchange = () => {
                if (dateInput.value) {
                    // Update both calendars to selected date
                    selectJournalDate(dateInput.value);
                    
                    selectedHabitsDate = dateInput.value;
                    renderHabitsTimeline();
                    renderTodayProgress();
                    renderHabitsList();
                }
                dateInput.remove();
            };
            
            dateInput.click();
        };
    }
}

// Random Inspo Quote loader
function loadSessionQuote() {
    const titleEl = document.getElementById('inspo-title');
    const quoteEl = document.getElementById('inspo-quote');
    if (titleEl && quoteEl) {
        titleEl.textContent = currentSessionQuote.title;
        quoteEl.textContent = currentSessionQuote.quote;
    }
}

function formatHumanDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
}

function renderDashboard() {
    updateHeader();
    renderTodayProgress();
    renderHabitsTimeline();
    renderHabitsList();
    renderJournalTimeline();
    loadSessionQuote();

    const habitsLabel = document.getElementById('habits-selected-date-label');
    if (habitsLabel) {
        habitsLabel.textContent = selectedHabitsDate === getTodayString() ? 'Bugün' : formatHumanDate(selectedHabitsDate);
    }
    const journalLabel = document.getElementById('journal-selected-date-label');
    if (journalLabel) {
        journalLabel.textContent = selectedJournalDate === getTodayString() ? 'Bugün' : formatHumanDate(selectedJournalDate);
    }
}

// ==========================================
// WEEKLY PROGRESS RENDERING
// ==========================================
function renderProgressStats() {
    const streakVal = document.getElementById('progress-streak-val');
    const totalVal = document.getElementById('progress-total-val');
    const weeklyTag = document.getElementById('progress-weekly-completions-tag');

    if (streakVal) {
        let maxStreak = 0;
        habits.forEach(h => {
            const streak = calculateStreak(h);
            if (streak > maxStreak) {
                maxStreak = streak;
            }
        });
        streakVal.textContent = `${maxStreak} Gün`;
    }

    if (totalVal) {
        const totalCompleted = habits.reduce((sum, h) => sum + h.history.length, 0);
        totalVal.textContent = `${totalCompleted} Kere`;
    }

    if (weeklyTag) {
        const last7Days = getLast7Days();
        const last7DaysStrings = last7Days.map(d => d.str);
        let weeklyCompleted = 0;
        habits.forEach(h => {
            h.history.forEach(d => {
                if (last7DaysStrings.includes(d)) {
                    weeklyCompleted++;
                }
            });
        });
        weeklyTag.textContent = `Bu hafta ${weeklyCompleted} tamamlandı`;
    }
}

// ==========================================
// MULTI-RANGE ACTIVITY WAVE CHART
// ==========================================

function getMonthlyCompletionRate(year, month) {
    // Returns avg daily completion ratio for a specific month (0-indexed)
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let totalRatio = 0;
    const total = habits.length;
    if (total === 0) return 0;

    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const completed = habits.filter(h => h.history.includes(dateStr)).length;
        totalRatio += completed / total;
    }
    return totalRatio / daysInMonth;
}

function getMonthlyMoodAverage(year, month) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let totalMood = 0;
    let count = 0;

    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const val = journal[dateStr];
        if (val && typeof val === 'object' && val.mood) {
            totalMood += val.mood;
            count++;
        }
    }
    return count > 0 ? totalMood / count : 3;
}

function renderWaveChart() {
    const strokeEl = document.getElementById('weekly-wave-stroke');
    const fillEl = document.getElementById('weekly-wave-fill');
    const labelsRow = document.getElementById('wave-labels-row');
    const statusDesc = document.getElementById('chart-status-desc');
    const legendDot = document.getElementById('chart-legend-dot');
    const stop1 = document.getElementById('wave-grad-stop-1');
    const stop2 = document.getElementById('wave-grad-stop-2');

    if (!strokeEl || !fillEl || !labelsRow || !statusDesc) return;

    let dataPoints = [];
    let labelTexts = [];
    const range = selectedActivityRange || 'weekly';

    if (range === 'weekly') {
        const days = getWeekDaysForDate(activityViewDate);
        const total = habits.length;
        days.forEach((d, index) => {
            const xStep = days.length > 1 ? 380 / (days.length - 1) : 0;
            const x = 10 + xStep * index;
            const completedOnDay = habits.filter(h => h.history.includes(d.str)).length;
            const r = total > 0 ? completedOnDay / total : 0;
            dataPoints.push({ x, y: 80 - 60 * r, r });
            labelTexts.push(d.label);
        });

        const dateLabel = document.getElementById('activity-chart-date-label');
        if (dateLabel) dateLabel.textContent = getWeekRangeLabel(days);

    } else if (range === 'monthly') {
        const days = getMonthDaysForDate(activityViewDate);
        const total = habits.length;
        days.forEach((d, index) => {
            const xStep = days.length > 1 ? 380 / (days.length - 1) : 0;
            const x = 10 + xStep * index;
            const completedOnDay = habits.filter(h => h.history.includes(d.str)).length;
            const r = total > 0 ? completedOnDay / total : 0;
            dataPoints.push({ x, y: 80 - 60 * r, r });
            labelTexts.push(index === 0 || (d.dayNum % 5 === 0) || index === days.length - 1 ? d.dayNum.toString() : '');
        });

        const dateLabel = document.getElementById('activity-chart-date-label');
        if (dateLabel) dateLabel.textContent = getMonthRangeLabel(activityViewDate);

    } else if (range === 'yearly') {
        const months = getYearMonthsForDate(activityViewDate);
        months.forEach((m, index) => {
            const xStep = months.length > 1 ? 380 / (months.length - 1) : 0;
            const x = 10 + xStep * index;
            const r = getMonthlyCompletionRate(m.year, m.month);
            dataPoints.push({ x, y: 80 - 60 * r, r });
            labelTexts.push(m.label);
        });

        const dateLabel = document.getElementById('activity-chart-date-label');
        if (dateLabel) dateLabel.textContent = getYearRangeLabel(activityViewDate);
    }

    const strokePath = getSplinePath(dataPoints);
    const fillPath = dataPoints.length > 0 ? `${strokePath} V 100 H ${dataPoints[0]?.x || 20} Z` : '';

    strokeEl.setAttribute('d', strokePath);
    fillEl.setAttribute('d', fillPath);

    const avgRatio = dataPoints.length > 0 ? dataPoints.reduce((s, p) => s + p.r, 0) / dataPoints.length : 0;

    let statusText = "Uygulamayı kullanmaya başladıkça aktivite grafiğin burada canlanacak!";
    if (habits.length > 0) {
        if (avgRatio >= 0.8) statusText = "Mükemmel! Hedeflerini neredeyse eksiksiz tamamladın. Zincir çok sağlam!";
        else if (avgRatio >= 0.5) statusText = "Tebrikler! Alışkanlık takibinde dengeli ve kararlı bir grafik sergiliyorsun.";
        else if (avgRatio > 0) statusText = "Geliştirilebilir. Küçük adımlarla başlayarak hedeflerini yukarı taşıyabilirsin.";
        else statusText = "Henüz hiçbir alışkanlık tamamlamadın. Bugün yeni bir başlangıç yapabilirsin!";
    }

    strokeEl.setAttribute('stroke', '#006b5a');
    if (stop1) stop1.style.stopColor = '#006b5a';
    if (stop2) stop2.style.stopColor = '#006b5a';
    if (legendDot) legendDot.style.backgroundColor = '#006b5a';
    statusDesc.textContent = statusText;

    labelsRow.innerHTML = '';
    labelTexts.forEach(lbl => {
        const span = document.createElement('span');
        span.className = `flex-1 text-center text-[10px] font-semibold text-on-surface-variant/70 uppercase truncate`;
        span.textContent = lbl;
        labelsRow.appendChild(span);
    });
}

window.switchActivityRange = function(range) {
    selectedActivityRange = range;
    activityViewDate = getTodayString(); // Reset to today on range switch

    const btnW = document.getElementById('btn-act-weekly');
    const btnM = document.getElementById('btn-act-monthly');
    const btnY = document.getElementById('btn-act-yearly');

    [btnW, btnM, btnY].forEach(b => {
        if (b) b.className = "flex-1 py-1 text-[10px] font-label-md rounded-full transition-all duration-300 text-on-surface-variant font-semibold";
    });

    const active = { weekly: btnW, monthly: btnM, yearly: btnY }[range];
    if (active) active.className = "flex-1 py-1 text-[10px] font-label-md rounded-full transition-all duration-300 bg-primary text-white font-semibold";

    renderWaveChart();
};

window.switchMoodRange = function(range) {
    selectedMoodRange = range;
    moodViewDate = getTodayString(); // Reset to today on range switch

    const btnW = document.getElementById('btn-mood-weekly');
    const btnM = document.getElementById('btn-mood-monthly');
    const btnY = document.getElementById('btn-mood-yearly');

    [btnW, btnM, btnY].forEach(b => {
        if (b) b.className = "flex-1 py-1 text-[10px] font-label-md rounded-full transition-all duration-300 text-on-surface-variant font-semibold";
    });

    const active = { weekly: btnW, monthly: btnM, yearly: btnY }[range];
    if (active) active.className = "flex-1 py-1 text-[10px] font-label-md rounded-full transition-all duration-300 bg-primary text-white font-semibold";

    renderMoodChart();
};

window.switchPerformanceRange = function(range) {
    selectedPerformanceRange = range;
    performanceViewDate = getTodayString(); // Reset to today on range switch

    const btnW = document.getElementById('btn-perf-weekly');
    const btnM = document.getElementById('btn-perf-monthly');
    const btnY = document.getElementById('btn-perf-yearly');
    const titleEl = document.getElementById('perf-chart-title');

    [btnW, btnM, btnY].forEach(b => {
        if (b) b.className = "flex-1 py-1 text-[10px] font-label-md rounded-full transition-all duration-300 text-on-surface-variant font-semibold";
    });

    const active = { weekly: btnW, monthly: btnM, yearly: btnY }[range];
    if (active) active.className = "flex-1 py-1 text-[10px] font-label-md rounded-full transition-all duration-300 bg-primary text-white font-semibold";

    const titles = { weekly: 'Haftalık Performans Çizelgesi', monthly: 'Aylık Performans Çizelgesi', yearly: 'Yıllık Performans Çizelgesi' };
    if (titleEl) titleEl.textContent = titles[range] || 'Performans Çizelgesi';

    renderHabitsPerformanceGrid();
};

function getCategoryIconHtml(category, habitColor, customEmoji) {
    if (category === 'Health') return `<span class="material-symbols-outlined text-[12px] align-middle" style="color: ${habitColor}">favorite</span>`;
    if (category === 'Mind') return `<span class="material-symbols-outlined text-[12px] align-middle" style="color: ${habitColor}">psychology</span>`;
    if (category === 'Productivity') return `<span class="material-symbols-outlined text-[12px] align-middle" style="color: ${habitColor}">bolt</span>`;
    if (category === 'Book') return `<span class="material-symbols-outlined text-[12px] align-middle" style="color: ${habitColor}">book</span>`;
    if (category === 'Software') return `<span class="material-symbols-outlined text-[12px] align-middle" style="color: ${habitColor}">code</span>`;
    if (category === 'Sport') return `<span class="material-symbols-outlined text-[12px] align-middle" style="color: ${habitColor}">fitness_center</span>`;
    if (category === 'Sleep') return `<span class="material-symbols-outlined text-[12px] align-middle" style="color: ${habitColor}">bedtimes</span>`;
    if (category === 'Social') return `<span class="material-symbols-outlined text-[12px] align-middle" style="color: ${habitColor}">group</span>`;
    if (category === 'Other') {
        if (customEmoji) return `<span class="text-xs align-middle leading-none">${customEmoji}</span>`;
        return `<span class="material-symbols-outlined text-[12px] align-middle" style="color: ${habitColor}">more_horiz</span>`;
    }
    return `<span class="material-symbols-outlined text-[12px] align-middle" style="color: ${habitColor}">more_horiz</span>`;
}

function renderHabitsPerformanceGrid() {
    const listContainer = document.getElementById('progress-habits-breakdown-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    if (habits.length === 0) {
        listContainer.innerHTML = `
            <p class="text-center font-body-md text-on-surface-variant/50 py-sm">Henüz performans analizi yapılacak alışkanlık yok.</p>
        `;
        return;
    }

    const range = selectedPerformanceRange || 'weekly';

    // Build the date range and rendering config per range
    let dateRange = [];
    let dotSizeClass = '';
    let checkIcon = '';
    let dotsWrapClass = '';

    if (range === 'weekly') {
        dateRange = getWeekDaysForDate(performanceViewDate);
        dotSizeClass = 'w-6 h-6 text-[10px]';
        checkIcon = '✓';
        dotsWrapClass = "flex items-center gap-xs bg-surface-container/40 p-1.5 rounded-full self-start sm:self-auto overflow-x-auto";

        const dateLabel = document.getElementById('perf-chart-date-label');
        if (dateLabel) dateLabel.textContent = getWeekRangeLabel(dateRange);

    } else if (range === 'monthly') {
        dateRange = getMonthDaysForDate(performanceViewDate);
        dotSizeClass = 'w-3 h-3 xs:w-3.5 xs:h-3.5 text-transparent text-[0px] rounded-sm';
        checkIcon = '';
        dotsWrapClass = "grid grid-cols-7 sm:flex sm:flex-wrap items-center gap-[3px] bg-surface-container/40 p-1.5 rounded-2xl self-start sm:self-auto justify-center sm:max-w-none w-fit sm:w-auto";

        const dateLabel = document.getElementById('perf-chart-date-label');
        if (dateLabel) dateLabel.textContent = getMonthRangeLabel(performanceViewDate);

    } else if (range === 'yearly') {
        dateRange = getYearDaysForDate(performanceViewDate);
        dotSizeClass = 'w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-[2px] text-transparent text-[0px] transition-all hover:scale-125 hover:shadow-md';
        checkIcon = '';
        dotsWrapClass = "grid grid-cols-[repeat(20,minmax(0,1fr))] sm:grid-cols-[repeat(36,minmax(0,1fr))] gap-[4px] bg-surface-container/20 p-3 rounded-2xl self-start sm:self-auto max-w-full justify-start w-full sm:w-auto";

        const dateLabel = document.getElementById('perf-chart-date-label');
        if (dateLabel) dateLabel.textContent = getYearRangeLabel(performanceViewDate);
    }

    habits.forEach(habit => {
        const streak = calculateStreak(habit);
        const habitColor = getHabitColor(habit);

        const categoryMap = {
            Health: 'Sağlık', Mind: 'Zihin', Productivity: 'Üretkenlik',
            Book: 'Kitap', Software: 'Yazılım', Sport: 'Spor',
            Sleep: 'Uyku', Social: 'Sosyal', Other: habit.customCategoryName || 'Diğer'
        };
        const categoryText = categoryMap[habit.category] || 'Diğer';

        const row = document.createElement('div');
        row.className = "soft-card p-4 sm:p-md shadow-[0_15px_20px_rgba(45,52,54,0.02)] border-l-4 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-sm hover:shadow-[0_15px_20px_rgba(45,52,54,0.04)] transition-all";
        row.style.borderLeftColor = habitColor;

        let dotsHtml = '';

        if (range === 'yearly') {
            dateRange.forEach(day => {
                const isDone = habit.history.includes(day.str);
                const dParts = day.str.split('-');
                const dObj = new Date(parseInt(dParts[0]), parseInt(dParts[1]) - 1, parseInt(dParts[2]));
                const titleStr = dObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
                
                if (isDone) {
                    dotsHtml += `<div class="${dotSizeClass} shrink-0 bg-[#7ed9c3] border border-[#006b5a]/20 shadow-[0_1px_2px_rgba(0,0,0,0.05)]" style="background-color: #7ed9c3;" title="${titleStr} - Yapıldı"></div>`;
                } else if (day.isFuture) {
                    dotsHtml += `<div class="${dotSizeClass} shrink-0 border border-dashed border-[#bdc9c4]/40 bg-surface-container-low/20" title="${titleStr} - Gelecek Tarih"></div>`;
                } else {
                    dotsHtml += `<div class="${dotSizeClass} shrink-0 border border-[#bdc9c4] bg-surface-container" title="${titleStr} - Yapılmadı"></div>`;
                }
            });
        } else {
            dateRange.forEach(day => {
                const isDone = habit.history.includes(day.str);
                if (isDone) {
                    dotsHtml += `<div class="${dotSizeClass} rounded-full flex items-center justify-center font-bold shadow-sm shadow-black/5 shrink-0" style="background-color: #7ed9c3; color: #005144;" title="${day.label} - Yapıldı">${checkIcon}</div>`;
                } else {
                    dotsHtml += `<div class="${dotSizeClass} rounded-full border-2 border-[#bdc9c4] dark:border-white/20 bg-surface-container-low/40 dark:bg-white/5 text-transparent shrink-0" title="${day.label} - Yapılmadı"></div>`;
                }
            });
        }

        const categoryIcon = getCategoryIconHtml(habit.category, habitColor, habit.customEmoji);

        row.innerHTML = `
            <div class="flex-1 space-y-1">
                <div class="flex items-center gap-2">
                    <span class="font-headline-sm text-[16px] text-on-surface font-bold">${habit.name}</span>
                    <span class="text-[10px] px-2.5 py-0.5 rounded-full font-semibold text-on-surface-variant flex items-center gap-1 shrink-0" style="background-color: ${habitColor}1A; color: ${habitColor};">
                        ${categoryIcon}
                        <span>${categoryText}</span>
                    </span>
                </div>
                <p class="text-[11px] text-on-surface-variant/60 font-medium">Güncel Zincir: <span class="text-secondary font-bold" style="color: #9e4037">${streak} Gün</span></p>
            </div>
            
            <!-- indicators -->
            <div class="${dotsWrapClass}">
                ${dotsHtml}
            </div>
        `;

        listContainer.appendChild(row);
    });
}

// Render dynamic advice
function renderInsights() {
    const titleEl = document.getElementById('insight-box-title');
    const descEl = document.getElementById('insight-box-desc');

    if (!titleEl || !descEl) return;

    titleEl.textContent = currentSessionAdvice.title;
    descEl.textContent = currentSessionAdvice.desc;
}

function renderProgress() {
    renderProgressStats();
    renderWaveChart();
    renderMoodChart();
    renderHabitsPerformanceGrid();
    renderInsights();
}

// ==========================================
// PROFILE & ACHIEVEMENTS SCREEN
// ==========================================
function renderAchievements() {
    const cards = document.querySelectorAll('#screen-profile .grid > div');
    if (cards.length < 4) return;

    // Condition 1: Zincir Ustası (7-day streak in any habit)
    let has7DayStreak = false;
    habits.forEach(h => {
        if (calculateStreak(h) >= 7) has7DayStreak = true;
    });

    // Condition 2: İstikrarlı (>10 habit completions in last 7 days)
    const last7Days = getLast7Days();
    const last7DaysStrings = last7Days.map(d => d.str);
    let completionsLast7Days = 0;
    habits.forEach(h => {
        h.history.forEach(d => {
            if (last7DaysStrings.includes(d)) completionsLast7Days++;
        });
    });
    const has10Completions = completionsLast7Days >= 10;

    // Condition 3: Kusursuz Gün (Perfect Day)
    // Completed all habits on a single day in history (with at least 3 active habits)
    let hasPerfectDay = false;
    if (habits.length >= 3) {
        const allCompletedDates = new Set();
        habits.forEach(h => {
            h.history.forEach(d => allCompletedDates.add(d));
        });

        for (let dStr of allCompletedDates) {
            const completedCount = habits.filter(h => h.history.includes(dStr)).length;
            if (completedCount === habits.length) {
                hasPerfectDay = true;
                break;
            }
        }
    }

    // Condition 4: Söz Yazarı (Total Journal Entries >= 5)
    let journalEntriesCount = Object.keys(journal).filter(k => journal[k] && journal[k].trim().length > 0).length;
    const has5JournalEntries = journalEntriesCount >= 5;

    // Card 1: Zincir Ustası
    const card1 = cards[0];
    if (has7DayStreak) {
        card1.classList.remove('opacity-60', 'grayscale');
        const badge = card1.querySelector('div');
        if (badge) badge.classList.add('badge-glow');
    } else {
        card1.classList.add('opacity-60', 'grayscale');
        const badge = card1.querySelector('div');
        if (badge) badge.classList.remove('badge-glow');
    }

    // Card 2: İstikrarlı
    const card2 = cards[1];
    if (has10Completions) {
        card2.classList.remove('opacity-60', 'grayscale');
        const badge = card2.querySelector('div');
        if (badge) badge.classList.add('badge-glow');
    } else {
        card2.classList.add('opacity-60', 'grayscale');
        const badge = card2.querySelector('div');
        if (badge) badge.classList.remove('badge-glow');
    }

    // Card 3: Kusursuz Gün
    const card3 = cards[2];
    if (hasPerfectDay) {
        card3.classList.remove('opacity-60', 'grayscale');
        const badge = card3.querySelector('div');
        if (badge) badge.classList.add('badge-glow');
    } else {
        card3.classList.add('opacity-60', 'grayscale');
        const badge = card3.querySelector('div');
        if (badge) badge.classList.remove('badge-glow');
    }

    // Card 4: Söz Yazarı
    const card4 = cards[3];
    if (has5JournalEntries) {
        card4.classList.remove('opacity-60', 'grayscale');
        const badge = card4.querySelector('div');
        if (badge) badge.classList.add('badge-glow');
    } else {
        card4.classList.add('opacity-60', 'grayscale');
        const badge = card4.querySelector('div');
        if (badge) badge.classList.remove('badge-glow');
    }
}

// Global Notification Switch binder in Settings screen
function initGlobalNotificationToggle() {
    const toggle = document.getElementById('settings-notifications-toggle');
    if (toggle) {
        const globalNotif = localStorage.getItem('globalNotificationsEnabled') !== 'false';
        toggle.checked = globalNotif;
        
        toggle.onchange = () => {
            localStorage.setItem('globalNotificationsEnabled', toggle.checked);
            const status = toggle.checked ? 'aktif edildi 🔔' : 'kapatıldı 🔕';
            showToast(`Genel bildirimler ${status}`, 'success');
        };
    }
}

function initBackupAction() {
    const backupBtn = document.getElementById('btn-export-backup');
    if (backupBtn) {
        backupBtn.onclick = () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
                habits: habits,
                journal: journal
            }, null, 2));
            
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", "zinciri-kirma-backup.json");
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
        };
    }
}

function initResetAction() {
    const resetBtn = document.getElementById('btn-reset-db');
    if (resetBtn) {
        resetBtn.onclick = () => {
            if (confirm('Tüm verilerinizi (alışkanlıklar, notlar, geçmiş) sıfırlamak istediğinize emin misiniz? Bu işlem geri alınamaz!')) {
                localStorage.clear();
                window.location.reload();
            }
        };
    }
}

function renderProfile() {
    const profileDisplayName = document.getElementById('profile-display-name');
    if (profileDisplayName) {
        profileDisplayName.textContent = username;
    }
    renderAchievements();
    renderGoals();
    renderAvatar();
}

window.enableProfileNameEdit = function() {
    const displayGroup = document.getElementById('profile-name-display-group');
    const editGroup = document.getElementById('profile-name-edit-group');
    const nameInput = document.getElementById('profile-name-input');
    
    if (displayGroup && editGroup && nameInput) {
        displayGroup.classList.add('hidden');
        editGroup.classList.remove('hidden');
        nameInput.value = username;
        nameInput.focus();
        nameInput.select();
    }
};

window.cancelProfileNameEdit = function() {
    const displayGroup = document.getElementById('profile-name-display-group');
    const editGroup = document.getElementById('profile-name-edit-group');
    
    if (displayGroup && editGroup) {
        displayGroup.classList.remove('hidden');
        editGroup.classList.add('hidden');
    }
};

window.saveProfileName = function() {
    const nameInput = document.getElementById('profile-name-input');
    if (nameInput) {
        const val = nameInput.value.trim();
        if (val) {
            username = val;
            localStorage.setItem('username', username);
            updateHeader();
            renderProfile();
        }
    }
    window.cancelProfileNameEdit();
};

// ==========================================
// PWA SERVICE WORKER
// ==========================================
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js')
                .then(reg => console.log('Service Worker kayıtlı.', reg))
                .catch(err => console.error('Service Worker hatası:', err));
        });
    }
}

// ==========================================
// INITIALIZATION
// ==========================================
function init() {
    updateHeader();
    initTheme();
    initAddHabitForm();
    initJournalSection();
    initCalendarAction();
    initBackupAction();
    initResetAction();
    
    // Initialize profile avatar rendering on start
    renderAvatar();
    
    // Enable swipe-to-navigate-week gesture on timeline rows
    enableWeekGesture('habits-timeline-row', (delta) => {
        const parts = selectedHabitsDate.split('-');
        const currentDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        currentDate.setDate(currentDate.getDate() + delta);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (currentDate > today) return; // can't go to future
        selectedHabitsDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
        renderTodayProgress();
        renderHabitsList();
        renderHabitsTimeline();
    });

    enableWeekGesture('journal-timeline-row', (delta) => {
        const parts = selectedJournalDate.split('-');
        const currentDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        currentDate.setDate(currentDate.getDate() + delta);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (currentDate > today) return; // can't go to future
        selectedJournalDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
        selectJournalDate(selectedJournalDate);
        renderJournalTimeline();
    });

    // Switch to default screen (Dashboard)
    switchTab('dashboard');

    // Register PWA Service worker
    registerServiceWorker();
}

// ==========================================
// NEW FEATURES: HISTORICAL NAVIGATION, PROFILE AVATARS, CUSTOM GOALS & SVG MOOD WAVE
// ==========================================

window.onHabitsDatePickerChange = function(val) {
    if (!val) return;
    selectedHabitsDate = val;
    renderDashboard();
    showToast(`Alışkanlıklar tarihi değiştirildi: ${formatHumanDate(val)} 📅`, 'success');
};

window.onJournalDatePickerChange = function(val) {
    if (!val) return;
    selectedJournalDate = val;
    selectJournalDate(val);
    renderDashboard();
    showToast(`Günlük tarihi değiştirildi: ${formatHumanDate(val)} ✍️`, 'success');
};

window.selectDailyMood = function(rating) {
    const dateStr = selectedJournalDate;
    let currentVal = journal[dateStr] || '';
    
    let note = '';
    if (typeof currentVal === 'string') {
        note = currentVal;
    } else {
        note = currentVal.note || '';
    }
    
    journal[dateStr] = { note: note, mood: rating };
    saveState();
    highlightMoodButtons(rating);
    
    if (activeTab === 'progress') {
        renderProgress();
    }
};

window.highlightMoodButtons = function(rating) {
    for (let i = 1; i <= 5; i++) {
        const btn = document.getElementById(`mood-btn-${i}`);
        if (btn) {
            if (i === rating) {
                btn.className = "text-xl p-1.5 rounded-xl bg-primary/20 scale-125 border border-primary/40 transition-all duration-200 active:scale-95";
            } else {
                btn.className = "text-lg p-1 rounded-xl hover:bg-surface-container transition-all active:scale-90 opacity-60";
            }
        }
    }
};

window.uploadAvatar = function(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const base64 = e.target.result;
            localStorage.setItem('userAvatar', base64);
            renderAvatar();
            showToast('Profil fotoğrafınız başarıyla güncellendi! 📸', 'success');
        };
        reader.readAsDataURL(input.files[0]);
    }
};

window.deleteAvatar = function() {
    if (confirm('Profil fotoğrafınızı silmek istediğinize emin misiniz?')) {
        localStorage.removeItem('userAvatar');
        renderAvatar();
    }
};

window.renderAvatar = function() {
    const base64 = localStorage.getItem('userAvatar');
    const headerBox = document.getElementById('header-avatar-box');
    const profileBox = document.getElementById('profile-avatar-container');
    const deleteBtn = document.getElementById('btn-delete-avatar');
    
    const avatarHtml = base64 
        ? `<img src="${base64}" class="w-full h-full object-cover" />`
        : `<span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">person</span>`;
        
    const profileAvatarHtml = base64 
        ? `<img src="${base64}" class="w-full h-full object-cover" />`
        : `<span class="material-symbols-outlined text-[64px]" style="font-variation-settings: 'FILL' 1;">person</span>`;
        
    if (headerBox) headerBox.innerHTML = avatarHtml;
    if (profileBox) profileBox.innerHTML = profileAvatarHtml;
    
    if (deleteBtn) {
        if (base64) {
            deleteBtn.classList.remove('hidden');
        } else {
            deleteBtn.classList.add('hidden');
        }
    }
};

window.toggleAddGoalForm = function(show = true) {
    const card = document.getElementById('add-goal-form-card');
    const nameInput = document.getElementById('goal-name-input');
    const dateInput = document.getElementById('goal-date-input');
    const currentInput = document.getElementById('goal-current-input');
    const editIdInput = document.getElementById('edit-goal-id');
    const formTitle = document.getElementById('goal-form-title');
    
    if (card) {
        if (show) {
            card.classList.remove('hidden');
            nameInput.focus();
        } else {
            card.classList.add('hidden');
            // Clear values
            nameInput.value = '';
            dateInput.value = '';
            if (currentInput) currentInput.value = '';
            editIdInput.value = '';
            if (formTitle) formTitle.textContent = 'Yeni Hedef Belirle';
        }
    }
};

window.saveGoalSubmit = function() {
    const nameInput = document.getElementById('goal-name-input');
    const dateInput = document.getElementById('goal-date-input');
    const currentInput = document.getElementById('goal-current-input');
    const editIdInput = document.getElementById('edit-goal-id');
    
    if (!nameInput || !dateInput) return;
    
    const title = nameInput.value.trim();
    const dateStr = dateInput.value;
    const currentVal = currentInput ? currentInput.value.trim() : '';
    const editId = editIdInput ? editIdInput.value : '';
    
    if (!title || !dateStr) {
        alert('Lütfen hedef başlığını ve tarihini eksiksiz girin!');
        return;
    }
    
    if (editId) {
        // Edit existing goal
        const goal = goals.find(g => g.id === editId);
        if (goal) {
            goal.title = title;
            goal.targetDate = dateStr;
            goal.currentStatus = currentVal;
            showToast('Hedefiniz güncellendi! 🎯', 'success');
        }
    } else {
        // Create new goal
        const newGoal = {
            id: Date.now().toString(),
            title: title,
            targetDate: dateStr,
            currentStatus: currentVal
        };
        goals.push(newGoal);
        showToast('Yeni hedefiniz eklendi! 🎯', 'success');
    }
    
    localStorage.setItem('goals', JSON.stringify(goals));
    toggleAddGoalForm(false);
    renderGoals();
};

window.editGoal = function(id) {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;
    
    const card = document.getElementById('add-goal-form-card');
    const nameInput = document.getElementById('goal-name-input');
    const dateInput = document.getElementById('goal-date-input');
    const currentInput = document.getElementById('goal-current-input');
    const editIdInput = document.getElementById('edit-goal-id');
    const formTitle = document.getElementById('goal-form-title');
    
    if (card && nameInput && dateInput && editIdInput) {
        card.classList.remove('hidden');
        nameInput.value = goal.title;
        dateInput.value = goal.targetDate;
        if (currentInput) currentInput.value = goal.currentStatus || '';
        editIdInput.value = goal.id;
        if (formTitle) formTitle.textContent = 'Hedefi Düzenle';
        nameInput.focus();
    }
};

window.deleteGoal = function(id) {
    if (confirm('Bu hedefi silmek istediğinize emin misiniz?')) {
        goals = goals.filter(g => g.id !== id);
        localStorage.setItem('goals', JSON.stringify(goals));
        renderGoals();
        showToast('Hedef silindi.', 'info');
    }
};

window.getDaysRemaining = function(targetDateStr) {
    const today = new Date();
    today.setHours(0,0,0,0);
    const target = new Date(targetDateStr);
    target.setHours(0,0,0,0);
    
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

window.renderGoals = function() {
    const goalsContainer = document.getElementById('profile-goals-list');
    if (!goalsContainer) return;
    
    goalsContainer.innerHTML = '';
    
    if (goals.length === 0) {
        goalsContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center p-sm text-center bg-white dark:bg-on-surface/10 rounded-3xl border border-surface-container py-6">
                <span class="material-symbols-outlined text-3xl text-primary/40 mb-xs">emoji_events</span>
                <p class="text-xs text-on-surface-variant font-medium">Kayıtlı hedefiniz bulunmuyor. Bir hedef belirleyin!</p>
            </div>
        `;
        return;
    }
    
    goals.forEach(goal => {
        const daysLeft = window.getDaysRemaining(goal.targetDate);
        
        let countdownBadge = '';
        if (daysLeft > 0) {
            countdownBadge = `<span class="text-[11px] font-bold text-primary bg-primary-container/20 px-2.5 py-0.5 rounded-full flex items-center gap-0.5"><span class="material-symbols-outlined text-[12px]">schedule</span> ${daysLeft} Gün Kaldı</span>`;
        } else if (daysLeft === 0) {
            countdownBadge = `<span class="text-[11px] font-bold text-[#f59e0b] bg-[#f59e0b]/20 px-2.5 py-0.5 rounded-full flex items-center gap-0.5"><span class="material-symbols-outlined text-[12px]">celebrate</span> Bugün Son Gün!</span>`;
        } else {
            countdownBadge = `<span class="text-[11px] font-bold text-[#ba1a1a] bg-[#ffdad6]/40 px-2.5 py-0.5 rounded-full flex items-center gap-0.5"><span class="material-symbols-outlined text-[12px]">warning</span> Süre Doldu (${Math.abs(daysLeft)} gün geçti)</span>`;
        }
        
        const d = new Date(goal.targetDate);
        const targetStr = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
        
        const card = document.createElement('div');
        card.className = "soft-card p-md bg-white border border-surface-container shadow-[0_10px_15px_rgba(45,52,54,0.02)] flex items-center justify-between gap-sm hover:shadow-[0_15px_20px_rgba(45,52,54,0.04)] transition-all";
        
        // Show dynamic starting status if available
        let currentStatusHtml = '';
        if (goal.currentStatus) {
            currentStatusHtml = `
                <div class="text-[11px] font-bold text-[#9e4037] bg-[#fe8a7c]/15 px-2.5 py-0.5 rounded-full flex items-center gap-0.5 w-fit">
                    <span class="material-symbols-outlined text-[13px]" style="font-variation-settings: 'FILL' 1;">trending_up</span>
                    <span>Şu An: ${goal.currentStatus}</span>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="flex-1 space-y-1.5">
                <div class="font-headline-sm text-[15px] text-on-surface font-bold leading-snug">${goal.title}</div>
                <div class="flex flex-wrap items-center gap-sm">
                    <div class="text-[11px] text-on-surface-variant font-medium flex items-center gap-0.5">
                        <span class="material-symbols-outlined text-[13px]">calendar_today</span>
                        <span>Hedef: ${targetStr}</span>
                    </div>
                    ${countdownBadge}
                    ${currentStatusHtml}
                </div>
            </div>
            <div class="flex items-center gap-1 opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity duration-200">
                <button class="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant/60 hover:text-on-surface transition-colors" onclick="editGoal('${goal.id}')" title="Düzenle">
                    <span class="material-symbols-outlined text-[18px]">edit</span>
                </button>
                <button class="p-1.5 rounded-full hover:bg-error-container text-on-surface-variant/60 hover:text-error transition-colors" onclick="deleteGoal('${goal.id}')" title="Sil">
                    <span class="material-symbols-outlined text-[18px]">delete</span>
                </button>
            </div>
        `;
        
        card.classList.add('group');
        goalsContainer.appendChild(card);
    });
};

// Graphs Mood Selector Panel Operations
let graphsSelectedMoodDate = null;

window.openGraphsMoodPicker = function(dateStr, label) {
    graphsSelectedMoodDate = dateStr;
    
    const panel = document.getElementById('graphs-mood-picker-panel');
    const title = document.getElementById('graphs-mood-picker-title');
    
    if (panel && title) {
        panel.classList.remove('hidden');
        title.textContent = `${label} Günü Duygu Durumunuz`;
        
        // Highlight saved mood
        const val = journal[dateStr];
        let savedMood = null;
        if (val && typeof val === 'object') {
            savedMood = val.mood;
        }
        highlightGraphsMoodButtons(savedMood);
        
        // Scroll panel into view smoothly
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
};

window.closeGraphsMoodPicker = function() {
    const panel = document.getElementById('graphs-mood-picker-panel');
    if (panel) {
        panel.classList.add('hidden');
    }
    graphsSelectedMoodDate = null;
};

window.setGraphsMood = function(rating) {
    if (!graphsSelectedMoodDate) return;
    
    const dateStr = graphsSelectedMoodDate;
    const currentVal = journal[dateStr];
    
    let note = '';
    if (currentVal) {
        if (typeof currentVal === 'string') {
            note = currentVal;
        } else {
            note = currentVal.note || '';
        }
    }
    
    journal[dateStr] = { note: note, mood: rating };
    saveState();
    
    // Re-render
    renderProgress();
    closeGraphsMoodPicker();
};

function highlightGraphsMoodButtons(rating) {
    const buttons = document.querySelectorAll('#graphs-mood-picker-panel button[onclick^="setGraphsMood"]');
    buttons.forEach((btn, index) => {
        const r = index + 1;
        if (r === rating) {
            btn.className = "text-3xl hover:scale-125 transition-transform p-1 bg-primary/20 rounded-xl border border-primary/30 active:scale-95";
        } else {
            btn.className = "text-2xl hover:scale-125 transition-transform p-2 rounded-xl hover:bg-white dark:hover:bg-white/10 active:scale-95 opacity-60";
        }
    });
}

window.renderMoodChart = function() {
    const strokeEl = document.getElementById('mood-wave-stroke');
    const labelsRow = document.getElementById('mood-labels-row');
    const statusDesc = document.getElementById('mood-chart-status-desc');
    const graphsMoodDaysRow = document.getElementById('graphs-mood-days-row');

    if (!strokeEl || !labelsRow) return;

    const moodRange = selectedMoodRange || 'weekly';

    let moodPoints = [];
    let labelTexts = [];

    if (moodRange === 'weekly') {
        const days = getWeekDaysForDate(moodViewDate);
        days.forEach((d, index) => {
            const xStep = days.length > 1 ? 380 / (days.length - 1) : 0;
            const x = 10 + xStep * index;
            let rating = 3;
            const val = journal[d.str];
            if (val && typeof val === 'object' && val.mood) rating = val.mood;
            moodPoints.push({ x, y: 90 - 20 * (rating - 1), rating });
            labelTexts.push(d.label);
        });

        const dateLabel = document.getElementById('mood-chart-date-label');
        if (dateLabel) dateLabel.textContent = getWeekRangeLabel(days);

    } else if (moodRange === 'monthly') {
        const days = getMonthDaysForDate(moodViewDate);
        days.forEach((d, index) => {
            const xStep = days.length > 1 ? 380 / (days.length - 1) : 0;
            const x = 10 + xStep * index;
            let rating = 3;
            const val = journal[d.str];
            if (val && typeof val === 'object' && val.mood) rating = val.mood;
            moodPoints.push({ x, y: 90 - 20 * (rating - 1), rating });
            labelTexts.push(index === 0 || (d.dayNum % 5 === 0) || index === days.length - 1 ? d.dayNum.toString() : '');
        });

        const dateLabel = document.getElementById('mood-chart-date-label');
        if (dateLabel) dateLabel.textContent = getMonthRangeLabel(moodViewDate);

    } else if (moodRange === 'yearly') {
        const months = getYearMonthsForDate(moodViewDate);
        months.forEach((m, index) => {
            const xStep = months.length > 1 ? 380 / (months.length - 1) : 0;
            const x = 10 + xStep * index;
            const avg = getMonthlyMoodAverage(m.year, m.month);
            moodPoints.push({ x, y: 90 - 20 * (avg - 1), rating: avg });
            labelTexts.push(m.label);
        });

        const dateLabel = document.getElementById('mood-chart-date-label');
        if (dateLabel) dateLabel.textContent = getYearRangeLabel(moodViewDate);
    }


    const strokePath = getSplinePath(moodPoints);
    strokeEl.setAttribute('d', strokePath);

    const avgRating = moodPoints.length > 0 ? moodPoints.reduce((s, p) => s + p.rating, 0) / moodPoints.length : 3;

    let statusText = "Duygu durum analiziniz.";
    if (avgRating >= 4.2) statusText = "Harika! Bu dönemde enerjiniz ve mutluluğunuz zirvede. Bu pozitifliği koruyun! 😄";
    else if (avgRating >= 3.4) statusText = "Güzel! Genelde mutlu ve dengeli günler geçiriyorsunuz. Kararlılığınız harika! 🙂";
    else if (avgRating >= 2.6) statusText = "Dengeli. Bu dönemde nötr ve huzurlu bir duygu durumu hakim. Sakinliğe odaklanın. 😐";
    else if (avgRating >= 1.8) statusText = "Biraz düşük. Canınız biraz sıkkın geçmiş olabilir. Kendinize şefkat gösterin. 🙁";
    else statusText = "Oldukça hassas. Zorlayıcı duygularla karşılaşmış olabilirsiniz. Dinlenmeye zaman ayırın. 😢";
    if (statusDesc) statusDesc.textContent = statusText;

    // Render X-axis labels
    labelsRow.innerHTML = '';
    labelTexts.forEach(lbl => {
        const span = document.createElement('span');
        span.className = `flex-1 text-center text-[10px] font-semibold text-on-surface-variant/70 uppercase truncate`;
        span.textContent = lbl;
        labelsRow.appendChild(span);
    });

    // Quick-edit row always shows last 7 days
    if (graphsMoodDaysRow) {
        graphsMoodDaysRow.innerHTML = '';
        getLast7Days().forEach(day => {
            let rating = 3;
            const val = journal[day.str];
            if (val && typeof val === 'object' && val.mood) rating = val.mood;

            const emojiMap = { 1: '😢', 2: '🙁', 3: '😐', 4: '🙂', 5: '😄' };
            const emoji = emojiMap[rating] || '😐';

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = "flex flex-col items-center justify-center p-1 sm:p-2 rounded-xl bg-white dark:bg-white/5 border border-surface-container hover:bg-surface-container-high/40 active:scale-95 transition-all w-full select-none shadow-[0_2px_4px_rgba(0,0,0,0.02)]";
            btn.innerHTML = `
                <span class="text-[9px] sm:text-[10px] text-on-surface-variant font-bold leading-none">${day.label.substring(0, 3)}</span>
                <span class="text-base sm:text-lg mt-0.5 sm:mt-1 leading-none">${emoji}</span>
            `;
            btn.onclick = () => openGraphsMoodPicker(day.str, day.label);
            graphsMoodDaysRow.appendChild(btn);
        });
    }
};

// Boot
init();
