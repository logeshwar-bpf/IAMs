# Claude Enterprise API Server (Independent Backend)

This repository is an independent Node.js / Express backend server that serves real-time enterprise data for Claude plan provisioning, drift logs, audit histories, and user access management.

## Port & Configuration
- **Port:** 4000
- **Base URL:** `http://localhost:4000`

## API Endpoints

### 1. Health Check
- `GET /api/health`

### 2. Dashboard
- `GET /api/dashboard` - Returns subscription distribution, active count, drift alerts count, recent activity.

### 3. Users Directory & Provisioning
- `GET /api/users?search=&plan=&page=&limit=` - Returns paginated user records.
- `GET /api/users/:id` - Returns single user record + audit logs.
- `POST /api/users/:id/plan` - Body `{ newPlan, seats, billingCycle, notes }` - Real-time provision plan change.

### 4. Plans Catalog
- `GET /api/plans` - Returns active distribution per plan.

### 5. Drift Alerts
- `GET /api/drift` - Open drift alerts findings.
- `POST /api/drift/:id/resolve` - Body `{ status }` - Acknowledge or remediate a drift alert.

### 6. Audit Logs
- `GET /api/audit-logs?search=&page=&limit=` - Paginated audit logs.

## Running Independently
```bash
npm install
npm run dev
```
