const { Client } = require('@notionhq/client');

const getClient = () => {
  if (!process.env.NOTION_TOKEN) throw new Error('NOTION_TOKEN not set');
  return new Client({ auth: process.env.NOTION_TOKEN });
};

/**
 * Push an action plan step to the user's Notion study tracker database
 */
const pushTaskToNotion = async ({ databaseId, title, description, priority, estimatedHours }) => {
  const notion = getClient();

  const response = await notion.pages.create({
    parent: { database_id: databaseId },
    properties: {
      Name: {
        title: [{ text: { content: title } }]
      },
      Status: {
        select: { name: 'Not started' }
      },
      Priority: {
        select: { name: priority === 'high' ? 'High' : priority === 'medium' ? 'Medium' : 'Low' }
      },
      'Estimated Hours': {
        number: estimatedHours || 0
      },
      Tags: {
        multi_select: [{ name: 'PathFinder' }, { name: 'Auto-generated' }]
      }
    },
    children: [
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ type: 'text', text: { content: description || '' } }]
        }
      }
    ]
  });

  return response.id;
};

/**
 * Create a new PathFinder Study Tracker database in Notion
 * Run this once during setup if the user has no database yet
 */
const createStudyTrackerDatabase = async (parentPageId) => {
  const notion = getClient();

  const response = await notion.databases.create({
    parent: { page_id: parentPageId },
    title: [{ text: { content: '🧭 PathFinder Study Tracker' } }],
    properties: {
      Name: { title: {} },
      Status: {
        select: {
          options: [
            { name: 'Not started', color: 'gray' },
            { name: 'In progress', color: 'blue' },
            { name: 'Done', color: 'green' }
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
      'Due Date': { date: {} }
    }
  });

  return response.id;
};

module.exports = { pushTaskToNotion, createStudyTrackerDatabase };
