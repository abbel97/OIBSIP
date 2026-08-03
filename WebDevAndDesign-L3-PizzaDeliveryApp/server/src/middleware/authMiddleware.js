const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;
    const authHeader = req.headers.authorization;

    if(authHeader && authHeader.startsWith('Bearer ')){
        token = authHeader.split(' ')[1];
    }

    if(!token){
        return res.status(401).json({message: 'Not authorized, no token'});
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-passwordHash');
        if(!req.user){
            return res.status(401).json({message: 'User not found'});
        }
        next();
    }
    catch(err){
        if(err.name === 'TokenExpiredError'){
            return res.status(401).json({message: 'Token expired, please log in again'});
        }
        if (err.name === 'JsonWebTokenError'){
            return res.status(401).json({message: 'Invalid Token'});
        }
        return res.status(401).json({message: 'Not authoried'});
    }
};

const adminOnly = (req, res, next) => {
    if(req.user && req.user.role === 'admin'){
        next();
    }
    else{
        res.status(403).json({message: 'Admin access required'})
    }
};

module.exports = {protect, adminOnly};