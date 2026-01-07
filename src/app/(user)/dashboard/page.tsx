'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Ticket as TicketIcon } from 'lucide-react';

import DashboardLayout from '@/components/DashboardLayout';
import RatingModal from '@/components/RatingModal';
import ITSchedule from '@/components/ITSchedule';
import { Clock, AlertCircle } from 'lucide-react';

import { User, Ticket } from '@/types';

export default function UserDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [ratingTicket, setRatingTicket] = useState<Ticket | null>(null);

    useEffect(() => {
        const session = localStorage.getItem('user_session');
        if (!session) {
            router.push('/login');
            return;
        }
        const userData = JSON.parse(session);
        setTimeout(() => setUser(userData), 0);

        fetch(`/api/tickets?userId=${userData.id}`)
            .then(res => res.json())
            .then(setTickets)
            .catch(err => console.error(err));
    }, [router]);

    const handleRatingSubmit = async (rating: number, feedback: string) => {
        if (!ratingTicket) return;
        try {
            await fetch('/api/tickets', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: ratingTicket.id,
                    rating,
                    feedback
                })
            });
            setTickets(tickets.map(t => t.id === ratingTicket.id ? { ...t, rating } : t));
            setRatingTicket(null);
            alert('Thank you for your feedback!');
        } catch (error) {
            console.error(error);
            alert('Failed to submit rating');
        }
    };

    if (!user) return <div className="min-h-screen flex items-center justify-center text-blue-600">Loading...</div>;

    const stats = [
        { label: 'Total Tickets', value: tickets.length, color: 'bg-blue-50 text-blue-700', icon: BookOpen },
        { label: 'Open Issues', value: tickets.filter(t => t.status === 'OPEN').length, color: 'bg-red-50 text-red-700', icon: AlertCircle },
        { label: 'In Progress', value: tickets.filter(t => t.status === 'IN_PROGRESS').length, color: 'bg-yellow-50 text-yellow-700', icon: Clock },
    ];

    return (
        <DashboardLayout role="USER">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                    <p className="text-gray-500">Welcome back, {user.name}</p>
                </div>
                <Link
                    href="/dashboard/report"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 font-medium"
                >
                    + Report Issue
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-0.5">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="font-bold text-lg text-gray-900">Recent Tickets</h2>
                </div>
                {tickets.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                            <TicketIcon size={32} className="text-gray-400" />
                        </div>
                        <p className="text-lg font-medium text-gray-900">No tickets found</p>
                        <p>Report an issue to get started.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50/50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4">Room</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Created</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {tickets.map(ticket => (
                                    <tr key={ticket.id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{ticket.title}</td>
                                        <td className="px-6 py-4 text-gray-600">{ticket.room?.name || 'N/A'}</td>
                                        <td className="px-6 py-4 text-gray-600">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {ticket.category || 'General'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${ticket.status === 'OPEN' ? 'bg-red-50 text-red-700 border-red-200' :
                                                ticket.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    'bg-green-50 text-green-700 border-green-200'
                                                }`}>
                                                {ticket.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">
                                            {new Date(ticket.createdAt).toLocaleDateString()}
                                            {ticket.status === 'RESOLVED' && !ticket.rating && (
                                                <button
                                                    onClick={() => setRatingTicket(ticket)}
                                                    className="ml-3 text-xs bg-yellow-400 text-yellow-900 px-2 py-1 rounded-md hover:bg-yellow-500 shadow-sm transition-transform active:scale-95"
                                                >
                                                    Rate Service
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="mb-8">
                <ITSchedule readOnly={true} />
            </div>

            {ratingTicket && (
                <RatingModal
                    isOpen={!!ratingTicket}
                    onClose={() => setRatingTicket(null)}
                    onSubmit={handleRatingSubmit}
                    ticketTitle={ratingTicket.title}
                />
            )}
        </DashboardLayout>
    );
}
