import { promises as fs } from 'fs';
import path from 'path';
import type { Project } from '../types/project';

// Use a more reliable path resolution for Next.js
const PROJECTS_DIRECTORY = path.join(process.cwd(), 'data', 'projects');

/**
 * Load all project data and sort by order
 */
export async function getAllProjects(): Promise<Project[]> {
  try {
    // Read all files from the projects directory
    const fileNames = await fs.readdir(PROJECTS_DIRECTORY);
    console.log('Found project files:', fileNames);
    
    const jsonFiles = fileNames.filter(file => file.endsWith('.json'));
    console.log('JSON files:', jsonFiles);
    
    // Load and parse each project file
    const projects = await Promise.all(
      jsonFiles.map(async (filename) => {
        const filePath = path.join(PROJECTS_DIRECTORY, filename);
        console.log('Loading project file:', filePath);
        const fileContent = await fs.readFile(filePath, 'utf8');
        const project = JSON.parse(fileContent) as Project;
        console.log('Loaded project:', project.id);
        return project;
      })
    );
    
    // Sort projects by order
    const sortedProjects = projects.sort((a, b) => a.order - b.order);
    console.log('Sorted projects:', sortedProjects.map(p => p.id));
    return sortedProjects;
  } catch (error) {
    console.error('Error loading projects:', error);
    return [];
  }
}

/**
 * Get featured projects only
 */
export async function getFeaturedProjects(): Promise<Project[]> {
  const allProjects = await getAllProjects();
  return allProjects.filter(project => project.featured);
}

/**
 * Get a specific project by ID
 */
export async function getProjectById(id: string): Promise<Project | null> {
  try {
    const filePath = path.join(PROJECTS_DIRECTORY, `${id}.json`);
    const fileContent = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContent) as Project;
  } catch (error) {
    console.error(`Error loading project ${id}:`, error);
    return null;
  }
}

/**
 * Get projects by tag
 */
export async function getProjectsByTag(tag: string): Promise<Project[]> {
  const allProjects = await getAllProjects();
  return allProjects.filter(project => 
    project.tags.some(projectTag => 
      projectTag.toLowerCase() === tag.toLowerCase()
    )
  );
} 