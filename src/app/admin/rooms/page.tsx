'use client';

import { useState, useEffect } from 'react';
import { Room } from '@/types';
import Link from 'next/link';

export default function AdminRoomsPage() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [newName, setNewName] = useState('');
    const [newFloor, setNewFloor] = useState('');
    const [newBuilding, setNewBuilding] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        const res = await fetch('/api/rooms');
        const data = await res.json();
        setRooms(data);
    };

    const handleAddRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/rooms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newName,
                    floor: newFloor,
                    building: newBuilding
                })
            });

            if (res.ok) {
                setNewName('');
                setNewFloor('');
                setNewBuilding('');
                fetchRooms();
            } else {
                alert('Failed to add room');
            }
        } catch (error) {
            console.error(error);
            alert('Error adding room');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
                        <p className="text-gray-500">Add and manage rooms for equipment repairs</p>
                    </div>
                    <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-800">
                        ← Back to Dashboard
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Add Room Form */}
                    <div className="md:col-span-1">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-8">
                            <h2 className="text-lg font-bold mb-4 text-gray-800">Add New Room</h2>
                            <form onSubmit={handleAddRoom} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newName}
                                        onChange={e => setNewName(e.target.value)}
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="e.g. Lab 101"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Floor (Optional)</label>
                                    <input
                                        type="text"
                                        value={newFloor}
                                        onChange={e => setNewFloor(e.target.value)}
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="e.g. 1st Floor"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Building (Optional)</label>
                                    <input
                                        type="text"
                                        value={newBuilding}
                                        onChange={e => setNewBuilding(e.target.value)}
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="e.g. Building 2"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                                >
                                    {loading ? 'Adding...' : 'Add Room'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Room List */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                <h2 className="font-bold text-gray-800">Room List ({rooms.length})</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                                        <tr>
                                            <th className="px-6 py-3">Name</th>
                                            <th className="px-6 py-3">Location</th>
                                            <th className="px-6 py-3">Equipment Count</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {rooms.map((room) => (
                                            <tr key={room.id} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4 font-medium text-gray-900">{room.name}</td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {room.building && `${room.building}`}
                                                    {room.floor && `, ${room.floor}`}
                                                    {!room.building && !room.floor && '-'}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {room.equipment?.length || 0} items
                                                </td>
                                            </tr>
                                        ))}
                                        {rooms.length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                                    No rooms found. Add one to get started.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
