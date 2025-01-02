const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  task: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  duration: { type: Number, required: true }, // Duration in minutes
});

const scheduleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: [sessionSchema], // Array of sessions
  availableSlots: { type: Array, default: [] }, // Array of available time slots
});

const Schedule = mongoose.model('Schedule', scheduleSchema);

module.exports = Schedule;  // default export
