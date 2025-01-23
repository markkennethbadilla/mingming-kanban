"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Message } from "primereact/message";

const ChatPage = () => {
    const [messages, setMessages] = useState<{ type: string; text: string }[]>([]);
    const [input, setInput] = useState("");
    const [userId, setUserId] = useState<number | null>(null);
    const router = useRouter();
    const [missingFields, setMissingFields] = useState<string[]>([]);

    // Load chat messages from localStorage on component mount
    useEffect(() => {
        const savedMessages = localStorage.getItem("chatMessages");
        if (savedMessages) {
            setMessages(JSON.parse(savedMessages));
            console.log("Loaded messages from localStorage:", JSON.parse(savedMessages));
        }
    }, []);

    // Save chat messages to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem("chatMessages", JSON.stringify(messages));
        console.log("Saved messages to localStorage:", messages);
    }, [messages]);

    // Validate user session using token
    useEffect(() => {
        const validateSession = async () => {
            console.log("Validating session...");
            try {
                const response = await fetch("/api/session", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                    },
                });
                const data = await response.json();
                console.log("Session validation response:", data);
                if (data.success) {
                    setUserId(data.user.id);
                    console.log("User ID set to:", data.user.id);
                } else {
                    console.log("Invalid session. Redirecting to login...");
                    router.push("/");
                }
            } catch (error) {
                console.error("Session validation error:", error);
                router.push("/");
            }
        };
        validateSession();
    }, [router]);

    const sendMessage = async () => {
        console.log("Send message called. Input:", input);

        if (!input.trim()) {
            console.log("Input is empty. Sending reminder to user.");
            setMessages((prev) => [
                ...prev,
                { type: "ai", text: "Oops! Please type something to get started. 😊" },
            ]);
            return;
        }

        const userMessage = { type: "user", text: input };
        console.log("User message created:", userMessage);

        setInput(""); // Clear the input field immediately
        console.log("Input cleared");

        setMessages((prev) => [...prev, userMessage]);
        console.log("User message added to messages:", userMessage);

        const conversationHistory = messages.map((msg) => `${msg.type === "user" ? "User" : "AI"}: ${msg.text}`);
        console.log("Conversation history:", conversationHistory);

        try {
            const response = await fetch("/api/ai/interpret", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: input, userId, conversationHistory }),
            });
            console.log("Sent message to AI. Awaiting response...");
            const data = await response.json();
            console.log("AI response received:", data);

            if (data.success) {
                setMessages((prev) => [...prev, { type: "ai", text: data.response || data.payload.message }]);
                console.log("AI message added to messages:", data.response || data.payload.message);
                setMissingFields([]); // Clear missing fields if any
            } else if (data.missingFields && data.missingFields.length > 0) {
                // Handle missing fields
                setMessages((prev) => [
                    ...prev,
                    { type: "ai", text: data.message },
                ]);
                console.log("AI is requesting additional details:", data.missingFields);
                setMissingFields(data.missingFields);
            }
        } catch (error) {
            console.error("Error sending message to AI:", error);
            setMessages((prev) => [
                ...prev,
                { type: "ai", text: "Yikes! Something went wrong. Please try again later. 🌈" },
            ]);
        }
    };

    // Automatically ask for missing details if `missingFields` is set
    useEffect(() => {
        if (missingFields.length > 0) {
            let promptMessage = "Please provide the following details: ";
            promptMessage += missingFields.join(", ");
            setMessages((prev) => [
                ...prev,
                { type: "ai", text: promptMessage },
            ]);
            console.log("Missing fields prompt:", promptMessage);
        }
    }, [missingFields]);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const clearChat = () => {
        console.log("Clearing chat...");
        setMessages([]);
        localStorage.removeItem("chatMessages");
        console.log("Chat cleared and localStorage updated.");
    };

    return (
        <div className="chat-container">
            <div className="chat-messages">
                {messages.map((msg, i) => (
                    <Message key={i} severity={msg.type === "ai" ? "info" : "success"} text={msg.text} />
                ))}
            </div>
            <div className="chat-input">
                <InputTextarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    rows={3}
                    placeholder="Type here to chat... 😊"
                    onKeyDown={handleKeyPress}
                />
                <Button label="Send" onClick={sendMessage} />
                <Button label="Clear Chat" onClick={clearChat} className="p-button-danger" />
            </div>
        </div>
    );
};

export default ChatPage;
