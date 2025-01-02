const analyzePreferences = (preferences, academicWorkload) => {
    const plan = [];
    academicWorkload.forEach((task) => {
      const taskName = task.name || task.task; // Support both `task.name` and `task.task`
      
      if (!taskName) {
        console.error("Missing task name:", task);
        return;
      }
  
      const duration = preferences.studyDuration || 60; // Default to 1 hour/session
      const dueDate = new Date(task.deadline);
      if (isNaN(dueDate.getTime())) {
        console.error(`Invalid or missing deadline for task:`, task);
        return;
      }
  
      const session = {
        task: taskName,
        startTime: new Date(dueDate.getTime() - duration * 60000).toISOString(),
        endTime: dueDate.toISOString(),
        duration,
      };
      plan.push(session);
    });
  
    return plan;
  };
  module.exports=analyzePreferences;