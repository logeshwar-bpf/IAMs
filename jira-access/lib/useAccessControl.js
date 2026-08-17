import { useState, useEffect } from "react";
import { getStoredData, saveStoredData, getStoredAdminUser, saveStoredAdminUser } from "./storage";
import { createLogEntry, ACTION_TYPES } from "./audit";

export function useAccessControl() {
  const [adminUser, setAdminUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [people, setPeople] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize data from LocalStorage
  useEffect(() => {
    const data = getStoredData();
    setProjects(data.projects || []);
    setPeople(data.people || []);
    setLogs(data.logs || []);

    const storedAdmin = getStoredAdminUser();
    if (storedAdmin) {
      setAdminUser(storedAdmin);
    }
    setIsLoaded(true);
  }, []);

  // Save state updates to LocalStorage
  useEffect(() => {
    if (isLoaded) {
      saveStoredData(projects, people, logs);
    }
  }, [projects, people, logs, isLoaded]);

  // Handle Admin Sign In
  const handleLoginSuccess = (userPayload) => {
    setAdminUser(userPayload);
    saveStoredAdminUser(userPayload);

    const newLog = createLogEntry({
      action: ACTION_TYPES.ADMIN_LOGIN,
      targetPerson: userPayload.name || "Admin User",
      targetProject: "Security Gateway",
      details: `Admin authenticated successfully (${userPayload.role || "Master Admin"})`,
      actor: userPayload.name || "Provisioning Admin",
    });
    setLogs((prev) => [newLog, ...prev]);
  };

  // Handle Logout
  const handleLogout = () => {
    setAdminUser(null);
    saveStoredAdminUser(null);
  };

  // Toggle Access (Idempotent with State Transition Guard)
  const handleToggleAccess = (userId, projectId, actionType) => {
    const targetUser = people.find((p) => p.id === userId);
    const targetProject = projects.find((p) => p.id === projectId);

    if (!targetUser || !targetProject) return;

    const userProjectIds = targetUser.accessibleProjectIds || [];
    const hasAccess = userProjectIds.includes(projectId);

    // Guard against redundant/no-op log entries
    if (actionType === "GRANT" && hasAccess) return;
    if (actionType === "REVOKE" && !hasAccess) return;

    let updatedPeople = [...people];

    if (actionType === "GRANT") {
      updatedPeople = updatedPeople.map((u) => {
        if (u.id === userId) {
          const ids = u.accessibleProjectIds || [];
          return { ...u, accessibleProjectIds: [...ids, projectId] };
        }
        return u;
      });

      const newLog = createLogEntry({
        action: ACTION_TYPES.ACCESS_GRANTED,
        targetPerson: targetUser.name,
        targetProject: targetProject.name,
        details: `Granted access to ${targetProject.name} (${targetProject.accessibleDashboards} dashboards)`,
        actor: adminUser?.name || "Provisioning Admin",
      });

      setPeople(updatedPeople);
      setLogs((prev) => [newLog, ...prev]);
    } else if (actionType === "REVOKE") {
      updatedPeople = updatedPeople.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            accessibleProjectIds: (u.accessibleProjectIds || []).filter((id) => id !== projectId),
          };
        }
        return u;
      });

      const newLog = createLogEntry({
        action: ACTION_TYPES.ACCESS_REVOKED,
        targetPerson: targetUser.name,
        targetProject: targetProject.name,
        details: `Revoked access to ${targetProject.name} & linked dashboard permissions`,
        actor: adminUser?.name || "Provisioning Admin",
      });

      setPeople(updatedPeople);
      setLogs((prev) => [newLog, ...prev]);
    }
  };

  // Create Project
  const handleCreateProject = ({ name, key, category, accessibleDashboards, securityLevel, description }) => {
    const trimmedKey = key.trim().toUpperCase();
    const trimmedName = name.trim();

    const newProject = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `proj-${Date.now()}`,
      key: trimmedKey,
      name: trimmedName,
      description: description?.trim() || "Custom provisioned task project with analytical dashboards.",
      category: category?.trim() || "Internal Operations",
      accessibleDashboards: Number(accessibleDashboards) || 3,
      securityLevel: securityLevel || "Standard Internal",
    };

    setProjects((prev) => [newProject, ...prev]);

    const newLog = createLogEntry({
      action: ACTION_TYPES.PROJECT_PROVISIONED,
      targetPerson: adminUser?.name || "Provisioning Admin",
      targetProject: newProject.name,
      details: `Provisioned new Task Project '${newProject.name}' [${newProject.key}] with ${newProject.accessibleDashboards} dashboards`,
      actor: adminUser?.name || "Provisioning Admin",
    });

    setLogs((prev) => [newLog, ...prev]);
  };

  // Create User
  const handleCreateUser = ({ name, email, role, avatarBg }) => {
    const colorBgs = ["bg-purple-600", "bg-[#0052cc]", "bg-[#0070f3]", "bg-teal-600", "bg-rose-600", "bg-amber-600"];
    const selectedBg = avatarBg || colorBgs[Math.floor(Math.random() * colorBgs.length)];

    const newUser = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `usr-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role: role.trim() || "Team Member",
      avatarBg: selectedBg,
      accessibleProjectIds: [],
    };

    setPeople((prev) => [newUser, ...prev]);

    const newLog = createLogEntry({
      action: ACTION_TYPES.USER_CREATED,
      targetPerson: newUser.name,
      targetProject: "User Directory",
      details: `Registered new team member '${newUser.name}' (${newUser.role})`,
      actor: adminUser?.name || "Provisioning Admin",
    });

    setLogs((prev) => [newLog, ...prev]);
  };

  // Delete Project with Referential Integrity Cleanup
  const handleDeleteProject = (projectId) => {
    const targetProject = projects.find((p) => p.id === projectId);
    if (!targetProject) return;

    // 1. Remove project from projects state
    setProjects((prev) => prev.filter((p) => p.id !== projectId));

    // 2. Remove project ID from all users' accessibleProjectIds
    setPeople((prev) =>
      prev.map((u) => ({
        ...u,
        accessibleProjectIds: (u.accessibleProjectIds || []).filter((id) => id !== projectId),
      }))
    );

    // 3. Audit log entry
    const newLog = createLogEntry({
      action: ACTION_TYPES.PROJECT_DELETED,
      targetPerson: adminUser?.name || "Provisioning Admin",
      targetProject: targetProject.name,
      details: `Decommissioned task project '${targetProject.name}' and removed all user assignments`,
      actor: adminUser?.name || "Provisioning Admin",
    });

    setLogs((prev) => [newLog, ...prev]);
  };

  // Delete User with Cleanup
  const handleDeleteUser = (userId) => {
    const targetUser = people.find((u) => u.id === userId);
    if (!targetUser) return;

    setPeople((prev) => prev.filter((u) => u.id !== userId));

    const newLog = createLogEntry({
      action: ACTION_TYPES.USER_DELETED,
      targetPerson: targetUser.name,
      targetProject: "User Directory",
      details: `Removed user '${targetUser.name}' from directory and revoked all project permissions`,
      actor: adminUser?.name || "Provisioning Admin",
    });

    setLogs((prev) => [newLog, ...prev]);
  };

  // Clear Audit Logs with Archival Log Entry
  const handleClearLogs = () => {
    const count = logs.length;
    const clearLog = createLogEntry({
      action: ACTION_TYPES.LOGS_CLEARED,
      targetPerson: adminUser?.name || "Provisioning Admin",
      targetProject: "Audit Vault",
      details: `Cleared ${count} audit trail log entries`,
      actor: adminUser?.name || "Provisioning Admin",
    });
    setLogs([clearLog]);
  };

  return {
    adminUser,
    projects,
    people,
    logs,
    isLoaded,
    handleLoginSuccess,
    handleLogout,
    handleToggleAccess,
    handleCreateProject,
    handleCreateUser,
    handleDeleteProject,
    handleDeleteUser,
    handleClearLogs,
  };
}
