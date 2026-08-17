"use client";

import React from "react";
import SignInPage from "../components/SignInPage";
import Dashboard from "../components/Dashboard";
import { useAccessControl } from "../lib/useAccessControl";

export default function Page() {
  const {
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
  } = useAccessControl();

  if (!isLoaded) {
    return (
      <div className="min-h-screen w-full bg-[#1A1A19] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#38bdf8] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-gray-400 font-mono">Initializing Jira Provisioning Engine...</span>
        </div>
      </div>
    );
  }

  if (!adminUser) {
    return <SignInPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Dashboard
      adminUser={adminUser}
      projects={projects}
      people={people}
      logs={logs}
      onLogout={handleLogout}
      onToggleAccess={handleToggleAccess}
      onClearLogs={handleClearLogs}
      onCreateProject={handleCreateProject}
      onCreateUser={handleCreateUser}
      onDeleteProject={handleDeleteProject}
      onDeleteUser={handleDeleteUser}
    />
  );
}

