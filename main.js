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

  loadBooksFromStorage();
});

const books = [];
const RENDER_EVENT = 'render_book';
const STORAGE_KEY = 'BOOKSHELF_APPS';

function generateId() {
  return +new Date();
}

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

  const generatedID = generateId();
  const bookObject = generateBookObject(generatedID, titleBook, bookAuthor, bookYear, isCompleted);
  books.push(bookObject);

  saveData();
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function saveData() {
  if (typeof(Storage) !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  }
}

function loadBooksFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  if (serializedData) {
    const data = JSON.parse(serializedData);
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function updateBookStatus(id) {
  const book = books.find(book => book.id === id);
  if (book) {
    book.isCompleted = !book.isCompleted;
    saveData();
    document.dispatchEvent(new Event(RENDER_EVENT));
  }
}

function deleteBook(id) {
  const bookIndex = books.findIndex(book => book.id === id);
  if (bookIndex !== -1) {
    books.splice(bookIndex, 1);
    saveData();
    document.dispatchEvent(new Event(RENDER_EVENT));
  }
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
    updateBookStatus(bookObject.id);
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.classList.add('red');
  deleteBtn.innerText = 'Hapus';
  deleteBtn.addEventListener('click', function () {
    if (confirm('Yakin ingin menghapus buku ini?')) {
      deleteBook(bookObject.id);
    }
  });

  action.append(toggleBtn, deleteBtn);
  container.append(action);

  return container;
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
  const filtered = books.filter(book =>
    book.title.toLowerCase().includes(keyword.toLowerCase())
  );

  const incompletedBookList = document.getElementById('incompleteBookshelfList');
  const completedBookList = document.getElementById('completeBookshelfList');
  incompletedBookList.innerHTML = '';
  completedBookList.innerHTML = '';

  for (const bookItem of filtered) {
    const bookElement = makeBookList(bookItem);
    if (bookItem.isCompleted) {
      completedBookList.append(bookElement);
    } else {
      incompletedBookList.append(bookElement);
    }
  }
}
