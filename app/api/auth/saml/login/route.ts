import { NextRequest, NextResponse } from "next/server";
import { createSamlInstance } from "@/lib/saml-config";

export async function GET(request: NextRequest) {
  try {
    const saml = createSamlInstance();
    
    // Generate SAML authentication request URL
    // getAuthorizeUrlAsync(RelayState, host, options)
    const loginUrl = await saml.getAuthorizeUrlAsync("", "", {});

    // Redirect to IdP login page
    return NextResponse.redirect(loginUrl);
  } catch (error) {
    console.error("SAML login error:", error);
    const errorMessage = error instanceof Error ? error.message : "SAML login failed";
    
    // Redirect back to login with error
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(
      `${baseUrl}/login?error=${encodeURIComponent(errorMessage)}`
    );
  }
}

