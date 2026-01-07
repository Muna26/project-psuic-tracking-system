'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Ticket } from '@/types';


type Stats = {
    categoryData: { name: string; value: number }[];
    problemData: { name: string; count: number }[];
    avgRating: string;
    avgResolution: string;
};

export default function AnalyticsDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);

    useEffect(() => {
        // In real app, fetch from /api/reports/stats
        // For now, mock based on tickets
        fetch('/api/tickets').then(res => res.json()).then(tickets => {
            const categoryCount: { [key: string]: number } = {};
            const problemCount: { [key: string]: number } = {};
            let totalRating = 0;
            let ratingCount = 0;
            let totalResolutionTime = 0;
            let resolvedCount = 0;

            tickets.forEach((t: Ticket) => {
                const cat = t.category || 'Uncategorized';
                categoryCount[cat] = (categoryCount[cat] || 0) + 1;

                if (t.problemType) {
                    problemCount[t.problemType] = (problemCount[t.problemType] || 0) + 1;
                }

                if (t.rating) {
                    totalRating += t.rating;
                    ratingCount++;
                }

                if (t.status === 'RESOLVED' && t.closedAt && t.createdAt) {
                    const diff = new Date(t.closedAt).getTime() - new Date(t.createdAt).getTime();
                    totalResolutionTime += diff;
                    resolvedCount++;
                }
            });

            const categoryData = Object.keys(categoryCount).map(key => ({ name: key, value: categoryCount[key] }));
            const problemData = Object.keys(problemCount).map(key => ({ name: key, count: problemCount[key] }));

            // If no data, provide placeholder
            if (categoryData.length === 0) categoryData.push({ name: 'No Data', value: 1 });
            if (problemData.length === 0) problemData.push({ name: 'No Data', count: 0 });

            setStats({
                categoryData,
                problemData,
                avgRating: ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : 'N/A',
                avgResolution: resolvedCount > 0 ? (totalResolutionTime / resolvedCount / (1000 * 60 * 60)).toFixed(1) + ' hrs' : 'N/A'
            });
        });
    }, []);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    if (!stats) return <div>Loading Analytics...</div>;

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
                    <h3 className="text-gray-500 font-medium mb-1">Average Satisfaction</h3>
                    <div className="flex items-end items-center gap-2">
                        <span className="text-4xl font-bold text-yellow-500">{stats.avgRating}</span>
                        <span className="text-sm text-gray-400 mb-1">/ 5.0</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
                    <h3 className="text-gray-500 font-medium mb-1">Avg. Resolution Time</h3>
                    <div className="text-4xl font-bold text-blue-600">{stats.avgResolution}</div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow border">
                <h2 className="text-xl font-bold mb-4">Tickets by Category</h2>
                <div className="h-64 rounded-xl overflow-hidden">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={stats.categoryData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {stats.categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow border">
                <h2 className="text-xl font-bold mb-4">Frequent Repeated Problems</h2>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.problemData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#82ca9d" name="Occurrences" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
