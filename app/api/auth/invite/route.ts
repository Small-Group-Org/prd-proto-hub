import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, generateInvitationToken } from '@/lib/auth';
import { errorResponse, successResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/api-response';
import { invitationSchema, validateData } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    // Check if user has permission to invite (SUPERUSER or ADMIN)
    if (!['SUPERUSER', 'ADMIN'].includes(authUser.role)) {
      return forbiddenResponse('Only admins can send invitations');
    }

    const body = await request.json();
    
    // Validate input
    const validation = validateData(invitationSchema, body);
    if (!validation.success) {
      return errorResponse(validation.error);
    }

    const { email, role } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return errorResponse('User already exists');
    }

    // Check for existing pending invitation
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        email,
        status: 'PENDING',
      },
    });

    if (existingInvitation) {
      return errorResponse('Invitation already sent');
    }

    // Create invitation token
    const token = generateInvitationToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

    // Create invitation
    const invitation = await prisma.invitation.create({
      data: {
        email,
        role,
        token,
        expiresAt,
        invitedById: authUser.id,
        status: 'PENDING',
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'INVITATION_SENT',
        entityType: 'INVITATION',
        entityId: invitation.id,
        userId: authUser.id,
        details: {
          email,
          role,
          expiresAt: expiresAt.toISOString(),
        },
      },
    });

    // In production, send invitation email here
    // For now, return the token for testing
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/accept-invitation?token=${token}`;

    return successResponse({
      message: 'Invitation sent successfully',
      invitationId: invitation.id,
      // Remove this in production - only for development
      inviteUrl,
    });
  } catch (error) {
    console.error('Send invitation error:', error);
    return errorResponse('Failed to send invitation', 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    // Check if user has permission (SUPERUSER or ADMIN)
    if (!['SUPERUSER', 'ADMIN'].includes(authUser.role)) {
      return forbiddenResponse('Only admins can view invitations');
    }

    const invitations = await prisma.invitation.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        invitedBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return successResponse({ invitations });
  } catch (error) {
    console.error('Get invitations error:', error);
    return errorResponse('Failed to get invitations', 500);
  }
}

