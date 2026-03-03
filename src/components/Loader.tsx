import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[85vh] bg-[var(--surface)] text-center p-5" data-region="loader">
      {/* Animated cat paw spinner */}
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 rounded-full border-[3px] border-[var(--border)]" />
        <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-primary animate-spin" />
        <span className="absolute inset-0 flex items-center justify-center text-2xl">🐾</span>
      </div>
      <p className="text-lg font-semibold text-[var(--text)]">
        Loading&hellip;
      </p>
      <p className="text-sm text-[var(--text-muted)] mt-1">
        Hang tight, MingMing is fetching things!
      </p>
    </div>
  );
};

export default Loader;
