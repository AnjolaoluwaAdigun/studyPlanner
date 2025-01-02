const express = require("express");
const {
  generateSchedule,
  syncCalendar,
  sendReminders,
  rescheduleSession,
  getScheduleSummary,
} = require("../controllers/scheduleController");

const router = express.Router();

// Route to generate a personalized study schedule
router.post("/:userId/generate", generateSchedule);

// Route to sync the schedule with Google Calendar
router.post("/:userId/sync-calendar", syncCalendar);

// Route to send reminders for upcoming study sessions
router.post("/:userId/send-reminders", sendReminders);

// Route to reschedule a session
router.put("/:userId/sessions/:sessionId/reschedule", rescheduleSession);

// Route to get a summary of daily/weekly study plans
router.get("/:userId/summary", getScheduleSummary);

module.exports = router;
