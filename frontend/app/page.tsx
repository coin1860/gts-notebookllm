"use client";

import DashboardLayout from './components/DashboardLayout';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [repoUrl, setRepoUrl] = useState('/app/simulated_repo_origin');

  const createWorkspace = async () => {
    if (!workspaceName) return;
    setLoading(true);

    try {
      // In a real app, this would be a fetch call to the backend
      // await fetch('http://localhost:8000/workspace', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name: workspaceName, repo_url: repoUrl })
      // });

      // Simulate success for MVP without needing live backend
      setTimeout(() => {
        router.push('/notebook');
      }, 1000);

    } catch (error) {
      console.error('Failed to create workspace', error);
      alert('Failed to create workspace');
    } finally {
      setLoading(false);
    }
  };

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
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
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
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-hsbc-red focus:border-hsbc-red"
                placeholder="https://github.com/hsbc/trading-engine.git"
              />
              <p className="text-xs text-gray-500 mt-1">
                For this MVP, we are simulating a remote repository at <code>/app/simulated_repo_origin</code>.
              </p>
            </div>
            <button
              onClick={createWorkspace}
              disabled={loading || !workspaceName}
              className={`px-6 py-2 rounded text-white transition-colors ${loading || !workspaceName ? 'bg-gray-400' : 'bg-hsbc-dark-gray hover:bg-black'}`}
            >
              {loading ? 'Connecting...' : 'Verify & Connect'}
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
            <button
              disabled={true}
              className="bg-gray-300 text-white px-6 py-2 rounded w-full cursor-not-allowed"
            >
              Create Workspace (Connect Repo First)
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
