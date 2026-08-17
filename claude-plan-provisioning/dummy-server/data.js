// ─── Seed data ────────────────────────────────────────────────────────────────
const now = Date.now();

const USERS = [
  { id:'usr_001', name:'John Doe',         email:'john.doe@anthropic-client.com',  role:'Engineering Lead',      plan:'Claude Pro',  status:'Active',  grantedAt: new Date(now-86400000*30).toISOString() },
  { id:'usr_002', name:'Sarah Lee',        email:'sarah.lee@designhub.io',         role:'Product Designer',      plan:'Claude Team', status:'Active',  grantedAt: new Date(now-86400000*25).toISOString() },
  { id:'usr_003', name:'Alex Kim',         email:'alex.kim@fintechlabs.com',        role:'Data Scientist',        plan:'Claude Pro',  status:'Active',  grantedAt: new Date(now-86400000*20).toISOString() },
  { id:'usr_004', name:'Emma Wilson',      email:'emma.wilson@cloudtech.org',       role:'DevOps Engineer',       plan:'Enterprise',  status:'Active',  grantedAt: new Date(now-86400000*15).toISOString() },
  { id:'usr_005', name:'Michael Brown',    email:'michael.b@acmesolutions.com',     role:'CTO',                   plan:'Enterprise',  status:'Active',  grantedAt: new Date(now-86400000*10).toISOString() },
  { id:'usr_006', name:'Sophia Martinez',  email:'sophia.m@creativeworks.co',       role:'UX Researcher',         plan:'Claude Pro',  status:'Active',  grantedAt: new Date(now-86400000*8).toISOString() },
  { id:'usr_007', name:'David Chen',       email:'david.chen@quantumai.net',        role:'AI Researcher',         plan:'Claude Team', status:'Active',  grantedAt: new Date(now-86400000*7).toISOString() },
  { id:'usr_008', name:'Olivia Taylor',    email:'olivia.t@venturecapital.io',      role:'Partner',               plan:'No Access',   status:'Revoked', grantedAt: new Date(now-86400000*5).toISOString() },
  { id:'usr_009', name:'James Anderson',   email:'james.a@cyberdefense.gov',        role:'Security Specialist',   plan:'Claude Pro',  status:'Active',  grantedAt: new Date(now-86400000*4).toISOString() },
  { id:'usr_010', name:'Emily Thomas',     email:'emily.t@healthplus.org',          role:'Medical Analyst',       plan:'Claude Team', status:'Active',  grantedAt: new Date(now-86400000*3).toISOString() },
  { id:'usr_011', name:'Daniel Jackson',   email:'daniel.j@edulearn.edu',           role:'Professor',             plan:'Claude Pro',  status:'Active',  grantedAt: new Date(now-86400000*2).toISOString() },
  { id:'usr_012', name:'Ava White',        email:'ava.w@mediastream.tv',            role:'Content Strategist',    plan:'No Access',   status:'Revoked', grantedAt: new Date(now-86400000*1).toISOString() },
  { id:'usr_013', name:'Matthew Harris',   email:'matthew.h@logistics.com',         role:'Operations Manager',    plan:'Claude Team', status:'Active',  grantedAt: new Date(now-86400000*60).toISOString() },
  { id:'usr_014', name:'Isabella Martin',  email:'isabella.m@retailgroup.com',      role:'Marketing Director',    plan:'Claude Pro',  status:'Active',  grantedAt: new Date(now-86400000*55).toISOString() },
  { id:'usr_015', name:'Ethan Thompson',   email:'ethan.t@financesec.com',          role:'Risk Analyst',          plan:'Enterprise',  status:'Active',  grantedAt: new Date(now-86400000*50).toISOString() },
];

