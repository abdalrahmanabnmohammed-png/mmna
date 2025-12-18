const SUPABASE_URL = "https://jbfsnjxnjvdfnlarqthq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiZnNuanhuanZkZm5sYXJxdGhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjQyMzQsImV4cCI6MjA4MTY0MDIzNH0.hp4_jvYwCGEwIIhLJjmCgzzzDErgeBrOmnYKP7BpZO0"; // تأكد من وضع مفتاحك هنا
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function displayBooks() {
    const { data: books, error } = await _supabase.from('books').select('*');
    const listDiv = document.getElementById('books-list');
    if (error) return;

    listDiv.innerHTML = books.map(book => `
        <div class="bg-white p-5 rounded-xl shadow-md border hover:shadow-xl transition-shadow">
            <div class="flex justify-between items-start mb-3">
                <span class="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded">${book.type}</span>
                <span class="text-green-600 font-bold">${book.price || 'تبديل'} د.أ</span>
            </div>
            <h3 class="text-xl font-bold mb-2">${book.title}</h3>
            <p class="text-gray-600 text-sm mb-4">${book.description}</p>
            <button onclick="openChat('${book.owner_id}', '${book.title}')" class="w-full bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600 flex items-center justify-center gap-2">
                💬 تواصل مع البائع
            </button>
        </div>
    `).join('');
}

// منطق الشات البسيط
let currentChatPartner = null;

function openChat(sellerId, bookTitle) {
    currentChatPartner = sellerId;
    document.getElementById('chat-with').innerText = `استفسار عن: ${bookTitle}`;
    document.getElementById('chat-box').classList.remove('hidden');
    loadMessages();
}

function toggleChat() {
    document.getElementById('chat-box').classList.add('hidden');
}

async function sendMessage() {
    const input = document.getElementById('msg-input');
    const message = input.value;
    if(!message) return;

    // ملاحظة: الشات يحتاج لجدول رسائل في Supabase سننشئه في الخطوة القادمة
    alert("سيتم إرسال: " + message + " (نحتاج تفعيل جدول الرسائل في Supabase أولاً)");
    input.value = '';
}
