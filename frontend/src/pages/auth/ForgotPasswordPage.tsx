import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button, Input } from '@/components/ui/Form';
import { Card } from '@/components/ui/Card';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setEmailSent(true);
    }, 1000);
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-neutral-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-green-medium to-primary-green-dark rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">U</span>
            </div>
            <h1 className="text-2xl font-bold text-text-primary">Check Your Email</h1>
            <p className="text-text-secondary mt-2">We've sent password reset instructions</p>
          </div>

          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-primary-green-light rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-primary-green-dark" />
            </div>
            
            <h2 className="text-lg font-semibold text-text-primary mb-2">
              Reset Link Sent
            </h2>
            
            <p className="text-text-secondary mb-6">
              We've sent password reset instructions to <strong>{email}</strong>. 
              Please check your email and follow the link to reset your password.
            </p>

            <div className="space-y-3">
              <Button
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                }}
                className="w-full"
              >
                Send Another Email
              </Button>
              
              <Link
                to="/auth/login"
                className="block w-full text-center text-primary-green-dark hover:text-primary-green-medium font-medium transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-green-medium to-primary-green-dark rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">U</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Forgot Password</h1>
          <p className="text-text-secondary mt-2">Enter your email to reset your password</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={Mail}
              placeholder="Enter your email"
              required
            />

            <Button
              type="submit"
              className="w-full"
              loading={loading}
              disabled={loading}
            >
              Send Reset Link
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/auth/login"
              className="inline-flex items-center text-primary-green-dark hover:text-primary-green-medium font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Link>
          </div>
        </Card>

        {/* Help text */}
        <div className="mt-6 p-4 bg-primary-blue-light rounded-lg">
          <h3 className="text-sm font-medium text-text-primary mb-2">Need Help?</h3>
          <p className="text-xs text-text-secondary">
            If you're having trouble accessing your account, contact your HR administrator or IT support team.
          </p>
        </div>
      </div>
    </div>
  );
};
