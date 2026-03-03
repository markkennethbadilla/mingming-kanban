import React from 'react';
import { PixelCatSleep } from '@/components/pixel-cats';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[85vh] text-center p-5" style={{ backgroundColor: 'var(--background)' }} data-region="loader">
      <div className="cat-bounce mb-4">
        <PixelCatSleep size={64} />
      </div>
      <p className="text-base font-extrabold text-[var(--text)]">
        Loading&hellip;
      </p>
      <p className="text-sm text-[var(--text-muted)] mt-1 font-semibold">
        MingMing is stretching... one moment!
      </p>
    </div>
  );
};

export default Loader;
