import DashboardLayout from '../components/DashboardLayout';
import { useState } from 'react';

export default function NotebookPage() {
  const [documents, setDocuments] = useState([
    {
      title: 'Market Data Requirements',
      source: 'Jira (TRD-101)',
      summary: 'The Market Data Module is responsible for ingesting, parsing, and normalizing market data feeds...'
    },
    {
      title: 'SMA Strategy Logic',
      source: 'Confluence (TE-Strategy)',
      summary: 'Implementation details for Simple Moving Average strategy, including window size and crossover logic...'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { role: 'user', content: 'What are the requirements for the Market Data module?' },
    { 
      role: 'assistant', 
      content: 'The Market Data Module must ingest and normalize data feeds. Specifically: Implement `MarketDataProvider` interface, Support `get_price(symbol)` and `subscribe(symbol, callback)`, Must handle simulated `CSVFeed`, Must raise `SymbolNotFoundException` for invalid inputs.',
      sources: ['Market Data Requirements']
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');

  const importData = async () => {
    setLoading(true);
    // Simulate backend fetch
    setTimeout(() => {
      setDocuments([...documents, {
        title: 'Account Module Requirements',
        source: 'Jira (TRD-102)',
        summary: 'Manages user accounts, balances, and positions. Must handle deposits, withdrawals, and updates.'
      }]);
      setLoading(false);
    }, 1500);
  };

  const sendMessage = async () => {
    if (!currentMessage) return;
    const msg = currentMessage;
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setCurrentMessage('');
    
    // Simulate RAG response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Based on the knowledge base, I found relevant information regarding your query...',
        sources: ['Market Data Requirements']
      }]);
    }, 1000);
  };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-8rem)]">
        {/* Document List */}
        <div className="w-1/3 border-r border-gray-200 pr-6 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Knowledge Base</h2>
          <div className="space-y-4">
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
