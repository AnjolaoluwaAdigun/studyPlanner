const findAvailableSlots = (calendar, schedulePlan) => {
    const availableSlots = [];
  
    calendar.forEach((event) => {
      // Assuming the calendar is sorted by time
      const lastEnd = availableSlots.length
        ? new Date(availableSlots[availableSlots.length - 1].endTime)
        : new Date(event.startTime);
      const start = new Date(event.endTime);
  
      if (start > lastEnd) {
        availableSlots.push({ startTime: lastEnd.toISOString(), endTime: start.toISOString() });
      }
    });
  
    // Subtract schedulePlan from available slots
    schedulePlan.forEach((session) => {
      const index = availableSlots.findIndex(
        (slot) => new Date(slot.startTime) <= new Date(session.startTime)
      );
      if (index > -1) {
        availableSlots.splice(index, 1);
      }
    });
  
    return availableSlots;
  };
  
  module.exports = findAvailableSlots;
  