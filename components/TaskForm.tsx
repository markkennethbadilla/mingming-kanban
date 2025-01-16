'use client';

import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';
import { useEffect } from 'react';
import { Task } from '@/types/task';

const schema = yup.object().shape({
    title: yup.string().required('Title is required'),
    description: yup.string(),
    startTime: yup
        .string()
        .required('Start time is required')
        .test('is-valid-date', 'Invalid date', (value) => !value || !isNaN(Date.parse(value))),
    endTime: yup
        .string()
        .required('End time is required')
        .test('is-valid-date', 'Invalid date', (value) => !value || !isNaN(Date.parse(value))),
    priority: yup.number().default(1).min(1).max(5),
});

// Fields for the form (no ID here since it's auto-assigned by the DB)
interface TaskFormValues {
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    priority: number;
}

interface TaskFormProps {
    editMode?: boolean;
    // For editing, we expect a full Task object (with ID, etc.)
    initialValues?: Task;
    onTaskCreated?: (task: Task) => void;
    onTaskUpdated?: () => void;
}

export default function TaskForm({
    editMode,
    initialValues,
    onTaskCreated,
    onTaskUpdated,
}: TaskFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<TaskFormValues>({
        resolver: yupResolver(schema),
        defaultValues: {
            title: '',
            description: '',
            startTime: '',
            endTime: '',
            priority: 1,
        },
    });

    useEffect(() => {
        if (editMode && initialValues) {
            const patchValues: Partial<TaskFormValues> = {
                title: initialValues.title,
                description: initialValues.description,
                startTime: initialValues.startTime.slice(0, 16), // Format as "YYYY-MM-DDTHH:mm"
                endTime: initialValues.endTime.slice(0, 16),     // Format as "YYYY-MM-DDTHH:mm"
                priority: initialValues.priority,
            };
            reset(patchValues);
        }
    }, [editMode, initialValues, reset]);


    const onSubmit = async (data: TaskFormValues) => {
        const taskData = {
            ...data,
            startTime: new Date(data.startTime), // Convert to Date
            endTime: new Date(data.endTime),     // Convert to Date
        };

        try {
            if (editMode && initialValues?.id) {
                await axios.put(`/api/tasks/${initialValues.id}`, taskData);
                onTaskUpdated?.();
            } else {
                const res = await axios.post('/api/tasks', taskData);
                onTaskCreated?.(res.data);
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                console.error('Axios error:', err.message);
            } else if (err instanceof Error) {
                console.error('General error:', err.message);
            } else {
                console.error('Unknown error');
            }
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="block font-medium">Title</label>
                <input
                    {...register('title')}
                    className="border p-1 block w-full"
                    type="text"
                    placeholder="Task Title"
                />
                {errors.title && (
                    <p className="text-red-500 text-sm">{errors.title.message}</p>
                )}
            </div>
            <div>
                <label className="block font-medium">Description</label>
                <textarea
                    {...register('description')}
                    className="border p-1 block w-full"
                    placeholder="Task Description"
                />
            </div>
            <div>
                <label className="block font-medium">Start Time</label>
                <input
                    type="datetime-local"
                    {...register('startTime')}
                    className="border p-1 block w-full"
                />
                {errors.startTime && (
                    <p className="text-red-500 text-sm">{errors.startTime.message}</p>
                )}
            </div>
            <div>
                <label className="block font-medium">End Time</label>
                <input
                    type="datetime-local"
                    {...register('endTime')}
                    className="border p-1 block w-full"
                />
                {errors.endTime && (
                    <p className="text-red-500 text-sm">{errors.endTime.message}</p>
                )}
            </div>
            <div>
                <label className="block font-medium">Priority</label>
                <input
                    type="number"
                    {...register('priority')}
                    className="border p-1 block w-full"
                    min={1}
                    max={5}
                />
            </div>
            <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
                {editMode ? 'Update Task' : 'Create Task'}
            </button>
        </form>
    );
}
