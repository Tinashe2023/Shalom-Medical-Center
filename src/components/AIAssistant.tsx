import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

interface AIAssistantProps {
    welcomeMessage?: string;
}

export function AIAssistant({ welcomeMessage }: AIAssistantProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Check AI status when component mounts
    useEffect(() => {
        checkAIStatus();
    }, []);

    const checkAIStatus = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('http://localhost:8080/api/ai/status', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setIsConnected(data.connected);
            if (!data.connected) {
                setError(data.message);
            }
        } catch (err) {
            console.error('Failed to check AI status:', err);
            setIsConnected(false);
            setError('Failed to connect to AI service');
        }
    };

    const sendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage: Message = {
            role: 'user',
            content: inputMessage,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('http://localhost:8080/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message: inputMessage })
            });

            const data = await response.json();

            if (data.success) {
                const assistantMessage: Message = {
                    role: 'assistant',
                    content: data.message,
                    timestamp: data.timestamp
                };
                setMessages(prev => [...prev, assistantMessage]);
                setIsConnected(true);
            } else {
                setError(data.error || 'Failed to get response');
                setIsConnected(false);
            }
        } catch (err) {
            console.error('Failed to send message:', err);
            setError('Failed to send message. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const clearHistory = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            await fetch('http://localhost:8080/api/ai/chat/history', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setMessages([]);
            setError(null);
        } catch (err) {
            console.error('Failed to clear history:', err);
        }
    };

    return (
        <>
            {/* Floating Chat Button */}
            {!isOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-110 z-50"
                    size="icon"
                >
                    <MessageCircle className="h-6 w-6 text-white" />
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                </Button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl flex flex-col z-50 border-2 border-purple-200 dark:border-purple-800 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5" />
                            <div>
                                <h3 className="font-semibold">AI Assistant</h3>
                                <p className="text-xs text-blue-100">
                                    {isConnected ? 'Online' : 'Offline'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {messages.length > 0 && (
                                <Button
                                    onClick={clearHistory}
                                    variant="ghost"
                                    size="sm"
                                    className="text-white hover:bg-white/20 text-xs h-7"
                                >
                                    Clear
                                </Button>
                            )}
                            <Button
                                onClick={() => setIsOpen(false)}
                                variant="ghost"
                                size="icon"
                                className="text-white hover:bg-white/20 h-8 w-8"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Messages Area - Fixed with proper overflow */}
                    <div className="flex-1 overflow-hidden">
                        <ScrollArea className="h-full">
                            <div className="p-4 bg-gray-50 dark:bg-gray-900">
                                {messages.length === 0 && (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        <Sparkles className="h-12 w-12 mx-auto mb-3 text-purple-400" />
                                        <p className="text-sm font-medium mb-2">Welcome to AI Assistant</p>
                                        <p className="text-xs px-4">
                                            {welcomeMessage || 'Ask me anything about your appointments, medical records, or hospital services!'}
                                        </p>
                                    </div>
                                )}

                                {messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-lg p-3 ${msg.role === 'user'
                                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
                                                }`}
                                        >
                                            <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                                            <p
                                                className={`text-xs mt-1 ${msg.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                                                    }`}
                                            >
                                                {new Date(msg.timestamp).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {isLoading && (
                                    <div className="flex justify-start mb-4">
                                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                                            <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1">
                                                <p className="text-sm text-red-800 dark:text-red-200 font-medium">Error</p>
                                                <p className="text-xs text-red-600 dark:text-red-300 mt-1">{error}</p>
                                                {!isConnected && (
                                                    <Button
                                                        onClick={checkAIStatus}
                                                        variant="outline"
                                                        size="sm"
                                                        className="mt-2 text-xs h-7"
                                                    >
                                                        Retry Connection
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                        <div className="flex gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                disabled={isLoading || !isConnected}
                                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <Button
                                onClick={sendMessage}
                                disabled={isLoading || !inputMessage.trim() || !isConnected}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
                                size="icon"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        {!isConnected && (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                                AI service is offline. Please ensure LMStudio is running.
                            </p>
                        )}
                    </div>
                </Card>
            )}
        </>
    );
}
