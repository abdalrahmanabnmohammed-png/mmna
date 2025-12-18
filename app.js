// --- إعدادات الربط مع Supabase ---
const SUPABASE_URL = "https://jbfsnjxnjvdfnlarqthq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiZnNuanhuanZkZm5sYXJxdGhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjQyMzQsImV4cCI6MjA4MTY0MDIzNH0.hp4_jvYwCGEwIIhLJjmCgzzzDErgeBrOmnYKP7BpZO0";
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let allBooks = []; // لتخزين الكتب محلياً لسرعة البحث والفلترة

// --- وظيفة تشغيل التطبيق عند التحميل ---
async function initializeApp() {
    await checkUser();
    await fetchBooks();
}

// 1. التحقق من حالة المستخدم (هل هو مسجل دخول؟)
async function checkUser() {
    const { data: { user } } = await _supabase.auth.getUser();
    const actionArea = document.getElementById('user-actions');
    const authBtn = document.getElementById('auth-nav-btn');

    if (user) {
        // إذا كان مسجلاً، نجلب اسمه من الـ Metadata أو البروفايل
        const userName = user.user_metadata.full_name || "زميلي العزيز";
        
        if (authBtn) {
            authBtn.innerText = "تسجيل خروج";
            authBtn.classList.replace('bg-indigo-50', 'bg-red-50');
            authBtn.classList.add('text-red-600');
            authBtn.onclick = async () => { await _supabase.auth.signOut(); location.reload(); };
        }

        if (actionArea) {
            actionArea.innerHTML = `
                <div class="bg-indigo-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between shadow-2xl shadow-indigo-200">
                    <div>
                        <h2 class="text-2xl font-bold mb-2 text-right">أهلاً بك، ${userName}! 👋</h2>
                        <p class="opacity-80 text-right">هل لديك كتب أو دوسيات تريد مشاركتها اليوم؟</p>
                    </div>
                    <div class="flex gap-3 mt-6 md:mt-0">
                        <a href="add-book.html" class="bg-white text-indigo-600 px-8 py-3 rounded-xl font-black hover:scale-105 transition-transform shadow-lg">➕ انشر الآن</a>
                    </div>
                </div>`;
        }
    } else {
        // إذا كان ضيفاً
        if (authBtn) {
            authBtn.innerText = "دخول / تسجيل";
            authBtn.onclick = () => window.location.href = 'auth.html';
        }
        if (actionArea) {
            actionArea.innerHTML = `
                <div class="bg-gradient-to-r from-gray-800 to-gray-900 rounded-3xl p-8 text-white text-center shadow-xl">
                    <h2 class="text-2xl font-bold mb-4">انضم إلى مجتمع كُتبي الجامعي 🎓</h2>
                    <p class="mb-6 opacity-70">تصفح كتب زملائك مجاناً، وسجل دخولك لتتمكن من المراسلة والنشر.</p>
                    <a href="auth.html" class="inline-block bg-indigo-500 px-10 py-3 rounded-xl font-bold hover:bg-indigo-400 transition-all shadow-lg">ابدأ الآن - مجاناً</a>
                </div>`;
        }
    }
}

// 2. جلب الكتب من قاعدة البيانات (مع اسم صاحب الكتاب)
async function fetchBooks() {
    const listDiv = document.getElementById('books-list');
    
    // جلب البيانات مع الربط بجدول profiles لجلب اسم المستخدم
    const { data, error } = await _supabase
        .from('books')
        .select(`*, profiles:owner_id (full_name)`)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching books:", error);
        if (listDiv) listDiv.innerHTML = "<p class='text-red-500'>حدث خطأ أثناء تحميل البيانات.</p>";
        return;
    }

    allBooks = data;
    renderBooks(allBooks);
}

