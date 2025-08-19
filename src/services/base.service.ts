/**
 * Base Service Class
 * Provides common functionality for all services
 */

import { PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export abstract class BaseService {
  protected prisma: PrismaClient;
  
  constructor() {
    this.prisma = prisma;
  }
  
  /**
   * Log service actions for debugging
   */
  protected log(action: string, data?: any) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${this.constructor.name}] ${action}`, data || '');
    }
  }
  
  /**
   * Handle service errors consistently
   */
  protected handleError(error: any, context: string) {
    console.error(`[${this.constructor.name}] Error in ${context}:`, error);
    throw error;
  }
}