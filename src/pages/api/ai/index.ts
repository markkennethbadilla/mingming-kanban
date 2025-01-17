import { NextApiRequest, NextApiResponse } from 'next';
import { Task } from '@/models/Task';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Task as TaskType } from '@/types/task';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { userInput } = req.body;
    if (!userInput) {
      return res.status(400).json({ error: 'No userInput provided' });
    }

    const result = await model.generateContent(userInput);
    const rawText = result.response.text();

    let parsed: { intent?: string; data?: Partial<TaskType> & { id?: number } };
    try {
      parsed = JSON.parse(rawText);
    } catch (err) {
      console.error('Error parsing AI response:', err);
      return res.status(400).json({ error: 'Failed to parse AI response' });
    }

    const { intent, data } = parsed;
    if (!intent || !data) {
      return res.status(400).json({ error: 'Invalid AI response structure' });
    }

    switch (intent) {
      case 'add': {
        const newTask = await Task.create({
          title: data.title || 'Untitled',
          description: data.description || '',
          startTime: data.startTime ? new Date(data.startTime).toISOString() : null,
          endTime: data.endTime ? new Date(data.endTime).toISOString() : null,
          priority: data.priority ?? 1,
        });
        return res.status(200).json({ message: 'Task added', task: newTask });
      }
      case 'update': {
        if (!data.id) {
          return res.status(400).json({ error: 'No task ID for update' });
        }
        const [updatedCount] = await Task.update(data, { where: { id: data.id } });
        if (!updatedCount) {
          return res.status(404).json({ error: 'Task not found' });
        }
        return res.status(200).json({ message: 'Task updated' });
      }
      case 'delete': {
        if (!data.id) {
          return res.status(400).json({ error: 'No task ID for delete' });
        }
        const deletedCount = await Task.destroy({ where: { id: data.id } });
        if (!deletedCount) {
          return res.status(404).json({ error: 'Task not found' });
        }
        return res.status(200).json({ message: 'Task deleted' });
      }
      default:
        return res.status(400).json({ error: 'Unrecognized command' });
    }
  } catch (err: unknown) {
    console.error('AI route error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default handler;
