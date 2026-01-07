'use client';

import { useState, useEffect } from 'react';

type KBItem = {
    id: string;
    title: string;
    content: string;
    type: string;
    tags: string | null;
};

export default function KnowledgeBasePage() {
    const [items, setItems] = useState<KBItem[]>([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('');

    useEffect(() => {
        const fetchItems = async () => {
            const params = new URLSearchParams();
            if (search) params.append('q', search);
            if (filter) params.append('type', filter);

            const res = await fetch(`/api/knowledge-base?${params.toString()}`);
            if (res.ok) {
                setItems(await res.json());
            }
        };

        // Debounce or just run? For now just run on effect
        const timeout = setTimeout(fetchItems, 300);
        return () => clearTimeout(timeout);
    }, [search, filter]);

    return (
        <div className="max-w-4xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Knowledge Base</h1>

            <div className="flex gap-4 mb-8">
                <input
                    type="text"
                    placeholder="Search how-to, FAQ..."
                    className="flex-1 p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select
                    className="p-3 border rounded-lg shadow-sm bg-white"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="">All Types</option>
                    <option value="FAQ">FAQ</option>
                    <option value="GUIDE">Guide</option>
                    <option value="VIDEO">Video</option>
                </select>
            </div>

            <div className="grid gap-4">
                {items.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No articles found. Try a different search.</p>
                ) : (
                    items.map((item) => (
                        <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${item.type === 'FAQ' ? 'bg-blue-100 text-blue-800' :
                                        item.type === 'VIDEO' ? 'bg-red-100 text-red-800' :
                                            'bg-green-100 text-green-800'
                                    }`}>
                                    {item.type}
                                </span>
                            </div>
                            <p className="text-gray-600 line-clamp-2">{item.content}</p>
                            {item.tags && (
                                <div className="mt-3 flex gap-2">
                                    {item.tags.split(',').map(tag => (
                                        <span key={tag} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                            #{tag.trim()}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
