import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Shield, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface TwoFactorPageProps {
  onSuccess: () => void;
  onBack: () => void;
  userEmail: string;
}

export const TwoFactorPage: React.FC<TwoFactorPageProps> = ({ onSuccess, onBack, userEmail }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');
    
    if (fullCode.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock validation - in real app, this would verify with backend
    if (fullCode === '123456') {
      toast.success('Two-factor authentication successful');
      onSuccess();
    } else {
      toast.error('Invalid verification code');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }

    setIsSubmitting(false);
  };

  const resendCode = async () => {
    toast.success('New verification code sent to your device');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] via-[#e9d8fd] to-[#c6f6d5] flex items-center justify-center p-6">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#bee3f8] rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#fed7cc] rounded-full blur-3xl"
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Login</span>
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#e9d8fd] rounded-2xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-[#553c9a]" />
            </div>
            <span className="text-2xl font-semibold text-gray-800">Two-Factor Auth</span>
          </div>
          <h1 className="text-3xl font-semibold text-gray-800 mb-2">Verify Your Identity</h1>
          <p className="text-gray-600">
            We've sent a 6-digit code to your authenticator app
          </p>
        </motion.div>

        {/* 2FA Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          <Card className="border-0 shadow-xl backdrop-blur-sm bg-white/90">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-semibold text-center text-gray-800">
                Enter Verification Code
              </CardTitle>
              <CardDescription className="text-center text-gray-600">
                Enter the 6-digit code from your authenticator app
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Code Input */}
                <div className="flex justify-center gap-3">
                  {code.map((digit, index) => (
                    <motion.input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-12 text-center text-xl font-semibold border border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm focus:border-[#553c9a] focus:ring-2 focus:ring-[#553c9a]/20 outline-none transition-all"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    />
                  ))}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || code.some(d => !d)}
                  className="w-full bg-gradient-to-r from-[#9AE6B4] to-[#68D391] hover:from-[#7dd69e] hover:to-[#5bb377] text-gray-800 rounded-xl py-3 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full"
                    />
                  ) : (
                    'Verify Code'
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Didn't receive the code?
                  </p>
                  <button
                    type="button"
                    onClick={resendCode}
                    className="text-sm text-[#553c9a] hover:text-[#442b7a] transition-colors font-medium"
                  >
                    Resend Code
                  </button>
                </div>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-center text-sm text-gray-600">
                  Demo Code: <strong>123456</strong>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};