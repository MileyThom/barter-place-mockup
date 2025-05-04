//import necessary libraries 
const express = require('express');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');

//initialize the dotenv library
dotenv.config();

//initialize the express lirbary 
const app = express();
const PORT = 3000;

// Middleware to parse form data and serve static files
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


// create the database connection using the .env file
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});
db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL database');
});

// create the secret key using the .env file
const SECRET_KEY = process.env.JWT_SECRET;

//create a default route to our home page 
app.route('/', (req, res) => {
    res.send('Welcome to BarterPlace.');
});

// create a route which adds users 
app.post('/add-user', (req, res) => {
    const { profileName, password, contact, DOB, state, city, address } = req.body;
    const query = 'INSERT INTO users (profileName, password, contact, DOB, state, city, address) VALUES (?, ?, ?, ?, ?, ?, ?)';
    let html = `<html><head><title>Account Creation</title><link rel="stylesheet" href="styles.css"></head><ul>
            <li><a  href="index.html">Home</a></li>
            <li><a class="active" href="create-user.html">Create Account</a></li>
            <li><a href="login.html">Login to Account</a></li>
            <li><a href="create.html">Create a post</a></li>
            <li><a href="view.html">View Posts</a></li>
            <li><a href="user.html">Your Account</a></li>
        </ul></body>
        <h1>Thank You For Making an Account!</h1>`
    db.query(query, [profileName, password, contact, DOB, state, city, address], (err) => {
        if (err) return res.status(500).send('Error adding user');
        res.send(html);
    });
});

// create a route which allows a user to 'login' meaning receive a authintication token
app.post('/login', (req, res) => {
    const { profileName, password } = req.body;
    const query = 'SELECT * FROM users WHERE profileName = ? AND password = ?';
    db.query(query, [profileName, password], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            const user = results[0];
            const token = jwt.sign({ id: user.userID, username: user.profileName }, SECRET_KEY, { expiresIn: '1h' });
            let html = `<html><head><title>Securty Token</title><link rel="stylesheet" href="styles.css"></head><ul>
            <li><a  href="index.html">Home</a></li>
            <li><a href="create-user.html">Create Account</a></li>
            <li><a class="active" href="login.html">Login to Account</a></li>
            <li><a href="create.html">Create a post</a></li>
            <li><a href="view.html">View Posts</a></li>
            <li><a href="user.html">Your Account</a></li>
        </ul></body>
        <h1>Token:</h1>${token}`
            res.send(html);
        } else {
            res.status(401).send('Invalid credentials');
        }
    });
});

