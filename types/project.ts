interface ProjectMetadata {
  date: string;
  status: 'completed' | 'active' | 'in-progress';
  role: string;
}

interface ProjectLinks {
  github?: string;
  demo?: string;
  live?: string;
  [key: string]: string | undefined;  // Allow for other types of links
}

interface Project {
  id: string;
  order: number;
  title: string;
  shortDescription: string;
  tags: string[];
  thumbnailImage?: string;
  featured: boolean;
  markdownContent: string;
  links: ProjectLinks;
  metadata: ProjectMetadata;
}

export type { Project, ProjectLinks, ProjectMetadata }; 