/**
 * Task Manager Implementation
 * Manages tasks for a project, including creating and updating the TASK.mdc file
 */

const fs = require('fs-extra');
const path = require('path');

/**
 * Task Manager class
 * Manages tasks for a project, including creating and updating the TASK.mdc file
 */
class TaskManager {
  /**
   * Initialize the TaskManager
   * @param {string} projectRoot - Root directory of the project
   */
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.taskFilePath = path.join(projectRoot, 'TASK.mdc');
  }

  /**
   * Create a new TASK.mdc file for the project
   * @param {string} projectName - Name of the project
   * @param {string} projectDescription - Description of the project
   * @param {Array<object>} tasks - List of tasks with their details
   * @param {string} environmentSetup - Environment setup instructions
   * @param {Array<string>} nextSteps - List of next steps
   * @param {string} notes - Additional notes
   * @returns {Promise<string>} - Path to the created TASK.mdc file
   */
  async createTaskFile(projectName, projectDescription, tasks, environmentSetup = '', nextSteps = [], notes = '') {
    // Create template content
    const template = `# ${projectName} - Project Plan

## Project Overview
${projectDescription}

## Environment Setup
\`\`\`bash
${environmentSetup}
\`\`\`

## Implementation Tasks

${this._formatTasks(tasks)}

## Progress Tracking
- Started: ${new Date().toISOString().replace('T', ' ').substring(0, 19)}
- Last Updated: ${new Date().toISOString().replace('T', ' ').substring(0, 19)}
- Status: IN PROGRESS

## Next Steps
${nextSteps.map(step => `- ${step}`).join('\n')}

## Notes
${notes}`;

    // Write to file
    await fs.writeFile(this.taskFilePath, template, 'utf8');
    
    return this.taskFilePath;
  }

  /**
   * Format tasks into markdown format
   * @param {Array<object>} tasks - List of task dictionaries
   * @returns {string} - Formatted tasks string
   */
  _formatTasks(tasks) {
    const result = [];
    
    // Group tasks by priority
    const priorityGroups = {};
    for (const task of tasks) {
      const priority = task.priority || 'MEDIUM';
      if (!priorityGroups[priority]) {
        priorityGroups[priority] = [];
      }
      priorityGroups[priority].push(task);
    }
    
    // Order priorities
    const priorityOrder = ['HIGH', 'MEDIUM', 'LOW'];
    
    for (const priority of priorityOrder) {
      if (priorityGroups[priority]) {
        result.push(`### ${priority} Priority Tasks`);
        for (const task of priorityGroups[priority]) {
          result.push(`- [ ] ${task.title}`);
          if (task.description) {
            result.push(`  - ${task.description}`);
          }
          if (task.subtasks && task.subtasks.length > 0) {
            for (const subtask of task.subtasks) {
              result.push(`  - [ ] ${subtask}`);
            }
          }
        }
        result.push('');
      }
    }
    
    return result.join('\n');
  }

  /**
   * Update the status of a task in the TASK.mdc file
   * @param {string} taskTitle - Title of the task to update
   * @param {boolean} completed - Whether the task is completed
   * @returns {Promise<boolean>} - True if the task was updated, False otherwise
   */
  async updateTaskStatus(taskTitle, completed = true) {
    try {
      if (!await fs.pathExists(this.taskFilePath)) {
        return false;
      }
      
      let content = await fs.readFile(this.taskFilePath, 'utf8');
      
      // Escape special characters in the task title for regex
      const escapedTitle = taskTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Pattern to match the task
      const pattern = new RegExp(`- \\[([ x])\\] ${escapedTitle}`);
      
      // Replace the status
      const newStatus = completed ? 'x' : ' ';
      const newContent = content.replace(pattern, `- [${newStatus}] ${taskTitle}`);
      
      // Update the last updated timestamp
      const currentDate = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const updatedContent = newContent.replace(/Last Updated: .*/, `Last Updated: ${currentDate}`);
      
      // Check if any changes were made
      if (updatedContent === content) {
        return false;
      }
      
      // Write the updated content back to the file
      await fs.writeFile(this.taskFilePath, updatedContent, 'utf8');
      
      return true;
    } catch (error) {
      console.error('Error updating task status:', error);
      return false;
    }
  }

  /**
   * Get the current status of the project from the TASK.mdc file
   * @returns {Promise<object>} - Dictionary with project status information
   */
  async getCurrentStatus() {
    try {
      if (!await fs.pathExists(this.taskFilePath)) {
        return { error: 'TASK.mdc file not found' };
      }
      
      const content = await fs.readFile(this.taskFilePath, 'utf8');
      
      // Extract project name
      const projectNameMatch = content.match(/# (.*) - Project Plan/);
      const projectName = projectNameMatch ? projectNameMatch[1] : 'Unknown';
      
      // Extract tasks and their status
      const tasks = [];
      const taskPattern = /- \[([ x])\] (.*?)(?=\n- \[|$)/g;
      let match;
      
      while ((match = taskPattern.exec(content)) !== null) {
        const status = match[1];
        const title = match[2].trim();
        tasks.push({
          title,
          completed: status === 'x'
        });
      }
      
      // Extract overall status
      const statusMatch = content.match(/Status: (.*)/);
      const status = statusMatch ? statusMatch[1] : 'Unknown';
      
      // Extract last updated
      const lastUpdatedMatch = content.match(/Last Updated: (.*)/);
      const lastUpdated = lastUpdatedMatch ? lastUpdatedMatch[1] : 'Unknown';
      
      return {
        project_name: projectName,
        status,
        last_updated: lastUpdated,
        tasks,
        completed_tasks: tasks.filter(task => task.completed).length,
        total_tasks: tasks.length
      };
    } catch (error) {
      console.error('Error getting project status:', error);
      return { error: `Error getting project status: ${error.message}` };
    }
  }
}

module.exports = {
  TaskManager
};
