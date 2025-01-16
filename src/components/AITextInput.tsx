'use client';

import { useState } from 'react';
import axios from 'axios';

export default function AITextInput() {
  const [inputText, setInputText] = useState('');
  const [responseMessage, setResponseMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/ai', { userInput: inputText });
      setResponseMessage(JSON.stringify(res.data, null, 2));
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setResponseMessage(err.message);
      } else if (err instanceof Error) {
        setResponseMessage(err.message);
      } else {
        setResponseMessage('Unknown error');
      }
    }
  };

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-bold mb-2">Conversational AI</h2>
      <form onSubmit={handleSubmit} className="mb-2">
        <input
          className="border p-2 w-full"
          placeholder='e.g., "Add a yoga session tomorrow at 6 AM"'
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 mt-2 rounded">
          Send to AI
        </button>
      </form>
      {responseMessage && (
        <pre className="bg-gray-100 p-2 mt-2 rounded whitespace-pre-wrap">
          {responseMessage}
        </pre>
      )}
    </div>
  );
}
