import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from './ui/alert-dialog';

interface QueueConfirmationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    doctorName: string;
    date: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export function QueueConfirmationDialog({
    open,
    onOpenChange,
    doctorName,
    date,
    onConfirm,
    onCancel,
}: QueueConfirmationDialogProps) {
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>⏳ Doctor Fully Booked</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-3">
                        <p>
                            <strong>Dr. {doctorName}</strong> is fully booked for{' '}
                            <strong>{formattedDate}</strong>.
                        </p>

                        <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded">
                            <p className="text-sm text-amber-900">
                                <strong>📧 We'll notify you!</strong>
                            </p>
                            <p className="text-sm text-amber-800 mt-1">
                                Would you like to join the waitlist? You'll be automatically assigned a slot
                                and notified via email when one becomes available.
                            </p>
                        </div>

                        <p className="text-sm">
                            Alternatively, you can choose another available doctor with the same specialization.
                        </p>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onCancel}>
                        Choose Another Doctor
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Join Waitlist
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
