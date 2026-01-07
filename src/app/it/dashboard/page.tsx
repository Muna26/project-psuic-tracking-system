'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ITSchedule from '@/components/ITSchedule';
import DashboardLayout from '@/components/DashboardLayout';
import { Ticket, AlertCircle } from 'lucide-react';

type Ticket = {
    id: string;
    title: string;
    status: string;
    urgency: string;
    room: { name: string };
    createdAt: string;
};

export default function ITDashboard() {
    const [tickets, setTickets] = useState<Ticket[]>([]);

    useEffect(() => {
        fetch('/api/tickets').then(res => res.json()).then(setTickets);
    }, []);

    return (
        <DashboardLayout role="IT_STAFF">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">IT Support Dashboard</h1>
                <p className="text-gray-500">Manage tickets and schedules</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex justify-between items-center">
                    <div>
                        <p className="text-sm text-gray-500">Total Tickets</p>
                        <p className="text-2xl font-bold text-gray-900">{tickets.length}</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                        <Ticket size={20} />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-orange-100 shadow-sm flex justify-between items-center">
                    <div>
                        <p className="text-sm text-gray-500">Open Tickets</p>
                        <p className="text-2xl font-bold text-orange-600">{tickets.filter(t => t.status === 'OPEN').length}</p>
                    </div>
                    <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                        <AlertCircle size={20} />
                    </div>
                </div>
                {/* Add more stats if needed, or leave as is */}
            </div>

            <div className="flex flex-col gap-8">
                {/* Left Column - Active Jobs */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h2 className="font-bold text-gray-900">Active Jobs</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 text-xs text-gray-500 uppercase font-semibold">
                                <tr>
                                    <th className="p-4">Urgency</th>
                                    <th className="p-4">Issue</th>
                                    <th className="p-4">Location</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Created</th>
                                    <th className="p-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {tickets.map(ticket => (
                                    <tr key={ticket.id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${ticket.urgency === 'CRITICAL' || ticket.urgency === 'HIGH'
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {ticket.urgency}
                                            </span>
                                        </td>
                                        <td className="p-4 font-medium text-gray-900">{ticket.title}</td>
                                        <td className="p-4 text-gray-600">{ticket.room.name}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${ticket.status === 'OPEN' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                ticket.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    'bg-green-50 text-green-700 border-green-200'
                                                }`}>
                                                {ticket.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-500 text-sm">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                                        <td className="p-4">
                                            <Link href={`/it/ticket/${ticket.id}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm">Manage</Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {tickets.length === 0 && (
                        <div className="p-8 text-center text-gray-500">No tickets found.</div>
                    )}
                </div>

                {/* Bottom Row - Schedule */}
                <div>
                    <ITSchedule />
                </div>
            </div>
        </DashboardLayout>
    );
}
