import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Plus } from 'lucide-react';

interface FABProps {
  onClick?: () => void;
  icon?: React.ReactNode;
  label?: string;
  /** Page-specific context to determine the FAB action */
  context?: 'timesheet' | 'leave' | 'reimbursement' | 'default';
}

const FAB: React.FC<FABProps> = ({
  onClick,
  icon,
  label = 'Add',
  context = 'default'
}) => {
  const { themeMode } = useTheme();
  const isDark = themeMode === 'dark';
  const navigate = useNavigate();

  if (!onClick) return null;

  return (
    <button
      onClick={onClick}
      className={`
        md:hidden fixed z-40 shadow-2xl
        right-4 bottom-[76px]
        w-14 h-14 rounded-2xl
        flex items-center justify-center
        transition-all duration-300 ease-out
        active:scale-90 hover:scale-105
        hover:shadow-3xl
        ${isDark
          ? 'bg-blue-600 text-white shadow-blue-900/50 hover:bg-blue-500'
          : 'bg-blue-600 text-white shadow-blue-600/40 hover:bg-blue-700'
        }
      `}
      style={{
        bottom: `calc(76px + env(safe-area-inset-bottom, 0px))`,
      }}
      aria-label={label}
      title={label}
    >
      {icon || <Plus className="w-6 h-6 stroke-[2.5]" />}
    </button>
  );
};

export default FAB;
