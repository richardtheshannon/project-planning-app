// src/lib/template-service.ts
import fs from 'fs/promises';
import path from 'path';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  file: string;
  isDefault: boolean;
  isActive: boolean;
  variables: string[];
}

export interface TemplateWithContent extends Template {
  htmlContent: string;
}

const TEMPLATES_DIR = path.join(process.cwd(), 'src', 'templates');
const TEMPLATES_CONFIG = path.join(TEMPLATES_DIR, 'templates.json');

export async function getTemplates(): Promise<Template[]> {
  try {
    const configContent = await fs.readFile(TEMPLATES_CONFIG, 'utf-8');
    const config = JSON.parse(configContent);
    return config.templates;
  } catch (error) {
    console.error('Error reading templates config:', error);
    return [];
  }
}

export async function getTemplate(id: string): Promise<TemplateWithContent | null> {
  try {
    const templates = await getTemplates();
    const template = templates.find(t => t.id === id);
    
    if (!template) return null;
    
    const htmlPath = path.join(TEMPLATES_DIR, template.file);
    const htmlContent = await fs.readFile(htmlPath, 'utf-8');
    
    return {
      ...template,
      htmlContent
    };
  } catch (error) {
    console.error('Error reading template:', error);
    return null;
  }
}