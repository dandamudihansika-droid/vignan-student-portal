const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  branch: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  currentSemester: {
    type: Number,
    default: 1
  },
  batch: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  subjects: [{
    subjectCode: String,
    subjectName: String,
    totalClasses: Number
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);
