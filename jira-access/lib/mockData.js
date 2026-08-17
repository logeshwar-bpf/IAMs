// Re-export modular state layers for backward compatibility
export { INITIAL_PROJECTS, INITIAL_PEOPLE, INITIAL_LOGS } from "./fixtures";
export { getStoredData, saveStoredData, KEYS } from "./storage";
export { createLogEntry, ACTION_TYPES } from "./audit";

