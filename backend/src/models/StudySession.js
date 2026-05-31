const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    ref: 'Student'
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    default: null
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  concentrationLevel: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  breaks: [{
    startTime: Date,
    endTime: Date,
    duration: Number
  }],
  notes: {
    type: String,
    default: ''
  },
  tags: [{
    type: String,
    trim: true
  }],
  isCompleted: {
    type: Boolean,
    default: false
  },
  productivityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate duration before saving
studySessionSchema.pre('save', function(next) {
  if (this.endTime && this.startTime) {
    this.duration = Math.round((this.endTime - this.startTime) / (1000 * 60)); // Convert to minutes
  }
  next();
});

// Index for better query performance
studySessionSchema.index({ studentId: 1, startTime: -1 });
studySessionSchema.index({ studentId: 1, isCompleted: 1 });

module.exports = mongoose.model('StudySession', studySessionSchema);
