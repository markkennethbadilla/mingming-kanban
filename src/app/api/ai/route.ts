import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/models';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Task } from '@/types/task';

const { Task: TaskModel } = db;

// Create a single instance for the generative model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
});

export async function POST(request: NextRequest) {
    try {
        const { userInput } = await request.json();
        if (!userInput) {
            return NextResponse.json({ error: 'No userInput provided' }, { status: 400 });
        }

        // 1. Send userInput to Gemini
        const result = await model.generateContent(userInput);

        // 2. Parse the text. We assume the model returns JSON { intent, data }
        const rawText = result.response.text();
        let parsed: { intent?: string; data?: Partial<Task> & { id?: number } };
        try {
            parsed = JSON.parse(rawText);
        } catch (err) {
            console.error('Error parsing AI response:', err);
            return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 400 });
        }


        const { intent, data } = parsed;
        if (!intent || !data) {
            return NextResponse.json({ error: 'Invalid AI response structure' }, { status: 400 });
        }

        // 3. Perform CRUD based on `intent`
        switch (intent) {
            case 'add': {
                const startTime = data.startTime ? new Date(data.startTime).toISOString() : null;
                const endTime = data.endTime ? new Date(data.endTime).toISOString() : null;
                const newTask = await TaskModel.create({
                    title: data.title || 'Untitled',
                    description: data.description || '',
                    startTime,
                    endTime,
                    priority: data.priority ?? 1,
                });
                return NextResponse.json({ message: 'Task added', task: newTask }, { status: 200 });
            }

            case 'update': {
                if (!data.id) {
                    return NextResponse.json({ error: 'No task ID for update' }, { status: 400 });
                }
                const updatedData = {
                    ...data,
                    startTime: data.startTime ? new Date(data.startTime).toISOString() : undefined,
                    endTime: data.endTime ? new Date(data.endTime).toISOString() : undefined,
                };
                const [updatedCount] = await TaskModel.update(updatedData, {
                    where: { id: data.id },
                });
                if (!updatedCount) {
                    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
                }
                return NextResponse.json({ message: 'Task updated' }, { status: 200 });
            }

            case 'delete': {
                if (!data.id) {
                    return NextResponse.json({ error: 'No task ID for delete' }, { status: 400 });
                }
                const deletedCount = await TaskModel.destroy({ where: { id: data.id } });
                if (!deletedCount) {
                    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
                }
                return NextResponse.json({ message: 'Task deleted' }, { status: 200 });
            }

            default:
                return NextResponse.json({ error: 'Unrecognized command' }, { status: 400 });
        }
    } catch (err: unknown) {
        console.error('AI route error:', err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 });
    }
}
