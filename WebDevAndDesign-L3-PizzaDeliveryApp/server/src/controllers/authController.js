const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const register = async (req, res) => {
    try{
        const {name, email, password} = req.body;

        if(!name || !email || !password){
            return res.status(400).json({message: 'All fields are required'});
        }
        const existingUser = await User.findOne({email: email.toLowerCase()});
        if (existingUser){
            return res.status(409).json({message: 'Email already registered'});
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const user = await User.create({name, email, passwordHash, role: 'User'});

        res.status(201).json({
            messgae: 'Registration successful',
            user: {id: user._id, name: user.name, email: user.email, role: user.role},
        });
    }
    catch(err){
        res.status(500).json({message: 'Server Error'});
    }
};

const login = async (req, res) => {
    try{
        const {email, password} = req.body;

        if(!email || !password){
            return res.status(400).json({message: 'Email and Password are required'});
        }

        const user = await User.findOne({email: email.toLowerCase() });
        if(!user){
            return res.status(401).json({message: 'Invalid Credentials'});
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if(!isMatch){
            return res.status(401).json({message: 'Invalid credentials'})
        }

        const token = generateToken(user._id, user.role);

        res.json({
            token,
            user :{id: user._id, name: user.name, email: user.email, role: user.role},
        });
    }
    catch(err){
        res.status(500).json({message: 'Server error', error: err.message});
    }
};

module.exports = {register, login}