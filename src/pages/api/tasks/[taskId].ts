import { NextApiRequest, NextApiResponse } from 'next';
import { Task } from '../../../models';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  const { taskId } = req.query;

  if (!taskId) {
    return res
      .status(400)
      .json({ success: false, message: 'Task ID is required' });
  }

  switch (method) {
    case 'GET': {
      try {
        const task = await Task.findByPk(
          Array.isArray(taskId) ? taskId[0] : taskId
        );
        if (!task) {
          return res
            .status(404)
            .json({ success: false, message: 'Task not found' });
        }
        res.status(200).json({ success: true, task });
      } catch {
        res
          .status(500)
          .json({ success: false, message: 'Error fetching task' });
      }
      break;
    }
    case 'PUT': {
      const { title, description, dueDate, priority, status } = req.body;
      try {
        const task = await Task.findByPk(
          Array.isArray(taskId) ? taskId[0] : taskId
        );
        if (!task) {
          return res
            .status(404)
            .json({ success: false, message: 'Task not found' });
        }

        await task.update({ title, description, dueDate, priority, status });
        await task.reload();

        res.status(200).json({ success: true, task });
      } catch {
        res
          .status(500)
          .json({ success: false, message: 'Error updating task' });
      }
      break;
    }

    case 'DELETE': {
      try {
        const task = await Task.findByPk(
          Array.isArray(taskId) ? taskId[0] : taskId
        );
        if (!task) {
          return res
            .status(404)
            .json({ success: false, message: 'Task not found' });
        }
        await task.destroy();
        res
          .status(200)
          .json({ success: true, message: 'Task deleted successfully' });
      } catch {
        res
          .status(500)
          .json({ success: false, message: 'Error deleting task' });
      }
      break;
    }
    default:
      res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}
