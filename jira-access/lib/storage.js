import { INITIAL_PROJECTS, INITIAL_PEOPLE, INITIAL_LOGS } from "./fixtures";

export const KEYS = Object.freeze({
  projects: "jira:projects",
  people: "jira:people",
  logs: "jira:logs",
  admin: "jira:admin-user",
  theme: "jira:theme",
  // Legacy keys fallback support
  legacyProjects: "jira_projects",
  legacyPeople: "jira_people",
  legacyLogs: "jira_logs",
  legacyAdmin: "jira_admin_user",
  legacyTheme: "iam-theme",
});

/**
 * Safely parse JSON from localStorage with fallbacks, shape checks, and self-healing.
 */
const readJSON = (key, legacyKey, fallback) => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key) || (legacyKey ? localStorage.getItem(legacyKey) : null);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (Array.isArray(fallback) && !Array.isArray(parsed)) {
      console.warn(`Discarding non-array data for key "${key}"`);
      return fallback;
    }
    return parsed;
  } catch (err) {
    console.warn(`Discarding corrupt localStorage key "${key}"`, err);
    try {
      localStorage.removeItem(key);
      if (legacyKey) localStorage.removeItem(legacyKey);
    } catch {
      /* ignore */
    }
    return fallback;
  }
};

/**
 * Retrieves application data from LocalStorage with safe fallbacks.
 */
export const getStoredData = () => {
  if (typeof window === "undefined") {
    return { projects: INITIAL_PROJECTS, people: INITIAL_PEOPLE, logs: INITIAL_LOGS };
  }
  return {
    projects: readJSON(KEYS.projects, KEYS.legacyProjects, INITIAL_PROJECTS),
    people: readJSON(KEYS.people, KEYS.legacyPeople, INITIAL_PEOPLE),
    logs: readJSON(KEYS.logs, KEYS.legacyLogs, INITIAL_LOGS),
  };
};

/**
 * Safely saves application data to LocalStorage with quota protection & log capping.
 */
export const saveStoredData = (projects, people, logs) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEYS.projects, JSON.stringify(projects));
    localStorage.setItem(KEYS.people, JSON.stringify(people));
    // Cap logs to prevent LocalStorage quota overflow
    const cappedLogs = Array.isArray(logs) ? logs.slice(0, 500) : [];
    localStorage.setItem(KEYS.logs, JSON.stringify(cappedLogs));
  } catch (err) {
    console.error("Failed to persist Jira state to LocalStorage", err);
  }
};

/**
 * Reads stored Admin User session.
 */
export const getStoredAdminUser = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEYS.admin) || localStorage.getItem(KEYS.legacyAdmin);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Persists or clears Admin User session.
 */
export const saveStoredAdminUser = (user) => {
  if (typeof window === "undefined") return;
  try {
    if (user) {
      localStorage.setItem(KEYS.admin, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEYS.admin);
      localStorage.removeItem(KEYS.legacyAdmin);
    }
  } catch (err) {
    console.error("Failed to persist admin user session", err);
  }
};
