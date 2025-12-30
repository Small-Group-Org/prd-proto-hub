import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, AuthUser } from '@/lib/auth';
import { unauthorizedResponse, forbiddenResponse } from '@/lib/api-response';

export interface AuthenticatedRequest extends NextRequest {
  user: AuthUser;
}

/**
 * Middleware to require authentication for API routes
 */
export async function requireAuth(
  request: NextRequest,
  handler: (request: AuthenticatedRequest) => Promise<Response>
): Promise<Response> {
  const user = getUserFromRequest(request);
  
  if (!user) {
    return unauthorizedResponse('Authentication required');
  }

  // Verify user still exists and is active
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser || dbUser.status !== 'ACTIVE') {
    return unauthorizedResponse('User not found or inactive');
  }

  // Attach user to request and call handler
  const authRequest = request as AuthenticatedRequest;
  authRequest.user = user;
  
  return handler(authRequest);
}

/**
 * Middleware to require specific roles for API routes
 */
export async function requireRole(
  request: NextRequest,
  roles: string[],
  handler: (request: AuthenticatedRequest) => Promise<Response>
): Promise<Response> {
  return requireAuth(request, async (authRequest) => {
    if (!roles.includes(authRequest.user.role)) {
      return forbiddenResponse('Insufficient permissions');
    }
    return handler(authRequest);
  });
}

/**
 * Optional auth - attaches user if authenticated, but doesn't require it
 */
export async function optionalAuth(
  request: NextRequest,
  handler: (request: NextRequest & { user?: AuthUser }) => Promise<Response>
): Promise<Response> {
  const user = getUserFromRequest(request);
  
  if (user) {
    // Verify user still exists and is active
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (dbUser && dbUser.status === 'ACTIVE') {
      const authRequest = request as NextRequest & { user?: AuthUser };
      authRequest.user = user;
      return handler(authRequest);
    }
  }

  return handler(request);
}

