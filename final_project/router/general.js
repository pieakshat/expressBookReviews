const express = require('express');
const axios = require('axios');
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

// Get all books using async/await with Axios
public_users.get('/', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5000/books');
    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(200).json(books);
  }
});

// Internal endpoint to serve raw books data
public_users.get('/books', (req, res) => {
  return res.status(200).json(books);
});

// Get book by ISBN using async/await with Axios
public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const isbn = req.params.isbn;
    const response = await axios.get('http://localhost:5000/books');
    const book = response.data[isbn];
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
    const response = await axios.get('http://localhost:5000/books');
    const matched = Object.entries(response.data)
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
    const response = await axios.get('http://localhost:5000/books');
    const matched = Object.entries(response.data)
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

// Get book review by ISBN
public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).json(books[isbn].reviews);
});

module.exports.general = public_users;
