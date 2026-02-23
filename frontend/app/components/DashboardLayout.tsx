import Link from 'next/link';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-hsbc-dark-gray text-white flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-white">
            <span className="text-hsbc-red">AI</span> Agent
          </h1>
          <p className="text-xs text-gray-400 mt-1">Investment Banking IT</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/" className="block px-4 py-2 rounded hover:bg-gray-700 transition-colors">
            Workspaces
          </Link>
          <Link href="/notebook" className="block px-4 py-2 rounded hover:bg-gray-700 transition-colors">
            Notebook (Knowledge)
          </Link>
          <Link href="/coding" className="block px-4 py-2 rounded hover:bg-gray-700 transition-colors">
            Jules (Coding Agent)
          </Link>
        </nav>
        
        <div className="p-4 border-t border-gray-700 text-xs text-gray-400">
          &copy; 2024 HSBC Internal
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center px-8 justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Workspace</h2>
          <div className="flex items-center space-x-4">
             <div className="w-8 h-8 rounded-full bg-hsbc-red text-white flex items-center justify-center font-bold">
               U
             </div>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
