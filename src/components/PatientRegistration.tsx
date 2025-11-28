import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, AlertCircle, CheckCircle2, Heart } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { authAPI } from '../lib/api';
import { Footer } from './Footer';

interface PatientRegistrationProps {
  onSuccess: (user: any) => void;
  onBackToLogin: () => void;
  onBackToHome?: () => void;
}

export function PatientRegistration({ onSuccess, onBackToLogin, onBackToHome }: PatientRegistrationProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
    bloodGroup: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register(formData);
      setSuccess(true);
      setSuccessMessage(response.message);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        onBackToLogin();
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Background with Video */}
        <div className="relative flex-1 flex items-center justify-center">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/media/banner.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/95 via-purple-800/90 to-indigo-900/95" />

          <div className="relative z-10 w-full max-w-md p-4">
            <Card className="shadow-2xl border-purple-200">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <CheckCircle2 className="h-16 w-16 text-green-600" />
                </div>
                <CardTitle>Registration Successful!</CardTitle>
                <CardDescription>
                  {successMessage}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertDescription>
                    Please check your email inbox and click the verification link to activate your account.
                    You'll be redirected to the login page shortly...
                  </AlertDescription>
                </Alert>
                <Button
                  className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  onClick={onBackToLogin}
                >
                  Go to Login
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Background with Video */}
      <div className="relative flex-1 flex items-center justify-center py-8">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/media/banner.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/95 via-purple-800/90 to-indigo-900/95" />

        <div className="relative z-10 w-full max-w-2xl p-4">
          <Card className="shadow-2xl border-purple-200">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Button
                  variant="ghost"
                  className="w-fit"
                  onClick={onBackToLogin}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </Button>
                {onBackToHome && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onBackToHome}
                  >
                    Back to Home
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-2 rounded-full">
                  <Heart className="h-6 w-6 text-pink-400 fill-pink-400" />
                </div>
                <div>
                  <CardTitle>Patient Registration</CardTitle>
                  <CardDescription>Join Shalom Medical Center</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="555-1234"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bloodGroup">Blood Group</Label>
                    <Input
                      id="bloodGroup"
                      name="bloodGroup"
                      placeholder="A+"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="123 Main St, City, State"
                    value={formData.address}
                    onChange={handleChange}
                  />
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
                  {loading ? 'Registering...' : 'Register'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
