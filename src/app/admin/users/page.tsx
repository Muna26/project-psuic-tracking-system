'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User } from '@/types';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/users')
            .then(res => res.json())
            .then(data => {
                setUsers(data as User[]);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    const updateRole = async (id: string, newRole: string) => {
        try {
            const res = await fetch('/api/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, role: newRole })
            });
            if (res.ok) {
                setUsers(users.map(u => u.id === id ? { ...u, role: newRole as User['role'] } : u));
                alert('Role updated');
            } else {
                alert('Failed to update role');
            }
        } catch (error) {
            console.error(error);
            alert('Error updating role');
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Manage Users</h1>
                <Link href="/admin/dashboard" className="text-gray-600 hover:text-gray-900">
                    ← Back to Dashboard
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Email</th>
                            <th className="px-6 py-3">Role</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium">{user.name}</td>
                                <td className="px-6 py-4 text-gray-600">{user.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold
                                        ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                                            user.role === 'IT_STAFF' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <select
                                        className="p-1 border rounded text-sm"
                                        value={user.role}
                                        onChange={(e) => updateRole(user.id, e.target.value)}
                                    >
                                        <option value="STUDENT">STUDENT</option>
                                        <option value="IT_STAFF">IT_STAFF</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
