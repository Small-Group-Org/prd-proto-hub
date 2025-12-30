import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/api-response';
import { acceptInvitationSchema, validateData } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = validateData(acceptInvitationSchema, body);
    if (!validation.success) {
      return errorResponse(validation.error);
    }

    const { token, password, firstName, lastName } = validation.data;

    // Find valid invitation
    const invitation = await prisma.invitation.findFirst({
      where: {
        token,
        status: 'PENDING',
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!invitation) {
      return errorResponse('Invalid or expired invitation');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: invitation.email,
        passwordHash,
        firstName,
        lastName,
        role: invitation.role,
        invitedById: invitation.invitedById,
      },
    });

    // Update invitation status
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: 'ACCEPTED' },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'INVITATION_ACCEPTED',
        entityType: 'USER',
        entityId: user.id,
        userId: user.id,
        details: {
          email: user.email,
          role: user.role,
        },
      },
    });

    return successResponse({
      message: 'Account created successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Accept invitation error:', error);
    return errorResponse('Failed to create account', 500);
  }
}

