export const ACTION_TYPES = Object.freeze({
  ACCESS_GRANTED: "ACCESS_GRANTED",
  ACCESS_REVOKED: "ACCESS_REVOKED",
  ADMIN_LOGIN: "ADMIN_LOGIN",
  PROJECT_PROVISIONED: "PROJECT_PROVISIONED",
  USER_CREATED: "USER_CREATED",
  LOGS_CLEARED: "LOGS_CLEARED",
  PROJECT_DELETED: "PROJECT_DELETED",
  USER_DELETED: "USER_DELETED",
});

export const ACTION_META = Object.freeze({
  [ACTION_TYPES.ACCESS_GRANTED]: {
    label: "Access Granted",
    pillClass: "approved",
    iconName: "CheckCircle2",
  },
  [ACTION_TYPES.ACCESS_REVOKED]: {
    label: "Access Revoked",
    pillClass: "revoked",
    iconName: "XCircle",
  },
  [ACTION_TYPES.ADMIN_LOGIN]: {
    label: "Admin Login",
    pillClass: "primary",
    iconName: "Shield",
  },
  [ACTION_TYPES.PROJECT_PROVISIONED]: {
    label: "Project Provisioned",
    pillClass: "info",
    iconName: "Sparkles",
  },
  [ACTION_TYPES.USER_CREATED]: {
    label: "User Registered",
    pillClass: "info",
    iconName: "Sparkles",
  },
  [ACTION_TYPES.LOGS_CLEARED]: {
    label: "Audit Logs Cleared",
    pillClass: "warn",
    iconName: "Trash2",
  },
  [ACTION_TYPES.PROJECT_DELETED]: {
    label: "Project Deleted",
    pillClass: "revoked",
    iconName: "Trash2",
  },
  [ACTION_TYPES.USER_DELETED]: {
    label: "User Removed",
    pillClass: "revoked",
    iconName: "Trash2",
  },
});

/**
 * Creates a structured, standardized Audit Log record.
 */
export const createLogEntry = ({ action, targetPerson, targetProject, details, actor }) => {
  return {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    actor: actor || "Provisioning Admin",
    action,
    targetPerson: targetPerson || "System",
    targetProject: targetProject || "Directory",
    details: details || "",
    ipAddress: "—",
  };
};
