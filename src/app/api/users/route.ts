
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(users);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, role } = body;

        const user = await prisma.user.update({
            where: { id },
            data: { role }
        });

        return NextResponse.json(user);
    } catch {
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}
