import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { authAPI } from '../lib/api';

export function EmailVerification() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyEmail = async () => {
            const token = searchParams.get('token');

            if (!token) {
                setStatus('error');
                setMessage('Invalid verification link');
                return;
            }

            try {
                const response = await authAPI.verifyEmail(token);
                setStatus('success');
                setMessage(response.message);
            } catch (error: any) {
                setStatus('error');
                setMessage(error.message || 'Email verification failed');
            }
        };

        verifyEmail();
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        {status === 'loading' && (
                            <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
                        )}
                        {status === 'success' && (
                            <CheckCircle2 className="h-16 w-16 text-green-600" />
                        )}
                        {status === 'error' && (
                            <XCircle className="h-16 w-16 text-red-600" />
                        )}
                    </div>
                    <CardTitle>
                        {status === 'loading' && 'Verifying Email...'}
                        {status === 'success' && 'Email Verified!'}
                        {status === 'error' && 'Verification Failed'}
                    </CardTitle>
                    <CardDescription>
                        {status === 'loading' && 'Please wait while we verify your email address'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {status !== 'loading' && (
                        <>
                            <Alert variant={status === 'success' ? 'default' : 'destructive'}>
                                <AlertDescription>{message}</AlertDescription>
                            </Alert>

                            <Button
                                className="w-full mt-4"
                                onClick={() => navigate('/')}
                            >
                                {status === 'success' ? 'Go to Login' : 'Back to Home'}
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
