# Claude IAM & Plan Provisioning Platform

A comprehensive Identity and Access Management (IAM) and Plan Provisioning system for Anthropic Claude Enterprise & Pro services.

## Overview
This platform provides enterprise-wide visibility, role-based access control, plan provisioning management (Claude Pro, Claude Team, Enterprise), automated drift detection, and audit logging.

## Core Features
- **User Directory & Provisioning:** Search, filter, and modify seat allocations and subscription plans.
- **Drift Alerts:** Real-time monitoring and remediation of access drift across teams.
- **Audit Logs:** Full tracking of admin access requests, approval workflows, and plan updates.
- **Independent Express API:** Lightweight Node.js backend server (`/claude-enterprise-api` and `/dummy-server`) powering real-time statistics and storage.
- **Next.js Dashboard:** Modern dashboard interface built with Next.js App Router and Tailwind CSS.

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn / pnpm

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Start the API Server:**
```bash
node dummy-server/server.js
# or node claude-enterprise-api/server.js (runs on port 4000)
```

3. **Start the Frontend Dashboard:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Project Structure
```
├── app/                    # Next.js App Router pages and API routes
├── components/             # React UI components & navigation
├── lib/                    # API client and helper functions
├── dummy-server/           # Standalone Express API server (Port 4000)
├── claude-enterprise-api/  # Claude Enterprise API backend module
└── docker-compose.yaml     # Containerization setup
```

## Tech Stack
- **Framework:** Next.js 16 / React 19
- **Styling:** Tailwind CSS
- **Backend:** Node.js / Express
- **Language:** TypeScript / JavaScript
