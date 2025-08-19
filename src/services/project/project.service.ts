/**
 * Project Service
 * Handles all project-related business logic
 */

import { BaseService } from '../base.service';
import { Prisma } from '@prisma/client';

export class ProjectService extends BaseService {
  /**
   * Get all projects with optional filters
   */
  async getProjects(options?: {
    includeContacts?: boolean;
    includeTasks?: boolean;
    status?: string;
  }) {
    try {
      this.log('Getting projects', options);
      
      const include: Prisma.ProjectInclude = {};
      
      if (options?.includeContacts) {
        include.contacts = true;
      }
      
      if (options?.includeTasks) {
        include.tasks = {
          where: { completedAt: null }, // Fixed: using completedAt instead of completed
          orderBy: { dueDate: 'asc' },
          take: 5
        };
      }
      
      const where: Prisma.ProjectWhereInput = {};
      
      // Fixed: Handle status as enum
      if (options?.status) {
        where.status = options.status as any; // We'll cast for now
      }
      
      return await this.prisma.project.findMany({
        where,
        include,
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      this.handleError(error, 'getProjects');
    }
  }
  
  /**
   * Get single project by ID
   */
  async getProjectById(id: string) {
    try {
      this.log('Getting project by ID', { id });
      
      return await this.prisma.project.findUnique({
        where: { id },
        include: {
          contacts: true,
          tasks: {
            orderBy: { createdAt: 'desc' }
          },
          documents: true,
          timelineEvents: {
            orderBy: { eventDate: 'asc' }
          }
        }
      });
    } catch (error) {
      this.handleError(error, 'getProjectById');
    }
  }
  
  /**
   * Create a new project
   */
  async createProject(data: Prisma.ProjectCreateInput) {
    try {
      this.log('Creating project', { name: data.name });
      
      return await this.prisma.project.create({
        data,
        include: {
          contacts: true,
          tasks: true
        }
      });
    } catch (error) {
      this.handleError(error, 'createProject');
    }
  }
  
  /**
   * Update project
   */
  async updateProject(id: string, data: Prisma.ProjectUpdateInput) {
    try {
      this.log('Updating project', { id });
      
      return await this.prisma.project.update({
        where: { id },
        data,
        include: {
          contacts: true,
          tasks: true
        }
      });
    } catch (error) {
      this.handleError(error, 'updateProject');
    }
  }
  
  /**
   * Get project statistics
   */
  async getProjectStats() {
    try {
      this.log('Getting project stats');
      
      const [total, inProgress, completed] = await Promise.all([
        this.prisma.project.count(),
        this.prisma.project.count({ 
          where: { status: 'IN_PROGRESS' } 
        }),
        this.prisma.project.count({ 
          where: { status: 'COMPLETED' } 
        })
      ]);
      
      return {
        total,
        inProgress,
        completed,
        completionRate: total > 0 ? (completed / total) * 100 : 0
      };
    } catch (error) {
      this.handleError(error, 'getProjectStats');
    }
  }
}

// Export singleton instance
export const projectService = new ProjectService();