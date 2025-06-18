const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../Schema/UserSchema');

const auth = require('../middleware/auth');
const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  const { fullName, email, password, role } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    
    if (existingUser) return res.status(400).json({ error: 'Email already registered' });

const passwordHash = await bcrypt.hash(password, 10);

const user = await User.create({ fullName, email, passwordHash, role });

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
    console.log("amtch")
    
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
    console.log("token")
    res.cookie('token', token, {
      // httpOnly: true,
      secure: true,      // true if HTTPS
      sameSite: 'None', // or 'Lax' depending on flow
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


router.get('/me',auth, async (req, res) => {
  try {
    // Ensure req.user is set by authentication middleware

    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized: No user info provided' });
    }

    const user = await User.findById(req.user.id).select('_id fullName email role');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error('Error in /me route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports= router;
