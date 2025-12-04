import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { AlertCircle, Heart, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { authAPI } from '../lib/api';
import { Footer } from './Footer';

interface LoginProps {
  onLogin: (user: any) => void;
  onRegister: () => void;
  onBackToHome?: () => void;
}

export function Login({ onLogin, onRegister, onBackToHome }: LoginProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authAPI.login(email, password);
      onLogin(data.user);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Background with Video */}
      <div className="relative flex-1 flex items-center justify-center">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/media/banner.mp4" type="video/mp4" />
        </video>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/95 via-purple-800/90 to-indigo-900/95" />

        {/* Login Card */}
        <div className="relative z-10 w-full max-w-md p-4">
          <Card className="shadow-2xl border-purple-200">
            <CardHeader className="space-y-4">
              {onBackToHome && (
                <Button
                  variant="ghost"
                  className="w-fit -mt-2"
                  onClick={onBackToHome}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              )}
              <div className="flex justify-center">
                <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-3 rounded-full">
                  <Heart className="h-8 w-8 text-pink-400 fill-pink-400" />
                </div>
              </div>
              <div className="text-center">
                <CardTitle className="text-2xl">Shalom Medical Center</CardTitle>
                <CardDescription>Sign in to access your account</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="text-right">
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto text-sm"
                    onClick={() => navigate('/forgot-password')}
                  >
                    Forgot password?
                  </Button>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-2 text-muted-foreground">
                      New patient?
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-4"
                  onClick={onRegister}
                >
                  Register as Patient
                </Button>
              </div>

              <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-muted-foreground mb-2">Demo Accounts Available:</p>
                <div className="space-y-1 text-xs">
                  <p><strong>Admin:</strong> admin@hospital.com</p>
                  <p><strong>Doctor:</strong> dr.smith@hospital.com</p>
                  <p><strong>Patient:</strong> john.doe@email.com</p>
                  <p className="text-xs text-muted-foreground mt-2">Contact your administrator for login credentials.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
