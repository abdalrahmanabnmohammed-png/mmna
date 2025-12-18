const SUPABASE_URL = "https://jbfsnjxnjvdfnlarqthq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiZnNuanhuanZkZm5sYXJxdGhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjQyMzQsImV4cCI6MjA4MTY0MDIzNH0.hp4_jvYwCGEwIIhLJjmCgzzzDErgeBrOmnYKP7BpZO0";
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// وظيفة عرض الكتب
async function displayBooks() {
    const { data: books, error } = await _supabase.from('books').select('*');
    const listDiv = document.getElementById('books-list');
    if (error) return console.error(error);
    
    listDiv.innerHTML = books.map(book => `
        <div class="book-item">
            <div>
                <strong>${book.title}</strong> - <small>${book.category}</small>
                <p>${book.description}</p>
            </div>
            <div class="price">${book.type}: ${book.price || 'تبديل'} د.أ</div>
        </div>
    `).join('');
}

// وظيفة إضافة كتاب
async function addBook(event) {
    event.preventDefault();
    const title = document.getElementById('title').value;
    const price = document.getElementById('price').value;
    const type = document.getElementById('type').value;
    const desc = document.getElementById('description').value;

    const { error } = await _supabase.from('books').insert([
        { title, price, type, description: desc, owner_id: (await _supabase.auth.getUser()).data.user?.id }
    ]);

    if (error) alert("خطأ: تأكد من تسجيل الدخول أولاً");
    else { alert("تمت الإضافة بنجاح!"); window.location.href = "index.html"; }
}
