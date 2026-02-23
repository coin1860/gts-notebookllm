import DashboardLayout from './components/DashboardLayout';

export default function Home() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-800">Create New Workspace</h1>
        <p className="text-gray-600">
          Start by connecting a GitHub repository and your knowledge sources.
        </p>
        
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-hsbc-red">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">1. Repository Connection</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Workspace Name
              </label>
              <input 
                type="text" 
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-hsbc-red focus:border-hsbc-red"
                placeholder="e.g., Trading Engine MVP" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GitHub Repository URL (or Local Path)
              </label>
              <input 
                type="text" 
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-hsbc-red focus:border-hsbc-red"
                placeholder="https://github.com/hsbc/trading-engine.git" 
                defaultValue="/app/simulated_repo_origin"
              />
              <p className="text-xs text-gray-500 mt-1">
                For this MVP, we are simulating a remote repository at <code>/app/simulated_repo_origin</code>.
              </p>
            </div>
            <button className="bg-hsbc-dark-gray text-white px-6 py-2 rounded hover:bg-black transition-colors">
              Verify & Connect
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-gray-300">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">2. Knowledge Sources</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jira Project Key
                </label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                  placeholder="e.g., TRD-ENG" 
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confluence Space Key
                </label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                  placeholder="e.g., TE" 
                />
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
               <p className="text-sm text-gray-600 mb-2">Or upload documents manually (PDF, TXT, MD)</p>
               <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 cursor-pointer">
                 <p className="text-gray-500">Drag and drop files here, or click to browse</p>
               </div>
            </div>
             <button className="bg-hsbc-red text-white px-6 py-2 rounded hover:bg-red-700 transition-colors w-full">
              Create Workspace
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
