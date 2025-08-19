/**
 * Application Configuration
 * Centralizes all configuration in one place
 */

export const appConfig = {
  // Application
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Business Manager',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    env: process.env.NODE_ENV || 'development',
  },
  
  // Database
  database: {
    url: process.env.DATABASE_URL!,
    shadowUrl: process.env.SHADOW_DATABASE_URL,
  },
  
  // Authentication
  auth: {
    secret: process.env.NEXTAUTH_SECRET!,
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    providers: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      },
    },
  },
  
  // Email
  email: {
    enabled: process.env.ENABLE_EMAIL === 'true',
    from: process.env.EMAIL_FROM || 'noreply@example.com',
    smtp: {
      host: process.env.SMTP_HOST || '',
      port: parseInt(process.env.SMTP_PORT || '587'),
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  },
  
  // Features
  features: {
    emailNotifications: process.env.ENABLE_EMAIL === 'true',
    fileUploads: process.env.ENABLE_UPLOADS === 'true',
    dailyManifest: process.env.ENABLE_MANIFEST === 'true',
    backups: process.env.ENABLE_BACKUPS === 'true',
  },
  
  // Storage
  storage: {
    uploadDir: process.env.UPLOAD_DIR || 'public/uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
  },
};