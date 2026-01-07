
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username } = body;

        if (!username) {
            return NextResponse.json({ error: 'Username is required' }, { status: 400 });
        }

        // Mock password check - in simulation we skip it or check mock
        // For simulation: Accept any non-empty username

        // Upsert User
        // If user exists, update last login (if we had a field, but we check updatedAt)
        // If not, create new user
        const user = await prisma.user.upsert({
            where: { username },
            update: { updatedAt: new Date() },
            create: {
                username,
                email: `${username}@psu.ac.th`, // Auto-generate email mock
                name: username, // Default name
                role: username.toLowerCase().startsWith('admin') ? 'ADMIN' :
                    username.toLowerCase().startsWith('it') ? 'IT_STAFF' : 'STUDENT'
            }
        });

        // In a real app, we would return a JWT session cookie here.
        // For this prototype, we'll just return the user object and handle "session" in client state (localStorage or Context)

        // Create the response
        const response = NextResponse.json({ success: true, user });

        // Set a simple cookie for middleware to use (simulated session)
        response.cookies.set('user_role', user.role, {
            path: '/',
            httpOnly: false, // Allow client to read if needed, though mostly for server
            maxAge: 60 * 60 * 24 * 7 // 1 week
        });

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }
}
