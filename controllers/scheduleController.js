// Import necessary modules
const express = require("express");
const { google } = require("googleapis"); // For Google Calendar integration
const nodemailer = require("nodemailer"); // For email notifications

// Mock database or models (replace with real models in production)
const User = require("../models/User");
const Schedule = require("../models/Schedule");

// Helper functions
const analyzePreferences = require("../utils/analyzePrefences");
const findAvailableSlots = require("../utils/findAvailableSlots");

const generateSchedule = async (req, res) => {
  try {
    const { userId } = req.params;
    const { preferences, academicWorkload, calendar } = req.body; // Get preferences and calendar data from the request body

    // Fetch the user to validate their existence
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Analyze preferences, workload, and deadlines
    const schedulePlan = analyzePreferences(preferences, academicWorkload);

    // Find available time slots based on user calendar
    const availableSlots = findAvailableSlots(calendar, schedulePlan);

    // Create and save the schedule
    const newSchedule = new Schedule({
      userId,
      plan: schedulePlan,
      availableSlots,
    });

    await newSchedule.save();
    res.status(201).json({ message: "Schedule generated successfully", schedule: newSchedule });
  } catch (error) {
    console.error("Error generating schedule:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const syncCalendar = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user || !user.googleRefreshToken) {
      return res.status(400).json({ error: "User not connected to a calendar" });
    }

    const auth = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    auth.setCredentials({ refresh_token: user.googleRefreshToken });

    // Automatically refresh the access token
    const { token } = await auth.getAccessToken();

    const calendar = google.calendar({ version: "v3", auth });

    const schedule = await Schedule.findOne({ userId });
    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    for (const session of schedule.plan) {
      await calendar.events.insert({
        calendarId: "primary",
        resource: {
          summary: "Study Session",
          description: session.task,
          start: { dateTime: session.startTime },
          end: { dateTime: session.endTime },
        },
      });
    }

    res.status(200).json({ message: "Schedule synced with Google Calendar" });
  } catch (error) {
    console.error("Error syncing calendar:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const sendReminders = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const schedule = await Schedule.findOne({ userId });
    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    const now = new Date();
    const upcomingSessions = schedule.plan.filter(session => new Date(session.startTime) > now);

    for (const session of upcomingSessions) {
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: user.email,
        subject: "Study Session Reminder",
        text: `You have an upcoming study session at ${session.startTime}. Focus on: ${session.task}`,
      });
    }

    res.status(200).json({ message: "Reminders sent successfully" });
  } catch (error) {
    console.error("Error sending reminders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const rescheduleSession = async (req, res) => {
  try {
    const { userId, sessionId } = req.params;
    const { newTime } = req.body;

    const schedule = await Schedule.findOne({ userId });
    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    const session = schedule.plan.find(s => s.id === sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    session.startTime = newTime;
    session.endTime = new Date(new Date(newTime).getTime() + session.duration * 60000).toISOString();

    await schedule.save();
    res.status(200).json({ message: "Session rescheduled successfully", schedule });
  } catch (error) {
    console.error("Error rescheduling session:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getScheduleSummary = async (req, res) => {
  try {
    const { userId } = req.params;
    const schedule = await Schedule.findOne({ userId });

    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const dailyPlan = schedule.plan.filter(session => session.startTime.startsWith(today));
    const weeklyPlan = schedule.plan.filter(session => session.startTime <= weekLater);

    res.status(200).json({ dailyPlan, weeklyPlan });
  } catch (error) {
    console.error("Error retrieving schedule summary:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  generateSchedule,
  syncCalendar,
  sendReminders,
  rescheduleSession,
  getScheduleSummary,
};
