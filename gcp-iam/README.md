# GCP IAM & Cloud Access Portal

A Google Cloud Platform (GCP) Identity and Access Management (IAM) management tool for provisioning roles, reviewing project permissions, service account keys, and processing access requests.

## Overview
This system allows organization administrators and team members to manage GCP project access, request IAM roles (Viewer, Editor, Owner, Custom Roles), review user access, and handle OAuth/Google auth integration cleanly.

## Key Features
- **GCP Project & Role Management:** View, request, and manage GCP roles across organization projects.
- **Access Requests Portal:** Submit access requests with expiration timelines and justifications.
- **Admin Access Portal:** Role assignment review and approval dashboard.
- **Google OAuth Integration:** Authenticate with Google Workspace accounts to manage cloud access.

## Tech Stack
- **Framework:** Next.js (App Router) / React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS / CSS Modules

## Getting Started

### Prerequisites
- Node.js 18+
- npm / yarn / pnpm

### Running Locally
```bash
# Install dependencies
npm install

# Run dev server
npm run dev
```

Navigate to `http://localhost:3000` to start using the GCP IAM portal.

## Architecture & Technical Decisions

### In-Memory Demo State Store
- **Local Demo Store:** For local testing and demonstration purposes, `gcp-store.ts` uses module-level state arrays (`MOCK_PROVISIONS`, `MOCK_REQUESTS`).
- **Production Persistence:** On production serverless or multi-instance deployments, these in-memory data structures should be replaced with a persistent backend (e.g., PostgreSQL, Firestore, or Redis) so that provisions and requests persist across cold starts and instances.

### GCP IAM Policy Mutations & Optimistic Concurrency
- When `GCP_ACCESS_TOKEN` is set, live IAM mutations invoke `cloudresourcemanager.googleapis.com` via `getIamPolicy` and `setIamPolicy`.
- `setIamPolicy` includes the project policy's current `etag` for optimistic concurrency control. Concurrent modification conflicts (HTTP 409) will return explicit failure status so callers can retry.

