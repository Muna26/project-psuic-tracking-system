
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    // Return all schedules for now (assuming single IT staff or filtering by implicit user)
    // In real app, filter by date range
    try {
        const schedules = await prisma.schedule.findMany({
            orderBy: { startTime: 'asc' }
        });
        return NextResponse.json(schedules);
    } catch (error) {
        console.error('Error fetching schedule:', error);
        return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, startTime, endTime, type, details } = body;

        // Mock user if needed
        let targetUserId = userId;
        if (!targetUserId) {
            // Find/Create IT Staff user
            const itUser = await prisma.user.upsert({
                where: { email: 'it@psuic.edu' },
                update: {},
                create: { email: 'it@psuic.edu', role: 'IT_STAFF', name: 'P\'Jae (IT)' }
            });
            targetUserId = itUser.id;
        }

        const schedule = await prisma.schedule.create({
            data: {
                userId: targetUserId,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                type: type || 'BUSY',
                details
            }
        });
        return NextResponse.json(schedule);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create schedule' }, { status: 500 });
    }
}
