'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import TaskCard from '@/components/TaskCard';
import Image from 'next/image';
import { ToastProvider } from '@/context/ToastContext';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Loader from '@/components/Loader';

const ChatPage = () => {
  const [messages, setMessages] = useState<
    { type: string; text: string; tasks?: any[] }[]
  >([]);
  const [input, setInput] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [isValidSession, setIsValidSession] = useState(false);
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      const storedMessages = localStorage.getItem(`chatMessages_${authToken}`);
      if (storedMessages) setMessages(JSON.parse(storedMessages));
    }
  }, []);

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      localStorage.setItem(
        `chatMessages_${authToken}`,
        JSON.stringify(messages)
      );
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    const validateSession = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
          router.push('/');
          return;
        }
        const response = await fetch('/api/session', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setUserId(data.user.id);
          setIsValidSession(true);
        } else {
          router.push('/');
        }
      } catch {
        router.push('/');
      }
    };
    validateSession();
  }, [router]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { type: 'user', text: input };
    const updatedMessages = [...messages, userMessage];
    setInput('');
    setMessages(updatedMessages);

    const conversationHistory = updatedMessages.map(
      (msg) => `${msg.type === 'user' ? 'User' : 'AI'}: ${msg.text}`
    );

    try {
      const response = await fetch('/api/ai/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input, userId, conversationHistory }),
      });

      const data = await response.json();

      if (data.success && data.message) {
        const aiMessage = {
          type: 'ai',
          text: data.message,
          tasks: data.tasks || [],
        };

        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch {
      console.error('Failed to send message to AI.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      localStorage.removeItem(`chatMessages_${authToken}`);
    }
  };

  const handleTaskDelete = (taskId: number) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) => {
        if (msg.tasks) {
          return {
            ...msg,
            tasks: msg.tasks.filter((task) => task.id !== taskId),
          };
        }
        return msg;
      })
    );
  };

  const handleTaskUpdate = (taskId: number, updatedFields: any) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) => {
        if (msg.tasks) {
          return {
            ...msg,
            tasks: msg.tasks.map((task) =>
              task.id === taskId ? { ...task, ...updatedFields } : task
            ),
          };
        }
        return msg;
      })
    );
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!isValidSession) {
    return <Loader />;
  }
  return (
    <DndProvider backend={HTML5Backend}>
      <ToastProvider>
        <div
          style={{
            paddingTop: '2rem',
            paddingBottom: '2rem',
            height: '87vh',
            backgroundImage: "url('/background-image.png')",
            backgroundSize: 'cover',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            className="max-w-4xl mx-auto p-2"
            style={{
              backgroundColor: 'var(--card-background)',
              borderRadius: '0.5rem',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              width: '100%',
              maxHeight: '87vh',
            }}
          >
            <div className="text-center mb-2">
              <h1
                className="text-3xl font-bold"
                style={{ color: 'var(--text-color)' }}
              >
                Chat with Mingming
              </h1>
              <p style={{ color: 'var(--neutral-color)' }}>
                Mingming is your AI assistant for task management
              </p>
            </div>
            <div
              className="flex flex-col flex-1 border"
              style={{
                borderColor: 'var(--neutral-color)',
                borderRadius: '0.5rem',
                backgroundColor: 'white',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column-reverse',
              }}
            >
              <div
                className="p-2 border-t"
                style={{
                  borderColor: 'var(--neutral-color)',
                  backgroundColor: 'var(--card-background)',
                }}
              >
                <div className="flex space-x-2">
                  <InputTextarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    rows={2}
                    placeholder="Type your message..."
                    onKeyDown={handleKeyPress}
                    className="flex-1 border rounded-md p-2"
                    style={{
                      borderColor: 'var(--neutral-color)',
                      color: 'var(--text-color)',
                    }}
                  />
                  <Button
                    label="Send"
                    icon="pi pi-send"
                    onClick={sendMessage}
                    className="font-semibold px-4 py-2 rounded-md shadow-md"
                    style={{
                      backgroundColor: 'var(--primary-color)',
                      color: 'white',
                    }}
                  />
                  <Button
                    label="Clear"
                    icon="pi pi-trash"
                    onClick={clearChat}
                    className="font-semibold px-4 py-2 rounded-md shadow-md"
                    style={{
                      backgroundColor: 'var(--secondary-color)',
                      color: 'white',
                    }}
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex items-start space-x-2 ${
                      msg.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.type === 'ai' && (
                      <div>
                        <Image
                          src="/logo.svg"
                          alt="AI"
                          width={32}
                          height={32}
                        />
                      </div>
                    )}
                    <div
                      className={`rounded-lg p-2 ${
                        msg.type === 'user' ? 'self-end' : 'self-start'
                      }`}
                      style={{
                        backgroundColor:
                          msg.type === 'user'
                            ? 'var(--primary-color)'
                            : 'var(--secondary-color)',
                        color: 'white',
                      }}
                    >
                      {msg.text}
                    </div>

                    {msg.tasks && (
                      <div className="grid grid-cols-1 md:grid-cols-2 mt-2">
                        {msg.tasks.map((task) => (
                          <div key={task.id} className="flex flex-col">
                            <TaskCard
                              id={task.id}
                              title={task.title}
                              description={task.description}
                              dueDate={task.dueDate}
                              priority={task.priority}
                              status={task.status}
                              onDelete={handleTaskDelete}
                              onStatusChange={(id, newStatus) =>
                                handleTaskUpdate(id, { status: newStatus })
                              }
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>
        </div>
      </ToastProvider>
    </DndProvider>
  );
};

export default ChatPage;
