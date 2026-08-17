"use client";

import React, { useState } from "react";
import Modal from "./Modal";
import { UserPlus } from "lucide-react";

const AVATAR_COLORS = [
  { label: "Purple", value: "bg-purple-600" },
  { label: "Blue", value: "bg-blue-600" },
  { label: "Cyan", value: "bg-cyan-600" },
  { label: "Teal", value: "bg-teal-600" },
  { label: "Emerald", value: "bg-emerald-600" },
  { label: "Rose", value: "bg-rose-600" },
  { label: "Amber", value: "bg-amber-600" },
  { label: "Indigo", value: "bg-indigo-600" },
];

export default function AddUserModal({ isOpen, onClose, onSubmit, existingPeople = [] }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Software Engineer");
  const [avatarBg, setAvatarBg] = useState("bg-purple-600");
  const [error, setError] = useState("");

  const handleNameChange = (val) => {
    setName(val);
    if (!email || email.includes("@jira.internal")) {
      const suggested = val.toLowerCase().trim().replace(/\s+/g, ".");
      setEmail(suggested ? `${suggested}@jira.internal` : "");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedRole = role.trim();

    if (!trimmedName) {
      setError("Full Name is required.");
      return;
    }

    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setError("Valid Email address is required.");
      return;
    }

    // Check duplicate email
    const isDuplicate = existingPeople.some((p) => p.email?.toLowerCase() === trimmedEmail);
    if (isDuplicate) {
      setError(`Email '${trimmedEmail}' is already registered.`);
      return;
    }

    onSubmit({
      name: trimmedName,
      email: trimmedEmail,
      role: trimmedRole || "Team Member",
      avatarBg,
    });

    // Reset form
    setName("");
    setEmail("");
    setRole("Software Engineer");
    setAvatarBg("bg-purple-600");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register New Team Member" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-[var(--risk-soft)] border border-[var(--risk)] text-xs text-[var(--risk)] font-semibold">
            {error}
          </div>
        )}

        <div className="field">
          <span>Full Name *</span>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Jordan Miller"
            required
          />
        </div>

        <div className="field">
          <span>Email Address *</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jordan.miller@jira.internal"
            required
          />
        </div>

        <div className="field">
          <span>Job Title / Role</span>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Senior Frontend Engineer"
            required
          />
        </div>

        <div className="field">
          <span>Avatar Theme Color</span>
          <div className="flex items-center gap-2 flex-wrap mt-1">
            {AVATAR_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setAvatarBg(c.value)}
                className={`w-7 h-7 rounded-full ${c.value} transition-transform ${
                  avatarBg === c.value ? "ring-2 ring-offset-2 ring-[var(--primary)] scale-110" : "opacity-80 hover:opacity-100"
                }`}
                title={c.label}
                aria-label={`Select ${c.label} color`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
          <button type="button" onClick={onClose} className="btn btn-ghost btn-sm">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-sm">
            <UserPlus className="w-4 h-4" />
            <span>Add Team Member</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
