import React from 'react';
import Button from './Button';
import { 
  PlusIcon, 
  ArrowUpTrayIcon, 
  ArrowDownTrayIcon, 
  DocumentArrowDownIcon 
} from '@heroicons/react/24/outline';

interface ActionBarProps {
  onAdd?: () => void;
  addLabel?: string;
  onUpload?: () => void;
  onDownload?: () => void;
  onDownloadTemplate?: () => void;
  showAdd?: boolean;
  showUpload?: boolean;
  showDownload?: boolean;
  showTemplate?: boolean;
  isUploading?: boolean;
}

const ActionBar: React.FC<ActionBarProps> = ({
  onAdd,
  addLabel = 'Add New',
  onUpload,
  onDownload,
  onDownloadTemplate,
  showAdd = true,
  showUpload = true,
  showDownload = true,
  showTemplate = true,
  isUploading = false,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {showTemplate && onDownloadTemplate && (
        <Button
          variant="secondary"
          size="sm"
          className="h-10 text-xs font-bold border-secondary-200"
          onClick={onDownloadTemplate}
          leftIcon={<DocumentArrowDownIcon className="w-4 h-4" />}
        >
          Download Template
        </Button>
      )}

      {showUpload && onUpload && (
        <Button
          variant="secondary"
          size="sm"
          className="h-10 text-xs font-bold border-secondary-200"
          onClick={onUpload}
          disabled={isUploading}
          leftIcon={<ArrowUpTrayIcon className="w-4 h-4" />}
        >
          {isUploading ? 'Uploading...' : 'Upload Excel'}
        </Button>
      )}

      {showDownload && onDownload && (
        <Button
          variant="secondary"
          size="sm"
          className="h-10 text-xs font-bold border-secondary-200"
          onClick={onDownload}
          leftIcon={<ArrowDownTrayIcon className="w-4 h-4" />}
        >
          Download Excel
        </Button>
      )}

      {showAdd && onAdd && (
        <Button
          variant="primary"
          size="sm"
          className="h-10 px-6 text-xs font-bold shadow-md shadow-primary-500/10"
          onClick={onAdd}
          leftIcon={<PlusIcon className="w-4 h-4" />}
        >
          {addLabel}
        </Button>
      )}
    </div>
  );
};

export default ActionBar;
