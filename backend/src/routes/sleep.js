const express = require('express');
const { body, validationResult } = require('express-validator');
const SleepSchedule = require('../models/SleepSchedule');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/sleep/schedule
// @desc    Add or update sleep schedule
// @access  Private
router.post('/schedule', auth, [
  body('date').isISO8601().withMessage('Valid date is required'),
  body('bedtime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid bedtime format (HH:MM)'),
  body('wakeTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid wake time format (HH:MM)'),
  body('quality').optional().isInt({ min: 1, max: 10 }).withMessage('Quality must be between 1-10')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { date, bedtime, wakeTime, quality, factors, notes } = req.body;
    const studentId = req.student.studentId;

    // Check if schedule exists for this date
    let schedule = await SleepSchedule.findOne({ 
      studentId, 
      date: new Date(date).toISOString().split('T')[0] 
    });

    if (schedule) {
      // Update existing schedule
      schedule.bedtime = bedtime;
      schedule.wakeTime = wakeTime;
      schedule.quality = quality || schedule.quality;
      schedule.factors = factors || schedule.factors;
      schedule.notes = notes || schedule.notes;
      await schedule.save();
    } else {
      // Create new schedule
      schedule = new SleepSchedule({
        studentId,
        date: new Date(date),
        bedtime,
        wakeTime,
        quality: quality || 5,
        factors: factors || [],
        notes: notes || ''
      });
      await schedule.save();
    }

    res.json(schedule);
  } catch (error) {
    console.error('Sleep schedule error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/sleep/schedules
// @desc    Get sleep schedules for a student
// @access  Private
router.get('/schedules', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    const studentId = req.student.studentId;

    // Build filter
    const filter = { studentId };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const schedules = await SleepSchedule.find(filter)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await SleepSchedule.countDocuments(filter);

    res.json({
      schedules,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get sleep schedules error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/sleep/analytics
// @desc    Get sleep analytics and recommendations
// @access  Private
router.get('/analytics', auth, async (req, res) => {
  try {
    const studentId = req.student.studentId;
    const { period = '30' } = req.query; // Default to last 30 days

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    const schedules = await SleepSchedule.find({
      studentId,
      date: { $gte: daysAgo }
    }).sort({ date: 1 });

    if (schedules.length === 0) {
      return res.json({
        message: 'No sleep data found',
        analytics: null
      });
    }

    // Calculate analytics
    const totalDays = schedules.length;
    const avgSleepDuration = schedules.reduce((sum, schedule) => sum + (schedule.duration || 0), 0) / totalDays;
    const avgSleepQuality = schedules.reduce((sum, schedule) => sum + (schedule.quality || 0), 0) / totalDays;

    // Sleep pattern analysis
    const sleepPatterns = {
      earlyBedtime: 0,    // Before 10 PM
      normalBedtime: 0,   // 10 PM - 12 AM
      lateBedtime: 0,     // After 12 AM
      earlyWake: 0,       // Before 6 AM
      normalWake: 0,      // 6 AM - 8 AM
      lateWake: 0         // After 8 AM
    };

    schedules.forEach(schedule => {
      const bedHour = parseInt(schedule.bedtime.split(':')[0]);
      const wakeHour = parseInt(schedule.wakeTime.split(':')[0]);

      if (bedHour < 22) sleepPatterns.earlyBedtime++;
      else if (bedHour <= 24) sleepPatterns.normalBedtime++;
      else sleepPatterns.lateBedtime++;

      if (wakeHour < 6) sleepPatterns.earlyWake++;
      else if (wakeHour <= 8) sleepPatterns.normalWake++;
      else sleepPatterns.lateWake++;
    });

    // Sleep quality trends
    const qualityTrends = schedules.map(schedule => ({
      date: schedule.date.toISOString().split('T')[0],
      duration: schedule.duration || 0,
      quality: schedule.quality || 0
    }));

    // Common factors affecting sleep
    const factorAnalysis = {};
    schedules.forEach(schedule => {
      if (schedule.factors && schedule.factors.length > 0) {
        schedule.factors.forEach(factor => {
          factorAnalysis[factor] = (factorAnalysis[factor] || 0) + 1;
        });
      }
    });

    // Sleep consistency score
    const consistencyScore = calculateSleepConsistency(schedules);

    // Recommendations
    const recommendations = generateSleepRecommendations(avgSleepDuration, avgSleepQuality, sleepPatterns, consistencyScore);

    res.json({
      summary: {
        totalDays,
        avgSleepDuration: Math.round(avgSleepDuration * 100) / 100,
        avgSleepQuality: Math.round(avgSleepQuality * 10) / 10,
        consistencyScore: Math.round(consistencyScore),
        sleepGoal: 8.0 // Recommended sleep for college students
      },
      sleepPatterns,
      qualityTrends,
      factorAnalysis,
      recommendations
    });
  } catch (error) {
    console.error('Sleep analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/sleep/recommendations
// @desc    Get personalized sleep recommendations
// @access  Private
router.get('/recommendations', auth, async (req, res) => {
  try {
    const studentId = req.student.studentId;

    // Get recent sleep data
    const recentSchedules = await SleepSchedule.find({
      studentId,
      date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    });

    const generalRecommendations = [
      "Maintain a consistent sleep schedule, even on weekends",
      "Avoid screens 1 hour before bedtime",
      "Keep your bedroom dark, quiet, and cool",
      "Avoid caffeine and heavy meals close to bedtime",
      "Exercise regularly but not close to bedtime",
      "Develop a relaxing bedtime routine"
    ];

    const personalizedRecommendations = [];

    if (recentSchedules.length > 0) {
      const avgDuration = recentSchedules.reduce((sum, s) => sum + (s.duration || 0), 0) / recentSchedules.length;
      const avgQuality = recentSchedules.reduce((sum, s) => sum + (s.quality || 0), 0) / recentSchedules.length;

      if (avgDuration < 7) {
        personalizedRecommendations.push("You're averaging less than 7 hours of sleep. Try to sleep earlier for better academic performance.");
      } else if (avgDuration > 9) {
        personalizedRecommendations.push("You're sleeping more than 9 hours. Ensure this doesn't affect your morning study schedule.");
      }

      if (avgQuality < 6) {
        personalizedRecommendations.push("Your sleep quality is below average. Consider meditation or relaxation techniques before bed.");
      }

      // Check bedtime consistency
      const bedtimes = recentSchedules.map(s => parseInt(s.bedtime.split(':')[0]));
      const bedtimeVariance = Math.max(...bedtimes) - Math.min(...bedtimes);
      
      if (bedtimeVariance > 2) {
        personalizedRecommendations.push("Your bedtime varies significantly. Try to maintain a more consistent schedule.");
      }
    } else {
      personalizedRecommendations.push("Start tracking your sleep to get personalized recommendations.");
    }

    res.json({
      general: generalRecommendations,
      personalized: personalizedRecommendations,
      tips: [
        "Power naps (20-30 minutes) can improve alertness",
        "Blue light filters on devices can help with sleep",
        "Reading before bed can be more relaxing than screen time",
        "Avoid studying in bed to maintain sleep association"
      ]
    });
  } catch (error) {
    console.error('Sleep recommendations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to calculate sleep consistency
function calculateSleepConsistency(schedules) {
  if (schedules.length < 2) return 100;

  const bedtimes = schedules.map(s => {
    const [hour, min] = s.bedtime.split(':').map(Number);
    return hour * 60 + min;
  });

  const wakeTimes = schedules.map(s => {
    const [hour, min] = s.wakeTime.split(':').map(Number);
    return hour * 60 + min;
  });

  const avgBedtime = bedtimes.reduce((sum, time) => sum + time, 0) / bedtimes.length;
  const avgWakeTime = wakeTimes.reduce((sum, time) => sum + time, 0) / wakeTimes.length;

  const bedtimeVariance = bedtimes.reduce((sum, time) => sum + Math.abs(time - avgBedtime), 0) / bedtimes.length;
  const wakeTimeVariance = wakeTimes.reduce((sum, time) => sum + Math.abs(time - avgWakeTime), 0) / wakeTimes.length;

  const consistencyScore = Math.max(0, 100 - (bedtimeVariance + wakeTimeVariance) / 2);
  return Math.round(consistencyScore);
}

// Helper function to generate sleep recommendations
function generateSleepRecommendations(avgDuration, avgQuality, patterns, consistencyScore) {
  const recommendations = [];

  if (avgDuration < 6) {
    recommendations.push("Critical: You're getting less than 6 hours of sleep. This will significantly impact your academic performance.");
  } else if (avgDuration < 7) {
    recommendations.push("Warning: You're getting less than recommended 7-9 hours of sleep.");
  } else if (avgDuration > 9) {
    recommendations.push("You're oversleeping. This might indicate poor sleep quality or other issues.");
  } else {
    recommendations.push("Good: Your sleep duration is within the recommended range.");
  }

  if (avgQuality < 5) {
    recommendations.push("Poor sleep quality detected. Focus on improving your sleep environment and routine.");
  }

  if (patterns.lateBedtime > patterns.normalBedtime + patterns.earlyBedtime) {
    recommendations.push("You frequently go to bed late. Try to establish an earlier bedtime routine.");
  }

  if (consistencyScore < 70) {
    recommendations.push("Your sleep schedule is inconsistent. Regular sleep times improve both sleep quality and daytime alertness.");
  }

  recommendations.push("Good sleep is essential for memory consolidation and learning efficiency.");
  recommendations.push("Consider your study schedule when planning your bedtime to ensure adequate rest.");

  return recommendations;
}

module.exports = router;
