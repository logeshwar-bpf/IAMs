'use client';

import React from 'react';

export default function LiveBackground() {
  return (
    <div className="live-bg-container" aria-hidden="true">
      <div className="glow-orb orb-1" />
      <div className="glow-orb orb-2" />
      <div className="glow-orb orb-3" />
      <div className="glow-orb orb-4" />
      <div className="bg-grid-pattern" />
      <div className="bg-vignette" />
    </div>
  );
}
