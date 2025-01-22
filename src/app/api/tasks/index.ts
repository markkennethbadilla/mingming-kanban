import { NextApiRequest, NextApiResponse } from 'next';
import { Task } from '../../../models';
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  switch (method) {
    case 'GET': {
      const { userId } = req.query;
      if (!userId) {
        return res
          .status(400)
          .json({ success: false, message: 'User ID is required' });
      }
      try {
        const tasks = await Task.findAll({ where: { userId } });
        res.status(200).json({ success: true, tasks });
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({ success: false, message: 'Error fetching tasks' });
      }
      break;
    }
    case 'POST': {
      const { title, description, dueDate, priority, status, userId } =
        req.body;
      if (!title || !dueDate || !priority || !status || !userId) {
        return res
          .status(400)
          .json({ success: false, message: 'Missing required fields' });
      }
      try {
        const task = await Task.create({
          title,
          description,
          dueDate,
          priority,
          status,
          userId,
        });
        res.status(201).json({ success: true, task });
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({ success: false, message: 'Error creating task' });
      }
      break;
    }
    default:
      res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}
