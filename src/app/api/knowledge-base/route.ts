
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type');

    try {
        const items = await prisma.knowledgeBase.findMany({
            where: {
                AND: [
                    query ? {
                        OR: [
                            { title: { contains: query } }, // removed mode: 'insensitive' for sqlite compatibility or check if sqlite supports it? Prisma simulates it.
                            { content: { contains: query } },
                            { tags: { contains: query } }
                        ]
                    } : {},
                    type ? { type } : {}
                ]
            },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(items);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch KB items' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const item = await prisma.knowledgeBase.create({
            data: {
                title: body.title,
                content: body.content,
                type: body.type || 'FAQ',
                tags: body.tags
            }
        });
        return NextResponse.json(item);
    } catch {
        return NextResponse.json({ error: 'Failed to create KB item' }, { status: 500 });
    }
}
