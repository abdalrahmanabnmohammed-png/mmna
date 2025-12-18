const SUPABASE_URL = "https://jbfsnjxnjvdfnlarqthq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiZnNuanhuanZkZm5sYXJxdGhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjQyMzQsImV4cCI6MjA4MTY0MDIzNH0.hp4_jvYwCGEwIIhLJjmCgzzzDErgeBrOmnYKP7BpZO0";
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// التحقق من حالة المستخدم عند تحميل أي صفحة
async function checkUser() {
    const { data: { user } } = await _supabase.auth.getUser();
    const actionArea = document.getElementById('user-actions');
    const authBtn = document.getElementById('auth-nav-btn');

    if (user) {
        // إذا كان مسجلاً: أظهر زر النشر وزر تسجيل الخروج
        if(actionArea) actionArea.innerHTML = `
            <div class="flex flex-col items-center gap-4">
                <h2 class="text-2xl font-bold text-gray-800">أهلاً بك، ماذا تريد أن تفعل اليوم؟</h2>
                <div class="flex gap-4">
                    <a href="add-book.html" class="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-indigo-700">➕ انشر كتاب/دوسية</a>
                    <button class="bg-orange-500 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-orange-600">🔍 اطلب كتاباً</button>
                </div>
            </div>`;
        if(authBtn) {
            authBtn.innerText = "تسجيل خروج";
            authBtn.onclick = async () => { await _supabase.auth.signOut(); location.reload(); };
        }
    } else {
        // إذا لم يكن مسجلاً: أظهر زر يطلب منه التسجيل
        if(actionArea) actionArea.innerHTML = `
            <div class="bg-yellow-100 p-6 rounded-lg text-center border border-yellow-200">
                <p class="text-yellow-800 font-bold mb-4">يجب عليك تسجيل الدخول لتتمكن من إضافة الكتب أو التواصل مع البائعين</p>
                <a href="auth.html" class="bg-indigo-600 text-white px-8 py-2 rounded-full font-bold">تسجيل الدخول الآن</a>
            </div>`;
    }
}

// وظيفة عرض الكتب المحدثة لتشمل التحقق قبل الشات
async function displayBooks() {
    checkUser(); // تشغيل التحقق
    const { data: books, error } = await _supabase.from('books').select('*');
    const listDiv = document.getElementById('books-list');
    if (error || !listDiv) return;

    listDiv.innerHTML = books.map(book => `
        <div class="bg-white p-5 rounded-xl shadow-md border hover:shadow-xl transition-shadow">
            <div class="flex justify-between items-start mb-3">
                <span class="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded">${book.type}</span>
                <span class="text-green-600 font-bold font-mono">${book.price || 'تبديل'} د.أ</span>
            </div>
            <h3 class="text-xl font-bold mb-2 text-indigo-900">${book.title}</h3>
            <p class="text-gray-600 text-sm mb-4 h-12 overflow-hidden">${book.description}</p>
            <button onclick="handleContact('${book.owner_id}', '${book.title}')" class="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-black flex items-center justify-center gap-2">
                💬 تواصل مع البائع
            </button>
        </div>
    `).join('');
}

async function handleContact(sellerId, bookTitle) {
    const { data: { user } } = await _supabase.auth.getUser();
    if (!user) {
        alert("عذراً، يجب عليك تسجيل الدخول أولاً لتتمكن من مراسلة البائع");
        window.location.href = "auth.html";
    } else {
        openChat(sellerId, bookTitle);
    }
}

// تابع بقية وظائف الشات التي كتبناها سابقاً...
