document.addEventListener('DOMContentLoaded', function () {
  const submitInputBook = document.getElementById('inputBook');
  submitInputBook.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
  });

  const searchForm = document.getElementById('searchBook');
  searchForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const keyword = document.getElementById('searchBookTitle').value.trim();
    searchBooks(keyword);
  });

  const resetBtn = document.getElementById('resetSearch');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      document.getElementById('searchBookTitle').value = '';
      loadBooksFromDB();
    });
  }

  loadBooksFromDB();
});

const books = [];
const RENDER_EVENT = 'render_book';

function generateBookObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted,
  };
}

function addBook() {
  const titleBook = document.getElementById('inputBookTitle').value;
  const bookAuthor = document.getElementById('inputBookAuthor').value;
  const bookYear = parseInt(document.getElementById('inputBookYear').value);
  const isCompleted = document.getElementById('inputBookIsComplete').checked;

  const bookObject = {
    title: titleBook,
    author: bookAuthor,
    year: bookYear,
    isCompleted: isCompleted ? 1 : 0,
  };

  fetch('books.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bookObject),
  })
    .then(response => response.json())
    .then(data => {
      console.log('Buku berhasil ditambahkan:', data);
      loadBooksFromDB(); // refresh daftar buku
    });
}

function loadBooksFromDB() {
  fetch('books.php')
    .then(response => response.json())
    .then(data => {
      books.length = 0;
      for (const item of data) {
        books.push(generateBookObject(
          item.id,
          item.judul,
          item.penulis,
          item.tahun,
          item.is_completed == 1
        ));
      }
      document.dispatchEvent(new Event(RENDER_EVENT));
    });
}

function makeBookList(bookObject) {
  const title = document.createElement('h3');
  title.innerText = bookObject.title;

  const author = document.createElement('p');
  author.innerText = `Penulis : ${bookObject.author}`;

  const year = document.createElement('p');
  year.innerText = `Tahun : ${bookObject.year}`;

  const textContainer = document.createElement('div');
  textContainer.classList.add('input');
  textContainer.append(title, author, year);

  const container = document.createElement('article');
  container.classList.add('book_item');
  container.append(textContainer);
  container.setAttribute('data-id', bookObject.id);

  const action = document.createElement('div');
  action.classList.add('action');

  const toggleBtn = document.createElement('button');
  toggleBtn.classList.add('green');
  toggleBtn.innerText = bookObject.isCompleted ? 'Belum selesai' : 'Selesai baca';
  toggleBtn.addEventListener('click', function () {
    updateBookStatus(bookObject.id, !bookObject.isCompleted);
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.classList.add('red');
  deleteBtn.innerText = 'Hapus';
  deleteBtn.addEventListener('click', function () {
    if (confirm('Ingin menghapus buku dari rak buku?')) {
      deleteBook(bookObject.id);
    }
  });

  action.append(toggleBtn, deleteBtn);
  container.append(action);

  return container;
}

function updateBookStatus(id, newStatus) {
  const book = books.find(b => b.id == id);
  if (!book) return;

  const updatedBook = { ...book, isCompleted: newStatus ? 1 : 0 };

  fetch('books.php', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedBook),
  })
    .then(res => res.json())
    .then(() => loadBooksFromDB());
}

function deleteBook(id) {
  fetch('books.php', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `id=${id}`,
  })
    .then(res => res.json())
    .then(() => loadBooksFromDB());
}

document.addEventListener(RENDER_EVENT, function () {
  const incompletedBookList = document.getElementById('incompleteBookshelfList');
  const completedBookList = document.getElementById('completeBookshelfList');
  incompletedBookList.innerHTML = '';
  completedBookList.innerHTML = '';

  for (const bookItem of books) {
    const bookElement = makeBookList(bookItem);
    if (bookItem.isCompleted) {
      completedBookList.append(bookElement);
    } else {
      incompletedBookList.append(bookElement);
    }
  }
});

function searchBooks(keyword) {
  fetch(`books.php?search=${encodeURIComponent(keyword)}`)
    .then(response => response.json())
    .then(data => {
      books.length = 0;
      for (const item of data) {
        books.push(generateBookObject(
          item.id,
          item.judul,
          item.penulis,
          item.tahun,
          item.is_completed == 1
        ));
      }
      document.dispatchEvent(new Event(RENDER_EVENT));
    });
}
