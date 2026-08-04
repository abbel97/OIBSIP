const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const {buildEmailHTML} = require('../utils/emailTemplates');

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
    const verifyTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; //24 hours

    const user = await User.create({
        name, email, passwordHash, role: 'user',
        isVerified: false,
        verifyToken,
        verifyTokenExpiry,
    });

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;

    await sendEmail({ 
      to: user.email, 
      subject: '🍕 Verify your email - Pizza App',
      html: buildEmailHTML({
        heading: `Welcome, ${user.name}!`,
        bodyText: 'We are thrilled to have you on board. To finish setting up to your account and start ordering freshm delicious pizzas, please verify your email address by clicking the button below:',
        ctaText: 'Verify Email',
        ctaUrl: verifyUrl,
        expiryText: 'This verification link will expire in 24 hours.'
      })
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

    if(!user.isVerified){
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

const forgotPassword = async (req, res) => {
  try {
    const {email} = req.body;
    if (!email) {
      return res.status(400).json({message: 'Email is required'});
    }

    const user = await User.findOne({email: email.toLowerCase()});

    if (!user) {
      return res.json({message: 'If that email is registered, a reset link has been sent.'});
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 60 * 60 * 1000; //1 hour
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: '🍕 Reset your password - Pizza App',
      html: buildEmailHTML({
        heading: `Hi ${user.name},`,
        bodyText: 'We received a request to reset your password. Click the button below to choose a new one.',
        ctaText: 'Reset Password',
        ctaUrl: resetUrl,
        expiryText: 'This secure reset link will expire in 1 hour.',
      }),
    });

    res.json({message: 'If that email is registered, a reset link has been sent.'});
  } 
  catch (err) {
    res.status(500).json({message: 'Server error', error: err.message});
  }
};
  
const resetPassword = async (req, res) => {
  try {
    const {token} = req.params;
    const {newPassword} = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({message: 'Password must be at least 6 characters'});
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: {$gt: Date.now()},
    });

    if (!user) {
      return res.status(400).json({message: 'Invalid or expired reset link'});
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({message: 'Password reset successful. You can now log in with your new password.'});
  } 
  catch (err) {
    res.status(500).json({message: 'Server error', error: err.message});
  }
};


module.exports = {register, login, verifyEmail, forgotPassword, resetPassword};