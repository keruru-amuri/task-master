# Task-Master MCP

Task-Master MCP is a Master Control Program for Augment Code that provides project planning and task management capabilities. It generates and manages project plans in a standardized format (TASK.mdc), tracks task progress, and helps resume work on projects efficiently.

## Installation

```bash
# Install globally
npm install -g @keruru-amuri/task-master

# Or run directly with npx
npx -y @keruru-amuri/task-master
```

## Usage

### Command Line Interface

Task-Master MCP provides a command-line interface for managing projects:

```bash
# Start the MCP server
task-master start

# Initialize a new project
task-master init --name "My Project" --description "A description of my project"

# Initialize a project from a requirements file
task-master init --requirements requirements.txt

# Mark a task as completed
task-master complete "Setup project structure"

# Get project status
task-master status
```

### API Server

Task-Master MCP also provides an API server that can be used by Augment Code:

```bash
# Start the API server
task-master start --port 3000
```

The API server provides the following endpoints:

- `POST /api/projects` - Initialize a new project
- `POST /api/tasks/complete` - Mark a task as completed
- `GET /api/projects/status` - Get project status
- `GET /api/projects/resume` - Resume a project

### Integration with Augment Code

To integrate Task-Master MCP with Augment Code, add it to your MCP list in the settings:

```
npx -y @keruru-amuri/task-master
```

## Features

- **Project Initialization**: Automatically generate a structured project plan based on requirements
- **Task Management**: Track task status, add new tasks, and update existing ones
- **Progress Tracking**: Monitor project progress and task completion
- **Project Resumption**: Easily resume work on a project by identifying the next tasks to tackle
- **Markdown-based**: Uses a simple TASK.mdc file format that's both human and machine-readable

## TASK.mdc File Format

The TASK.mdc file uses a simple markdown format:

```markdown
# Project Name - Project Plan

## Project Overview
Project description goes here

## Environment Setup
```bash
# Setup instructions
```

## Implementation Tasks

### HIGH Priority Tasks
- [ ] Task 1
  - Description of task 1
  - [ ] Subtask 1.1
  - [ ] Subtask 1.2

### MEDIUM Priority Tasks
- [ ] Task 2
  - Description of task 2

### LOW Priority Tasks
- [ ] Task 3
  - Description of task 3

## Progress Tracking
- Started: 2023-01-01 12:00:00
- Last Updated: 2023-01-02 15:30:00
- Status: IN PROGRESS

## Next Steps
- Next step 1
- Next step 2

## Notes
Additional notes go here
```

## License

MIT
