import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { errorResponse, successResponse, unauthorizedResponse } from '@/lib/api-response';
import { updateProfileSchema, validateData } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      return unauthorizedResponse('User not found');
    }

    return successResponse({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    return errorResponse('Failed to get profile', 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    
    // Validate input
    const validation = validateData(updateProfileSchema, body);
    if (!validation.success) {
      return errorResponse(validation.error);
    }

    const { firstName, lastName } = validation.data;

    // Build update data
    const updateData: any = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;

    const user = await prisma.user.update({
      where: { id: authUser.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        updatedAt: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'PROFILE_UPDATE',
        entityType: 'USER',
        entityId: user.id,
        userId: authUser.id,
        details: {
          updatedFields: Object.keys(updateData),
          timestamp: new Date().toISOString(),
        },
      },
    });

    return successResponse({
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return errorResponse('Failed to update profile', 500);
  }
}

