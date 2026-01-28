require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(express.json());
app.use(cors());

// ================= REGISTER =================
app.post('/api/register', async (req, res) => {
  const {
    full_name,
    email,
    date_of_birth,
    country,
    state,
    city,
    address,
    phone_number,
    password
  } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Required fields missing' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users
      (full_name, email, date_of_birth, country, state, city, address, phone_number, password_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        full_name,
        email,
        date_of_birth,
        country,
        state,
        city,
        address,
        phone_number,
        hashedPassword
      ],
      (err) => {
        if (err) {
          console.error('REGISTER ERROR:', err);
          return res.status(400).json({
            message: err.sqlMessage || 'Registration failed'
          });
        }

        res.json({ message: 'User Registered Successfully' });
      }
    );
  } catch (error) {
    console.error('HASH ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ================= LOGIN =================
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  db.query(
    'SELECT * FROM users WHERE email = ?',
    [email],
    async (err, result) => {
      if (err) {
        console.error('LOGIN ERROR:', err);
        return res.status(500).json({ message: 'Database error' });
      }

      if (result.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const user = result[0];
      const isMatch = await bcrypt.compare(password, user.password_hash);

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.json({
        message: 'Login successful',
        token
      });
    }
  );
});

// ================= SERVER =================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
