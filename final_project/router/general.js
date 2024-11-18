const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

//Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  const userExists = users.some(user => user.username === username);
  if (userExists) {
    return res.status(400).json({ message: "Username already exists" });
  }
  users.push({ username, password });
  res.status(201).json({ message: "User registered successfully" });
});


public_users.get('/', async function (req, res) {
    try {
      const booksList = await new Promise((resolve) => resolve(books));
      res.status(200).send(JSON.stringify(booksList, null, 2));
    } catch (error) {
      res.status(500).json({ message: "Error fetching books list" });
    }
  });

public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn; // Get ISBN from request params
    try {
      const book = await new Promise((resolve, reject) => {
        const foundBook = books[isbn]; // Find book by ISBN
        if (foundBook) resolve(foundBook);
        else reject(new Error('Book not found'));
      });
      res.status(200).send(JSON.stringify(book, null, 2)); // Send book details
    } catch (error) {
      res.status(404).json({ message: "Book not found" });
    }
  });

public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;
    try {
      const matchingBooks = await new Promise((resolve) => {
        const result = Object.values(books).filter(book => book.author === author);
        resolve(result);
      });
  
      if (matchingBooks.length > 0) {
        res.status(200).send(JSON.stringify(matchingBooks, null, 2));
      } else {
        res.status(404).json({ message: "No books found for this author" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error fetching books by author" });
    }
  });

public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;
    try {
      const matchingBooks = await new Promise((resolve) => {
        const result = Object.values(books).filter(book => book.title === title);
        resolve(result);
      });
  
      if (matchingBooks.length > 0) {
        res.status(200).send(JSON.stringify(matchingBooks, null, 2)); // Send all matching books
      } else {
        res.status(404).json({ message: "No books found for this title" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error fetching books by title" });
    }
  });

public_users.get('/review/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    try {
      const book = await new Promise((resolve, reject) => {
        const foundBook = books[isbn];
        if (foundBook && foundBook.reviews) resolve(foundBook.reviews);
        else reject(new Error('No reviews found for this book'));
      });
      res.status(200).send(JSON.stringify(book, null, 2)); // Send reviews
    } catch (error) {
      res.status(404).json({ message: "No reviews found for this book" });
    }
  });


module.exports.general = public_users;