// 3. عرض الكتب في الصفحة
function renderBooks(books) {
    const listDiv = document.getElementById('books-list');
    const countSpan = document.getElementById('book-count');
    
    if (countSpan) countSpan.innerText = `${books.length} عناصر`;
    if (!listDiv) return;

    if (books.length === 0) {
        listDiv.innerHTML = `<div class="col-span-full py-20 text-center"><p class="text-gray-400 italic">لا توجد نتائج مطابقة لبحثك..</p></div>`;
        return;
    }

    listDiv.innerHTML = books.map(book => {
        const sellerName = book.profiles?.full_name || "طالب مجهول";
        return `
        <div class="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group p-5">
            <div class="flex justify-between items-center mb-4 text-[10px] font-bold uppercase tracking-widest text-indigo-500">
                <span class="bg-indigo-50 px-2 py-1 rounded-md">${book.type}</span>
                <span class="text-gray-400">بواسطة: ${sellerName.split(' ')[0]}</span>
            </div>
            
            <div class="h-32 bg-gray-50 rounded-2xl mb-4 flex items-center justify-center text-5xl">
                ${getEmoji(book.category)}
            </div>

            <h4 class="font-bold text-lg text-gray-800 mb-1 truncate text-right">${book.title}</h4>
            <p class="text-gray-500 text-xs mb-6 h-8 line-clamp-2 text-right">${book.description || 'لا يوجد وصف متاح لهذا العنصر.'}</p>
            
            <div class="flex items-center justify-between">
                <span class="font-black text-indigo-600">${book.price ? book.price + ' د.أ' : 'تبادل'}</span>
                <button onclick="handleContact('${sellerName}', '${book.title}')" class="bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-600 transition-colors shadow-md">
                    مراسلة البائع
                </button>
            </div>
        </div>`;
    }).join('');
}

// 4. وظيفة الفلترة والبحث
function filterBooks() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;

    const filtered = allBooks.filter(book => {
        const matchesSearch = book.title.toLowerCase().includes(searchTerm) || 
                             (book.description && book.description.toLowerCase().includes(searchTerm));
        const matchesCategory = category === 'all' || book.category === category;
        return matchesSearch && matchesCategory;
    });

    renderBooks(filtered);
}

// 5. التعامل مع الضغط على "مراسلة"
async function handleContact(sellerName, bookTitle) {
    const { data: { user } } = await _supabase.auth.getUser();
    
    if (!user) {
        alert(`عذراً! يجب تسجيل الدخول لتتمكن من مراسلة ${sellerName}`);
        window.location.href = "auth.html";
        return;
    }

    // فتح نافذة الشات
    const chatBox = document.getElementById('chat-box');
    const chatWith = document.getElementById('chat-with');
    const messages = document.getElementById('messages');

    if (chatBox) {
        chatWith.innerText = `مراسلة: ${sellerName}`;
        messages.innerHTML = `<div class="bg-indigo-50 p-3 rounded-xl text-indigo-600 text-xs text-center mb-4">أنت الآن تستفسر عن: <b>${bookTitle}</b></div>`;
        chatBox.classList.remove('hidden');
        chatBox.classList.add('flex');
    }
}

// إغلاق الشات
function toggleChat() {
    document.getElementById('chat-box').classList.add('hidden');
}

// وظائف مساعدة
function getEmoji(cat) {
    if (cat === 'طب') return '🩺';
    if (cat === 'هندسة') return '🏗️';
    if (cat === 'دوسية') return '📝';
    return '📚';
}

// تشغيل التطبيق
window.onload = initializeApp;

// وظيفة حماية صفحة الأدمن
async function checkAdminAccess() {
    const { data: { user } } = await _supabase.auth.getUser();
    
    // هنا نضع بريدك الإلكتروني (أنت المدير)
    const adminEmail = "abdqw472@gmail.com"; 

    if (!user || user.email !== adminEmail) {
        alert("عذراً، هذه المنطقة مخصصة للإدارة فقط!");
        window.location.href = "index.html";
    }
}
