// src/app/api/users/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';

// This is the main function that handles POST requests to this endpoint.
export async function POST(request: Request) {
  try {
    // 1. Parse the incoming request body to get the new user's data.
    const body = await request.json();
    const { name, email, password, role } = body;

    // 2. Basic validation: Check if all required fields are provided.
    if (!name || !email || !password || !role) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // 3. Validate the role to ensure it's one of the allowed enum values.
    if (!Object.values(UserRole).includes(role)) {
        return new NextResponse(`Invalid role specified: ${role}`, { status: 400 });
    }

    // 4. Check if a user with the given email already exists to prevent duplicates.
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new NextResponse('User with this email already exists', { status: 409 }); // 409 Conflict
    }

    // 5. Hash the password for security before storing it in the database.
    const hashedPassword = await bcrypt.hash(password, 12);

    // 6. Create the new user in the database.
    // We explicitly set isActive: true as requested.
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as UserRole, // Cast the role to the UserRole enum type
        isActive: true, // Set the new user as active by default
      },
    });

    // 7. Return the newly created user object (without the password) in the response.
    const { password: _, ...userWithoutPassword } = newUser;
    return NextResponse.json(userWithoutPassword, { status: 201 }); // 201 Created

  } catch (error) {
    // 8. Handle any unexpected errors during the process.
    console.error('[USERS_POST_API]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
