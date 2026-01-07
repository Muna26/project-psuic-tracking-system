'use client';

import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import DashboardLayout from '@/components/DashboardLayout';

export default function AdminDashboard() {
    return (
        <DashboardLayout role="ADMIN">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-500">System Overview & Analytics</p>
            </div>
            <AnalyticsDashboard />
        </DashboardLayout>
    );
}
