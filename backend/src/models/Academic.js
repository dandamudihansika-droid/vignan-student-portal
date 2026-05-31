const mongoose = require('mongoose');

const academicSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    ref: 'Student'
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  subjects: [{
    subjectCode: {
      type: String,
      required: true
    },
    subjectName: {
      type: String,
      required: true
    },
    attendance: {
      totalClasses: {
        type: Number,
        default: 0
      },
      attendedClasses: {
        type: Number,
        default: 0
      },
      percentage: {
        type: Number,
        default: 0
      }
    },
    marks: {
      internal1: {
        type: Number,
        min: 0,
        max: 30,
        default: 0
      },
      internal2: {
        type: Number,
        min: 0,
        max: 30,
        default: 0
      },
      assignments: {
        type: Number,
        min: 0,
        max: 20,
        default: 0
      },
      external: {
        type: Number,
        min: 0,
        max: 70,
        default: 0
      },
      total: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      grade: {
        type: String,
        enum: ['O', 'A+', 'A', 'B+', 'B', 'C', 'D', 'F'],
        default: 'F'
      }
    }
  }],
  gpa: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  sgpa: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  overallAttendance: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate GPA and attendance automatically
academicSchema.pre('save', function(next) {
  if (this.subjects && this.subjects.length > 0) {
    // Calculate overall attendance
    let totalClasses = 0;
    let attendedClasses = 0;
    
    this.subjects.forEach(subject => {
      totalClasses += subject.attendance.totalClasses;
      attendedClasses += subject.attendance.attendedClasses;
      
      // Calculate subject attendance percentage
      if (subject.attendance.totalClasses > 0) {
        subject.attendance.percentage = Math.round((subject.attendance.attendedClasses / subject.attendance.totalClasses) * 100);
      }
      
      // Calculate total marks
      subject.marks.total = subject.marks.internal1 + subject.marks.internal2 + 
                           subject.marks.assignments + subject.marks.external;
      
      // Assign grade based on total marks
      if (subject.marks.total >= 90) subject.marks.grade = 'O';
      else if (subject.marks.total >= 80) subject.marks.grade = 'A+';
      else if (subject.marks.total >= 70) subject.marks.grade = 'A';
      else if (subject.marks.total >= 60) subject.marks.grade = 'B+';
      else if (subject.marks.total >= 50) subject.marks.grade = 'B';
      else if (subject.marks.total >= 40) subject.marks.grade = 'C';
      else if (subject.marks.total >= 35) subject.marks.grade = 'D';
      else subject.marks.grade = 'F';
    });
    
    // Calculate overall attendance percentage
    if (totalClasses > 0) {
      this.overallAttendance = Math.round((attendedClasses / totalClasses) * 100);
    }
    
    // Calculate SGPA (simplified calculation)
    let totalPoints = 0;
    let totalCredits = 0;
    
    this.subjects.forEach(subject => {
      const gradePoints = {
        'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'D': 4, 'F': 0
      };
      totalPoints += gradePoints[subject.marks.grade] * 4; // Assuming 4 credits per subject
      totalCredits += 4;
    });
    
    if (totalCredits > 0) {
      this.sgpa = Math.round((totalPoints / totalCredits) * 100) / 100;
    }
  }
  
  next();
});

// Index for better queries
academicSchema.index({ studentId: 1, semester: -1 });
academicSchema.index({ studentId: 1, 'subjects.subjectCode': 1 });

module.exports = mongoose.model('Academic', academicSchema);
