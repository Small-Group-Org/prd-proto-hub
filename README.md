# Small Group Console - PRD Tracker

Internal web application for tracking PRD submissions and UI prototype generation jobs.

## Features

- **SAML SSO Authentication** - Secure login via Small Group Identity Provider
- **Multi-tenant User Management** - Role-based access control with user invitations
- Submit PRDs via text input or file upload
- Track generation status and estimated completion times
- View all past generations with deploy links
- Webhook endpoint for external server updates
- PostgreSQL database persistence with comprehensive audit logging

## Tech Stack

- **Next.js 14** (App Router)
- **React 18** + **TypeScript**
- **Tailwind CSS**
- **PostgreSQL** (via Prisma ORM)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Database Configuration
DATABASE_URL="postgresql://postgres:password@host:5432/prd-proto-hub"

# JWT Configuration
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Application URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# SAML SSO Configuration (Required for Authentication)
SAML_ENTRY_POINT="https://sso.smallgroup.com/saml/login"
SAML_ISSUER="prd-proto-hub"
SAML_CALLBACK_URL="http://localhost:3000/api/auth/saml/callback"

# IdP Certificate - Required for production, optional for dev
# Use either SAML_IDP_CERT or SAML_CERT
SAML_IDP_CERT="your-idp-certificate-here"
# OR
SAML_CERT="your-idp-certificate-here"
```

**Important:** 
- Use `postgresql://` (not `postgres://`) in the DATABASE_URL for Prisma compatibility
- See [SAML_SSO_SETUP.md](./SAML_SSO_SETUP.md) for detailed SAML configuration instructions

### 3. Run Database Migrations

```bash
npx prisma migrate dev
```

This will:
- Create the database schema
- Generate Prisma Client

### 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Database Schema

The `Generation` model includes:
- `id` - Unique identifier
- `prdName` - Name of the PRD
- `prdContent` - Full PRD content (text)
- `userEmail` - Email address for notifications
- `status` - PENDING | IN_PROGRESS | COMPLETED
- `estimatedCompletionTime` - Estimated completion timestamp
- `deployUrl` - Deploy link (nullable)
- `createdAt` - Creation timestamp
- `completedAt` - Completion timestamp (nullable)

## Authentication

This application uses **SAML 2.0 Single Sign-On (SSO)** for authentication.

### Login Flow

1. User navigates to `/login`
2. Clicks "Login with Small Group"
3. Redirects to Small Group SSO Identity Provider
4. User authenticates with SSO credentials
5. Redirected back to application with JWT token
6. Authenticated session established

### SAML Endpoints

- **`/api/auth/saml/login`** - Initiates SAML authentication
- **`/api/auth/saml/callback`** - Handles SAML response from IdP
- **`/api/auth/saml/metadata`** - Service Provider metadata XML

### User Roles

- **SUPERUSER** - Full system access, can invite admins and users
- **ADMIN** - Can invite users, manage generations
- **USER** - Can create and view own generations

For detailed SAML configuration, see [SAML_SSO_SETUP.md](./SAML_SSO_SETUP.md)

## API Endpoints

### Authentication Required

All generation endpoints require a valid JWT token in the `Authorization` header:
```
Authorization: Bearer <token>
```

### GET `/api/generations`
Fetch all generations for authenticated user (ordered by creation date, descending)

### POST `/api/generations`
Create a new generation job

**Request Body:**
```json
{
  "prdName": "My PRD",
  "prdContent": "PRD content here...",
  "userEmail": "user@example.com"
}
```

### GET `/api/generations/[id]`
Fetch a specific generation by ID

### POST `/api/webhook/update`
Webhook endpoint for external server to update generation status

**Request Body:**
```json
{
  "generationId": 1,
  "status": "COMPLETED",
  "deployUrl": "https://deploy.example.com/123",
  "completedAt": "2024-01-01T12:00:00Z"
}
```

### User Management

- **POST `/api/auth/invite`** - Send user invitation (Admin/Superuser only)
- **POST `/api/auth/accept-invitation`** - Accept invitation and create account
- **GET `/api/auth/profile`** - Get current user profile

## Pages

### `/` - PRD Submission
Form to submit new PRDs and start generation jobs.

### `/history` - Generation History
Table view of all past generations with status, completion times, and deploy links.

## Development

### Database Commands

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# Open Prisma Studio (database GUI)
npm run db:studio
```

### Build for Production

```bash
npm run build
npm start
```

## Notes

- Email notifications are mocked (logged to console)
- Generation processing is simulated with random delays (30-90 minutes)
- File uploads (PDF/text) are parsed as text (full PDF parsing not implemented)
- The app polls for updates every 10 seconds on the history page

