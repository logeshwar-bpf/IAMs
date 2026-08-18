# IAMs — Identity & Access Management Suite

A unified monorepo housing four dedicated Identity & Access Management (IAM) systems designed for enterprise provisioning, drift detection, policy enforcement, and audit observability.

---

## Projects Overview

| Service / Project | Directory | Port | Description |
| :--- | :--- | :--- | :--- |
| **Claude IAM** | [`claude-plan-provisioning/`](./claude-plan-provisioning) | `3001` | Claude Enterprise plan provisioning, real-time seat assignment, live aurora visuals, and drift tracking. |
| **GCP IAM** | [`gcp-iam/`](./gcp-iam) | `3003` | Google Cloud Platform IAM role request workflows, Google OAuth/JWT auth, and project permission governance. |
| **Google Workspace IAM** | [`google-workspace-iam/`](./google-workspace-iam) | `3002` | Organization Unit management, user directory, bulk service licensing, and policy enforcement. |
| **Jira Access Management** | [`jira-access/`](./jira-access) | `3004` | Jira project permission matrix, team access control, drift remediation, and real-time audit logs. |

---

## Quick Start

### Installation & Monorepo Setup
```bash
npm ci
```

### Starting Development Servers

```bash
# Claude Plan Provisioning (Port 3001)
npm run dev:claude

# Google Workspace IAM (Port 3002)
npm run dev:gws

# GCP IAM (Port 3003)
npm run dev:gcp

# Jira Access Management (Port 3004)
npm run dev:jira
```

### Docker Compose
```bash
docker compose up --build
```

---

## Verification & Quality Gates

```bash
npm run lint         # Linting across all workspaces
npm run typecheck    # TypeScript verification across all workspaces
npm run build        # Production build across all workspaces
npm audit            # Monorepo security audit
```

---

## Features & Highlights

- **Dynamic Theme System**: Unified design tokens supporting Light and Dark modes with live GPU-accelerated mesh aurora backgrounds.
- **Glassmorphism & Micro-animations**: Modern UI layout with interactive stat cards, glow hovers, and responsive navigation drawers.
- **Zero Drift Access**: Integrated drift detection alerting admins to permission mismatches and over-provisioned access.
- **Comprehensive Audit Trails**: Centralized audit logging capturing grants, revocations, policy changes, and actor attribution.
