import React from 'react';

interface DietaryBadgeProps {
  isVeg: boolean;
  isJain?: boolean;
  size?: 'sm' | 'md';
}

export const DietaryBadge: React.FC<DietaryBadgeProps> = ({ isVeg, isJain, size = 'md' }) => {
  const boxSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';

  return (
    <div className="inline-flex items-center gap-1.5" role="group" aria-label={isVeg ? 'Vegetarian dish' : 'Non-vegetarian dish'}>
      {/* Official FSSAI Indian Dietary Symbol */}
      <span
        className={`inline-flex items-center justify-center border ${boxSize} ${
          isVeg ? 'border-emerald-700 bg-emerald-50' : 'border-amber-900 bg-amber-50'
        } rounded-xs`}
        title={isVeg ? 'Vegetarian (FSSAI)' : 'Non-Vegetarian (FSSAI)'}
      >
        <span
          className={`${dotSize} rounded-full ${
            isVeg ? 'bg-emerald-700' : 'bg-amber-900'
          }`}
        />
      </span>

      <span
        className={`font-semibold tracking-wide uppercase text-[10px] ${
          isVeg ? 'text-emerald-800' : 'text-amber-950'
        }`}
      >
        {isVeg ? 'Veg' : 'Non-Veg'}
      </span>

      {isJain && (
        <span className="bg-amber-100 text-amber-900 border border-amber-300 font-bold px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider">
          Jain Option
        </span>
      )}
    </div>
  );
};
