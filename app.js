// بيانات الربط مع Supabase
const SUPABASE_URL = "https://jbfsnjxnjvdfnlarqthq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiZnNuanhuanZkZm5sYXJxdGhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjQyMzQsImV4cCI6MjA4MTY0MDIzNH0.hp4_jvYwCGEwIIhLJjmCgzzzDErgeBrOmnYKP7BpZO0";
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 1. وظيفة التحقق من حالة المستخدم (ضيف أم مسجل)
async function checkUser() {
    const { data: { user } } = await _supabase.auth.getUser();
    const actionArea = document.getElementById('user-actions');
    const authBtn = document.getElementById('auth-nav-btn');

    if (user) {
        // إذا كان المستخدم مسجل دخول
        if(actionArea) {
            actionArea.innerHTML = `
                <div class="flex flex-col items-center gap-4">
                    <h2 class="text-2xl font-bold text-gray-800">أهلاً بك مجدداً! 👋</h2>
                    <p class="text-gray-600">يمكنك الآن إدارة كتبك أو إضافة محتوى جديد</p>
                    <div class="flex gap-4">
                        <a href="add-book.html" class="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition">➕ انشر كتاب/دوسية</a>
                        <button class="bg-white text-indigo-600 border-2 border-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition">🔍 اطلب كتاباً</button>
                    </div>
                </div>`;
        }
        if(authBtn) {
            authBtn.innerText = "تسجيل خروج";
            authBtn.classList.replace('bg-indigo-800', 'bg-red-500');
            authBtn.onclick = async () => { await _supabase.auth.signOut(); location.reload(); };
        }
    } else {
        // إذا كان المستخدم ضيف (Guest)
        if(actionArea) {
            actionArea.innerHTML = `
                <div class="flex flex-col items-center gap-4">
                    <h2 class="text-2xl font-bold text-gray-800">مرحباً بك في منصة كُتبي 🎓</h2>
                    <p class="text-gray-600">تصفح الكتب المتاحة مجاناً، وسجل دخولك لتبدأ البيع أو التواصل</p>
                    <a href="auth.html" class="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition">سجل حسابك الآن مجاناً</a>
                </div>`;
        }
    }
}

// 2. وظيفة جلب وعرض الكتب (متاحة للجميع)
async function displayBooks() {
    checkUser(); // تحديث واجهة المستخدم حسب حالته
    
    // جلب البيانات من جدول books
    const { data: books, error } = await _supabase.from('books').select('*').order('created_at', { ascending: false });
    
    const listDiv = document.getElementById('books-list');
    if (error) {
        listDiv.innerHTML = "<p class='text-red-500'>حدث خطأ أثناء تحميل الكتب.</p>";
        return;
    }

    if (books.length === 0) {
        listDiv.innerHTML = "<p class='col-span-full text-gray-400'>لا توجد كتب معروضة حالياً.</p>";
        return;
    }

    listDiv.innerHTML = books.map(book => `
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-xl transition-all duration-300 group">
            <div class="flex justify-between items-start mb-4">
                <span class="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">${book.type}</span>
                <span class="text-xl font-bold text-indigo-600">${book.price ? book.price + ' د.أ' : 'تبديل'}</span>
            </div>
            <h3 class="text-lg font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">${book.title}</h3>
            <p class="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">${book.description || 'لا يوجد وصف متاح'}</p>
            
            <button onclick="handleContact('${book.owner_id}', '${book.title}')" 
                class="w-full bg-gray-50 text-indigo-600 font-bold py-3 rounded-xl hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2">
                <span>💬 تواصل مع البائع</span>
            </button>
        </div>
    `).join('');
}

// 3. منع الضيف من التواصل إلا بعد تسجيل الدخول
async function handleContact(sellerId, bookTitle) {
    const { data: { user } } = await _supabase.auth.getUser();
    if (!user) {
        alert("عذراً، يجب عليك تسجيل الدخول أولاً لتتمكن من مراسلة صاحب الكتاب.");
        window.location.href = "auth.html";
    } else {
        openChat(sellerId, bookTitle);
    }
}

// 4. وظائف الشات
function openChat(sellerId, bookTitle) {
    document.getElementById('chat-with').innerText = `استفسار عن: ${bookTitle}`;
    document.getElementById('chat-box').classList.remove('hidden');
}

function toggleChat() {
    document.getElementById('chat-box').classList.add('hidden');
}

async function sendMessage() {
    const input = document.getElementById('msg-input');
    if(!input.value) return;
    alert("تم إرسال رسالتك: " + input.value);
    input.value = '';
}

// 5. وظيفة إضافة كتاب جديد
async function addBook(event) {
    event.preventDefault();
    const { data: { user } } = await _supabase.auth.getUser();
    
    if(!user) {
        alert("انتهت جلستك، يرجى تسجيل الدخول");
        window.location.href = "auth.html";
        return;
    }

    const title = document.getElementById('title').value;
    const price = document.getElementById('price').value;
    const type = document.getElementById('type').value;
    const desc = document.getElementById('description').value;

    const { error } = await _supabase.from('books').insert([
        { 
            title: title, 
            price: price ? parseFloat(price) : null, 
            type: type, 
            description: desc, 
            owner_id: user.id 
        }
    ]);

    if (error) {
        alert("حدث خطأ: " + error.message);
    } else {
        alert("تم نشر كتابك بنجاح!");
        window.location.href = "index.html";
    }
}
