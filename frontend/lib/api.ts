const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Workspace {
  id: string;
  name: string;
  repo_url: string;
  status: string;
}

export interface SearchResult {
  source: string;
  content: string;
  relevance: number;
}

export interface ChatResponse {
  response: string;
  thread_id: string;
}

export const api = {
  createWorkspace: async (name: string, repo_url: string): Promise<Workspace> => {
    const response = await fetch(`${API_URL}/workspace`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, repo_url }),
    });
    if (!response.ok) throw new Error('Failed to create workspace');
    return response.json();
  },

  searchDocs: async (query: string): Promise<SearchResult[]> => {
    const response = await fetch(`${API_URL}/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to search documents');
    return response.json();
  },

  importRequirements: async (workspaceId: string, query: string): Promise<any> => {
    const response = await fetch(`${API_URL}/import-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspace_id: workspaceId, query: query })
    });
    if (!response.ok) throw new Error('Failed to import requirements');
    return response.json();
  },

  chatWithAgent: async (message: string, thread_id?: string): Promise<ChatResponse> => {
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, thread_id }),
    });
    if (!response.ok) throw new Error('Failed to chat with agent');
    return response.json();
  },

  executeTask: async (task: string): Promise<any> => {
    const response = await fetch(`${API_URL}/task`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task }),
    });
    if (!response.ok) throw new Error('Failed to execute task');
    return response.json();
  },
};
