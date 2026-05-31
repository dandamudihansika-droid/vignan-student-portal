const mongoose = require('mongoose');

const sleepScheduleSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    ref: 'Student'
  },
  date: {
    type: Date,
    required: true
  },
  bedtime: {
    type: String, // Format: "22:30"
    required: true,
    validate: {
      validator: function(v) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Invalid time format. Use HH:MM format.'
    }
  },
  wakeTime: {
    type: String, // Format: "06:30"
    required: true,
    validate: {
      validator: function(v) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Invalid time format. Use HH:MM format.'
    }
  },
  duration: {
    type: Number, // in hours
    min: 0,
    max: 24
  },
  quality: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  factors: [{
    type: String,
    enum: ['study', 'phone', 'caffeine', 'exercise', 'stress', 'noise', 'comfortable', 'routine']
  }],
  notes: {
    type: String,
    default: ''
  },
  recommendations: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Calculate sleep duration before saving
sleepScheduleSchema.pre('save', function(next) {
  if (this.bedtime && this.wakeTime) {
    const [bedHour, bedMin] = this.bedtime.split(':').map(Number);
    const [wakeHour, wakeMin] = this.wakeTime.split(':').map(Number);
    
    let bedtimeMinutes = bedHour * 60 + bedMin;
    let wakeTimeMinutes = wakeHour * 60 + wakeMin;
    
    // Handle overnight sleep
    if (wakeTimeMinutes < bedtimeMinutes) {
      wakeTimeMinutes += 24 * 60; // Add 24 hours
    }
    
    this.duration = Math.round((wakeTimeMinutes - bedtimeMinutes) / 60 * 100) / 100;
    
    // Generate recommendations based on sleep data
    this.recommendations = this.generateRecommendations();
  }
  
  next();
});

// Method to generate sleep recommendations
sleepScheduleSchema.methods.generateRecommendations = function() {
  const recommendations = [];
  
  if (this.duration < 6) {
    recommendations.push("You're getting less than 6 hours of sleep. Try to sleep earlier for better academic performance.");
  } else if (this.duration > 9) {
    recommendations.push("You're sleeping more than 9 hours. Ensure you're not oversleeping which can affect your study schedule.");
  } else {
    recommendations.push("Good sleep duration! Maintain this consistent schedule.");
  }
  
  if (this.quality < 5) {
    recommendations.push("Poor sleep quality detected. Avoid screens 1 hour before bedtime and maintain a consistent routine.");
  }
  
  // Check bedtime consistency
  const bedtimeHour = parseInt(this.bedtime.split(':')[0]);
  if (bedtimeHour > 23) {
    recommendations.push("Late bedtime detected. Try to sleep before 11 PM for better concentration in classes.");
  }
  
  // Age-specific recommendations for college students
  recommendations.push("As a college student, aim for 7-9 hours of quality sleep for optimal learning and memory retention.");
  
  return recommendations.join(' ');
};

// Index for better queries
sleepScheduleSchema.index({ studentId: 1, date: -1 });
sleepScheduleSchema.index({ studentId: 1, quality: -1 });

module.exports = mongoose.model('SleepSchedule', sleepScheduleSchema);
