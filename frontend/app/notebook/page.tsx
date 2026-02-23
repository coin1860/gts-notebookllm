"use client";

import DashboardLayout from '../components/DashboardLayout';
import { useState } from 'react';
import { api } from '../../lib/api';

export default function NotebookPage() {
  const [documents, setDocuments] = useState<any[]>([]); // To be populated by search/ingest
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');

  const refreshDocs = async () => {
    try {
        const results = await api.searchDocs("requirements strategy");
        setDocuments(results.map(r => ({
            title: r.source.split('/').pop() || 'Document',
            source: r.source,
            summary: r.content.substring(0, 100) + '...'
        })));
    } catch (e) {
        console.error("Search failed", e);
    }
  };

  const importData = async () => {
    setLoading(true);
    try {
        // Trigger ingestion
        await api.importRequirements("default-workspace", "requirements");
        // Refresh the list
        await refreshDocs();
    } catch (e) {
        console.error("Import failed", e);
        alert("Import failed. Check console.");
    } finally {
        setLoading(false);
    }
  };

  // Initial load? Maybe not needed for MVP as list starts empty

  const sendMessage = async () => {
    if (!currentMessage) return;
    const msg = currentMessage;
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setCurrentMessage('');

    try {
        const response = await api.chatWithAgent(msg);
        setMessages(prev => [...prev, {
            role: 'assistant',
            content: response.response,
            sources: []
        }]);
    } catch (e) {
        console.error("Chat failed", e);
        setMessages(prev => [...prev, { role: 'assistant', content: "Error communicating with agent." }]);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-8rem)]">
        {/* Document List */}
        <div className="w-1/3 border-r border-gray-200 pr-6 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Knowledge Base</h2>
          <div className="space-y-4">
            {documents.length === 0 && (
                <p className="text-gray-500 text-sm italic">No documents found. Click import to fetch requirements.</p>
            )}
            {documents.map((doc, idx) => (
              <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md cursor-pointer transition-shadow">
                <h3 className="font-semibold text-hsbc-dark-gray">{doc.title}</h3>
                <p className="text-xs text-gray-500 mt-1">Source: {doc.source}</p>
                <p className="text-sm text-gray-600 mt-2 line-clamp-3">{doc.summary}</p>
              </div>
            ))}
          </div>
          <button
            onClick={importData}
            disabled={loading}
            className="mt-4 w-full border border-gray-300 rounded py-2 text-gray-600 hover:bg-gray-50 flex items-center justify-center"
          >
            {loading ? (
              <span className="animate-spin h-5 w-5 mr-3 border-b-2 border-gray-600 rounded-full"></span>
            ) : '+ Import More from Jira/Confluence'}
          </button>
        </div>

        {/* Chat / Preview */}
        <div className="flex-1 pl-6 flex flex-col">
          <div className="flex-1 bg-white rounded-lg border border-gray-200 p-6 overflow-y-auto mb-4">
            <div className="flex flex-col space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`self-${msg.role === 'user' ? 'end' : 'start'} max-w-[80%]`}>
                  <div className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-hsbc-red text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                    {msg.content}
                  </div>
                  {msg.role === 'assistant' && msg.sources && (
                    <p className="text-xs text-gray-500 mt-1 ml-1">Sources: {msg.sources.join(', ')}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask a question about your documents..."
              className="w-full border border-gray-300 rounded-lg pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-hsbc-red focus:border-transparent"
            />
            <button
              onClick={sendMessage}
              className="absolute right-3 top-3 text-hsbc-red hover:text-red-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
