const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); 

// Connect to the MySQL database
const db = mysql.createConnection({
  host: `localhost`,
  user: `root`,          
  password: `vasanthi`,  
  database: `places`
});

db.connect((err) => {
  if (err) throw err;
  console.log(`Connected to the database.`);
});

// Fetch Places
app.get(`/places`, (req, res) => {
  const query = `SELECT * FROM places`;
  db.query(query, (err, results) => {
    if (err) {
      console.error(`Error retrieving places:`, err);
      res.status(500).send(`Server error`);
    } else {
      res.json(results); // Send the retrieved places as JSON response
    }
  });
});

// Add place
app.post(`/places`, (req, res) => {
  const {name, nearestmetro, distancefrommetro, pricerange, googlelink, status} = req.body;

  // Ensure all fields are provided
  if (!name || !nearestmetro || !distancefrommetro || !pricerange || !googlelink || !status) {
    return res.status(400).send({ message: 'Missing required fields' });
  }

  // Validate the googlelink (basic validation for a URL)
  const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
  if (!urlRegex.test(googlelink)) {
    return res.status(400).send({ message: 'Invalid Google link format' });
  }

  // Check if the place already exists in the database
  const checkSql = `SELECT * FROM places WHERE name = ?`;
  db.query(checkSql, [name], (err, results) => {
    if (err) {
      console.error('Error checking for existing place:', err);
      return res.status(500).send({ message: 'Server error' });
    }

    // If the place already exists
    if (results.length > 0) {
      console.log(`Place already exists: ${name}`);
      return res.status(400).send({ message: 'Place already exists.' });
    }

    // Insert the place if it does not exist
    const insertSql = `INSERT INTO places (name, nearestmetro, distancefrommetro, pricerange, googlelink, status) VALUES (?, ?, ?, ?, ?, ?)`;
    db.query(insertSql, [name, nearestmetro, distancefrommetro, pricerange, googlelink, status], (err, result) => {
      if (err) {
        console.error('Error adding place:', err);
        return res.status(500).send({ message: 'Server error' });
      }
      console.log(`Place added: ${name}`);
      res.status(201).json({ message: 'Place added successfully' });
    });
  });
});

  
  
  

// Update place
app.put(`/places`, (req, res) => {
  const {name, nearestmetro, distancefrommetro, pricerange, googlelink, status} = req.body;

  // Ensure all fields are provided for update
  if (!name || !nearestmetro || !distancefrommetro || !pricerange || !googlelink || !status) {
    return res.status(400).send({ message: 'Missing required fields' });
  }

  // Validate the googlelink (basic validation for a URL)
  const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
  if (!urlRegex.test(googlelink)) {
    return res.status(400).send({ message: 'Invalid Google link format' });
  }

  // First, check if the place exists
  const checkSql = `SELECT * FROM places WHERE name = ?`;
  db.query(checkSql, [name], (err, results) => {
    if (err) {
      console.error('Error checking for existing place:', err);
      return res.status(500).send({ message: 'Server error' });
    }

    // If the place does not exist, return an error
    if (results.length === 0) {
      console.log(`Place not found: ${name}`);
      return res.status(404).send({ message: 'Place not found' });
    }

    // Proceed to update the place if it exists
    const updateSql = `UPDATE places SET nearestmetro = ?, distancefrommetro = ?, pricerange = ?, googlelink = ?, status = ? WHERE name = ?`;
    db.query(updateSql, [nearestmetro, distancefrommetro, pricerange, googlelink, status, name], (err, result) => {
      if (err) {
        console.error('Error updating place:', err);
        return res.status(500).send({ message: 'Server error' });
      }
      
      // Check if any rows were affected (updated)
      if (result.affectedRows === 0) {
        console.log(`Place not updated: ${name}`);
        return res.status(400).send({ message: 'Place update failed' });
      }

      console.log(`Place updated successfully: ${name}`);
      res.status(200).send({ message: 'Place updated successfully' });
    });
  });
});



// Delete place
app.delete(`/places`, (req, res) => {
  const { name } = req.body;
  const sql = `DELETE FROM places WHERE name = ?`;
  db.query(sql, [name], (err, result) => {
    if (err) {
      console.error(`Error deleting place:`, err);
      res.status(500).send(`Server error`);
    } else {
      res.send(`place deleted successfully.`);
    }
  });
});

const bcrypt = require('bcrypt');

// User Signup
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).send({ message: 'All fields are required' });
  }

  // Check if user already exists
  const checkUserSql = `SELECT * FROM users WHERE email = ?`;
  db.query(checkUserSql, [email], async (err, results) => {
    if (err) {
      console.error('Error checking user:', err);
      return res.status(500).send({ message: 'Server error' });
    }

    if (results.length > 0) {
      return res.status(409).send({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into DB
    const insertSql = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
    db.query(insertSql, [name, email, hashedPassword], (err, result) => {
      if (err) {
        console.error('Error creating user:', err);
        return res.status(500).send({ message: 'Server error' });
      }

      res.status(201).send({ message: 'User created successfully' });
    });
  });
});


// User Login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({ message: 'Email and password are required' });
  }

  const sql = `SELECT * FROM users WHERE email = ?`;
  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).send({ message: 'Server error' });
    }

    if (results.length === 0) {
      return res.status(401).send({ message: 'Invalid email or password' });
    }

    const user = results[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({ message: 'Invalid email or password' });
    }

    res.status(200).send({ message: 'Login successful', name: user.name });
  });
});


app.listen(3000, () => {
  console.log(`Server started on port 3000`);
});