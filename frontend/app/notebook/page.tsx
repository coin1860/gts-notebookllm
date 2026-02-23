import DashboardLayout from '../components/DashboardLayout';

export default function NotebookPage() {
  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-8rem)]">
        {/* Document List */}
        <div className="w-1/3 border-r border-gray-200 pr-6 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Knowledge Base</h2>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md cursor-pointer transition-shadow">
              <h3 className="font-semibold text-hsbc-dark-gray">Market Data Requirements</h3>
              <p className="text-xs text-gray-500 mt-1">Source: Jira (TRD-101)</p>
              <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                The Market Data Module is responsible for ingesting, parsing, and normalizing market data feeds...
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md cursor-pointer transition-shadow">
              <h3 className="font-semibold text-hsbc-dark-gray">SMA Strategy Logic</h3>
              <p className="text-xs text-gray-500 mt-1">Source: Confluence (TE-Strategy)</p>
              <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                Implementation details for Simple Moving Average strategy, including window size and crossover logic...
              </p>
            </div>
          </div>
          <button className="mt-4 w-full border border-gray-300 rounded py-2 text-gray-600 hover:bg-gray-50">
            + Import More
          </button>
        </div>

        {/* Chat / Preview */}
        <div className="flex-1 pl-6 flex flex-col">
          <div className="flex-1 bg-white rounded-lg border border-gray-200 p-6 overflow-y-auto mb-4">
            <div className="flex flex-col space-y-4">
              <div className="self-end bg-hsbc-red text-white p-3 rounded-lg rounded-tr-none max-w-[80%]">
                <p>What are the requirements for the Market Data module?</p>
              </div>
              <div className="self-start bg-gray-100 text-gray-800 p-3 rounded-lg rounded-tl-none max-w-[80%]">
                <p className="font-semibold mb-1 text-xs text-gray-500">Based on 2 sources</p>
                <p>The Market Data Module must ingest and normalize data feeds. Specifically:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Implement `MarketDataProvider` interface.</li>
                  <li>Support `get_price(symbol)` and `subscribe(symbol, callback)`.</li>
                  <li>Must handle simulated `CSVFeed`.</li>
                  <li>Must raise `SymbolNotFoundException` for invalid inputs.</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <input 
              type="text" 
              placeholder="Ask a question about your documents..." 
              className="w-full border border-gray-300 rounded-lg pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-hsbc-red focus:border-transparent"
            />
            <button className="absolute right-3 top-3 text-hsbc-red hover:text-red-700">
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
