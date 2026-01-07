
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const user = searchParams.get('userId'); // For "My Tickets"
    const id = searchParams.get('id'); // For fetching single ticket

    try {
        const tickets = await prisma.ticket.findMany({
            where: {
                AND: [
                    id ? { id } : {},
                    status ? { status: status as 'OPEN' | 'RESOLVED' } : {},
                    user ? { createdById: user } : {}
                ]
            },
            include: {
                room: true,
                equipment: true,
                createdBy: { select: { name: true, email: true } },
                assignedTo: { select: { name: true, email: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(tickets);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // body: { roomId, equipmentId, title, description, createdById (mock) }

        // Urgency from body or default to LOW
        const urgency = body.urgency || 'LOW';

        // Ensure we have a mock user if authentication isn't implemented yet
        let userId = body.createdById;
        if (!userId) {
            // Create/Find a guest user for reporting
            const guest = await prisma.user.upsert({
                where: { email: 'guest@student.com' },
                update: {},
                create: { email: 'guest@student.com', role: 'STUDENT', name: 'Guest Student' }
            });
            userId = guest.id;
        }

        const ticket = await prisma.ticket.create({
            data: {
                title: body.title,
                description: body.description,
                roomId: body.roomId,
                equipmentId: body.equipmentId, // Optional
                createdById: userId,
                urgency: urgency,
                category: body.category,
                problemType: body.problemType,
                status: 'OPEN',
                actions: {
                    create: {
                        actorId: userId,
                        action: 'CREATED',
                        details: 'Ticket created via portal'
                    }
                },
                exhibits: body.photo ? {
                    create: {
                        photoUrl: body.photo, // Storing Base64 directly for prototype simplicity
                        type: 'BEFORE'
                    }
                } : undefined
            }
        });

        return NextResponse.json(ticket);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, status, rating, feedback, solution, photo } = body;

        if (!id) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        }

        const updateData: Record<string, unknown> = {};
        if (status) updateData.status = status;
        if (rating) updateData.rating = rating;
        if (feedback) updateData.feedback = feedback;
        if (solution) updateData.solution = solution;
        if (status === 'RESOLVED') updateData.closedAt = new Date();

        const ticket = await prisma.ticket.update({
            where: { id },
            data: {
                ...updateData,
                exhibits: photo ? {
                    create: {
                        photoUrl: photo,
                        type: 'AFTER'
                    }
                } : undefined
            },
            include: {
                room: true,
                createdBy: true
            }
        });

        // Log action (Optional but good)
        if (status) {
            await prisma.ticketAction.create({
                data: {
                    ticketId: id,
                    action: 'STATUS_CHANGE',
                    details: `Status updated to ${status}`,
                    actorId: ticket.createdById
                }
            });
        }

        if (rating) {
            await prisma.ticketAction.create({
                data: {
                    ticketId: id,
                    action: 'RATED',
                    details: `Rated ${rating}/5`,
                    actorId: ticket.createdById
                }
            });
        }

        return NextResponse.json(ticket);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
    }
}
