import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET a single feature request by ID
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Ensure the user is authenticated to view the request
        const session = await getServerSession(authOptions);
        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const featureRequest = await prisma.featureRequest.findUnique({
            where: {
                id: Number(params.id),
            },
        });

        if (!featureRequest) {
            return new NextResponse('Feature request not found', { status: 404 });
        }

        return NextResponse.json(featureRequest);
    } catch (error) {
        console.error("Error fetching feature request:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

// PUT (update) a feature request
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.name) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await request.json();
        const { title, description, status, priority } = body;

        // You may want to add more robust validation here
        if (!title || !description || !status || !priority) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        // We can add a check here to ensure the user updating the request is the original submitter or an admin
        // For now, we'll assume the logged-in user can update it.
        const updatedRequest = await prisma.featureRequest.update({
            where: {
                id: Number(params.id),
            },
            data: {
                title,
                description,
                status,
                priority,
            },
        });

        return NextResponse.json(updatedRequest);
    } catch (error) {
        console.error("Error updating feature request:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

// DELETE a feature request
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.name) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // You should add an authorization check here to ensure only the submitter can delete the request
        await prisma.featureRequest.delete({
            where: {
                id: Number(params.id),
            },
        });

        return new NextResponse(null, { status: 204 }); // 204 No Content
    } catch (error) {
        console.error("Error deleting feature request:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
