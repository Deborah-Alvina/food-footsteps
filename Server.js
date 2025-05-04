const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcrypt');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Serve images statically
app.use('/Imgs', express.static('Imgs'));

// Configure multer for image storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'Imgs/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// MySQL database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'vasanthi',
  database: 'places'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to the database.');
});

// =================== API ROUTES ===================

// Fetch all places
app.get('/places', (req, res) => {
  const query = 'SELECT * FROM places';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error retrieving places:', err);
      return res.status(500).send('Server error');
    }
    res.json(results);
  });
});

// Add place with image
app.post('/places', upload.single('image'), (req, res) => {
  const { name, nearestmetro, distancefrommetro, pricerange, googlelink } = req.body;
  const image_url = req.file ? `/Imgs/${req.file.filename}` : null;

  if (!name || !nearestmetro || !distancefrommetro || !pricerange || !googlelink || !image_url) {
    return res.status(400).send({ message: 'Missing required fields or image' });
  }

  const checkSql = 'SELECT * FROM places WHERE name = ?';
  db.query(checkSql, [name], (err, results) => {
    if (err) return res.status(500).send({ message: 'Server error' });
    if (results.length > 0) return res.status(400).send({ message: 'Place already exists' });

    const insertSql = `INSERT INTO places (name, nearestmetro, distancefrommetro, pricerange, googlelink, image_url) VALUES (?, ?, ?, ?, ?, ?)`;
    db.query(insertSql, [name, nearestmetro, distancefrommetro, pricerange, googlelink, image_url], (err) => {
      if (err) return res.status(500).send({ message: 'Server error' });
      res.status(201).send({ message: 'Place added successfully' });
    });
  });
});

// Update place including image
app.put('/places', upload.single('image'), (req, res) => {
  const { name, nearestmetro, distancefrommetro, pricerange, googlelink } = req.body;
  const newImage = req.file ? `/Imgs/${req.file.filename}` : null;

  if (!name || !nearestmetro || !distancefrommetro || !pricerange || !googlelink ) {
    return res.status(400).send({ message: 'Missing required fields' });
  }

  const checkSql = 'SELECT * FROM places WHERE name = ?';
  db.query(checkSql, [name], (err, results) => {
    if (err) return res.status(500).send({ message: 'Server error' });

    if (results.length === 0) return res.status(404).send({ message: 'Place not found' });

    // Delete old image if new one is uploaded
    if (newImage && results[0].image_url) {
      const oldImagePath = path.join(__dirname, results[0].image_url);
      fs.unlink(oldImagePath, (err) => {
        if (err) console.warn('Old image delete failed:', err);
      });
    }

    const updateSql = `UPDATE places SET nearestmetro = ?, distancefrommetro = ?, pricerange = ?, googlelink = ?${newImage ? ', image_url = ?' : ''} WHERE name = ?`;
    const params = [nearestmetro, distancefrommetro, pricerange, googlelink];
    if (newImage) params.push(newImage);
    params.push(name);

    db.query(updateSql, params, (err, result) => {
      if (err) return res.status(500).send({ message: 'Server error' });
      if (result.affectedRows === 0) return res.status(400).send({ message: 'Place update failed' });
      res.status(200).send({ message: 'Place updated successfully' });
    });
  });
});

// Delete place (and image file)
app.delete('/places', (req, res) => {
  const { name } = req.body;
  const getSql = 'SELECT image_url FROM places WHERE name = ?';
  db.query(getSql, [name], (err, results) => {
    if (err) return res.status(500).send('Server error');
    if (results.length === 0) return res.status(404).send('Place not found');

    const imagePath = results[0].image_url ? path.join(__dirname, results[0].image_url) : null;

    const deleteSql = 'DELETE FROM places WHERE name = ?';
    db.query(deleteSql, [name], (err) => {
      if (err) return res.status(500).send('Server error');
      if (imagePath) {
        fs.unlink(imagePath, (err) => {
          if (err) console.warn('Failed to delete image:', err);
        });
      }
      res.send('Place deleted successfully.');
    });
  });
});

// User Signup
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).send({ message: 'All fields are required' });
  }

  const checkSql = 'SELECT * FROM users WHERE email = ?';
  db.query(checkSql, [email], async (err, results) => {
    if (err) return res.status(500).send({ message: 'Server error' });
    if (results.length > 0) return res.status(409).send({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const insertSql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    db.query(insertSql, [name, email, hashedPassword], (err) => {
      if (err) return res.status(500).send({ message: 'Server error' });
      res.status(201).send({ message: 'User created successfully' });
    });
  });
});

// User Login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).send({ message: 'Email and password are required' });

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).send({ message: 'Server error' });
    if (results.length === 0) return res.status(401).send({ message: 'Invalid email or password' });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).send({ message: 'Invalid email or password' });

    res.status(200).send({ message: 'Login successful', name: user.name });
  });
});

// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
