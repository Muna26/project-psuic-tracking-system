
export type RoomWithEquipment = {
    id: string;
    name: string;
    equipment: {
        id: string;
        name: string;
    }[];
}

export type Room = {
    id: string;
    name: string;
    floor?: string;
    building?: string;
    equipment?: { id: string; name: string; status: string }[];
}

export type User = {
    id: string;
    name: string;
    email: string;
    role: 'USER' | 'IT_STAFF' | 'ADMIN';
    username?: string;
}

export type Ticket = {
    id: string;
    title: string;
    description: string;
    status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'SCHEDULED' | 'CANCELLED';
    urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    category?: string;
    problemType?: string;
    createdAt: string | Date;
    closedAt?: string | Date;
    room?: { name: string };
    rating?: number;
    createdBy?: { name: string; email?: string };
    assignedTo?: { name: string; email?: string };
}
