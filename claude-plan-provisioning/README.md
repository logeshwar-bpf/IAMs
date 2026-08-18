# Claude IAM & Plan Provisioning Platform

A comprehensive Identity and Access Management (IAM) and Plan Provisioning system for Anthropic Claude Enterprise & Pro services.

## Overview
This platform provides enterprise-wide visibility, role-based access control, plan provisioning management (Claude Pro, Claude Team, Enterprise), automated drift detection, and audit logging.

## Core Features
- **User Directory & Provisioning:** Search, filter, and modify seat allocations and subscription plans.
- **Drift Alerts:** Real-time monitoring and remediation of access drift across teams.
- **Audit Logs:** Full tracking of admin access requests, approval workflows, and plan updates.
- **Integrated Route Handlers & Server Actions:** Built-in Next.js authenticated endpoints with fail-closed security and JWT session verification.
- **Next.js Dashboard:** Modern dashboard interface built with Next.js App Router and Tailwind CSS.

## Getting Started

### Prerequisites
- Node.js 20+
- npm

### Installation
From the monorepo root:
```bash
npm ci
```

### Running the Application
```bash
npm run dev --workspace=claude-plan-provisioning
```

Open [http://localhost:3001](http://localhost:3001) to view the dashboard.

## Project Structure
```
├── app/                    # Next.js App Router pages, Server Actions, and API routes
├── components/             # React UI components & navigation
├── data/                   # Initial / persistent JSON storage
├── lib/                    # API client, database engine, and authentication
└── Dockerfile              # Monorepo containerization build
```

## Tech Stack
- **Framework:** Next.js 16 / React 19
- **Styling:** Tailwind CSS
- **Authentication:** JWT (HMAC-SHA256) & bcrypt
- **Language:** TypeScript / JavaScript
