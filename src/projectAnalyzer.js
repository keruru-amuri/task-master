/**
 * Project Analyzer Implementation
 * Analyzes project requirements and generates tasks
 */

/**
 * Analyze project requirements and extract key information
 * @param {string} requirements - Project requirements text
 * @returns {object} - Dictionary with extracted project information
 */
function analyzeRequirements(requirements) {
  // Extract project name
  const projectNameMatch = requirements.match(/Project Name:?\s*(.*?)(?:\n|$)/i);
  const projectName = projectNameMatch ? projectNameMatch[1].trim() : 'New Project';
  
  // Extract project description
  const projectDescMatch = requirements.match(/Project Description:?\s*(.*?)(?:\n\n|\n#|\n\*\*|$)/is);
  const projectDescription = projectDescMatch ? projectDescMatch[1].trim() : '';
  
  // Extract environment setup if available
  const envSetupMatch = requirements.match(/Environment Setup:?\s*(.*?)(?:\n\n|\n#|\n\*\*|$)/is);
  const environmentSetup = envSetupMatch ? envSetupMatch[1].trim() : '';
  
  // Generate tasks based on requirements
  const tasks = generateTasks(requirements);
  
  return {
    project_name: projectName,
    project_description: projectDescription,
    environment_setup: environmentSetup,
    tasks
  };
}

/**
 * Generate tasks based on project requirements
 * @param {string} requirements - Project requirements text
 * @returns {Array<object>} - List of task dictionaries
 */
function generateTasks(requirements) {
  const tasks = [];
  
  // Look for explicit task lists
  const taskSectionMatch = requirements.match(/Tasks:?\s*(.*?)(?:\n\n|\n#|\n\*\*|$)/is);
  
  if (taskSectionMatch) {
    const taskSection = taskSectionMatch[1];
    // Extract tasks from bullet points or numbered lists
    const taskMatches = taskSection.matchAll(/(?:[-*]|\d+\.)\s*(.*?)(?:\n|$)/g);
    
    for (const match of taskMatches) {
      const taskTitle = match[1].trim();
      if (taskTitle) {
        // Try to determine priority based on keywords
        const priority = determineTaskPriority(taskTitle);
        
        tasks.push({
          title: taskTitle,
          priority,
          description: ''
        });
      }
    }
  }
  
  // If no explicit tasks found, try to infer from requirements
  if (tasks.length === 0) {
    // Look for sections that might indicate tasks
    const sectionMatches = requirements.matchAll(/#+\s*(.*?)(?:\n|$)/g);
    
    for (const match of sectionMatches) {
      const sectionTitle = match[1].trim();
      if (!['project name', 'project description', 'environment setup', 'tasks'].includes(sectionTitle.toLowerCase())) {
        // This might be a task or category
        const priority = determineTaskPriority(sectionTitle);
        
        tasks.push({
          title: `Implement ${sectionTitle}`,
          priority,
          description: `Based on the ${sectionTitle} section in requirements`
        });
      }
    }
  }
  
  // If still no tasks, create generic tasks based on project type inference
  if (tasks.length === 0) {
    const projectType = inferProjectType(requirements);
    return getDefaultTasks(projectType);
  }
  
  return tasks;
}

/**
 * Determine task priority based on text analysis
 * @param {string} text - Text to analyze
 * @returns {string} - Priority level (HIGH, MEDIUM, LOW)
 */
function determineTaskPriority(text) {
  const textLower = text.toLowerCase();
  
  // Check for explicit priority indicators
  if (textLower.includes('urgent') || 
      textLower.includes('critical') || 
      textLower.includes('important') || 
      textLower.includes('high priority')) {
    return 'HIGH';
  } else if (textLower.includes('low priority') || 
             textLower.includes('optional') || 
             textLower.includes('if time permits')) {
    return 'LOW';
  }
  
  // Check for architectural or foundational components
  if (textLower.includes('database') || 
      textLower.includes('authentication') || 
      textLower.includes('core') || 
      textLower.includes('foundation') || 
      textLower.includes('architecture') || 
      textLower.includes('security')) {
    return 'HIGH';
  }
  
  // Check for UI/UX or non-critical features
  if (textLower.includes('ui') || 
      textLower.includes('ux') || 
      textLower.includes('design') || 
      textLower.includes('style') || 
      textLower.includes('appearance') || 
      textLower.includes('documentation')) {
    return 'MEDIUM';
  }
  
  // Default priority
  return 'MEDIUM';
}

/**
 * Infer the type of project from requirements
 * @param {string} requirements - Project requirements text
 * @returns {string} - Inferred project type
 */
function inferProjectType(requirements) {
  const requirementsLower = requirements.toLowerCase();
  
  if (requirementsLower.includes('web') || 
      requirementsLower.includes('website') || 
      requirementsLower.includes('frontend') || 
      requirementsLower.includes('backend') || 
      requirementsLower.includes('fullstack') || 
      requirementsLower.includes('html') || 
      requirementsLower.includes('css') || 
      requirementsLower.includes('javascript')) {
    return 'web';
  } else if (requirementsLower.includes('mobile') || 
             requirementsLower.includes('app') || 
             requirementsLower.includes('ios') || 
             requirementsLower.includes('android') || 
             requirementsLower.includes('flutter') || 
             requirementsLower.includes('react native')) {
    return 'mobile';
  } else if (requirementsLower.includes('api') || 
             requirementsLower.includes('rest') || 
             requirementsLower.includes('graphql') || 
             requirementsLower.includes('microservice')) {
    return 'api';
  } else if (requirementsLower.includes('data') || 
             requirementsLower.includes('analysis') || 
             requirementsLower.includes('analytics') || 
             requirementsLower.includes('machine learning') || 
             requirementsLower.includes('ml') || 
             requirementsLower.includes('ai')) {
    return 'data';
  } else {
    return 'generic';
  }
}

/**
 * Get default tasks based on project type
 * @param {string} projectType - Type of project
 * @returns {Array<object>} - List of default tasks
 */
function getDefaultTasks(projectType) {
  if (projectType === 'web') {
    return [
      { title: 'Setup project structure', priority: 'HIGH', description: 'Initialize the web project structure and configuration files' },
      { title: 'Implement database models', priority: 'HIGH', description: 'Design and implement database schema and models' },
      { title: 'Create authentication system', priority: 'HIGH', description: 'Implement user authentication and authorization' },
      { title: 'Develop API endpoints', priority: 'MEDIUM', description: 'Create backend API endpoints for data access' },
      { title: 'Build frontend UI', priority: 'MEDIUM', description: 'Develop the user interface components' },
      { title: 'Implement business logic', priority: 'MEDIUM', description: 'Develop core business logic and functionality' },
      { title: 'Write tests', priority: 'MEDIUM', description: 'Create unit and integration tests' },
      { title: 'Setup deployment pipeline', priority: 'LOW', description: 'Configure CI/CD and deployment process' }
    ];
  } else if (projectType === 'mobile') {
    return [
      { title: 'Setup project structure', priority: 'HIGH', description: 'Initialize the mobile app project structure' },
      { title: 'Design app architecture', priority: 'HIGH', description: 'Define the app architecture and navigation flow' },
      { title: 'Implement authentication', priority: 'HIGH', description: 'Create user authentication and session management' },
      { title: 'Develop core screens', priority: 'MEDIUM', description: 'Build the main screens and functionality' },
      { title: 'Implement API integration', priority: 'MEDIUM', description: 'Connect to backend services and APIs' },
      { title: 'Add offline support', priority: 'LOW', description: 'Implement data caching and offline functionality' },
      { title: 'Write tests', priority: 'MEDIUM', description: 'Create unit and UI tests' },
      { title: 'Prepare for app store submission', priority: 'LOW', description: 'Configure app for distribution' }
    ];
  } else if (projectType === 'api') {
    return [
      { title: 'Define API specifications', priority: 'HIGH', description: 'Create OpenAPI/Swagger specifications' },
      { title: 'Setup project structure', priority: 'HIGH', description: 'Initialize the API project structure' },
      { title: 'Implement database models', priority: 'HIGH', description: 'Design and implement data models' },
      { title: 'Create authentication middleware', priority: 'HIGH', description: 'Implement API authentication and authorization' },
      { title: 'Develop API endpoints', priority: 'MEDIUM', description: 'Implement the API endpoints and controllers' },
      { title: 'Add validation and error handling', priority: 'MEDIUM', description: 'Implement input validation and error responses' },
      { title: 'Write tests', priority: 'MEDIUM', description: 'Create unit and integration tests' },
      { title: 'Setup monitoring and logging', priority: 'LOW', description: 'Configure API monitoring and logging' }
    ];
  } else if (projectType === 'data') {
    return [
      { title: 'Setup data processing environment', priority: 'HIGH', description: 'Configure data processing tools and libraries' },
      { title: 'Implement data collection', priority: 'HIGH', description: 'Create data collection and ingestion processes' },
      { title: 'Develop data cleaning pipeline', priority: 'HIGH', description: 'Implement data cleaning and preprocessing' },
      { title: 'Create data models', priority: 'MEDIUM', description: 'Develop analytical or machine learning models' },
      { title: 'Implement data visualization', priority: 'MEDIUM', description: 'Create visualizations and dashboards' },
      { title: 'Setup data storage', priority: 'MEDIUM', description: 'Configure databases or data warehouses' },
      { title: 'Write tests', priority: 'MEDIUM', description: 'Create unit tests for data processing' },
      { title: 'Document data dictionary', priority: 'LOW', description: 'Create documentation for data schemas and models' }
    ];
  } else {  // generic
    return [
      { title: 'Setup project structure', priority: 'HIGH', description: 'Initialize the project structure and configuration' },
      { title: 'Define core requirements', priority: 'HIGH', description: 'Clarify and document detailed requirements' },
      { title: 'Implement core functionality', priority: 'HIGH', description: 'Develop the main functionality of the project' },
      { title: 'Create documentation', priority: 'MEDIUM', description: 'Write user and developer documentation' },
      { title: 'Implement testing', priority: 'MEDIUM', description: 'Create tests for the project' },
      { title: 'Setup deployment process', priority: 'LOW', description: 'Configure deployment and distribution' }
    ];
  }
}

module.exports = {
  analyzeRequirements,
  determineTaskPriority,
  inferProjectType,
  getDefaultTasks
};
