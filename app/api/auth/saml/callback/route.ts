import { NextRequest, NextResponse } from "next/server";
import { createSamlInstance, processSamlProfile, generateToken } from "@/lib/saml-config";

export async function POST(request: NextRequest) {
  try {
    const saml = createSamlInstance();
    const formData = await request.formData();
    
    // Convert FormData to object
    const body: Record<string, string> = {};
    formData.forEach((value, key) => {
      body[key] = value.toString();
    });

    // Validate and process SAML response
    const samlResponse = await saml.validatePostResponseAsync(body);
    
    if (!samlResponse || !samlResponse.profile) {
      throw new Error("Invalid SAML response");
    }

    // Process user profile and create/update user
    const user = await processSamlProfile(samlResponse.profile);

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Redirect to frontend with token
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(`${baseUrl}/login?token=${token}`);
  } catch (error) {
    console.error("SAML callback error:", error);
    const errorMessage = error instanceof Error ? error.message : "SAML authentication failed";
    
    // Redirect back to login with error
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(
      `${baseUrl}/login?error=${encodeURIComponent(errorMessage)}`
    );
  }
}

// Some IdPs use GET for callback (HTTP-Redirect binding)
export async function GET(request: NextRequest) {
  try {
    const saml = createSamlInstance();
    const searchParams = request.nextUrl.searchParams;
    
    // Convert searchParams to object
    const query: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      query[key] = value;
    });

    // Get the original query string for signature validation
    const queryString = request.nextUrl.search.substring(1); // Remove leading '?'

    // Validate and process SAML response (HTTP-Redirect binding)
    const samlResponse = await saml.validateRedirectAsync(query, queryString);
    
    if (!samlResponse || !samlResponse.profile) {
      throw new Error("Invalid SAML response");
    }

    // Process user profile and create/update user
    const user = await processSamlProfile(samlResponse.profile);

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Redirect to frontend with token
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(`${baseUrl}/login?token=${token}`);
  } catch (error) {
    console.error("SAML callback error:", error);
    const errorMessage = error instanceof Error ? error.message : "SAML authentication failed";
    
    // Redirect back to login with error
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(
      `${baseUrl}/login?error=${encodeURIComponent(errorMessage)}`
    );
  }
}

