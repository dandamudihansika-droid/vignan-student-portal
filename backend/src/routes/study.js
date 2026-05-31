const express = require('express');
const { body, validationResult } = require('express-validator');
const StudySession = require('../models/StudySession');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/study/session
// @desc    Start or update a study session
// @access  Private
router.post('/session', auth, [
  body('subject').notEmpty().withMessage('Subject is required'),
  body('startTime').optional().isISO8601().withMessage('Invalid start time format'),
  body('endTime').optional().isISO8601().withMessage('Invalid end time format'),
  body('concentrationLevel').optional().isInt({ min: 1, max: 10 }).withMessage('Concentration level must be between 1-10')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { subject, startTime, endTime, concentrationLevel, notes, tags } = req.body;
    const studentId = req.student.studentId;

    // Check if there's an active session
    let activeSession = await StudySession.findOne({ 
      studentId, 
      isCompleted: false 
    });

    if (activeSession && endTime) {
      // Complete the existing session
      activeSession.endTime = new Date(endTime);
      activeSession.concentrationLevel = concentrationLevel || activeSession.concentrationLevel;
      activeSession.notes = notes || activeSession.notes;
      activeSession.tags = tags || activeSession.tags;
      activeSession.isCompleted = true;
      
      // Calculate productivity score
      const studyDuration = activeSession.duration;
      const concentration = activeSession.concentrationLevel;
      const breakTime = activeSession.breaks.reduce((total, breakItem) => total + (breakItem.duration || 0), 0);
      
      // Productivity score formula: (concentration * study_efficiency) / total_time
      const efficiency = (studyDuration - breakTime) / studyDuration;
      activeSession.productivityScore = Math.round((concentration * efficiency * 10));
      
      await activeSession.save();
      return res.json(activeSession);
    } else if (!activeSession && !endTime) {
      // Start a new session
      const newSession = new StudySession({
        studentId,
        subject,
        startTime: startTime ? new Date(startTime) : new Date(),
        concentrationLevel: concentrationLevel || 5,
        notes: notes || '',
        tags: tags || []
      });

      await newSession.save();
      return res.status(201).json(newSession);
    } else {
      return res.status(400).json({ message: 'Invalid session operation' });
    }
  } catch (error) {
    console.error('Study session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/study/sessions
// @desc    Get all study sessions for a student
// @access  Private
router.get('/sessions', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, subject, startDate, endDate } = req.query;
    const studentId = req.student.studentId;

    // Build filter
    const filter = { studentId };
    if (subject) filter.subject = new RegExp(subject, 'i');
    if (startDate || endDate) {
      filter.startTime = {};
      if (startDate) filter.startTime.$gte = new Date(startDate);
      if (endDate) filter.startTime.$lte = new Date(endDate);
    }

    const sessions = await StudySession.find(filter)
      .sort({ startTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await StudySession.countDocuments(filter);

    res.json({
      sessions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/study/analytics
// @desc    Get study analytics and concentration analysis
// @access  Private
router.get('/analytics', auth, async (req, res) => {
  try {
    const studentId = req.student.studentId;
    const { period = '7' } = req.query; // Default to last 7 days

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    const sessions = await StudySession.find({
      studentId,
      startTime: { $gte: daysAgo },
      isCompleted: true
    });

    // Calculate analytics
    const totalSessions = sessions.length;
    const totalStudyTime = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    const avgConcentration = sessions.reduce((sum, session) => sum + (session.concentrationLevel || 0), 0) / totalSessions || 0;
    const avgProductivity = sessions.reduce((sum, session) => sum + (session.productivityScore || 0), 0) / totalSessions || 0;

    // Subject-wise analysis
    const subjectAnalysis = {};
    sessions.forEach(session => {
      if (!subjectAnalysis[session.subject]) {
        subjectAnalysis[session.subject] = {
          totalTime: 0,
          sessions: 0,
          avgConcentration: 0,
          avgProductivity: 0
        };
      }
      subjectAnalysis[session.subject].totalTime += session.duration || 0;
      subjectAnalysis[session.subject].sessions += 1;
      subjectAnalysis[session.subject].avgConcentration += session.concentrationLevel || 0;
      subjectAnalysis[session.subject].avgProductivity += session.productivityScore || 0;
    });

    // Calculate averages for each subject
    Object.keys(subjectAnalysis).forEach(subject => {
      const data = subjectAnalysis[subject];
      data.avgConcentration = Math.round(data.avgConcentration / data.sessions);
      data.avgProductivity = Math.round(data.avgProductivity / data.sessions);
    });

    // Daily study pattern
    const dailyPattern = {};
    sessions.forEach(session => {
      const day = session.startTime.toLocaleDateString();
      if (!dailyPattern[day]) {
        dailyPattern[day] = { totalTime: 0, sessions: 0 };
      }
      dailyPattern[day].totalTime += session.duration || 0;
      dailyPattern[day].sessions += 1;
    });

    // Concentration trends
    const concentrationTrends = sessions.map(session => ({
      date: session.startTime.toISOString().split('T')[0],
      concentration: session.concentrationLevel || 0,
      productivity: session.productivityScore || 0
    }));

    res.json({
      summary: {
        totalSessions,
        totalStudyTime: Math.round(totalStudyTime),
        avgConcentration: Math.round(avgConcentration * 10) / 10,
        avgProductivity: Math.round(avgProductivity),
        dailyAverage: Math.round(totalStudyTime / parseInt(period))
      },
      subjectAnalysis,
      dailyPattern,
      concentrationTrends,
      recommendations: generateStudyRecommendations(avgConcentration, avgProductivity, totalStudyTime, parseInt(period))
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/study/break
// @desc    Add a break to current study session
// @access  Private
router.post('/break', auth, [
  body('startTime').isISO8601().withMessage('Invalid start time format'),
  body('endTime').optional().isISO8601().withMessage('Invalid end time format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { startTime, endTime } = req.body;
    const studentId = req.student.studentId;

    // Find active session
    const session = await StudySession.findOne({ 
      studentId, 
      isCompleted: false 
    });

    if (!session) {
      return res.status(404).json({ message: 'No active study session found' });
    }

    const breakItem = {
      startTime: new Date(startTime),
      endTime: endTime ? new Date(endTime) : null,
      duration: endTime ? Math.round((new Date(endTime) - new Date(startTime)) / (1000 * 60)) : 0
    };

    session.breaks.push(breakItem);
    await session.save();

    res.json(session);
  } catch (error) {
    console.error('Break tracking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to generate study recommendations
function generateStudyRecommendations(avgConcentration, avgProductivity, totalStudyTime, period) {
  const recommendations = [];

  if (avgConcentration < 5) {
    recommendations.push("Your concentration level is below average. Try the Pomodoro technique: 25 minutes study, 5 minutes break.");
  }

  if (avgProductivity < 60) {
    recommendations.push("Low productivity detected. Ensure you're studying in a distraction-free environment.");
  }

  const dailyAvg = totalStudyTime / period;
  if (dailyAvg < 120) { // Less than 2 hours per day
    recommendations.push("Consider increasing your daily study time to at least 2-3 hours for better academic performance.");
  } else if (dailyAvg > 480) { // More than 8 hours per day
    recommendations.push("You're studying extensively. Remember to take regular breaks to maintain effectiveness.");
  }

  if (avgConcentration > 7 && avgProductivity > 70) {
    recommendations.push("Great job! Your study habits are excellent. Keep up the consistent routine.");
  }

  recommendations.push("Maintain a consistent study schedule and review your notes regularly for better retention.");

  return recommendations;
}

module.exports = router;
