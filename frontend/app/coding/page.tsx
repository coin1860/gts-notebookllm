"use client";

import DashboardLayout from '../components/DashboardLayout';
import { useState, useRef, useEffect } from 'react';
import { api } from '../../lib/api';

export default function CodingPage() {
  const [messages, setMessages] = useState([
    {
      role: 'agent',
      content: 'I am ready. I have analyzed the project structure and requirements. What should we implement first?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [tasks, setTasks] = useState([
    { title: 'Project Initialization', status: 'completed' },
    { title: 'Market Data Module Implementation', status: 'pending' },
    { title: 'Account Module Implementation', status: 'pending' },
    { title: 'Strategy Module Implementation', status: 'pending' },
    { title: 'Trading Engine Implementation', status: 'pending' },
  ]);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    '$ Initialized workspace environment.',
    '$ Connected to simulated_repo_origin.',
  ]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [prLink, setPrLink] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsProcessing(true);

    try {
        const result = await api.executeTask(userMsg);

        // Update logs
        if (result.logs && Array.isArray(result.logs)) {
            setTerminalOutput(result.logs);
        } else if (result.logs) {
             setTerminalOutput([result.logs]);
        }

        // Check for PR
        if (result.pr_url) {
            setPrLink(result.pr_url);
            setShowReviewModal(true);
        }

        setMessages(prev => [...prev, {
            role: 'agent',
            content: result.message
        }]);

    } catch (e) {
        setTerminalOutput(prev => [...prev, `Error: ${e}`]);
        setMessages(prev => [...prev, {
            role: 'agent',
            content: "I encountered an error executing the task."
        }]);
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-8rem)] gap-6 relative">
        {/* Review Modal */}
        {showReviewModal && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full border-t-4 border-green-500 animate-in fade-in zoom-in duration-300">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-green-100 p-2 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Ready for Review</h3>
              </div>
              <p className="text-gray-600 mb-6">
                The agent has successfully implemented the task and all tests passed. A Pull Request has been created.
              </p>
              <div className="bg-gray-50 p-3 rounded border border-gray-200 mb-6 text-sm break-all font-mono text-blue-600">
                <a href={prLink} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {prLink}
                </a>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Dismiss
                </button>
                <a
                  href={prLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-hsbc-red text-white rounded hover:bg-red-700 transition-colors"
                >
                  View PR
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Left: Chat & Plan */}
        <div className="w-1/3 flex flex-col space-y-6">
          {/* Plan View */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">Implementation Plan</h3>
            <ul className="space-y-3">
              {tasks.map((task, idx) => (
                <li key={idx} className="flex items-center space-x-3 text-sm">
                  {task.status === 'completed' && (
                    <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold">✓</span>
                  )}
                  {task.status === 'current' && (
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center border border-blue-200 animate-pulse">●</span>
                  )}
                  {task.status === 'pending' && (
                    <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">○</span>
                  )}
                  <span className={`${task.status === 'completed' ? 'text-gray-400 line-through' : task.status === 'current' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                    {task.title}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Chat Interface */}
          <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-hsbc-red text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 text-gray-500 p-3 rounded-lg rounded-bl-none shadow-sm text-sm italic">
                    Thinking and coding...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-3 bg-white border-t border-gray-200">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={isProcessing}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-hsbc-red focus:border-hsbc-red disabled:bg-gray-100"
                placeholder="Type a command (e.g., 'Implement Market Data Module')..."
              />
            </div>
          </div>
        </div>

        {/* Right: Terminal / Output */}
        <div className="flex-1 bg-[#1e1e1e] rounded-lg shadow-lg flex flex-col overflow-hidden font-mono text-xs border border-gray-700">
          <div className="bg-[#2d2d2d] px-4 py-2 flex items-center justify-between border-b border-[#3e3e3e]">
            <span className="text-gray-300">Terminal - Output</span>
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-1 font-mono">
            {terminalOutput.map((line, idx) => (
              <p key={idx} className={`${line.includes('FAIL') || line.includes('Error') ? 'text-red-400' :
                  line.includes('Agent') ? 'text-yellow-400' :
                    line.startsWith('$') ? 'text-gray-500' : 'text-green-400'
                }`}>
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
