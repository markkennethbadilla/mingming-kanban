import { NextApiRequest, NextApiResponse } from 'next';
import { Task } from '../../../models';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  const { taskId } = req.query;

  console.log(`Received ${method} request for task ID: ${taskId}`);
  console.log('Request body:', req.body);

  if (!taskId) {
    console.log('Task ID is missing in the request');
    return res
      .status(400)
      .json({ success: false, message: 'Task ID is required' });
  }

  switch (method) {
    case 'GET': {
      try {
        console.log(`Fetching task with ID: ${taskId}`);
        const task = await Task.findByPk(
          Array.isArray(taskId) ? taskId[0] : taskId
        );
        if (!task) {
          console.log(`Task with ID: ${taskId} not found`);
          return res
            .status(404)
            .json({ success: false, message: 'Task not found' });
        }
        console.log(`Task with ID: ${taskId} found`);
        res.status(200).json({ success: true, task });
      } catch (error) {
        console.error('Error fetching task:', error);
        res
          .status(500)
          .json({ success: false, message: 'Error fetching task' });
      }
      break;
    }
    case 'PUT': {
      const { title, description, dueDate, priority, status } = req.body;
      try {
        console.log(`Updating task with ID: ${taskId}`);
        const task = await Task.findByPk(
          Array.isArray(taskId) ? taskId[0] : taskId
        );
        if (!task) {
          console.log(`Task with ID: ${taskId} not found`);
          return res
            .status(404)
            .json({ success: false, message: 'Task not found' });
        }

        // Update all fields
        console.log('Updating task with fields:', {
          title,
          description,
          dueDate,
          priority,
          status,
        });
        await task.update({ title, description, dueDate, priority, status });

        // Reload updated task to return the latest data
        await task.reload();

        console.log(`Task with ID: ${taskId} updated successfully`);
        res.status(200).json({ success: true, task });
      } catch (error) {
        console.error('Error updating task:', error);
        res
          .status(500)
          .json({ success: false, message: 'Error updating task' });
      }
      break;
    }

    case 'DELETE': {
      try {
        console.log(`Deleting task with ID: ${taskId}`);
        const task = await Task.findByPk(
          Array.isArray(taskId) ? taskId[0] : taskId
        );
        if (!task) {
          console.log(`Task with ID: ${taskId} not found`);
          return res
            .status(404)
            .json({ success: false, message: 'Task not found' });
        }
        await task.destroy();
        console.log(`Task with ID: ${taskId} deleted successfully`);
        res
          .status(200)
          .json({ success: true, message: 'Task deleted successfully' });
      } catch (error) {
        console.error('Error deleting task:', error);
        res
          .status(500)
          .json({ success: false, message: 'Error deleting task' });
      }
      break;
    }
    default:
      console.log(`Method ${method} not allowed`);
      res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}
