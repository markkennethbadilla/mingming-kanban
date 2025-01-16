'use client';

import AITextInput from '@/components/AITextInput';

export default function AIPage() {
  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">AI Task Management</h1>
      <AITextInput />
      <p className="mt-4 text-gray-600">
        Try commands like: &quot;Add a new task: feed the cat at 8 AM&quot; or &quot;Delete task with id: 3&quot;.
        Make sure your AI prompt returns valid JSON for our CRUD logic!
      </p>
    </div>
  );
}
