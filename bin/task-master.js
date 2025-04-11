#!/usr/bin/env node

/**
 * Task-Master MCP CLI
 * Command-line interface for Task-Master MCP
 */

const { program } = require('commander');
const path = require('path');
const fs = require('fs-extra');
const { startServer } = require('../src/server');
const { version } = require('../package.json');
const { initializeProject, completeTask, getProjectStatus } = require('../src/taskMaster');

// Set up the CLI program
program
  .name('task-master')
  .description('Task-Master MCP - Project Planning and Task Management System for Augment Code')
  .version(version);

// Start the MCP server
program
  .command('start')
  .description('Start the Task-Master MCP server')
  .option('-p, --port <port>', 'Port to run the server on', '3000')
  .action((options) => {
    console.log(`Starting Task-Master MCP server on port ${options.port}...`);
    startServer(options.port);
  });

// Initialize a new project
program
  .command('init')
  .description('Initialize a new project with Task-Master')
  .option('-n, --name <name>', 'Project name')
  .option('-d, --description <description>', 'Project description')
  .option('-r, --requirements <file>', 'Path to requirements file')
  .action(async (options) => {
    try {
      const projectRoot = process.cwd();
      let requirements = '';

      if (options.name) {
        requirements += `Project Name: ${options.name}\n\n`;
      }

      if (options.description) {
        requirements += `Project Description:\n${options.description}\n\n`;
      }

      if (options.requirements) {
        const reqPath = path.resolve(options.requirements);
        if (fs.existsSync(reqPath)) {
          const reqContent = await fs.readFile(reqPath, 'utf8');
          requirements += reqContent;
        } else {
          console.error(`Requirements file not found: ${reqPath}`);
          process.exit(1);
        }
      }

      if (!requirements) {
        console.error('No project requirements provided. Use --name, --description, or --requirements options.');
        process.exit(1);
      }

      const result = await initializeProject(projectRoot, requirements);
      console.log(`Project initialized: ${result.message}`);
    } catch (error) {
      console.error('Error initializing project:', error.message);
      process.exit(1);
    }
  });

// Complete a task
program
  .command('complete <task>')
  .description('Mark a task as completed')
  .action(async (task) => {
    try {
      const projectRoot = process.cwd();
      const result = await completeTask(projectRoot, task);
      console.log(result.message);
    } catch (error) {
      console.error('Error completing task:', error.message);
      process.exit(1);
    }
  });

// Get project status
program
  .command('status')
  .description('Get the current status of the project')
  .action(async () => {
    try {
      const projectRoot = process.cwd();
      const result = await getProjectStatus(projectRoot);

      if (result.success) {
        const status = result.status;
        console.log(`Project: ${status.project_name}`);
        console.log(`Status: ${status.status}`);
        console.log(`Progress: ${status.completed_tasks}/${status.total_tasks} tasks completed`);
        console.log('\nTasks:');

        status.tasks.forEach(task => {
          const statusMark = task.completed ? '✓' : '☐';
          console.log(`${statusMark} ${task.title}`);
        });
      } else {
        console.error(result.message);
        process.exit(1);
      }
    } catch (error) {
      console.error('Error getting project status:', error.message);
      process.exit(1);
    }
  });

// Check if running with npx
const isNpx = process.env.npm_execpath && process.env.npm_execpath.includes('npx');

// If running with npx and no arguments provided, start the server
if (isNpx && process.argv.length <= 2) {
  console.log('Running Task-Master MCP server with npx...');
  const port = process.env.PORT || 3000;
  console.log(`Starting Task-Master MCP server on port ${port}...`);
  startServer(port);
} else {
  // Parse command line arguments
  program.parse(process.argv);

  // If no arguments provided and not running with npx, show help
  if (process.argv.length <= 2 && !isNpx) {
    program.help();
  }
}
