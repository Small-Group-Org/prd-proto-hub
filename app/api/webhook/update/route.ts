import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Webhook endpoint for external server to send updates about generation status
 * Expected payload:
 * {
 *   generationId: number,
 *   status?: "PENDING" | "IN_PROGRESS" | "COMPLETED",
 *   deployUrl?: string,
 *   completedAt?: string (ISO date string)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { generationId, status, deployUrl, completedAt } = body;

    if (!generationId) {
      return NextResponse.json(
        { error: "generationId is required" },
        { status: 400 }
      );
    }

    // Find the generation
    const generation = await prisma.generation.findUnique({
      where: { id: generationId },
    });

    if (!generation) {
      return NextResponse.json(
        { error: "Generation not found" },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: {
      status?: "PENDING" | "IN_PROGRESS" | "COMPLETED";
      deployUrl?: string;
      completedAt?: Date;
    } = {};

    if (status) {
      updateData.status = status;
    }

    if (deployUrl) {
      updateData.deployUrl = deployUrl;
    }

    if (completedAt) {
      updateData.completedAt = new Date(completedAt);
    }

    // Update the generation
    const updated = await prisma.generation.update({
      where: { id: generationId },
      data: updateData,
    });

    // If status is completed and we have a deploy URL, send email (mocked)
    if (updated.status === "COMPLETED" && updated.deployUrl) {
      console.log(`[EMAIL] Sending deploy link to ${updated.userEmail}`);
      console.log(`[EMAIL] Subject: Your UI Prototype is Ready`);
      console.log(
        `[EMAIL] Body: Your PRD generation is complete. Deploy link: ${updated.deployUrl}`
      );
    }

    return NextResponse.json({
      success: true,
      generation: updated,
    });
  } catch (error) {
    console.error("Error updating generation via webhook:", error);
    return NextResponse.json(
      { error: "Failed to update generation" },
      { status: 500 }
    );
  }
}

