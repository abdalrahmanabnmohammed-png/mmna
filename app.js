const SUPABASE_URL = "https://jbfsnjxnjvdfnlarqthq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiZnNuanhuanZkZm5sYXJxdGhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjQyMzQsImV4cCI6MjA4MTY0MDIzNH0.hp4_jvYwCGEwIIhLJjmCgzzzDErgeBrOmnYKP7BpZO0";
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let allBooks = []; // لتخزين الكتب محلياً لسرعة البحث

async function initializeApp() {
    await checkUser();
    await fetchBooks();
}

async function checkUser() {
    const { data: { user } } = await _supabase.auth.getUser();
    const actionArea = document.getElementById('user-actions');
    const authBtn = document.getElementById('auth-nav-btn');

    if (user) {
        authBtn.innerText = "تسجيل خروج";
        authBtn.onclick = async () => { await _supabase.auth.signOut(); location.reload(); };
        actionArea.innerHTML = `
            <div class="bg-indigo-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between shadow-2xl shadow-indigo-200">
                <div>
                    <h2 class="text-2xl font-bold mb-2">أهلاً بك يا بطل! 🌟</h2>
                    <p class="opacity-80">لديك كتب لا تحتاجها؟ شاركها مع زملائك الآن.</p>
                </div>
                <div class="flex gap-3 mt-6 md:mt-0">
                    <a href="add-book.html" class="bg-white text-indigo-600 px-8 py-3 rounded-xl font-black hover:scale-105 transition-transform">➕ انشر كتابك</a>
                </div>
            </div>`;
    } else {
        authBtn.innerText = "تسجيل دخول / مستخدم جديد";
        authBtn.onclick = () => window.location.href='auth.html';
        actionArea.innerHTML = `
            <div class="bg-gradient-to-r from-gray-800 to-gray-900 rounded-3xl p-8 text-white text-center shadow-xl">
                <h2 class="text-2xl font-bold mb-4">انضم إلى مجتمع كُتبي الجامعي 🎓</h2>
                <p class="mb-6 opacity-70">سجل دخولك لتتمكن من مراسلة البائعين ونشر كتبك الخاصة.</p>
                <a href="auth.html" class="inline-block bg-indigo-500 px-10 py-3 rounded-xl font-bold hover:bg-indigo-400 transition-all">ابدأ الآن - مجاناً</a>
            </div>`;
    }
}

async function fetchBooks() {
    const { data, error } = await _supabase.from('books').select('*').order('created_at', { ascending: false });
    if (!error) {
        allBooks = data;
        renderBooks(allBooks);
    }
}

function renderBooks(books) {
    const listDiv = document.getElementById('books-list');
    document.getElementById('book-count').innerText = `${books.length} كتب`;
    
    if (books.length === 0) {
        listDiv.innerHTML = `<div class="col-span-full py-20 text-center"><p class="text-gray-400">لم يتم العثور على نتائج مطابقة..</p></div>`;
        return;
    }

    listDiv.innerHTML = books.map(book => `
        <div class="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative group">
            <div class="h-40 bg-indigo-50 flex items-center justify-center text-4xl group-hover:bg-indigo-100 transition-colors">
                ${book.category === 'طب' ? '🩺' : book.category === 'هندسة' ? '🏗️' : '📚'}
            </div>
            <div class="p-6">
                <div class="flex justify-between items-center mb-3">
                    <span class="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md">${book.type}</span>
                    <span class="font-bold text-gray-900">${book.price ? book.price + ' د.أ' : 'تبادل'}</span>
                </div>
                <h4 class="font-bold text-lg text-gray-800 mb-1 truncate">${book.title}</h4>
                <p class="text-gray-500 text-xs mb-6 h-8 line-clamp-2">${book.description || 'وصف سريع غير متوفر لهذا الكتاب.'}</p>
                <button onclick="handleContact('${book.owner_id}', '${book.title}')" class="w-full bg-gray-900 text-white py-3 rounded-2xl text-sm font-bold group-hover:bg-indigo-600 transition-colors shadow-lg">
                    تواصل الآن
                </button>
            </div>
        </div>
    `).join('');
}

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

async function handleContact(ownerId, title) {
    const { data: { user } } = await _supabase.auth.getUser();
    if (!user) {
        alert("يرجى تسجيل الدخول لمراسلة الزملاء");
        window.location.href = "auth.html";
        return;
    }
    alert(`سيتم فتح محادثة فورية بخصوص: ${title}`);
}

window.onload = initializeApp;
