import React from 'react';
import Badge from './Badge';

interface StatusBadgeProps {
    status: string;
    text?: string;
    className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, text, className = '' }) => {
    const getStatusConfig = (status: string) => {
        if (!status) return { variant: 'secondary' as const, text: text || 'Unknown' };
        switch (status.toLowerCase()) {
            case 'active':
            case 'approved':
            case 'verified':
            case 'optimal':
                return { variant: 'success' as const, text: text || 'Active' };
            case 'inactive':
            case 'rejected':
            case 'critical':
            case 'error':
                return { variant: 'danger' as const, text: text || 'Inactive' };
            case 'pending':
            case 'warning':
            case 'on leave':
                return { variant: 'warning' as const, text: text || status };
            case 'completed':
            case 'shipped':
                return { variant: 'primary' as const, text: text || status };
            default:
                return { variant: 'secondary' as const, text: text || status };
        }
    };

    const { variant, text: statusText } = getStatusConfig(status);

    return (
        <Badge variant={variant} className={className}>
            {statusText}
        </Badge>
    );
};

export default StatusBadge;
