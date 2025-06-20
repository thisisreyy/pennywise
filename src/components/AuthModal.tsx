import React, { useState } from 'react';
import { X, Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle, ArrowLeft, Send } from 'lucide-react';
import { signIn, signUp, validateEmail, validatePassword, LoginCredentials, SignupCredentials } from '../utils/auth';
import { User as UserType } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserType) => void;
}

type AuthMode = 'signin' | 'signup' | 'forgot-password' | 'reset-password';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    rememberMe: false,
    otp: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      rememberMe: false,
      otp: '',
      newPassword: '',
      confirmNewPassword: ''
    });
    setError(null);
    setSuccess(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setOtpSent(false);
    setResetEmail('');
  };

  const handleModeSwitch = (newMode: AuthMode) => {
    setMode(newMode);
    resetForm();
  };

  const handleClose = () => {
    resetForm();
    setMode('signin');
    onClose();
  };

  // Simulate sending OTP email
  const sendOTP = async (email: string): Promise<string> => {
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // In a real app, you would send this via email service
    // For demo purposes, we'll store it in localStorage and show it in console
    localStorage.setItem(`otp_${email}`, JSON.stringify({
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    }));
    
    console.log(`🔐 OTP for ${email}: ${otp} (expires in 10 minutes)`);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return otp;
  };

  // Verify OTP
  const verifyOTP = (email: string, inputOtp: string): boolean => {
    try {
      const stored = localStorage.getItem(`otp_${email}`);
      if (!stored) return false;
      
      const { otp, expiresAt } = JSON.parse(stored);
      
      if (Date.now() > expiresAt) {
        localStorage.removeItem(`otp_${email}`);
        return false;
      }
      
      return otp === inputOtp;
    } catch {
      return false;
    }
  };

  // Reset password
  const resetPassword = async (email: string, newPassword: string): Promise<boolean> => {
    try {
      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem('pennywise_users') || '{}');
      const user = Object.values(users).find((u: any) => u.email === email);
      
      if (!user) return false;
      
      // Hash new password (same method as in auth.ts)
      const encoder = new TextEncoder();
      const data = encoder.encode(newPassword + 'pennywise_salt');
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      // Update password
      (user as any).passwordHash = passwordHash;
      users[(user as any).id] = user;
      localStorage.setItem('pennywise_users', JSON.stringify(users));
      
      // Clean up OTP
      localStorage.removeItem(`otp_${email}`);
      
      return true;
    } catch {
      return false;
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      if (!validateEmail(formData.email)) {
        setError('Please enter a valid email address');
        return;
      }

      // Check if user exists
      const users = JSON.parse(localStorage.getItem('pennywise_users') || '{}');
      const userExists = Object.values(users).some((user: any) => user.email === formData.email);
      
      if (!userExists) {
        setError('No account found with this email address');
        return;
      }

      await sendOTP(formData.email);
      setResetEmail(formData.email);
      setOtpSent(true);
      setSuccess('OTP sent to your email! Check the browser console for the code.');
      setMode('reset-password');
    } catch (error) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      // Verify OTP
      if (!verifyOTP(resetEmail, formData.otp)) {
        setError('Invalid or expired OTP. Please try again.');
        return;
      }

      // Validate new password
      const passwordValidation = validatePassword(formData.newPassword);
      if (!passwordValidation.isValid) {
        setError(passwordValidation.errors[0]);
        return;
      }

      // Check password confirmation
      if (formData.newPassword !== formData.confirmNewPassword) {
        setError('Passwords do not match');
        return;
      }

      // Reset password
      const success = await resetPassword(resetEmail, formData.newPassword);
      if (!success) {
        setError('Failed to reset password. Please try again.');
        return;
      }

      setSuccess('Password reset successfully! You can now sign in with your new password.');
      setTimeout(() => {
        handleModeSwitch('signin');
      }, 2000);
    } catch (error) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'forgot-password') {
      return handleForgotPassword(e);
    }
    
    if (mode === 'reset-password') {
      return handleResetPassword(e);
    }

    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        const credentials: LoginCredentials = {
          email: formData.email,
          password: formData.password,
          rememberMe: formData.rememberMe
        };

        const result = await signIn(credentials);
        
        if (result.success && result.session) {
          onAuthSuccess(result.session.user);
          handleClose();
        } else {
          setError(result.error || 'Failed to sign in');
        }
      } else {
        const credentials: SignupCredentials = {
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        };

        const result = await signUp(credentials);
        
        if (result.success && result.user) {
          // Auto sign in after successful signup
          const signInResult = await signIn({
            email: formData.email,
            password: formData.password,
            rememberMe: formData.rememberMe
          });
          
          if (signInResult.success && signInResult.session) {
            onAuthSuccess(signInResult.session.user);
            handleClose();
          }
        } else {
          setError(result.error || 'Failed to create account');
        }
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    const validation = validatePassword(password);
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    
    const score = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /\d/.test(password),
      /[^A-Za-z0-9]/.test(password)
    ].filter(Boolean).length;

    if (score <= 2) return { strength: score * 25, label: 'Weak', color: 'bg-red-500' };
    if (score === 3) return { strength: 60, label: 'Fair', color: 'bg-yellow-500' };
    if (score === 4) return { strength: 80, label: 'Good', color: 'bg-blue-500' };
    return { strength: 100, label: 'Strong', color: 'bg-green-500' };
  };

  if (!isOpen) return null;

  const passwordStrength = (mode === 'signup' || mode === 'reset-password') ? 
    getPasswordStrength(mode === 'signup' ? formData.password : formData.newPassword) : null;

  const getTitle = () => {
    switch (mode) {
      case 'signin': return 'Welcome Back';
      case 'signup': return 'Create Account';
      case 'forgot-password': return 'Reset Password';
      case 'reset-password': return 'Enter New Password';
      default: return 'Welcome Back';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'signin': return 'Sign in to your account';
      case 'signup': return 'Join PennyWise today';
      case 'forgot-password': return 'Enter your email to receive a reset code';
      case 'reset-password': return 'Enter the OTP and your new password';
      default: return 'Sign in to your account';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 z-50 overflow-y-auto">
      <div className="bg-gray-800 rounded-2xl w-full max-w-sm mx-auto border border-gray-700 shadow-2xl my-4 max-h-[calc(100vh-2rem)] overflow-y-auto relative">
        {/* Close Button - Top Right */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-1.5 hover:bg-gray-700 rounded-lg z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          {/* Centered Logo */}
          <div className="flex justify-center mb-2">
            <img src="/logo.png" alt="PennyWise" className="h-14 w-auto" />
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            {/* Back Button for Reset Flows */}
            {(mode === 'forgot-password' || mode === 'reset-password') && (
              <div className="flex justify-start mb-3">
                <button
                  onClick={() => handleModeSwitch('signin')}
                  className="text-gray-400 hover:text-white transition-colors p-1.5 hover:bg-gray-700 rounded-lg"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <h2 className="text-2xl font-bold text-white mb-2">
              {getTitle()}
            </h2>
            <p className="text-gray-400 text-sm">
              {getSubtitle()}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
              <p className="text-green-300 text-sm">{success}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            {(mode === 'signin' || mode === 'signup' || mode === 'forgot-password') && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your email"
                    required
                  />
                  {formData.email && validateEmail(formData.email) && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-400 w-5 h-5" />
                  )}
                </div>
              </div>
            )}

            {/* OTP Field */}
            {mode === 'reset-password' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Verification Code
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.otp}
                    onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-lg tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Enter the 6-digit code sent to {resetEmail}
                </p>
              </div>
            )}

            {/* Password Field */}
            {(mode === 'signin' || mode === 'signup') && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {mode === 'signup' && formData.password && passwordStrength && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                      <span>Password Strength</span>
                      <span className={`font-medium ${
                        passwordStrength.strength >= 80 ? 'text-green-400' :
                        passwordStrength.strength >= 60 ? 'text-blue-400' :
                        passwordStrength.strength >= 40 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${passwordStrength.strength}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* New Password Field */}
            {mode === 'reset-password' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.newPassword && passwordStrength && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                      <span>Password Strength</span>
                      <span className={`font-medium ${
                        passwordStrength.strength >= 80 ? 'text-green-400' :
                        passwordStrength.strength >= 60 ? 'text-blue-400' :
                        passwordStrength.strength >= 40 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${passwordStrength.strength}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Confirm Password Field */}
            {(mode === 'signup' || mode === 'reset-password') && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={mode === 'signup' ? formData.confirmPassword : formData.confirmNewPassword}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      [mode === 'signup' ? 'confirmPassword' : 'confirmNewPassword']: e.target.value 
                    })}
                    className="w-full pl-10 pr-12 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  {((mode === 'signup' && formData.confirmPassword && formData.password === formData.confirmPassword) ||
                    (mode === 'reset-password' && formData.confirmNewPassword && formData.newPassword === formData.confirmNewPassword)) && (
                    <CheckCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 text-green-400 w-5 h-5" />
                  )}
                </div>
              </div>
            )}

            {/* Remember Me (Signin only) */}
            {mode === 'signin' && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={formData.rememberMe}
                    onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-300">
                    Remember me for 7 days
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => handleModeSwitch('forgot-password')}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-slate-600 text-white font-semibold rounded-lg hover:from-blue-500 hover:to-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>
                    {mode === 'signin' ? 'Signing In...' : 
                     mode === 'signup' ? 'Creating Account...' :
                     mode === 'forgot-password' ? 'Sending OTP...' : 'Resetting Password...'}
                  </span>
                </>
              ) : (
                <>
                  {mode === 'forgot-password' ? (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Send Reset Code</span>
                    </>
                  ) : mode === 'reset-password' ? (
                    <>
                      <Lock className="w-5 h-5" />
                      <span>Reset Password</span>
                    </>
                  ) : (
                    <>
                      <User className="w-5 h-5" />
                      <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                    </>
                  )}
                </>
              )}
            </button>
          </form>

          {/* Mode Switch */}
          {(mode === 'signin' || mode === 'signup') && (
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
                <button
                  onClick={() => handleModeSwitch(mode === 'signin' ? 'signup' : 'signin')}
                  className="ml-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  {mode === 'signin' ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          )}

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-300 text-sm font-medium">Secure & Private</p>
                <p className="text-blue-200/80 text-xs mt-1">
                  Your data is encrypted and stored locally. We never share your financial information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;