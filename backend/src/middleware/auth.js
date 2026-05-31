const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const student = await Student.findOne({ studentId: decoded.studentId }).select('-password');
    
    if (!student) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    if (!student.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    req.student = student;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;