const AUDIT_LOGS = [
  { id:'log_001', timestamp: new Date(now-3600000*2).toISOString(),   adminUser:'admin',   targetUserId:'usr_001', targetUserName:'John Doe',      targetUserEmail:'john.doe@anthropic-client.com',  action:'PLAN_GRANTED',  oldPlan:'No Access',   newPlan:'Claude Pro',  notes:'Initial workspace onboard' },
  { id:'log_002', timestamp: new Date(now-3600000*4).toISOString(),   adminUser:'admin',   targetUserId:'usr_002', targetUserName:'Sarah Lee',     targetUserEmail:'sarah.lee@designhub.io',         action:'PLAN_UPGRADE',  oldPlan:'Claude Pro',  newPlan:'Claude Team', notes:'Upgraded for design collab' },
  { id:'log_003', timestamp: new Date(now-3600000*8).toISOString(),   adminUser:'svc_bot', targetUserId:'usr_003', targetUserName:'Alex Kim',      targetUserEmail:'alex.kim@fintechlabs.com',       action:'PLAN_GRANTED',  oldPlan:'No Access',   newPlan:'Claude Pro',  notes:'Auto-provisioned via SCIM sync' },
  { id:'log_004', timestamp: new Date(now-3600000*12).toISOString(),  adminUser:'admin',   targetUserId:'usr_008', targetUserName:'Olivia Taylor', targetUserEmail:'olivia.t@venturecapital.io',     action:'PLAN_REVOKED',  oldPlan:'Claude Pro',  newPlan:'No Access',   notes:'Employment ended' },
  { id:'log_005', timestamp: new Date(now-86400000).toISOString(),    adminUser:'admin',   targetUserId:'usr_004', targetUserName:'Emma Wilson',   targetUserEmail:'emma.wilson@cloudtech.org',      action:'PLAN_UPGRADE',  oldPlan:'Claude Team', newPlan:'Enterprise',  notes:'Promoted to platform admin' },
  { id:'log_006', timestamp: new Date(now-86400000*2).toISOString(),  adminUser:'svc_bot', targetUserId:'usr_005', targetUserName:'Michael Brown', targetUserEmail:'michael.b@acmesolutions.com',    action:'INITIAL_PROVISION', oldPlan:'No Access', newPlan:'Enterprise', notes:'CTO onboarding — enterprise tier' },
  { id:'log_007', timestamp: new Date(now-86400000*3).toISOString(),  adminUser:'admin',   targetUserId:'usr_012', targetUserName:'Ava White',     targetUserEmail:'ava.w@mediastream.tv',           action:'PLAN_REVOKED',  oldPlan:'Claude Team', newPlan:'No Access',   notes:'Contract ended — access revoked' },
  { id:'log_008', timestamp: new Date(now-86400000*5).toISOString(),  adminUser:'admin',   targetUserId:'usr_006', targetUserName:'Sophia Martinez',targetUserEmail:'sophia.m@creativeworks.co',    action:'PLAN_GRANTED',  oldPlan:'No Access',   newPlan:'Claude Pro',  notes:'New hire onboard' },
  { id:'log_009', timestamp: new Date(now-86400000*7).toISOString(),  adminUser:'svc_bot', targetUserId:'usr_007', targetUserName:'David Chen',    targetUserEmail:'david.chen@quantumai.net',       action:'PLAN_UPGRADE',  oldPlan:'Claude Pro',  newPlan:'Claude Team', notes:'Team expansion Q3' },
  { id:'log_010', timestamp: new Date(now-86400000*10).toISOString(), adminUser:'admin',   targetUserId:'usr_015', targetUserName:'Ethan Thompson',targetUserEmail:'ethan.t@financesec.com',         action:'PLAN_GRANTED',  oldPlan:'No Access',   newPlan:'Enterprise',  notes:'Finance security tier approved' },
];

const DRIFT_ALERTS = [
  { id:'d1', type:'unmanaged',       svc:'Anthropic SSO',       detail:{ email:'contractor_ext@vendor.com', entitlementExternalId:'sso/team-seat' },      detectedAt: new Date(now-7200000).toISOString(),    status:'open' },
  { id:'d2', type:'role_mismatch',   svc:'Claude Enterprise',   detail:{ email:'alice@internal.io', expectedPlan:'Claude Pro', actualPlan:'Enterprise' }, detectedAt: new Date(now-14400000).toISOString(),   status:'open' },
  { id:'d3', type:'missing',         svc:'Slack Enterprise',    detail:{ email:'bob@internal.io', entitlementExternalId:'slack/paid-seat' },              detectedAt: new Date(now-86400000).toISOString(),   status:'open' },
  { id:'d4', type:'orphaned',        svc:'GitHub Enterprise',   detail:{ email:'former.emp@internal.io' },                                               detectedAt: new Date(now-172800000).toISOString(),  status:'open' },
  { id:'d5', type:'over_provisioned',svc:'Claude Enterprise',   detail:{ email:'intern@internal.io', expectedPlan:'Claude Pro', actualPlan:'Enterprise' },detectedAt: new Date(now-259200000).toISOString(),  status:'open' },
];

const PLANS = [
  { key:'Claude Pro',  price:'$20 / user / mo', badge:'Individual Power Users',       color:'#5B5BD6', features:['5× usage limits vs Free','Priority access during peak','Claude 3.5 Sonnet/Haiku/Opus','Custom Projects & Artifacts','Early feature access'] },
  { key:'Claude Team', price:'$30 / user / mo', badge:'Collaboration & Scale',         color:'#2A7FFF', features:['All Pro features','Higher usage limits','200 000 token context','Centralized billing','Shared workspace & style guides'] },
  { key:'Enterprise',  price:'Custom Pricing',  badge:'Maximum Governance & Limits',   color:'#C77C0A', features:['500 000 token context','SSO & SCIM sync','Zero data retention','99.9% SLA + success manager','Granular audit logging'] },
  { key:'No Access',   price:'Free / Unassigned',badge:'No Paid Privileges',           color:'#DD3E45', features:['Standard Claude Free only','No enterprise workspace','Rate-limited availability','Admin privileges revoked'] },
];

module.exports = { USERS, AUDIT_LOGS, DRIFT_ALERTS, PLANS };
