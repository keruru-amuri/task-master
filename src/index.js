/**
 * Task-Master MCP
 * Main entry point for Task-Master MCP
 */

const { startServer } = require('./server');
const { initializeProject, completeTask, getProjectStatus, resumeProject } = require('./taskMaster');

// If this file is run directly, start the server
if (require.main === module) {
  const port = process.env.PORT || 3000;
  startServer(port);
}

module.exports = {
  startServer,
  initializeProject,
  completeTask,
  getProjectStatus,
  resumeProject
};
