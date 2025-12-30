import { NextRequest, NextResponse } from "next/server";
import { createSamlInstance } from "@/lib/saml-config";

export async function GET(request: NextRequest) {
  try {
    const saml = createSamlInstance();
    
    // Generate SAML metadata XML
    const metadata = saml.generateServiceProviderMetadata(
      process.env.SAML_DECRYPTION_CERT || null,
      process.env.SAML_SIGNING_CERT || null
    );

    return new NextResponse(metadata, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Content-Disposition": "inline",
      },
    });
  } catch (error) {
    console.error("SAML metadata generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate SAML metadata" },
      { status: 500 }
    );
  }
}

