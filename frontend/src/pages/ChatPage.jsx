import axios from 'axios';
import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';

function ChatPage() {
    const { id } = useParams();
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user ? user._id : null;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    // Fetch messages
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get(
                    `${backendUrl}/messages/${id}?currentUserId=${userId}`
                );
                setMessages(response.data);
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };

        fetchMessages();
        // Add interval to fetch messages periodically
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [id, userId]);
    // Send Message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await axios.post(`${backendUrl}/messages`, {
                sender: userId,
                receiver: id,
                text: newMessage
            });
            setNewMessage("");
            // Fetch updated messages
            const response = await axios.get(
                `${backendUrl}/messages/${id}?currentUserId=${userId}`
            );
            setMessages(response.data);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    return (
      <div className="chat-container flex flex-col h-screen">
      <div className="messages-container flex-grow overflow-y-auto p-4">
        {messages.map((message, index) => (
        <div 
          key={message._id || index} 
          className={`message flex ${
          message.sender._id === userId 
          ? 'justify-end' 
          : 'justify-start'
          } mb-4`}
        >
          <div className={`max-w-[70%] ${
          message.sender._id === userId
          ? 'bg-blue-500 text-white'
          : 'bg-gray-200 text-black'
          } rounded-lg p-3`}>
          <p>{message.text}</p>
          <small className={`text-sm ${
            message.sender._id === userId
            ? 'text-blue-100'
            : 'text-gray-600'
          }`}>{message.sender?.username}</small>
          </div>
        </div>
        ))}
      </div>

      <form onSubmit={handleSendMessage} className="message-form sticky bottom-0 bg-white p-4 border-t">
        <div className="max-w-4xl mx-auto flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow p-2 border rounded-lg"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg">Send</button>
        </div>
      </form>
      </div>
    )
}

export default ChatPage