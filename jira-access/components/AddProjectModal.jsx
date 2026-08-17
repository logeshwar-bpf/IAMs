"use client";

import React, { useState } from "react";
import Modal from "./Modal";
import { Plus, Layers } from "lucide-react";

export default function AddProjectModal({ isOpen, onClose, onSubmit, existingProjects = [] }) {
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [category, setCategory] = useState("Internal Operations");
  const [accessibleDashboards, setAccessibleDashboards] = useState("4");
  const [securityLevel, setSecurityLevel] = useState("Standard Internal");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    const trimmedKey = key.trim().toUpperCase();

    if (!trimmedName) {
      setError("Project Name is required.");
      return;
    }
    if (!trimmedKey) {
      setError("Project Key is required.");
      return;
    }

    // Check duplicate key
    const isDuplicate = existingProjects.some((p) => p.key?.toUpperCase() === trimmedKey);
    if (isDuplicate) {
      setError(`Project Key '${trimmedKey}' already exists. Please choose a unique key.`);
      return;
    }

    onSubmit({
      name: trimmedName,
      key: trimmedKey,
      category: category.trim() || "Internal Operations",
      accessibleDashboards: parseInt(accessibleDashboards, 10) || 3,
      securityLevel,
      description: description.trim() || "Custom provisioned task project with analytical dashboards.",
    });

    // Reset form
    setName("");
    setKey("");
    setCategory("Internal Operations");
    setAccessibleDashboards("4");
    setSecurityLevel("Standard Internal");
    setDescription("");
    onClose();
  };

  const handleSuggestKey = (nameVal) => {
    setName(nameVal);
    if (!key || key.startsWith("PROJ-")) {
      const slug = nameVal
        .trim()
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .split(/\s+/)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 4);
      if (slug) {
        setKey(`PROJ-${slug}`);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Provision New Task Project" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-[var(--risk-soft)] border border-[var(--risk)] text-xs text-[var(--risk)] font-semibold">
            {error}
          </div>
        )}

        <div className="field">
          <span>Project Name *</span>
          <input
            type="text"
            value={name}
            onChange={(e) => handleSuggestKey(e.target.value)}
            placeholder="e.g. Identity Management Core"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="field">
            <span>Project Key *</span>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase())}
              placeholder="PROJ-IAM"
              required
            />
          </div>

          <div className="field">
            <span>Accessible Dashboards</span>
            <input
              type="number"
              min="1"
              max="50"
              value={accessibleDashboards}
              onChange={(e) => setAccessibleDashboards(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="field">
            <span>Category</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="Financial Engineering">Financial Engineering</option>
              <option value="Mobile Product">Mobile Product</option>
              <option value="DevOps & Platform">DevOps & Platform</option>
              <option value="Product Design">Product Design</option>
              <option value="Data Science">Data Science</option>
              <option value="Internal Operations">Internal Operations</option>
            </select>
          </div>

          <div className="field">
            <span>Security Level</span>
            <select value={securityLevel} onChange={(e) => setSecurityLevel(e.target.value)}>
              <option value="Public Internal">Public Internal</option>
              <option value="Standard Internal">Standard Internal</option>
              <option value="Standard Restricted">Standard Restricted</option>
              <option value="Restricted Confidential">Restricted Confidential</option>
              <option value="Strict / Admin Only">Strict / Admin Only</option>
              <option value="Mission Critical">Mission Critical</option>
            </select>
          </div>
        </div>

        <div className="field">
          <span>Project Description</span>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief scope and objectives of this project..."
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
          <button type="button" onClick={onClose} className="btn btn-ghost btn-sm">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-sm">
            <Plus className="w-4 h-4" />
            <span>Provision Project</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
