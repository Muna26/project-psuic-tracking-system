
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const rooms = await prisma.room.findMany({
        include: { equipment: true }
    });
    return NextResponse.json(rooms);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, floor, building } = body;

        if (!name) {
            return NextResponse.json({ error: 'Room name is required' }, { status: 400 });
        }

        const room = await prisma.room.create({
            data: {
                name,
                floor,
                building
            }
        });

        return NextResponse.json(room);
    } catch {
        return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
    }
}
