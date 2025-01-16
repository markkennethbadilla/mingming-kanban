import { NextRequest, NextResponse } from 'next/server';
import db from '@/models'; // Import the initialized Sequelize instance and models

const { Task } = db; // Access the Task model

export async function GET() {
  try {
    const tasks = await Task.findAll(); // Retrieve all tasks
    return NextResponse.json(tasks, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, startTime, endTime, priority } = body;

    const newTask = await Task.create({
      title,
      description,
      startTime,
      endTime,
      priority,
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 });
  }
}
