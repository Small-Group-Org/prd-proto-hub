import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, optionalAuth } from "@/lib/auth-middleware";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  return requireAuth(request, async (authRequest) => {
    try {
      // Get generations for the authenticated user
      const generations = await prisma.generation.findMany({
        where: {
          userId: authRequest.user.id,
        },
        orderBy: { createdAt: "desc" },
      });
      return successResponse(generations);
    } catch (error) {
      console.error("Error fetching generations:", error);
      return errorResponse("Failed to fetch generations", 500);
    }
  });
}

export async function POST(request: NextRequest) {
  return requireAuth(request, async (authRequest) => {
    try {
      const body = await request.json();
      const { prdName, prdContent, userEmail } = body;

      if (!prdContent) {
        return errorResponse("PRD content is required");
      }

      // Generate estimated completion time (30-90 minutes from now)
      const estimatedMinutes = Math.floor(Math.random() * (90 - 30 + 1)) + 30;
      const estimatedCompletionTime = new Date();
      estimatedCompletionTime.setMinutes(
        estimatedCompletionTime.getMinutes() + estimatedMinutes
      );

      // Create generation record linked to authenticated user
      const generation = await prisma.generation.create({
        data: {
          prdName: prdName || "Untitled PRD",
          prdContent,
          userEmail: userEmail || authRequest.user.email,
          userId: authRequest.user.id,
          status: "IN_PROGRESS",
          estimatedCompletionTime,
        },
      });

      // Simulate async processing (don't await - let it run in background)
      processGeneration(generation.id, userEmail || authRequest.user.email).catch((error) => {
        console.error(`Error processing generation ${generation.id}:`, error);
      });

      return successResponse(generation, 201);
    } catch (error) {
      console.error("Error creating generation:", error);
      return errorResponse("Failed to create generation", 500);
    }
  });
}

async function processGeneration(generationId: number, userEmail: string) {
  // Simulate processing time (30-90 minutes)
  const processingMinutes = Math.floor(Math.random() * (90 - 30 + 1)) + 30;
  const processingMs = processingMinutes * 60 * 1000;

  // Wait for processing to complete
  await new Promise((resolve) => setTimeout(resolve, processingMs));

  // Generate mock deploy URL
  const deployUrl = `https://deploy.mock/${generationId}`;

  // Update generation status
  await prisma.generation.update({
    where: { id: generationId },
    data: {
      status: "COMPLETED",
      deployUrl,
      completedAt: new Date(),
    },
  });

  // Mock email sending (log to console)
  console.log(`[EMAIL] Sending deploy link to ${userEmail}`);
  console.log(`[EMAIL] Subject: Your UI Prototype is Ready`);
  console.log(`[EMAIL] Body: Your PRD generation is complete. Deploy link: ${deployUrl}`);
}

