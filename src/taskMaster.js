/**
 * Task-Master Core Implementation
 * Core functionality for Task-Master MCP
 */

const fs = require('fs-extra');
const path = require('path');
const { analyzeRequirements } = require('./projectAnalyzer');
const { TaskManager } = require('./taskManager');

/**
 * Initialize a new project with Task-Master
 * @param {string} projectRoot - Root directory of the project
 * @param {string} requirements - Project requirements text
 * @returns {Promise<object>} - Initialization results
 */
async function initializeProject(projectRoot, requirements) {
  try {
    // Analyze project requirements
    const projectInfo = analyzeRequirements(requirements);
    
    // Create task manager for the project
    const taskManager = new TaskManager(projectRoot);
    
    // Create TASK.mdc file
    const taskFilePath = await taskManager.createTaskFile(
      projectInfo.project_name,
      projectInfo.project_description,
      projectInfo.tasks,
      projectInfo.environment_setup,
      ["Review and refine tasks", "Set up development environment", "Begin implementation of high priority tasks"]
    );
    
    return {
      success: true,
      message: `Project initialized with Task-Master. TASK.mdc created at ${taskFilePath}`,
      project_info: projectInfo,
      task_file_path: taskFilePath
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to initialize project: ${error.message}`
    };
  }
}

/**
 * Update the status of a task
 * @param {string} projectRoot - Root directory of the project
 * @param {string} taskTitle - Title of the task to update
 * @param {boolean} completed - Whether the task is completed
 * @returns {Promise<object>} - Update results
 */
async function completeTask(projectRoot, taskTitle, completed = true) {
  try {
    const taskManager = new TaskManager(projectRoot);
    const success = await taskManager.updateTaskStatus(taskTitle, completed);
    
    if (success) {
      return {
        success: true,
        message: `Task '${taskTitle}' marked as ${completed ? 'completed' : 'pending'}`
      };
    } else {
      return {
        success: false,
        message: `Failed to update task '${taskTitle}'. Task not found or TASK.mdc file does not exist.`
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Error updating task: ${error.message}`
    };
  }
}

/**
 * Get the current status of a project
 * @param {string} projectRoot - Root directory of the project
 * @returns {Promise<object>} - Project status
 */
async function getProjectStatus(projectRoot) {
  try {
    const taskManager = new TaskManager(projectRoot);
    const status = await taskManager.getCurrentStatus();
    
    if (status.error) {
      return {
        success: false,
        message: status.error
      };
    }
    
    return {
      success: true,
      status
    };
  } catch (error) {
    return {
      success: false,
      message: `Error getting project status: ${error.message}`
    };
  }
}

/**
 * Resume work on a project
 * @param {string} projectRoot - Root directory of the project
 * @returns {Promise<object>} - Project resumption information
 */
async function resumeProject(projectRoot) {
  try {
    const taskManager = new TaskManager(projectRoot);
    const status = await taskManager.getCurrentStatus();
    
    if (status.error) {
      return {
        success: false,
        message: status.error
      };
    }
    
    // Get incomplete tasks
    const incompleteTasks = status.tasks.filter(task => !task.completed);
    
    // Sort by priority (assuming task titles contain priority indicators)
    const determineTaskPriority = (title) => {
      const titleLower = title.toLowerCase();
      
      if (titleLower.includes('high') || 
          titleLower.includes('critical') || 
          titleLower.includes('important') ||
          titleLower.includes('database') ||
          titleLower.includes('authentication') ||
          titleLower.includes('core') ||
          titleLower.includes('foundation') ||
          titleLower.includes('architecture') ||
          titleLower.includes('security')) {
        return 'HIGH';
      } else if (titleLower.includes('low') || 
                titleLower.includes('optional') || 
                titleLower.includes('if time permits')) {
        return 'LOW';
      } else {
        return 'MEDIUM';
      }
    };
    
    const highPriorityTasks = incompleteTasks.filter(task => 
      determineTaskPriority(task.title) === 'HIGH'
    );
    
    const mediumPriorityTasks = incompleteTasks.filter(task => 
      determineTaskPriority(task.title) === 'MEDIUM'
    );
    
    const lowPriorityTasks = incompleteTasks.filter(task => 
      determineTaskPriority(task.title) === 'LOW'
    );
    
    // Determine next tasks to work on
    let nextTasks = highPriorityTasks.length > 0 ? highPriorityTasks : mediumPriorityTasks;
    if (nextTasks.length === 0) {
      nextTasks = lowPriorityTasks;
    }
    
    return {
      success: true,
      project_name: status.project_name,
      status: status.status,
      progress: `${status.completed_tasks}/${status.total_tasks} tasks completed`,
      next_tasks: nextTasks.slice(0, 3),  // Suggest up to 3 next tasks
      message: "Project resumed successfully"
    };
  } catch (error) {
    return {
      success: false,
      message: `Error resuming project: ${error.message}`
    };
  }
}

module.exports = {
  initializeProject,
  completeTask,
  getProjectStatus,
  resumeProject
};
