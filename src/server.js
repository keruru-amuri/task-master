/**
 * Task-Master MCP Server
 * Express server for Task-Master MCP
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const { initializeProject, completeTask, getProjectStatus, resumeProject } = require('./taskMaster');

/**
 * Start the Task-Master MCP server
 * @param {number} port - Port to run the server on
 */
function startServer(port = 3000) {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(bodyParser.json());
  app.use(morgan('dev'));

  // Routes
  app.get('/', (req, res) => {
    res.json({
      name: 'Task-Master MCP',
      version: require('../package.json').version,
      description: 'Project Planning and Task Management System for Augment Code'
    });
  });

  // Initialize a new project
  app.post('/api/projects', async (req, res) => {
    try {
      const { projectRoot, requirements } = req.body;

      if (!projectRoot || !requirements) {
        return res.status(400).json({
          success: false,
          message: 'Project root and requirements are required'
        });
      }

      const result = await initializeProject(projectRoot, requirements);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `Error initializing project: ${error.message}`
      });
    }
  });

  // Complete a task
  app.post('/api/tasks/complete', async (req, res) => {
    try {
      const { projectRoot, taskTitle } = req.body;

      if (!projectRoot || !taskTitle) {
        return res.status(400).json({
          success: false,
          message: 'Project root and task title are required'
        });
      }

      const result = await completeTask(projectRoot, taskTitle);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `Error completing task: ${error.message}`
      });
    }
  });

  // Get project status
  app.get('/api/projects/status', async (req, res) => {
    try {
      const { projectRoot } = req.query;

      if (!projectRoot) {
        return res.status(400).json({
          success: false,
          message: 'Project root is required'
        });
      }

      const result = await getProjectStatus(projectRoot);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `Error getting project status: ${error.message}`
      });
    }
  });

  // Resume a project
  app.get('/api/projects/resume', async (req, res) => {
    try {
      const { projectRoot } = req.query;

      if (!projectRoot) {
        return res.status(400).json({
          success: false,
          message: 'Project root is required'
        });
      }

      const result = await resumeProject(projectRoot);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `Error resuming project: ${error.message}`
      });
    }
  });

  // Start the server
  app.listen(port, () => {
    console.log(`Task-Master MCP server running on port ${port}`);
    console.log(`API available at http://localhost:${port}/api`);
  });
}

module.exports = {
  startServer
};
