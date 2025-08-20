// scripts/migrate-data.js
const mysql = require('mysql2/promise');
const { Client } = require('pg');
require('dotenv').config({ path: './.env' });

// IMPORTANT: Define the order of tables to migrate to respect foreign key constraints.
// Start with tables that don't depend on others (like User, Contact) and move to tables that do.
const TABLE_ORDER = [
  'User',
  'Account',
  'Session',
  'VerificationToken',
  'Contact',
  'Client',
  'Project',
  'ProjectContact',
  'ProjectMember',
  'Category',
  'Task',
  'Comment',
  'TimeEntry',
  'File',
  'Notification',
  'TimelineEvent',
  'FeatureRequest',
  'Invoice',
  'Expense',
  'Document',
  'Subscription',
  'Budget',
  'FinancialDocument',
  'AppearanceSettings',
];

// A mapping of Prisma model names to actual database table names.
// Most are pluralized by Prisma, but some might have custom names via @@map.
const TABLE_MAP = {
  User: 'User',
  Account: 'Account',
  Session: 'Session',
  VerificationToken: 'VerificationToken',
  Contact: 'contacts',
  Project: 'projects',
  ProjectContact: 'project_contacts',
  ProjectMember: 'project_members',
  Category: 'categories',
  Task: 'tasks',
  Comment: 'comments',
  TimeEntry: 'time_entries',
  File: 'files',
  Notification: 'notifications',
  TimelineEvent: 'timeline_events',
  FeatureRequest: 'FeatureRequest',
  Client: 'Client',
  Invoice: 'Invoice',
  Expense: 'Expense',
  Document: 'Document',
  Subscription: 'Subscription',
  Budget: 'Budget',
  FinancialDocument: 'FinancialDocument',
  AppearanceSettings: 'AppearanceSettings',
};

async function migrateData() {
  let mysqlConn;
  let pgClient;

  try {
    console.log('--- Starting Data Migration ---');

    // 1. Establish connections
    console.log('Connecting to MySQL source...');
    mysqlConn = await mysql.createConnection(process.env.MYSQL_URL);
    console.log('MySQL Connected.');

    console.log('Connecting to PostgreSQL destination...');
    pgClient = new Client({ connectionString: process.env.POSTGRES_URL });
    await pgClient.connect();
    console.log('PostgreSQL Connected.');
    
    // Disable foreign key checks for the session to allow inserting in any order
    await pgClient.query('SET session_replication_role = replica;');

    for (const modelName of TABLE_ORDER) {
      const tableName = TABLE_MAP[modelName];
      if (!tableName) {
        console.warn(`- Skipping ${modelName}: No table mapping found.`);
        continue;
      }

      console.log(`\nMigrating table: ${tableName}...`);

      // 2. Fetch data from MySQL
      const [rows] = await mysqlConn.execute(`SELECT * FROM \`${tableName}\`;`);
      if (rows.length === 0) {
        console.log(`- No data to migrate for ${tableName}.`);
        continue;
      }
      console.log(`- Found ${rows.length} rows to migrate.`);

      // 3. Insert data into PostgreSQL
      for (const row of rows) {
        const columns = Object.keys(row);
        const values = Object.values(row).map((val, index) => {
          // Convert MySQL's TINYINT(1) to PostgreSQL's boolean
          const column = columns[index];
          if (typeof val === 'number' && (column.toLowerCase().startsWith('is') || column.toLowerCase().endsWith('verified'))) {
             return val === 1;
          }
          return val;
        });

        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        const columnNames = columns.map(col => `"${col}"`).join(', '); // Use quotes for case-sensitivity

        const query = `INSERT INTO "${tableName}" (${columnNames}) VALUES (${placeholders}) ON CONFLICT DO NOTHING;`;
        
        try {
            await pgClient.query(query, values);
        } catch (pgError) {
            console.error(`- Error inserting row into ${tableName}:`, row);
            console.error('  PostgreSQL Error:', pgError.message);
            // Decide if you want to stop the whole process on a single row error
            // For now, we log it and continue
        }
      }
      console.log(`- Successfully migrated data for ${tableName}.`);
    }
    
    // Re-enable foreign key checks
    await pgClient.query('SET session_replication_role = DEFAULT;');

    console.log('\n--- Data Migration Completed Successfully! ---');

  } catch (error) {
    console.error('\n--- An error occurred during migration: ---');
    console.error(error);
    process.exit(1);
  } finally {
    // 4. Close connections
    if (mysqlConn) {
      await mysqlConn.end();
      console.log('\nMySQL connection closed.');
    }
    if (pgClient) {
      await pgClient.end();
      console.log('PostgreSQL connection closed.');
    }
  }
}

migrateData();
