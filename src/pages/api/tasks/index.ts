import { NextApiRequest, NextApiResponse } from 'next';
import { Task } from '@/models/Task';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === 'GET') {
      const tasks = await Task.findAll();
      return res.status(200).json(tasks);
    }

    if (req.method === 'POST') {
      const { title, description, startTime, endTime, priority } = req.body;
      const newTask = await Task.create({
        title,
        description,
        startTime: startTime ? new Date(startTime).toISOString() : null,
        endTime: endTime ? new Date(endTime).toISOString() : null,
        priority,
      });
      return res.status(201).json(newTask);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err: unknown) {
    console.error('Error in /api/tasks:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default handler;
