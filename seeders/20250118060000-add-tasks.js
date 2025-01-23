'use strict';

module.exports = {
  async up(queryInterface) {
    try {
      // Check if the user already exists
      const [existingUser] = await queryInterface.sequelize.query(
        `SELECT id FROM "Users" WHERE email = 'iammkb2002@gmail.com'`
      );

      let userId;
      if (existingUser.length > 0) {
        // User already exists
        userId = existingUser[0].id;
        console.log('User already exists with ID:', userId);
      } else {
        console.log('NO USER WITH THAT EMAIL');
      }

      // Insert tasks
      await queryInterface.bulkInsert('Tasks', [
        {
          title: 'Complete project report',
          description:
            'Prepare the final project report and submit it to the client.',
          dueDate: '2025-02-01',
          priority: 'HIGH',
          status: 'TO_DO',
          userId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'Team meeting',
          description:
            'Discuss project updates and allocate tasks for next sprint.',
          dueDate: '2025-01-21',
          priority: 'MEDIUM',
          status: 'IN_PROGRESS',
          userId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'Code review',
          description:
            'Review the latest code commits for quality and standards.',
          dueDate: '2025-01-23',
          priority: 'LOW',
          status: 'TO_DO',
          userId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'Prepare presentation',
          description:
            'Create slides for the upcoming stakeholder presentation.',
          dueDate: '2025-01-25',
          priority: 'HIGH',
          status: 'TO_DO',
          userId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'Fix UI bugs',
          description:
            'Resolve reported UI bugs in the task management module.',
          dueDate: '2025-01-28',
          priority: 'MEDIUM',
          status: 'IN_PROGRESS',
          userId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'Database optimization',
          description:
            'Improve database query performance for the reporting feature.',
          dueDate: '2025-02-05',
          priority: 'HIGH',
          status: 'TO_DO',
          userId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'Write unit tests',
          description: 'Add missing unit tests for the authentication module.',
          dueDate: '2025-01-30',
          priority: 'MEDIUM',
          status: 'TO_DO',
          userId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'Deploy staging environment',
          description:
            'Deploy the latest changes to the staging environment for QA.',
          dueDate: '2025-02-02',
          priority: 'LOW',
          status: 'TO_DO',
          userId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'Plan sprint tasks',
          description:
            'Define and estimate tasks for the next development sprint.',
          dueDate: '2025-02-04',
          priority: 'MEDIUM',
          status: 'TO_DO',
          userId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'Create API documentation',
          description: 'Document the APIs used for the task management system.',
          dueDate: '2025-02-10',
          priority: 'HIGH',
          status: 'TO_DO',
          userId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      console.log('Tasks inserted successfully.');
    } catch (error) {
      console.error('Error in seeding:', error);
    }
  },

  async down(queryInterface) {
    try {
      await queryInterface.bulkDelete('Tasks', null, {});
      console.log('Tasks deleted successfully.');

      await queryInterface.bulkDelete('Users', {
        email: 'john.doe@example.com',
      });
      console.log('User deleted successfully.');
    } catch (error) {
      console.error('Error in down migration:', error);
    }
  },
};