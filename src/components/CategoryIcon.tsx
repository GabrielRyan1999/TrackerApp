import React from 'react';

const ICON_MAP: Record<string, string> = {
  // Needs
  housing: '🏠',
  home: '🏠',
  groceries: '🛒',
  cart: '🛒',
  shoppingcart: '🛒',
  utilities: '⚡',
  zap: '⚡',
  power: '⚡',
  transport: '🚗',
  transportation: '🚗',
  car: '🚗',
  healthcare: '💊',
  health: '💊',
  heartpulse: '💊',
  insurance: '🛡️',
  shield: '🛡️',
  shieldalert: '🛡️',
  education: '🎓',
  school: '🎓',
  graduationcap: '🎓',

  // Wants
  dining: '🍔',
  food: '🍔',
  restaurant: '🍔',
  utensils: '🍔',
  shopping: '🛍️',
  bag: '🛍️',
  shoppingbag: '🛍️',
  entertainment: '🎬',
  film: '🎬',
  movie: '🎬',
  hobbies: '🏋️',
  gym: '🏋️',
  sport: '🏋️',
  dumbbell: '🏋️',
  travel: '✈️',
  plane: '✈️',
  flight: '✈️',

  // Savings
  savings: '💰',
  piggybank: '💰',
  investments: '📈',
  invest: '📈',
  trendingup: '📈',
  extradebt: '💳',
  extra_debt: '💳',
  debt: '💳',
  creditcard: '💳',

  // Misc
  wallet: '👛',
  uncategorized: '❓',
  helpcircle: '❓',
  unknown: '❓',
  tag: '🏷️',
};

interface CategoryIconProps {
  name?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  name = '',
  className = 'text-base',
  style,
}) => {
  const trimmed = (name || '').trim();
  const normalized = trimmed.toLowerCase().replace(/[-_\s]/g, '');

  // Look up mapped emoji or fallback to original emoji/string
  let emoji = ICON_MAP[normalized] || ICON_MAP[trimmed];
  if (!emoji) {
    if (trimmed.length > 0) {
      emoji = trimmed;
    } else {
      emoji = '🏷️';
    }
  }

  return (
    <span
      className={`inline-flex items-center justify-center select-none leading-none shrink-0 ${className}`}
      style={style}
      role="img"
      aria-label={trimmed || 'category icon'}
    >
      {emoji}
    </span>
  );
};

export default CategoryIcon;
