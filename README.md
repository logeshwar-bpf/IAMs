# IAMs — Identity & Access Management Suite

A unified monorepo housing four dedicated Identity & Access Management (IAM) systems designed for enterprise provisioning, drift detection, policy enforcement, and audit observability.

---

## Projects Overview

| Service / Project | Directory | Port | Description |
| :--- | :--- | :--- | :--- |
| **Claude IAM** | [`claude-plan-provisioning/`](./claude-plan-provisioning) | `3001` (App) / `4000` (API) | Claude Enterprise plan provisioning, real-time seat assignment, live aurora visuals, and drift tracking. |
| **GCP IAM** | [`gcp-iam/`](./gcp-iam) | `3003` | Google Cloud Platform IAM role request workflows, Google OAuth/JWT auth, and project permission governance. |
| **Google Workspace IAM** | [`google-workspace-iam/`](./google-workspace-iam) | `3002` | Organization Unit management, user directory, bulk service licensing, and policy enforcement. |
| **Jira Access Management** | [`jira-access/`](./jira-access) | `3004` | Jira project permission matrix, team access control, drift remediation, and real-time audit logs. |

---

## Quick Start

### 1. Claude Plan Provisioning & Mock API
```bash
# Terminal 1: Start Mock Enterprise API
cd claude-plan-provisioning/claude-enterprise-api
npm start

# Terminal 2: Start Claude IAM Console
cd claude-plan-provisioning
npm run dev -- -p 3001
```

### 2. Google Workspace IAM
```bash
cd google-workspace-iam
npm run dev -- -p 3002
```

### 3. GCP IAM
```bash
cd gcp-iam
npm run dev
```

### 4. Jira Access Management
```bash
cd jira-access
npm run dev -- -p 3004
```

---

## Features & Highlights

- **Dynamic Theme System**: Unified design tokens supporting Light and Dark modes with live GPU-accelerated mesh aurora backgrounds.
- **Glassmorphism & Micro-animations**: Modern UI layout with interactive stat cards, glow hovers, and responsive navigation drawers.
- **Zero Drift Access**: Integrated drift detection alerting admins to permission mismatches and over-provisioned access.
- **Comprehensive Audit Trails**: Centralized audit logging capturing grants, revocations, policy changes, and actor attribution.
