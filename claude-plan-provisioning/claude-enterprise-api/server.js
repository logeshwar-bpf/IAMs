const express = require('express');
const cors = require('cors');
const store = require('./data/store');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[Claude Enterprise API] ${req.method} ${req.url}`);
  next();
});

// ─── Health check ───
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Claude Enterprise Provisioning API', timestamp: new Date().toISOString() });
});

// ─── Dashboard statistics ───
app.get('/api/dashboard', (req, res) => {
  try {
    const data = store.getDashboard();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── User management ───
app.get('/api/users', (req, res) => {
  try {
    const { search = '', plan = 'All', page = 1, limit = 10 } = req.query;
    const result = store.getUsers({ search, plan, page, limit });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:id', (req, res) => {
  try {
    const user = store.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: `User with ID ${req.params.id} not found` });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Plan Provisioning Endpoint ───
app.post('/api/users/:id/plan', (req, res) => {
  try {
    const userId = req.params.id;
    const { newPlan, seats, billingCycle, notes, adminUser } = req.body;
    if (!newPlan) {
      return res.status(400).json({ error: 'newPlan parameter is required' });
    }
    const result = store.updateUserPlan({ userId, newPlan, seats, billingCycle, notes, adminUser });
    res.json({ success: true, user: result.user, auditLog: result.auditLog });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ─── Plans catalog ───
app.get('/api/plans', (req, res) => {
  try {
    const data = store.getPlans();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Drift detection ───
app.get('/api/drift', (req, res) => {
  try {
    const data = store.getDriftAlerts();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/drift/:id/resolve', (req, res) => {
  try {
    const { status = 'resolved' } = req.body;
    const alert = store.resolveDriftAlert(req.params.id, status);
    res.json({ success: true, alert });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ─── Audit logs ───
app.get('/api/audit-logs', (req, res) => {
  try {
    const { search = '', page = 1, limit = 15 } = req.query;
    const result = store.getAuditLogs({ search, page, limit });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`  ◆ CLAUDE ENTERPRISE API SERVER RUNNING`);
  console.log(`  URL: http://localhost:${PORT}`);
  console.log(`  Health Check: http://localhost:${PORT}/api/health`);
  console.log(`==================================================\n`);
});
