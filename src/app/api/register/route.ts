import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendEmail } from '@/lib/email';
import { UserRole } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 });
    }

    // Hash the password for security
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user with isActive set to false by default
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isActive: false, // New users are inactive by default
      },
    });

    // --- Email Notification Logic ---

    // 1. Send email to the newly registered user
    await sendEmail({
      to: newUser.email || '',
      subject: 'Account Registration Pending Approval',
      text: `Hi ${newUser.name},\n\nThank you for registering for the Project Planning & Management Application. Your account has been created successfully and is now pending approval from an administrator. You will receive another email once your account is activated.\n\nBest regards,\nThe Team`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2>Account Registration Pending</h2>
          <p>Hi ${newUser.name},</p>
          <p>Thank you for registering for the **Project Planning & Management Application**.</p>
          <p>Your account has been created successfully and is now pending approval from an administrator. You will receive another email once your account is activated.</p>
          <p>Best regards,</p>
          <p>The Team</p>
        </div>
      `,
    });

    // 2. Find all admins and notify them of the new user
    const admins = await prisma.user.findMany({
      where: { role: UserRole.ADMIN },
    });

    for (const admin of admins) {
      await sendEmail({
        to: admin.email || '',
        subject: 'New User Account Pending Approval',
        text: `Hello Admin,\n\nA new user, ${newUser.name} (${newUser.email}), has registered and is pending your approval. Please log in to the application to activate their account.\n\nBest regards,\nThe System`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2>New User Registration</h2>
            <p>Hello Admin,</p>
            <p>A new user, <strong>${newUser.name}</strong> (${newUser.email}), has registered and is pending your approval.</p>
            <p>Please log in to the application to activate their account.</p>
            <p>Best regards,</p>
            <p>The System</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ message: 'User created successfully', user: newUser }, { status: 201 });
  } catch (error) {
    console.error('Failed to create user:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
