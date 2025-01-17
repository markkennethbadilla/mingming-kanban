import { NextApiRequest, NextApiResponse } from 'next';
import { Task } from '@/models/Task';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      const task = await Task.findByPk(id as string);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      return res.status(200).json(task);
    }

    if (req.method === 'PUT') {
      const { title, description, startTime, endTime, priority } = req.body;
      const [updatedCount] = await Task.update(
        { title, description, startTime, endTime, priority },
        { where: { id: id as string } }
      );
      if (!updatedCount) {
        return res.status(404).json({ error: 'Task not found' });
      }
      return res.status(200).json({ message: 'Task updated' });
    }

    if (req.method === 'DELETE') {
      const deletedCount = await Task.destroy({ where: { id: id as string } });
      if (!deletedCount) {
        return res.status(404).json({ error: 'Task not found' });
      }
      return res.status(200).json({ message: 'Task deleted' });
    }

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err: unknown) {
    console.error('Error in /api/tasks/[id]:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default handler;
