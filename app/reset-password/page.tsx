'use client'

/**
 * =============================================================================
 * PASSWORD RESET PAGE - 3-STEP OTP-BASED FLOW
 * =============================================================================
 *
 * Features:
 * - Step 1: Enter email and receive OTP
 * - Step 2: Verify OTP code
 * - Step 3: Set new password
 * - Modern UI with progress indicator
 * - Comprehensive error handling
 * - Auto-login after successful reset
 *
 * Backend Integration:
 * - POST /api/v1/userManagement/reset-passwordEmail?email={email}
 * - POST /api/v1/userManagement/verify-otp?loggingEmail={email}&otp={code}
 * - POST /api/v1/userManagement/new-password with {loggingEmail, newPassword}
 */

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, ArrowLeft, Loader2, Check, Lock, Eye, EyeOff, Shield } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'

type Step = 'email' | 'otp' | 'password' | 'success'

export default function ResetPasswordPage() {
  const router = useRouter()
  const { toast } = useToast()

  // Form state
  const [currentStep, setCurrentStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 1: Send OTP to email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('Please enter your email address')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setIsLoading(true)

    try {
      await api.auth.sendPasswordResetOtp(email)

      toast({
        title: 'OTP Sent!',
        description: 'Check your email for the verification code.',
        variant: 'default',
      })

      setCurrentStep('otp')
    } catch (err) {
      const error = err as Error & { statusCode?: number }

      if (error.statusCode === 404) {
        setError('No account found with this email address. Please check and try again.')
      } else if (error.message) {
        setError(error.message)
      } else {
        setError('Failed to send OTP. Please try again.')
      }

      toast({
        title: 'Could Not Send OTP',
        description: 'Please verify your email address and try again.',
        variant: 'warning',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!otp) {
      setError('Please enter the OTP code')
      return
    }

    if (otp.length < 4) {
      setError('Please enter a valid OTP code')
      return
    }

    setIsLoading(true)

    try {
      await api.auth.verifyPasswordResetOtp(email, otp)

      toast({
        title: 'OTP Verified!',
        description: 'Now set your new password.',
        variant: 'default',
      })

      setCurrentStep('password')
    } catch (err) {
      const error = err as Error & { statusCode?: number }

      if (error.statusCode === 400) {
        setError('Invalid or expired OTP. Please request a new one.')
      } else if (error.statusCode === 404) {
        setError('OTP not found. Please request a new one.')
      } else if (error.message) {
        setError(error.message)
      } else {
        setError('Failed to verify OTP. Please try again.')
      }

      toast({
        title: 'Invalid OTP',
        description: 'Please check the code or request a new one.',
        variant: 'warning',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Step 3: Reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!newPassword) {
      setError('Please enter a new password')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      await api.auth.resetPasswordWithOtp(email, newPassword)

      toast({
        title: 'Password Reset Successful!',
        description: 'Redirecting to login page...',
        variant: 'default',
      })

      setCurrentStep('success')

      // Redirect to login after success
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err) {
      const error = err as Error

      if (error.message) {
        setError(error.message)
      } else {
        setError('Failed to reset password. Please try again.')
      }

      toast({
        title: 'Reset Failed',
        description: 'Please try again or contact support.',
        variant: 'warning',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Resend OTP
  const handleResendOtp = async () => {
    setError('')
    setIsLoading(true)

    try {
      await api.auth.sendPasswordResetOtp(email)

      toast({
        title: 'OTP Resent!',
        description: 'Check your email for the new verification code.',
        variant: 'default',
      })

      setOtp('')
    } catch {
      toast({
        title: 'Failed to Resend',
        description: 'Please try again in a moment.',
        variant: 'warning',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Success screen
  if (currentStep === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-primary via-blue-800 to-cyan-600 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl">
          <CardContent className="pt-8 pb-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-neutral-800 mb-3">Password Reset!</h2>
              <p className="text-neutral-600 mb-8 text-lg">
                Your password has been successfully reset. Redirecting to login...
              </p>
              <div className="flex items-center justify-center gap-2 text-brand-primary">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm font-medium">Taking you to login page</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Progress indicator
  const getStepNumber = () => {
    switch (currentStep) {
      case 'email':
        return 1
      case 'otp':
        return 2
      case 'password':
        return 3
      default:
        return 1
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary via-blue-800 to-cyan-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl">
        <CardHeader className="pb-4">
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-neutral-600 hover:text-brand-primary mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to login
          </Link>

          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3].map((step) => (
                <div key={step} className={`flex items-center ${step < 3 ? 'flex-1' : ''}`}>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                      step <= getStepNumber()
                        ? 'bg-brand-primary text-white'
                        : 'bg-neutral-200 text-neutral-500'
                    }`}
                  >
                    {step < getStepNumber() ? <Check className="w-5 h-5" /> : step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`flex-1 h-1 mx-2 transition-all ${
                        step < getStepNumber() ? 'bg-brand-primary' : 'bg-neutral-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-neutral-600 mt-2">
              <span className={getStepNumber() === 1 ? 'font-semibold text-brand-primary' : ''}>
                Email
              </span>
              <span className={getStepNumber() === 2 ? 'font-semibold text-brand-primary' : ''}>
                Verify OTP
              </span>
              <span className={getStepNumber() === 3 ? 'font-semibold text-brand-primary' : ''}>
                New Password
              </span>
            </div>
          </div>

          <CardTitle className="text-2xl font-bold text-neutral-800">
            {currentStep === 'email' && 'Reset Your Password'}
            {currentStep === 'otp' && 'Verify Your Email'}
            {currentStep === 'password' && 'Set New Password'}
          </CardTitle>
          <CardDescription className="text-neutral-600">
            {currentStep === 'email' &&
              "Enter your email address and we'll send you a verification code."}
            {currentStep === 'otp' && `Enter the 6-digit code we sent to ${email}`}
            {currentStep === 'password' && 'Create a strong password for your account.'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Step 1: Email Input */}
          {currentStep === 'email' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-neutral-700 font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="pl-10 h-11"
                    autoComplete="email"
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Verification Code
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {currentStep === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-neutral-700 font-medium">
                  Verification Code
                </Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    disabled={isLoading}
                    className="pl-10 h-11 text-center text-lg tracking-widest"
                    autoComplete="one-time-code"
                    maxLength={6}
                    inputMode="numeric"
                  />
                </div>
                <p className="text-xs text-neutral-500">Check your email inbox and spam folder</p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Verify Code
                  </>
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="text-sm text-brand-primary hover:underline disabled:opacity-50"
                >
                  Didn't receive the code? Resend
                </button>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setCurrentStep('email')
                  setOtp('')
                  setError('')
                }}
              >
                Change Email Address
              </Button>
            </form>
          )}

          {/* Step 3: New Password */}
          {currentStep === 'password' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-neutral-700 font-medium">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading}
                    className="pl-10 h-11"
                    autoComplete="new-password"
                    spellCheck="false"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-neutral-500">Must be at least 6 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-neutral-700 font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className="pl-10 pr-10 h-11"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Reset Password
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Back to Login Link */}
          <div className="text-center text-sm mt-6 pt-4 border-t border-neutral-200">
            <span className="text-neutral-600">Remember your password? </span>
            <Link href="/login" className="text-brand-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
