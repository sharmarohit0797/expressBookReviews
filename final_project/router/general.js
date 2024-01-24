const express = require('express');
let books = require("./booksdb.js");
const axios = require('axios'); // added
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username)=>{
  let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
}

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if(username && password){
      if (!isValid(username)) {
          return res.status(400).json({ message: "Invalid username. Username must be at least 5 characters long and contain only alphanumeric characters." });
      }
      if(!doesExist(username)){
          users.push({"username":username,"password":password});
          return res.status(200).json({message: "User successfully registered. Now you can login"});
      } else {
          return res.status(404).json({messgae:"User already exists!"});
      }
  }
return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  res.send(JSON.stringify(books, null, 2));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  res.json({ISBN: isbn, books : books[isbn]})
 });
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const authorParam = req.params.author;
  const allAuthors = Object.values(books).map(book => book.author);

  if (allAuthors.includes(authorParam)) {
    const booksByAuthor = Object.values(books).filter(book => book.author === authorParam);
    res.json({ books: booksByAuthor });
  } else {
    res.status(404).json({ message: "Author not found" });
  }
});


// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  const allTitles = Object.values(books).map(book => book.title);

  if(allTitles.includes(title)){
      const booksByTitle = Object.values(books).filter(book => book.title === title);
      res.json({books : booksByTitle})
  }   else {
      return res.status(300).json({message: "Yet to be implemented"});
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn  = req.params.isbn;
  const review = books[isbn].reviews;
   res.json({ISBN: isbn, reviews : review});
});



// the code for getting the list of books available in the shop using async-await with Axios.
// Sample endpoint to get the list of books from an external API
const getBooksEndpoint = 'https://api-endpoint/books';

const getBooks = async () => {
    try {
        const response = await axios.get(getBooksEndpoint);
        return response.data;
    } catch (error) {
        throw error;
    }
};

public_users.get('/books', async (req, res) => {
    try {
        const books = await getBooks();
        res.status(200).json({ books });
    } catch (error) {
        res.status(500).json({ error: 'Unable to fetch books' });
    }
});



//the code for getting the book details based on ISBN using promise callbacks with Axios.
const getBookDetailsEndpoint = 'https://api-endpoint/books';

const getBookDetails = (isbn) => {
    return new Promise((resolve, reject) => {
        axios.get(`${getBookDetailsEndpoint}/${isbn}`)
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
};

public_users.get('/book/:isbn', (req, res) => {
    const isbn = req.params.isbn;

    getBookDetails(isbn)
        .then(bookDetails => {
            res.status(200).json({ bookDetails });
        })
        .catch(error => {
            res.status(500).json({ error: 'Unable to fetch book details' });
        });
});



//code for getting the book details based on Author using or async-await with Axios.
const getBooksByAuthorEndpoint = 'https://api-endpoint/books';

const getBooksByAuthor = async (author) => {
    try {
        const response = await axios.get(`${getBooksByAuthorEndpoint}?author=${author}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

public_users.get('/books/author/:author', async (req, res) => {
    const author = req.params.author;

    try {
        const books = await getBooksByAuthor(author);
        res.status(200).json({ books });
    } catch (error) {
        res.status(500).json({ error: 'Unable to fetch books by author' });
    }
});


// Function to get book details based on title using Promise callbacks
const getBooksByTitleEndpoint = 'https://api-endpoint/books';

const getBooksByTitle = (title) => {
    return new Promise((resolve, reject) => {
        axios.get(`${getBooksByTitleEndpoint}?title=${title}`)
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
};

public_users.get('/books/title/:title', (req, res) => {
    const title = req.params.title;

    getBooksByTitle(title)
        .then(books => {
            res.status(200).json({ books });
        })
        .catch(error => {
            res.status(500).json({ error: 'Unable to fetch books by title' });
        });
});

module.exports.general = public_users;
