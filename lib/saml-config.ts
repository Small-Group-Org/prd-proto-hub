import { SAML, SamlConfig } from "@node-saml/node-saml";
import { prisma } from "./prisma";

// SAML Configuration for Next.js
const samlOptions: SamlConfig = {
  // Identity Provider (IdP) Configuration
  entryPoint: process.env.SAML_ENTRY_POINT || "https://sso.smallgroup.com/saml/login",
  issuer: process.env.SAML_ISSUER || "prd-to-proto",
  callbackUrl: process.env.SAML_CALLBACK_URL || "http://localhost:3000/api/auth/saml/callback",
  
  // Service Provider (SP) Configuration
  // IdP's public certificate (X.509 certificate for validating SAML responses)
  idpCert: process.env.SAML_IDP_CERT || process.env.SAML_CERT || "",
  
  // Optional: Private key for signing requests (if required by IdP)
  privateKey: process.env.SAML_PRIVATE_KEY || undefined,
  
  // Decryption (if IdP encrypts assertions)
  decryptionPvk: process.env.SAML_DECRYPTION_PVK || undefined,
  
  // Additional settings
  identifierFormat: "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress",
  wantAssertionsSigned: false, // Set to true in production with valid cert
  signatureAlgorithm: "sha256" as const,
  
  // Audience validation
  audience: process.env.SAML_ISSUER || "prd-to-proto",
};

// Create SAML instance
export const createSamlInstance = () => {
  return new SAML(samlOptions);
};

// Process SAML profile and create/update user
export const processSamlProfile = async (profile: any) => {
  try {
    if (!profile) {
      throw new Error("No profile returned from SAML");
    }

    // Extract user info from SAML profile
    const email = profile.email || profile.nameID || profile["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || "";
    const firstName = profile.firstName || profile.givenName || profile["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"] || "";
    const lastName = profile.lastName || profile.surname || profile["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"] || "";
    
    if (!email || typeof email !== 'string') {
      throw new Error("Email not found in SAML response");
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Auto-provision user if they don't exist
      // In production, you might want to check against invitation first
      user = await prisma.user.create({
        data: {
          email,
          firstName: firstName || "User",
          lastName: lastName || "",
          passwordHash: "", // No password for SSO users
          role: "USER", // Default role, can be overridden
          status: "ACTIVE",
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          action: "SSO_USER_CREATED",
          entityType: "USER",
          entityId: user.id,
          userId: user.id,
          details: {
            email,
            provider: "SAML",
            timestamp: new Date().toISOString(),
          },
        },
      });
    } else if (user.status !== "ACTIVE") {
      throw new Error("User account is not active");
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Create audit log for login
    await prisma.auditLog.create({
      data: {
        action: "SSO_LOGIN",
        entityType: "USER",
        entityId: user.id,
        userId: user.id,
        details: {
          email,
          provider: "SAML",
          timestamp: new Date().toISOString(),
        },
      },
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  } catch (error) {
    console.error("SAML authentication error:", error);
    throw error;
  }
};

// Helper to generate JWT token for authenticated user
export const generateToken = (user: { id: string; email: string; role: string }) => {
  const jwt = require("jsonwebtoken");
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET as string,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

