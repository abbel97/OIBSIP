const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({message: 'All fields are required'});
    }

    const existingUser = await User.findOne({email: email.toLowerCase()});
    if (existingUser) {
      return res.status(409).json({message: 'Email already registered'});
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const verifyToken = crypto.randomBytes(32).toString('hex');
    const verifyTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; //24 hrs

    const user = await User.create({
        name, email, passwordHash, role: 'user',
        isverified: false,
        verifyToken,
        verifyTokenExpiry,
    });

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;

    await sendEmail({
        to: user.email,
        subject: 'Verify your email - Pizza App',
        html: `
         <h2>Welcome to Pizza App, ${user.name}! </h2>
         <p>Please verify your email by clicking the link below: </p>
         <a href = "${verifyUrl}" target="_blank">Verify Email</a>
         <p>This Link expires in 24 hours.</p>
         `
    });

    res.status(201).json({
      message: 'Registration successful. Please check in your email to verify your account',
      user: {id: user._id, name: user.name, email: user.email, role: user.role},
    });
  } catch (err) {
    res.status(500).json({message: 'Server error', error: err.message});
  }
};

const verifyEmail = async (req, res) => {
  try {
    const {token} = req.params;

    const user = await User.findOne({
      verifyToken: token,
      verifyTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({message: 'Invalid or expired verification link'});
    }

    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpiry = undefined;
    await user.save();

    res.json({message: 'Email verified successfully. You can now log in.'});
  } catch (err) {
    res.status(500).json({message: 'Server error', error: err.message});
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({message: 'Email and password are required'});
    }

    const user = await User.findOne({email: email.toLowerCase()});
    if (!user) {
      return res.status(401).json({message: 'Invalid credentials'});
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({message: 'Invalid credentials'});
    }

    if(!User.isVerified){
        return res.status(403).json({message: 'Please verify your email adress before logging in.'});
    }

    const token = generateToken(user._id, user.role);

    res.json({
      token,
      user: {id: user._id, name: user.name, email: user.email, role: user.role},
    });
  } catch (err) {
    res.status(500).json({message: 'Server error', error: err.message});
  }
};

module.exports = {register, login, verifyEmail};