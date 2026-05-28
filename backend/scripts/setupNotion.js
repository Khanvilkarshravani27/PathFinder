/**
 * setupNotion.js
 * 
 * Run this ONCE to create your PathFinder Study Tracker database in Notion.
 * 
 * Prerequisites:
 *   1. Go to https://www.notion.so/my-integrations
 *   2. Create a new integration → copy the "Internal Integration Token"
 *   3. Open any Notion page → Share → Invite your integration
 *   4. Copy that page's ID from the URL: notion.so/Your-Page-XXXXXXXXXXXXXXXX
 *      (it's the 32-char hex at the end)
 * 
 * Usage:
 *   cd backend
 *   node scripts/setupNotion.js <PAGE_ID>
 * 
 * Example:
 *   node scripts/setupNotion.js abc123def456789012345678901234ab
 */

require('dotenv').config({ path: '../backend/.env' });
const { Client } = require('@notionhq/client');
const fs = require('fs');
const path = require('path');

async function main() {
  const pageId = process.argv[2];

  if (!pageId) {
    console.error('\n❌ Usage: node scripts/setupNotion.js <YOUR_NOTION_PAGE_ID>');
    console.error('   The page ID is the 32-char hex at the end of your Notion page URL.\n');
    process.exit(1);
  }

  if (!process.env.NOTION_TOKEN) {
    console.error('\n❌ NOTION_TOKEN not found in backend/.env');
    console.error('   Add: NOTION_TOKEN=secret_xxxx\n');
    process.exit(1);
  }

  const notion = new Client({ auth: process.env.NOTION_TOKEN });

  console.log('\n🧭 PathFinder — Notion Setup');
  console.log('   Creating Study Tracker database...\n');

  try {
    const db = await notion.databases.create({
      parent: { page_id: pageId },
      title: [{ text: { content: '🧭 PathFinder Study Tracker' } }],
      properties: {
        Name: { title: {} },
        Status: {
          select: {
            options: [
              { name: 'Not started', color: 'gray' },
              { name: 'In progress', color: 'blue' },
              { name: 'Done', color: 'green' },
              { name: 'Blocked', color: 'red' }
            ]
          }
        },
        Priority: {
          select: {
            options: [
              { name: 'High', color: 'red' },
              { name: 'Medium', color: 'yellow' },
              { name: 'Low', color: 'green' }
            ]
          }
        },
        'Estimated Hours': { number: { format: 'number' } },
        Tags: { multi_select: {} },
        Source: {
          select: {
            options: [
              { name: 'PathFinder', color: 'purple' },
              { name: 'Manual', color: 'gray' }
            ]
          }
        },
        'Due Date': { date: {} },
        Notes: { rich_text: {} }
      }
    });

    const dbId = db.id;
    console.log('✅ Database created successfully!');
    console.log(`   Database ID: ${dbId}`);
    console.log(`   URL: https://notion.so/${dbId.replace(/-/g, '')}`);

    // Auto-update the .env file
    const envPath = path.join(__dirname, '../.env');
    let envContent = fs.readFileSync(envPath, 'utf-8');

    if (envContent.includes('NOTION_DATABASE_ID=')) {
      envContent = envContent.replace(/NOTION_DATABASE_ID=.*/, `NOTION_DATABASE_ID=${dbId}`);
    } else {
      envContent += `\nNOTION_DATABASE_ID=${dbId}`;
    }

    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ NOTION_DATABASE_ID automatically added to backend/.env');
    console.log('\n🚀 You\'re all set! Restart the backend server to pick up the changes.\n');

  } catch (err) {
    console.error('\n❌ Setup failed:', err.message);
    if (err.message.includes('Could not find page')) {
      console.error('   Make sure you shared the Notion page with your integration.');
    }
    process.exit(1);
  }
}

main();
