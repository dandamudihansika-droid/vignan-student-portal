const express = require('express');
const { body, validationResult } = require('express-validator');
const Academic = require('../models/Academic');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/academic/records
// @desc    Get academic records for a student
// @access  Private
router.get('/records', auth, async (req, res) => {
  try {
    const studentId = req.student.studentId;
    const { semester } = req.query;

    const filter = { studentId };
    if (semester) filter.semester = parseInt(semester);

    const records = await Academic.find(filter).sort({ semester: -1 });

    res.json(records);
  } catch (error) {
    console.error('Get academic records error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/academic/record
// @desc    Create or update academic record
// @access  Private
router.post('/record', auth, [
  body('semester').isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1-8'),
  body('subjects').isArray({ min: 1 }).withMessage('At least one subject is required'),
  body('subjects.*.subjectCode').notEmpty().withMessage('Subject code is required'),
  body('subjects.*.subjectName').notEmpty().withMessage('Subject name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { semester, subjects } = req.body;
    const studentId = req.student.studentId;

    // Check if record exists for this semester
    let record = await Academic.findOne({ studentId, semester });

    if (record) {
      // Update existing record
      record.subjects = subjects;
      await record.save();
    } else {
      // Create new record
      record = new Academic({
        studentId,
        semester,
        subjects
      });
      await record.save();
    }

    res.json(record);
  } catch (error) {
    console.error('Academic record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/academic/attendance
// @desc    Update attendance for a specific subject
// @access  Private
router.put('/attendance', auth, [
  body('semester').isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1-8'),
  body('subjectCode').notEmpty().withMessage('Subject code is required'),
  body('totalClasses').isInt({ min: 0 }).withMessage('Total classes must be non-negative'),
  body('attendedClasses').isInt({ min: 0 }).withMessage('Attended classes must be non-negative')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { semester, subjectCode, totalClasses, attendedClasses } = req.body;
    const studentId = req.student.studentId;

    // Find or create academic record
    let record = await Academic.findOne({ studentId, semester });
    
    if (!record) {
      record = new Academic({
        studentId,
        semester,
        subjects: []
      });
    }

    // Find subject
    const subjectIndex = record.subjects.findIndex(s => s.subjectCode === subjectCode);
    
    if (subjectIndex === -1) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Update attendance
    record.subjects[subjectIndex].attendance.totalClasses = totalClasses;
    record.subjects[subjectIndex].attendance.attendedClasses = attendedClasses;

    await record.save();

    res.json(record);
  } catch (error) {
    console.error('Attendance update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/academic/marks
// @desc    Update marks for a specific subject
// @access  Private
router.put('/marks', auth, [
  body('semester').isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1-8'),
  body('subjectCode').notEmpty().withMessage('Subject code is required'),
  body('internal1').optional().isInt({ min: 0, max: 30 }).withMessage('Internal 1 must be 0-30'),
  body('internal2').optional().isInt({ min: 0, max: 30 }).withMessage('Internal 2 must be 0-30'),
  body('assignments').optional().isInt({ min: 0, max: 20 }).withMessage('Assignments must be 0-20'),
  body('external').optional().isInt({ min: 0, max: 70 }).withMessage('External must be 0-70')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { semester, subjectCode, internal1, internal2, assignments, external } = req.body;
    const studentId = req.student.studentId;

    // Find or create academic record
    let record = await Academic.findOne({ studentId, semester });
    
    if (!record) {
      record = new Academic({
        studentId,
        semester,
        subjects: []
      });
    }

    // Find subject
    const subjectIndex = record.subjects.findIndex(s => s.subjectCode === subjectCode);
    
    if (subjectIndex === -1) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Update marks
    const marks = record.subjects[subjectIndex].marks;
    if (internal1 !== undefined) marks.internal1 = internal1;
    if (internal2 !== undefined) marks.internal2 = internal2;
    if (assignments !== undefined) marks.assignments = assignments;
    if (external !== undefined) marks.external = external;

    await record.save();

    res.json(record);
  } catch (error) {
    console.error('Marks update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/academic/analytics
// @desc    Get academic analytics and performance trends
// @access  Private
router.get('/analytics', auth, async (req, res) => {
  try {
    const studentId = req.student.studentId;

    const records = await Academic.find({ studentId }).sort({ semester: 1 });

    if (records.length === 0) {
      return res.json({
        message: 'No academic records found',
        analytics: null
      });
    }

    // Calculate overall analytics
    const totalSemesters = records.length;
    const overallGPA = records.reduce((sum, record) => sum + (record.sgpa || 0), 0) / totalSemesters;
    const overallAttendance = records.reduce((sum, record) => sum + (record.overallAttendance || 0), 0) / totalSemesters;

    // Performance trends
    const performanceTrends = records.map(record => ({
      semester: record.semester,
      sgpa: record.sgpa || 0,
      overallAttendance: record.overallAttendance || 0
    }));

    // Subject-wise performance
    const subjectPerformance = {};
    records.forEach(record => {
      record.subjects.forEach(subject => {
        if (!subjectPerformance[subject.subjectName]) {
          subjectPerformance[subject.subjectName] = {
            totalMarks: 0,
            attendance: 0,
            semesters: 0
          };
        }
        subjectPerformance[subject.subjectName].totalMarks += subject.marks.total || 0;
        subjectPerformance[subject.subjectName].attendance += subject.attendance.percentage || 0;
        subjectPerformance[subject.subjectName].semesters += 1;
      });
    });

    // Calculate averages
    Object.keys(subjectPerformance).forEach(subjectName => {
      const data = subjectPerformance[subjectName];
      data.averageMarks = Math.round(data.totalMarks / data.semesters);
      data.averageAttendance = Math.round(data.attendance / data.semesters);
    });

    // Grade distribution
    const gradeDistribution = { 'O': 0, 'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 };
    records.forEach(record => {
      record.subjects.forEach(subject => {
        if (subject.marks.grade && gradeDistribution.hasOwnProperty(subject.marks.grade)) {
          gradeDistribution[subject.marks.grade]++;
        }
      });
    });

    // Recommendations
    const recommendations = generateAcademicRecommendations(overallGPA, overallAttendance, records);

    res.json({
      summary: {
        totalSemesters,
        overallGPA: Math.round(overallGPA * 100) / 100,
        overallAttendance: Math.round(overallAttendance),
        currentSemester: records[records.length - 1]?.semester || 1
      },
      performanceTrends,
      subjectPerformance,
      gradeDistribution,
      recommendations
    });
  } catch (error) {
    console.error('Academic analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/academic/comparison
// @desc    Compare performance across semesters
// @access  Private
router.get('/comparison', auth, async (req, res) => {
  try {
    const studentId = req.student.studentId;
    const { semester1, semester2 } = req.query;

    if (!semester1 || !semester2) {
      return res.status(400).json({ message: 'Both semesters are required for comparison' });
    }

    const [record1, record2] = await Promise.all([
      Academic.findOne({ studentId, semester: parseInt(semester1) }),
      Academic.findOne({ studentId, semester: parseInt(semester2) })
    ]);

    if (!record1 || !record2) {
      return res.status(404).json({ message: 'One or both semester records not found' });
    }

    // Compare subjects
    const comparison = {
      semester1: {
        semester: record1.semester,
        sgpa: record1.sgpa,
        overallAttendance: record1.overallAttendance,
        subjects: record1.subjects.map(s => ({
          name: s.subjectName,
          total: s.marks.total,
          grade: s.marks.grade,
          attendance: s.attendance.percentage
        }))
      },
      semester2: {
        semester: record2.semester,
        sgpa: record2.sgpa,
        overallAttendance: record2.overallAttendance,
        subjects: record2.subjects.map(s => ({
          name: s.subjectName,
          total: s.marks.total,
          grade: s.marks.grade,
          attendance: s.attendance.percentage
        }))
      },
      improvements: {
        gpaChange: Math.round((record2.sgpa - record1.sgpa) * 100) / 100,
        attendanceChange: record2.overallAttendance - record1.overallAttendance
      }
    };

    res.json(comparison);
  } catch (error) {
    console.error('Comparison error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to generate academic recommendations
function generateAcademicRecommendations(gpa, attendance, records) {
  const recommendations = [];

  if (gpa < 6.0) {
    recommendations.push("Your GPA is below average. Focus on understanding concepts and seek help from professors.");
  } else if (gpa >= 8.0) {
    recommendations.push("Excellent academic performance! Keep up the good work and consider mentoring others.");
  }

  if (attendance < 75) {
    recommendations.push("Low attendance detected. Regular class attendance is crucial for academic success.");
  } else if (attendance >= 90) {
    recommendations.push("Great attendance record! Consistent presence in classes contributes to better understanding.");
  }

  // Check for declining performance
  if (records.length >= 2) {
    const recentSgpa = records[records.length - 1].sgpa || 0;
    const previousSgpa = records[records.length - 2].sgpa || 0;
    
    if (recentSgpa < previousSgpa - 0.5) {
      recommendations.push("Your performance has declined. Identify the reasons and take corrective actions.");
    } else if (recentSgpa > previousSgpa + 0.5) {
      recommendations.push("Great improvement! Continue your current study strategies.");
    }
  }

  recommendations.push("Regular revision and practice are key to maintaining good academic performance.");
  recommendations.push("Don't hesitate to clarify doubts with teachers and peers.");

  return recommendations;
}

module.exports = router;
