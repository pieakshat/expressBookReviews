const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

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

// Get all books using async/await
public_users.get('/', async (req, res) => {
  try {
    const allBooks = await new Promise((resolve) => resolve(books));
    return res.status(200).json(allBooks);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching books" });
  }
});

// Get book by ISBN using async/await
public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const isbn = req.params.isbn;
    const book = await new Promise((resolve, reject) => {
      if (books[isbn]) resolve(books[isbn]);
      else reject(new Error("Book not found"));
    });
    return res.status(200).json(book);
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
});

// Get books by author using async/await
public_users.get('/author/:author', async (req, res) => {
  try {
    const author = req.params.author;
    const result = await new Promise((resolve, reject) => {
      const matched = Object.entries(books)
        .filter(([, b]) => b.author.toLowerCase() === author.toLowerCase())
        .map(([isbn, b]) => ({ isbn, ...b }));
      if (matched.length > 0) resolve(matched);
      else reject(new Error("No books found for this author"));
    });
    return res.status(200).json(result);
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
});

// Get books by title using async/await
public_users.get('/title/:title', async (req, res) => {
  try {
    const title = req.params.title;
    const result = await new Promise((resolve, reject) => {
      const matched = Object.entries(books)
        .filter(([, b]) => b.title.toLowerCase().includes(title.toLowerCase()))
        .map(([isbn, b]) => ({ isbn, ...b }));
      if (matched.length > 0) resolve(matched);
      else reject(new Error("No books found for this title"));
    });
    return res.status(200).json(result);
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
});

// Get book review
public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).json(books[isbn].reviews);
});

module.exports.general = public_users;
