'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Room = {
    id: string;
    name: string;
    equipment: { id: string; name: string }[];
};

export default function ReportIssuePage() {
    const router = useRouter();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [selectedRoomId, setSelectedRoomId] = useState('');
    const [selectedEquipmentId, setSelectedEquipmentId] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [problemType, setProblemType] = useState('');
    const [urgency, setUrgency] = useState('LOW');
    const [photo, setPhoto] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const PROBLEM_TYPES = {
        Hardware: ['CPU Missing', 'Mouse Broken', 'Monitor Flicker', 'Keyboard Issue', 'Printer Error'],
        Software: ['Cannot Login', 'Program Crash', 'OS Error', 'License Expired'],
        Network: ['No Internet', 'Slow Connection', 'Wifi Signal Weak'],
        Environment: ['Air Conditioner', 'Lighting', 'Chair/Desk', 'Water Leak']
    };

    useEffect(() => {
        fetch('/api/rooms').then(res => res.json()).then(setRooms);
    }, []);

    const selectedRoom = rooms.find(r => r.id === selectedRoomId);



    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhoto(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const session = localStorage.getItem('user_session');
        if (!session) {
            alert('You must be logged in to report an issue.');
            router.push('/login');
            return;
        }
        const user = JSON.parse(session);

        const res = await fetch('/api/tickets', {
            method: 'POST',
            body: JSON.stringify({
                roomId: selectedRoomId,
                equipmentId: selectedEquipmentId || undefined,
                title,
                description,
                category,
                problemType,
                urgency,
                photo,
                createdById: user.id
            }),
            headers: { 'Content-Type': 'application/json' }
        });

        if (res.ok) {
            alert('Ticket Created!');
            router.push('/dashboard');
        } else {
            alert('Error creating ticket');
        }
        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">Report an Issue</h1>
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-lg border">

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                    <select
                        required
                        className="w-full p-2 border rounded-lg"
                        value={selectedRoomId}
                        onChange={e => setSelectedRoomId(e.target.value)}
                    >
                        <option value="">Select a Room</option>
                        {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                </div>

                {selectedRoom && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Equipment (Optional)</label>
                        <select
                            className="w-full p-2 border rounded-lg"
                            value={selectedEquipmentId}
                            onChange={e => setSelectedEquipmentId(e.target.value)}
                        >
                            <option value="">Specific Equipment (or General Room Issue)</option>
                            {selectedRoom.equipment.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Issue Title</label>
                    <input
                        required
                        type="text"
                        className="w-full p-2 border rounded-lg"
                        placeholder="e.g. Projector not working"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        required
                        rows={4}
                        className="w-full p-2 border rounded-lg"
                        placeholder="Describe the issue in detail..."
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            required
                            className="w-full p-2 border rounded-lg"
                            value={category}
                            onChange={e => {
                                setCategory(e.target.value);
                                setProblemType(''); // Reset problem type when category changes
                            }}
                        >
                            <option value="">Select Category</option>
                            {Object.keys(PROBLEM_TYPES).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Problem Type</label>
                        <select
                            required
                            className="w-full p-2 border rounded-lg"
                            value={problemType}
                            onChange={e => setProblemType(e.target.value)}
                            disabled={!category}
                        >
                            <option value="">Select Specific Issue</option>
                            {category && PROBLEM_TYPES[category as keyof typeof PROBLEM_TYPES]?.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
                        <select
                            className="w-full p-2 border rounded-lg"
                            value={urgency}
                            onChange={e => setUrgency(e.target.value)}
                        >
                            <option value="LOW">Low - Can wait</option>
                            <option value="MEDIUM">Medium - Negatively affects work</option>
                            <option value="HIGH">High - Cannot work</option>
                            <option value="CRITICAL">Critical - System Down/Emergency</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Photo (Optional)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full p-1 border rounded-lg text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                    {loading ? 'Submitting...' : 'Submit Report'}
                </button>
            </form>
        </div>
    );
}
