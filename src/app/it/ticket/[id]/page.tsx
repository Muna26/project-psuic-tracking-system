'use client';

import { useState, useEffect, use } from 'react';
import { Ticket } from '@/types';
import Link from 'next/link';

export default function ITTicketDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(true);
    const [isResolving, setIsResolving] = useState(false);
    const [solution, setSolution] = useState('');
    const [afterPhoto, setAfterPhoto] = useState<string | null>(null);
    const [isScheduling, setIsScheduling] = useState(false);
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('');

    useEffect(() => {
        // Fetch ticket details
        // Note: We might need a specific API endpoint for single ticket or filter the list
        // For now, let's assume we can fetch all and filter, or a specific endpoint exists/we create it.
        // Let's rely on creating a specific endpoint /api/tickets/[id] ideally, 
        // but for speed, let's filter from the main list if the API supports it or just fetch all.
        // Better: Fetch specific. Let's try /api/tickets?id=... or assumes we need to update API.
        // The current API likely doesn't support single fetch seamlessly without checking code.
        // I will use /api/tickets?id={id} based on UserDashboard usage pattern which used query params.

        fetch(`/api/tickets?id=${id}`)
            .then(res => res.json())
            .then(data => {
                // API might return array or object depending on implementation. 
                // UserDashboard did `fetch(/api/tickets?userId=...)` and got array.
                if (Array.isArray(data)) {
                    setTicket(data[0]);
                } else {
                    setTicket(data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    const updateStatus = async (newStatus: string, extraData: Record<string, unknown> = {}) => {
        if (newStatus !== 'RESOLVED' && !confirm(`Change status to ${newStatus}?`)) return;

        try {
            const res = await fetch('/api/tickets', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus, ...extraData })
            });

            if (res.ok) {
                setTicket(prev => prev ? { ...prev, status: newStatus as Ticket['status'] } : null);
                if (newStatus === 'RESOLVED') setIsResolving(false);
                alert('Status updated successfully');
            } else {
                alert('Failed to update status');
            }
        } catch (error) {
            console.error(error);
            alert('Error updating status');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAfterPhoto(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleResolveSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateStatus('RESOLVED', { solution, photo: afterPhoto });
    };

    const handleScheduleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!scheduleDate || !scheduleTime) return alert('Please select date and time');
        if (!ticket) return;

        const start = new Date(`${scheduleDate}T${scheduleTime}`);
        const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour slot by default

        try {
            // Create Schedule
            await fetch('/api/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    startTime: start.toISOString(),
                    endTime: end.toISOString(),
                    type: 'SERVICE_JOB',
                    details: `Fixing Ticket #${ticket.id}: ${ticket.title}`
                })
            });

            // Update Ticket Status
            updateStatus('SCHEDULED');
            setIsScheduling(false);
        } catch (error) {
            console.error(error);
            alert('Failed to schedule');
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (!ticket) return <div className="p-8">Ticket not found</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <Link href="/it/dashboard" className="text-gray-500 hover:text-gray-900 mb-4 inline-block">
                ← Back to Dashboard
            </Link>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{ticket.title}</h1>
                        <p className="text-gray-500 mt-1">Ticket ID: {ticket.id}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold 
                        ${ticket.status === 'OPEN' ? 'bg-red-100 text-red-800' :
                            ticket.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'}`}>
                        {ticket.status}
                    </span>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Issue Details</h3>
                        <div className="space-y-3">
                            <div>
                                <span className="text-gray-600 block text-sm">Description:</span>
                                <p className="text-gray-900 mt-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    {ticket.description}
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-600 block text-sm">Category:</span>
                                <p className="text-gray-900 font-medium">{ticket.category || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="text-gray-600 block text-sm">Problem Type:</span>
                                <p className="text-gray-900 font-medium">{ticket.problemType || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="text-gray-600 block text-sm">Urgency:</span>
                                <p className={`font-medium ${ticket.urgency === 'CRITICAL' ? 'text-red-600' : 'text-gray-900'}`}>
                                    {ticket.urgency}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Location & Contact</h3>
                        <div className="space-y-3">
                            <div>
                                <span className="text-gray-600 block text-sm">Room:</span>
                                <p className="text-gray-900 font-medium">{ticket.room?.name || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="text-gray-600 block text-sm">Reported By:</span>
                                <p className="text-gray-900 font-medium">{ticket.createdBy?.name || 'Unknown'}</p>
                            </div>
                            <div>
                                <span className="text-gray-600 block text-sm">Date Reported:</span>
                                <p className="text-gray-900">{new Date(ticket.createdAt).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Actions</h3>
                            <div className="flex flex-col gap-2">
                                {ticket.status === 'OPEN' && (
                                    <>
                                        <button
                                            onClick={() => updateStatus('IN_PROGRESS')}
                                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                                        >
                                            Accept Job & Start Reparing
                                        </button>
                                        <button
                                            onClick={() => setIsScheduling(true)}
                                            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition font-medium"
                                        >
                                            Schedule Appointment
                                        </button>
                                    </>
                                )}
                                {ticket.status === 'IN_PROGRESS' && (
                                    <>
                                        <button
                                            onClick={() => setIsResolving(true)}
                                            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-medium"
                                        >
                                            Mark as Resolved
                                        </button>
                                        <button
                                            onClick={() => updateStatus('CANCELLED')}
                                            className="w-full bg-red-100 text-red-700 py-2 rounded-lg hover:bg-red-200 transition font-medium"
                                        >
                                            Reject / Cancel Job
                                        </button>
                                    </>
                                )}
                                {ticket.status === 'RESOLVED' && (
                                    <button
                                        onClick={() => updateStatus('OPEN')}
                                        className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
                                    >
                                        Re-open Ticket
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {
                isResolving && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-8 max-w-md w-full">
                            <h2 className="text-xl font-bold mb-4">Complete Job</h2>
                            <form onSubmit={handleResolveSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Solution Details</label>
                                    <textarea
                                        required
                                        className="w-full p-2 border rounded-lg"
                                        rows={4}
                                        placeholder="What did you create?"
                                        value={solution}
                                        onChange={e => setSolution(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Proof Photo (Optional)</label>
                                    <input type="file" onChange={handleFileChange} />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsResolving(false)}
                                        className="flex-1 py-2 text-gray-600 bg-gray-100 rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
                                    >
                                        Confirm Resolved
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {isScheduling && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Schedule Service</h2>
                        <form onSubmit={handleScheduleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full p-2 border rounded-lg"
                                    value={scheduleDate}
                                    onChange={e => setScheduleDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Time</label>
                                <input
                                    type="time"
                                    required
                                    className="w-full p-2 border rounded-lg"
                                    value={scheduleTime}
                                    onChange={e => setScheduleTime(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsScheduling(false)}
                                    className="flex-1 py-2 text-gray-600 bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700"
                                >
                                    Confirm Schedule
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div >
    );
}
