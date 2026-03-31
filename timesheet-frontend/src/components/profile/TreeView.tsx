import React, { useState } from 'react';
import { 
  ChevronRightIcon, 
  ChevronDownIcon, 
  UserCircleIcon,
  UserGroupIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

interface TreeItem {
  id: string;
  name: string;
  type: 'department' | 'team' | 'employee';
  role?: string;
  isCurrentUser?: boolean;
  children?: TreeItem[];
}

interface TreeViewProps {
  data: TreeItem[];
  className?: string;
}

const TreeView: React.FC<TreeViewProps> = ({ data, className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {data.map(item => (
        <TreeNode key={item.id} item={item} depth={0} />
      ))}
    </div>
  );
};

const TreeNode: React.FC<{ item: TreeItem; depth: number }> = ({ item, depth }) => {
  const [isExpanded, setIsExpanded] = useState(depth < 1); // Expand first level by default
  const hasChildren = item.children && item.children.length > 0;

  const Icon = item.type === 'department' 
    ? BuildingOfficeIcon 
    : item.type === 'team' 
      ? UserGroupIcon 
      : UserCircleIcon;

  return (
    <div className="select-none">
      <div 
        className={`flex items-center gap-3 p-2 rounded-xl transition-all duration-200 cursor-pointer tree-node-depth-${Math.min(depth, 4)} ${
          item.isCurrentUser 
            ? 'bg-primary-50 text-primary-700 ring-1 ring-primary-100' 
            : 'hover:bg-secondary-50 text-secondary-700'
        }`}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          {hasChildren ? (
            isExpanded ? <ChevronDownIcon className="w-3 h-3 text-secondary-400" /> : <ChevronRightIcon className="w-3 h-3 text-secondary-400" />
          ) : (
            <div className="w-3 h-3" />
          )}
          <Icon className={`w-4 h-4 ${item.isCurrentUser ? 'text-primary-600' : 'text-secondary-400'}`} />
        </div>
        
        <div className="flex items-center gap-2 overflow-hidden">
          <span className={`text-sm ${item.isCurrentUser ? 'font-bold' : 'font-medium'} truncate`}>{item.name}</span>
          {item.role && (
            <span className="px-1.5 py-0.5 rounded-full bg-secondary-100 text-[9px] font-black uppercase text-secondary-500 tracking-tighter">
              {item.role}
            </span>
          )}
          {item.isCurrentUser && (
            <span className="px-1.5 py-0.5 rounded-full bg-primary-100 text-[9px] font-black uppercase text-primary-600 tracking-tighter italic">
              Me
            </span>
          )}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-1 transition-all duration-300">
          {item.children?.map(child => (
            <TreeNode key={child.id} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeView;
