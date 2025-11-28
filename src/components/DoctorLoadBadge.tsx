import { Badge } from './ui/badge';

interface DoctorLoadBadgeProps {
    loadStatus: 'available' | 'busy' | 'full';
    appointmentCount: number;
}

export function DoctorLoadBadge({ loadStatus, appointmentCount }: DoctorLoadBadgeProps) {
    const variants = {
        available: {
            variant: 'default' as const,
            className: 'bg-green-600 hover:bg-green-700',
            icon: '✓',
            label: 'Available'
        },
        busy: {
            variant: 'default' as const,
            className: 'bg-amber-600 hover:bg-amber-700',
            icon: '⚠',
            label: 'Busy'
        },
        full: {
            variant: 'destructive' as const,
            className: 'bg-red-600 hover:bg-red-700',
            icon: '✕',
            label: 'Fully Booked'
        }
    };

    const config = variants[loadStatus];

    return (
        <div className="flex items-center gap-2">
            <Badge variant={config.variant} className={config.className}>
                {config.icon} {config.label}
            </Badge>
            <span className="text-sm text-muted-foreground">
                {appointmentCount}/10 appointments today
            </span>
        </div>
    );
}
