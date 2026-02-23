'use client';

import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';

export default function CodingPage() {
  const [messages, setMessages] = useState([
    {
      role: 'agent',
      content: 'I am ready. I have analyzed the project structure and requirements. What should we implement first?',
    },
  ]);

  const tasks = [
    { title: 'Project Initialization', status: 'completed' },
    { title: 'Market Data Module Implementation', status: 'current' },
    { title: 'Account Module Implementation', status: 'pending' },
    { title: 'Strategy Module Implementation', status: 'pending' },
    { title: 'Trading Engine Implementation', status: 'pending' },
  ];

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-8rem)] gap-6">
        {/* Left: Chat & Plan */}
        <div className="w-1/3 flex flex-col space-y-6">
          {/* Plan View */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">Implementation Plan</h3>
            <ul className="space-y-3">
              {tasks.map((task, idx) => (
                <li key={idx} className="flex items-center space-x-3 text-sm">
                  {task.status === 'completed' && (
                    <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center">✓</span>
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
             </div>
             <div className="p-3 bg-white border-t border-gray-200">
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-hsbc-red focus:border-hsbc-red" 
                  placeholder="Type a command..." 
                />
             </div>
          </div>
        </div>

        {/* Right: Terminal / Output */}
        <div className="flex-1 bg-[#1e1e1e] rounded-lg shadow-lg flex flex-col overflow-hidden font-mono text-xs">
          <div className="bg-[#2d2d2d] px-4 py-2 flex items-center justify-between border-b border-[#3e3e3e]">
            <span className="text-gray-300">Terminal - Output</span>
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
          </div>
          <div className="flex-1 p-4 text-green-400 overflow-y-auto space-y-1">
            <p className="text-gray-500">$ python3 -m unittest tests/test_market_data.py</p>
            <p>Running tests...</p>
            <p>test_get_price (tests.test_market_data.TestMarketData) ... ok</p>
            <p>test_subscribe (tests.test_market_data.TestMarketData) ... FAIL</p>
            <br/>
            <p className="text-red-400">FAIL: test_subscribe (tests.test_market_data.TestMarketData)</p>
            <p className="text-red-400">AssertionError: Callback not triggered for symbol 'AAPL'</p>
            <br/>
            <p className="text-yellow-400">Agent: Analyzing failure... Attempting fix in src/market_data.py...</p>
            <p className="text-gray-500">$ git add src/market_data.py</p>
            <p className="text-gray-500">$ git commit -m "Fix subscription callback logic"</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
