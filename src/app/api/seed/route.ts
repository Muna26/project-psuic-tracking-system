
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    // Check if rooms exist
    const count = await prisma.room.count();
    if (count > 0) {
        return NextResponse.json({ message: 'Database already seeded' });
    }

    // Seed Rooms
    const r1 = await prisma.room.create({
        data: {
            name: 'Lecture Room 101',
            floor: '1',
            building: 'Main'
        }
    });

    const r2 = await prisma.room.create({
        data: {
            name: 'Computer Lab 202',
            floor: '2',
            building: 'Main'
        }
    });

    // Seed Equipment
    await prisma.equipment.createMany({
        data: [
            { name: 'Projector A', type: 'Projector', roomId: r1.id },
            { name: 'Sound System', type: 'Audio', roomId: r1.id },
            { name: 'PC-01', type: 'PC', roomId: r2.id },
            { name: 'PC-02', type: 'PC', roomId: r2.id },
        ]
    });

    // Seed KB
    await prisma.knowledgeBase.createMany({
        data: [
            { title: 'Projector not turning on', content: 'Check if the remote battery is working.', type: 'FAQ', tags: 'projector, hardware' },
            { title: 'How to login to PC', content: 'Use your student ID and password.', type: 'GUIDE', tags: 'login, pc' }
        ]
    });

    return NextResponse.json({ message: 'Seeding completed' });
}
