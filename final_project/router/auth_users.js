const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.some(u => u.username === username);
}

const authenticatedUser = (username, password) => {
  return users.some(u => u.username === username && u.password === password);
}

regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const accessToken = jwt.sign({ username }, "access", { expiresIn: '1h' });
  req.session.authorization = { accessToken };
  return res.status(200).json({ message: "User successfully logged in", accessToken });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.user.username;
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  books[isbn].reviews[username] = review;
  return res.status(200).json({ message: "Review added/updated successfully", reviews: books[isbn].reviews });
});

// Delete a book review (isbn passed as query param)
regd_users.delete("/auth/review", (req, res) => {
  const isbn = req.query.isbn;
  const username = req.user.username;
  if (!isbn || !books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "No review found for this user" });
  }
  delete books[isbn].reviews[username];
  return res.status(200).json({ message: "Review successfully deleted", reviews: books[isbn].reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
