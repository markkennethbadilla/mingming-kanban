import { NextApiRequest, NextApiResponse } from 'next';
import { Task } from '@/models';
import { processUserQuery } from '@/utils/aiHandler';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ success: false, message: 'Method not allowed' });
  }

  const { prompt, userId, conversationHistory } = req.body;

  if (!prompt || !userId || !conversationHistory) {
    return res
      .status(400)
      .json({ success: false, message: 'Missing required fields' });
  }

  try {
    const tasks = await Task.findAll({
      where: {
        userId,
      },
      attributes: [
        'id',
        'title',
        'description',
        'dueDate',
        'priority',
        'status',
      ],
    });

    const detailedPrompt = `
You are a cheerful and motivating assistant with the personality of a happy and encouraging cat. Your job is to assist users with their tasks and keep them motivated. Based on the following conversation, decide the user's intent and generate ALL required task details, filling in any missing fields intelligently based on the context of the conversation. If the user's input lacks clarity, explicitly ask for clarification before proceeding. If the user doesn't address the clarification, use defaults but notify the user that defaults were used.

### Response Format
Your response must ALWAYS follow this exact JSON structure, enclosed in backticks. Do not include any text or explanations outside of this JSON.

\`\`\`json
{
    "intent": "intent_type",                 // One of: CREATE_TASK, UPDATE_TASK, DELETE_TASK, VIEW_TASKS, CHAT
    "payload": {
        "message": "string",                  // A meaningful response to the user, explaining the result or action taken.
        "tasks": [                            // Include this for CREATE_TASK, VIEW_TASKS, and after UPDATE_TASK or DELETE_TASK.
            {
                "id": "number",                   // The unique task ID. Optional for CREATE_TASK but required for all other intents.
                "title": "string",                // The task title.
                "description": "string",          // The task description.
                "dueDate": "string",              // The due date in ISO 8601 format.
                "priority": "LOW" | "MEDIUM" | "HIGH", // Task priority. Must be one of these values.
                "status": "TO_DO" | "IN_PROGRESS" | "DONE" // Task status. Must be one of these values.
            }
        ],
        "id": "number" | ["number"],           // Required for UPDATE_TASK and DELETE_TASK. The task ID(s) to update or delete.
        "fieldsToUpdate": {                   // Required for UPDATE_TASK. Fields to update in the specified task(s).
            "title": "string",                  // Optional. The new title.
            "description": "string",            // Optional. The new description.
            "dueDate": "string",                // Optional. The new due date in ISO 8601 format.
            "priority": "LOW" | "MEDIUM" | "HIGH", // Optional. The new priority.
            "status": "TO_DO" | "IN_PROGRESS" | "DONE" // Optional. The new status.
        }
    }
}
\`\`\`

### Rules for the AI:
1. **ALWAYS include a "message" field**:
     - Confirm the success of the action or explain the result.
     - Use the cheerful and motivating tone of a cat.
     - DO NOT embed the full list of tasks inside the "message" field.

2. **For \`VIEW_TASKS\`**:
     - By default, only include tasks with the status \`TO_DO\` or \`IN_PROGRESS\` in the \`tasks\` array.
     - If the user explicitly requests tasks with other statuses (e.g., \`DONE\`), include them in the response as well.
     - Keep the "message" field clear of task details.

3. **For all intents involving tasks**:
     - Ensure that task filtering and operations are meaningful and reflect the user's context and intent.

4. **Validation**:
     - Follow the JSON format exactly as specified.
     - All field names and values must be valid and adhere to the specified structure.

### Current Tasks
These are the current tasks for the user. Only tasks with the status \`TO_DO\` or \`IN_PROGRESS\` are included:
${JSON.stringify(tasks)}

### Conversation History
This is the conversation history so far. Use it to understand the user's intent and generate the appropriate response.

${Array.isArray(conversationHistory) ? conversationHistory.join('\n') : conversationHistory}

Respond now.
`;

    const aiResponseText = await processUserQuery(detailedPrompt);

    let aiResponse;
    try {
      const sanitizedResponseText = aiResponseText
        .replace(/```json|```/g, '')
        .trim();
      aiResponse = JSON.parse(sanitizedResponseText);

      const intent = aiResponse.intent || aiResponse.response_type;
      const payload = aiResponse.payload;

      if (!intent || !payload || !payload.message) {
        throw new Error('Missing intent or payload in the AI response.');
      }

      if (intent === 'CREATE_TASK') {
        const createdTasks = [];
        for (const task of payload.tasks) {
          const { title, description, dueDate, priority, status } = task;

          if (!title || !description || !dueDate || !priority || !status) {
            throw new Error(
              'Missing required fields for CREATE_TASK in the AI response.'
            );
          }

          const existingTask = await Task.findOne({
            where: {
              title,
              description,
              dueDate,
              userId,
            },
          });

          if (existingTask) {
            continue;
          }

          const taskDetails = {
            title,
            description,
            dueDate,
            priority,
            status,
            userId,
          };
          const createdTask = await Task.create(taskDetails);
          createdTasks.push(createdTask);
        }

        return res.status(200).json({
          success: true,
          message: payload.message,
          tasks: payload.tasks,
        });
      } else if (intent === 'UPDATE_TASK') {
        const { id, fieldsToUpdate } = payload;

        if (!id || !fieldsToUpdate) {
          throw new Error(
            'Missing required fields for UPDATE_TASK in the AI response.'
          );
        }

        const existingTask = await Task.findOne({ where: { id, userId } });

        if (!existingTask) {
          return res.status(404).json({
            success: false,
            message: `Task with ID ${id} not found.`,
          });
        }

        const changes = Object.entries(fieldsToUpdate).filter(
          ([key, value]) => existingTask[key] !== value
        );

        if (changes.length === 0) {
          return res.status(200).json({
            success: true,
            message: 'No changes detected in the update request.',
            tasks: payload.tasks,
          });
        }

        await Task.update(fieldsToUpdate, { where: { id } });

        return res.status(200).json({
          success: true,
          message: payload.message,
          tasks: payload.tasks,
        });
      } else if (intent === 'DELETE_TASK') {
        const idsToDelete = Array.isArray(payload.id)
          ? payload.id
          : [payload.id];

        const deletedCount = await Task.destroy({
          where: { id: idsToDelete, userId },
        });

        if (deletedCount === 0) {
          return res.status(404).json({
            success: false,
            message: 'No matching tasks found to delete.',
          });
        }

        return res.status(200).json({
          success: true,
          message: payload.message,
          tasks: payload.tasks,
        });
      } else if (intent === 'VIEW_TASKS') {
        return res.status(200).json({
          success: true,
          message: payload.message,
          tasks: payload.tasks,
        });
      } else if (intent === 'CHAT') {
        return res.status(200).json({
          success: true,
          message: payload.message,
        });
      }
    } catch (error) {
      console.error('Error parsing or validating AI response:', error, {
        rawResponse: aiResponseText,
      });
      return res.status(500).json({
        success: false,
        message:
          'AI response was not valid JSON or did not provide all required fields.',
        rawResponse: aiResponseText,
      });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
