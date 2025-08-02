import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, ChatBubbleOvalLeftEllipsisIcon, XMarkIcon } from '@heroicons/react/24/solid';
import MarkdownIt from 'markdown-it';
const md = new MarkdownIt();


const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hello! I'm GroqBot. Ask me about your tickets or other info. For example, try 'Show me my open tickets'.", sender: 'bot' }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatboxRef = useRef(null);

    // Automatically scroll to the latest message
    useEffect(() => {
        chatboxRef.current?.scrollTo(0, chatboxRef.current.scrollHeight);
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!userInput.trim()) return;

        const newUserMessage = { text: userInput, sender: 'user' };
        setMessages(prev => [...prev, newUserMessage]);
        setUserInput('');
        setIsLoading(true);

        try {
            // IMPORTANT: Retrieve the auth token from where you store it (e.g., localStorage, context)
            const token = localStorage.getItem('authToken'); 

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message: userInput }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to get response');
            }

            const data = await response.json();
            setMessages(prev => [...prev, { text: data.message, sender: 'bot' }]);

        } catch (error) {
            setMessages(prev => [...prev, { text: `Error: ${error.message}`, sender: 'bot' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-5 right-5 z-50">
            {/* Chat Modal Window */}
            <div className={`transition-transform transition-opacity duration-300 ease-in-out ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
                <div className="flex flex-col w-96 h-[600px] bg-white rounded-xl shadow-lg border border-gray-200"> {/* Adjusted shadow */}
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 bg-[#504ee2] text-white rounded-t-xl"> {/* Blue theme color */}
                        <h3 className="text-lg font-medium">GroqBot Assistant</h3> {/* Reduced font weight */}
                        <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-[#433ed1]"> {/* Darker blue on hover */}
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div ref={chatboxRef} className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3"> {/* Adjusted spacing */}
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`prose rounded-xl px-4 py-2 max-w-xs ${msg.sender === 'user' ? 'bg-[#504ee2] text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}
                                    dangerouslySetInnerHTML={{ __html: md.render(msg.text) }}
                                />
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-200 rounded-xl px-4 py-2 rounded-bl-none"> {/* Rounded-xl for consistency */}
                                    <div className="flex items-center space-x-1">
                                        <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse"></div> {/* Darker gray dots */}
                                        <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                                        <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Form */}
                    <form onSubmit={handleSendMessage} className="flex items-center p-3 border-t border-gray-200">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Ask me anything..."
                            className="flex-1 px-4 py-2 text-gray-800 bg-gray-100 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-[#504ee2]"
                            disabled={isLoading}
                        />
                        <button type="submit" className="ml-3 p-3 text-white bg-[#504ee2] rounded-full hover:bg-[#433ed1] disabled:bg-gray-400" disabled={isLoading}> {/* Blue theme for button */}
                            <PaperAirplaneIcon className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-4 text-white bg-[#504ee2] rounded-full shadow-md hover:bg-[#433ed1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#504ee2] transition-transform duration-200 ${isOpen ? 'scale-0' : 'scale-100'}`}
            >
                <ChatBubbleOvalLeftEllipsisIcon className="w-8 h-8" />
            </button>
        </div>
    );
};

export default Chatbot;