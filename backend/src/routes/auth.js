const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Student = require('../models/Student');
const auth = require('../middleware/auth');

const router = express.Router();

// Generate JWT Token
const generateToken = (studentId) => {
  return jwt.sign({ studentId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @route   POST /api/auth/register
// @desc    Register a new student
// @access  Public
router.post('/register', [
  body('studentId').matches(/^[2][0-9][1]fa0[0-9]{4}$/).withMessage('Invalid Vignan Student ID format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').matches(/^[0-9]{10}$/).withMessage('Phone must be 10 digits'),
  body('branch').isIn(['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT']).withMessage('Invalid branch'),
  body('section').isIn(['A', 'B', 'C', 'D']).withMessage('Invalid section')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { studentId, password, firstName, lastName, email, phone, branch, section } = req.body;

    // Determine batch from student ID
    const yearPrefix = studentId.substring(0, 2);
    const startYear = 2000 + parseInt(yearPrefix);
    const endYear = startYear + 4;
    const batch = `${startYear}-${endYear}`;

    // Check if student already exists
    let student = await Student.findOne({ studentId });
    if (student) {
      return res.status(400).json({ message: 'Student ID already registered' });
    }

    student = await Student.findOne({ email });
    if (student) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new student
    student = new Student({
      studentId,
      password,
      firstName,
      lastName,
      email,
      phone,
      batch,
      branch,
      section
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    student.password = await bcrypt.hash(password, salt);

    await student.save();

    // Generate token
    const token = generateToken(studentId);

    res.status(201).json({
      token,
      student: {
        studentId: student.studentId,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        batch: student.batch,
        branch: student.branch,
        section: student.section,
        currentSemester: student.currentSemester
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Login student
// @access  Public
router.post('/login', [
  body('studentId').notEmpty().withMessage('Student ID is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { studentId, password } = req.body;

    // Check if student exists
    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if account is active
    if (!student.isActive) {
      return res.status(400).json({ message: 'Account is deactivated' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(studentId);

    res.json({
      token,
      student: {
        studentId: student.studentId,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        batch: student.batch,
        branch: student.branch,
        section: student.section,
        currentSemester: student.currentSemester
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/profile
// @desc    Get student profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    res.json(req.student);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update student profile
// @access  Private
router.put('/profile', auth, [
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().matches(/^[0-9]{10}$/).withMessage('Phone must be 10 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, phone } = req.body;
    const studentId = req.student.studentId;

    // Check if email is already taken by another student
    if (email && email !== req.student.email) {
      const existingStudent = await Student.findOne({ email, studentId: { $ne: studentId } });
      if (existingStudent) {
        return res.status(400).json({ message: 'Email already taken' });
      }
    }

    // Update student profile
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;

    const student = await Student.findOneAndUpdate(
      { studentId },
      updateData,
      { new: true }
    ).select('-password');

    res.json(student);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