// Create a route which allows a user to create a post 
app.post('/createPost', (req, res) => {
    const { token, postDate, itemName, itemDescription, itemCategory, postType } = req.body;
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const d = new Date();
        const query = 'INSERT INTO posts (userID, postDate, itemName, itemDescription, itemCategory, postType) VALUES (?, ?, ?, ?, ?, ?)';
        let html = `<html><head><title>Post Creation</title><link rel="stylesheet" href="styles.css"></head><ul>
            <li><a  href="index.html">Home</a></li>
            <li><a href="create-user.html">Create Account</a></li>
            <li><a href="login.html">Login to Account</a></li>
            <li><a class="active" href="create.html">Create a post</a></li>
            <li><a href="view.html">View Posts</a></li>
            <li><a href="user.html">Your Account</a></li>
        </ul></body>
        <h1>Thank You For Making a Post!</h1>`
        db.query(query, [decoded.id, d, itemName, itemDescription, itemCategory, postType], (err, result) => {
            if (err) throw err;
            res.send(html);
        });
    } catch (err) {
        res.status(401).send('Unauthorized');
    }
});
// create a route which allows users to view posts based on their selected filters
app.get('/view', (req, res) => {
    const { token, state, itemCategory, postType, postStatus } = req.query;
    const decoded = jwt.verify(token, SECRET_KEY);
    let allRecordsCheck = []
    let values = []
    let query = 'Select posts.postDate, posts.itemName, posts.itemDescription, posts.itemCategory, posts.postType, posts.postStatus, users.profileName, users.state, users.city, users.address, users.contact FROM posts LEFT JOIN users ON users.userID = posts.userID '
    if (state != '*') {
        allRecordsCheck.push('users.state = ?');
        values.push(state)
    };
    if (itemCategory != '*') {
        allRecordsCheck.push('itemCategory = ?');
        values.push(itemCategory);
    };
    if (postType != '*') {
        allRecordsCheck.push('postType = ?');
        values.push(postType);
    };
    if (postStatus != '*') {
        allRecordsCheck.push('postStatus = ?');
        values.push(postStatus);
    };
    if (allRecordsCheck.length > 0) {
        query += ' WHERE ' + allRecordsCheck.join(' AND ');
    }
    db.query(query, values, (err, results) => {
        if (err) throw err;
        let html = `<html><head><title>Posts</title><link rel="stylesheet" href="styles.css"></head><body><ul>
            <li><a href="index.html">Home</a></li>
            <li><a href="create-user.html">Create Account</a></li>
            <li><a href="login.html">Login to Account</a></li>
            <li><a href="create.html">Create a post</a></li>
            <li><a class="active" href="view.html">View Posts</a></li>
            <li><a href="user.html">Your Account</a></li>
        </ul>
    <h1>Posts</h1>
    <table border="1" cellpadding="5" cellspacing="0">
      <thead>
        <tr>
          <th>Date</th><th>Item Name</th><th>Item Description</th><th>Item Category</th><th>Post Type</th><th>Post Status</th><th>User Name</th><th>State</th><th>City</th><th>Address</th><th>Contact</th>
        </tr>
      </thead>
      <tbody>`;
        results.forEach(items => {
            html += `
        <tr>
          <td>${items.postDate}</td>
          <td>${items.itemName}</td>
          <td>${items.itemDescription}</td>
          <td>${items.itemCategory}</td>
          <td>${items.postType}</td>
          <td>${items.postStatus}</td>
          <td>${items.profileName}</td>
          <td>${items.state}</td>
          <td>${items.city}</td>
          <td>${items.address}</td>
          <td>${items.contact}</td>
        </tr>
      `;
        });
        html += `</tbody></table></body></html>`;
        res.send(html);
    })
});

//create a route which allows a user to see their posts
app.get('/user', (req, res) => {
    const { token } = req.query;
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const query = 'SELECT postID, postDate, itemName, itemDescription, itemCategory, postType, postStatus FROM posts WHERE userID = ?';
        db.query(query, [decoded.id], (err, results) => {
            if (err) throw err;
            let html = `<html><head><title>Posts</title><link rel="stylesheet" href="styles.css"></head><body><ul>
            <li><a href="index.html">Home</a></li>
            <li><a href="create-user.html">Create Account</a></li>
            <li><a href="login.html">Login to Account</a></li>
            <li><a href="create.html">Create a post</a></li>
            <li><a href="view.html">View Posts</a></li>
            <li><a class="active" href="user.html">Your Account</a></li>
        </ul>
    <h1>Your Posts</h1>
    <table border="1" cellpadding="5" cellspacing="0">
      <thead>
        <tr>
          <th>Date</th><th>Item Name</th><th>Item Description</th><th>Item Category</th><th>Post Type</th><th>Post Status</th>
        </tr>
      </thead>
      <tbody>`;
            results.forEach(items => {
                html += `
        <tr>
          <td>${items.postDate}</td>
          <td>${items.itemName}</td>
          <td>${items.itemDescription}</td>
          <td>${items.itemCategory}</td>
          <td>${items.postType}</td>
          <td>${items.postStatus}</td>
        </tr>
      `;
            });
            html += `</tbody></table></body></html>`;
            res.send(html);
        });
    } catch (err) {
        res.status(401).send('Unauthorized');
    }
});


// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));


