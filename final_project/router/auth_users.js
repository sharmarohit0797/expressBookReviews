const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Function to check if a username is valid
const isValid = (username) => {
  const minLength = 5;
  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  
  return username.length >= minLength && alphanumericRegex.test(username);
};

const authenticatedUser = (username,password)=>{
  let validusers = users.filter((user)=>{
    return (user.username === username && user.password === password)
  });
  if(validusers.length > 0){
    return true;
  } else {
    return false;
  }
};

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }
  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken,username
  }
  return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const username = req.user.username; 
  const isbn = req.params.isbn;
  const reviewText = req.query.review;

  if (isbn && reviewText) {
      if (!books[isbn]) {
          return res.status(404).json({ message: "Book not found." });
      }
      if (books[isbn].reviews.hasOwnProperty(username)) {
          books[isbn].reviews[username] = reviewText;
          return res.status(200).json({ message: "Review modified successfully." });
      } else {
          books[isbn].reviews[username] = reviewText;
          return res.status(200).json({ message: "Review added successfully." });
      }
  }
  return res.status(400).json({ message: "Invalid request. Unable to add or modify review." });
});

regd_users.delete("/auth/review/:isbn", authenticatedUser, (req, res) => {
  const username = req.user.username; 
  const isbn = req.params.isbn;

  if (isbn) {
      if (!books[isbn]) {
          return res.status(404).json({ message: "Book not found." });
      }
      // Check if the user has posted a review for the given ISBN
      if (books[isbn].reviews.hasOwnProperty(username)) {
          delete books[isbn].reviews[username];
          return res.status(200).json({ message: "Review deleted successfully." });
      } else {
          return res.status(404).json({ message: "Review not found for the given ISBN." });
      }
  }

  return res.status(400).json({ message: "Unable to delete review. Missing ISBN." });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
