const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Reusable helper to fetch all books via Axios
const fetchBooks = async () => {
  const response = await axios.get('http://localhost:5000/books');
  return response.data;
};

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }
  if (isValid(username)) {
    return res.status(409).json({ message: "Username already exists" });
  }
  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login." });
});

// Internal endpoint to serve raw books data
public_users.get('/books', (req, res) => {
  return res.status(200).json(books);
});

// Get all books using async/await with Axios
public_users.get('/', async (req, res) => {
  try {
    const allBooks = await fetchBooks();
    return res.status(200).json(allBooks);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Get book by ISBN using async/await with Axios
public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const isbn = req.params.isbn;
    const allBooks = await fetchBooks();
    const book = allBooks[isbn];
    if (book) {
      return res.status(200).json(book);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Get books by author using async/await with Axios
public_users.get('/author/:author', async (req, res) => {
  try {
    const author = req.params.author;
    const allBooks = await fetchBooks();
    const matched = Object.entries(allBooks)
      .filter(([, b]) => b.author.toLowerCase() === author.toLowerCase())
      .map(([isbn, b]) => ({ isbn, ...b }));
    if (matched.length > 0) {
      return res.status(200).json(matched);
    } else {
      return res.status(404).json({ message: "No books found for this author" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Get books by title using async/await with Axios
public_users.get('/title/:title', async (req, res) => {
  try {
    const title = req.params.title;
    const allBooks = await fetchBooks();
    const matched = Object.entries(allBooks)
      .filter(([, b]) => b.title.toLowerCase().includes(title.toLowerCase()))
      .map(([isbn, b]) => ({ isbn, ...b }));
    if (matched.length > 0) {
      return res.status(200).json(matched);
    } else {
      return res.status(404).json({ message: "No books found for this title" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Get all reviews; returns message if none exist
public_users.get('/review', (req, res) => {
  const allReviews = {};
  let hasReviews = false;
  Object.entries(books).forEach(([isbn, book]) => {
    if (Object.keys(book.reviews).length > 0) {
      allReviews[isbn] = book.reviews;
      hasReviews = true;
    }
  });
  if (!hasReviews) {
    return res.status(200).json({ message: "No reviews found for this book." });
  }
  return res.status(200).json(allReviews);
});

// Get book review by ISBN
public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).json(books[isbn].reviews);
});

module.exports.general = public_users;
