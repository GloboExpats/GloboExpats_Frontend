'use client'

/**
 * =============================================================================
 * REGISTRATION PAGE - ENHANCED WITH VISUAL APPEAL
 * =============================================================================
 *
 * Features:
 * - Appealing visual design with hero imagery
 * - Two-column layout with information panel
 * - Social registration options
 * - Progressive form with clear organization
 * - Professional expat community focus
 *
 * Backend Integration:
 * - POST /api/auth/register for account creation
 * - Email verification flow
 * - Organization verification process
 */

import type React from 'react'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

import { AlertCircle, Globe, UserCheck, Briefcase, Eye, EyeOff, Loader2, Mail } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { validateEmail } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

/**
 * List of allowed personal email domains
 * Only these domains are accepted for registration
 */
const ALLOWED_PERSONAL_EMAIL_DOMAINS = [
  // Google
  'gmail.com',
  'googlemail.com',
  // Yahoo
  'yahoo.com',
  'yahoo.co.uk',
  'yahoo.fr',
  'yahoo.de',
  'yahoo.es',
  'yahoo.it',
  'yahoo.ca',
  'yahoo.com.au',
  'yahoo.co.in',
  'yahoo.co.jp',
  'ymail.com',
  'rocketmail.com',
  // Microsoft/Hotmail
  'hotmail.com',
  'hotmail.co.uk',
  'hotmail.fr',
  'hotmail.de',
  'hotmail.es',
  'hotmail.it',
  'outlook.com',
  'outlook.co.uk',
  'live.com',
  'live.co.uk',
  'msn.com',
  // Apple/iCloud
  'icloud.com',
  'me.com',
  'mac.com',
  // Other popular personal email providers
  'aol.com',
  'protonmail.com',
  'proton.me',
  'zoho.com',
  'mail.com',
  'gmx.com',
  'gmx.de',
  'gmx.net',
  'yandex.com',
  'yandex.ru',
  'fastmail.com',
  'tutanota.com',
  'inbox.com',
]

/**
 * Validates if an email is from a personal email provider
 * Returns true if the email domain is in the allowed list
 */
function isPersonalEmail(email: string): boolean {
  if (!email || !email.includes('@')) return false
  const domain = email.toLowerCase().split('@')[1]
  return ALLOWED_PERSONAL_EMAIL_DOMAINS.includes(domain)
}

export default function RegisterPage() {
  const router = useRouter()
  const { register, login, isLoggedIn, isLoading: authLoading } = useAuth()
  const { toast } = useToast()

  // Registration Steps: 1 (Info), 2 (OTP), 3 (Password)
  const [step, setStep] = useState(1)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    personalEmail: '',
    otp: '',
    otpArray: ['', '', '', '', '', ''],
    password: '',
    confirmPassword: '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const otpInputs = useRef<(HTMLInputElement | null)[]>([])

  // Add redirect logic for already authenticated users
  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      router.push('/')
    }
  }, [isLoggedIn, authLoading, router])

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    )
  }

  // Don't render register form if user is already logged in
  if (isLoggedIn) {
    return null
  }

  const handleGoogleRegister = async () => {
    setError(null)
    setSocialLoading('google')

    try {
      const res = await fetch('/api/oauth/google?nextPath=/', {
        method: 'GET',
        headers: { accept: '*/*' },
      })
      if (!res.ok) throw new Error('Failed to initiate Google registration')
      const data = await res.json()
      if (data && data.authUrl) {
        window.location.href = data.authUrl
      } else {
        throw new Error('No authUrl returned from server')
      }
    } catch {
      setError('Google registration failed. Please try again.')
      setSocialLoading(null)
    }
  }

  /**
   * Step 1: Send OTP to Email
   */
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.firstName || !formData.lastName || !formData.personalEmail) {
      setError('Please fill in all required fields.')
      return
    }

    if (!validateEmail(formData.personalEmail)) {
      setError('Please enter a valid personal email address.')
      return
    }

    if (!isPersonalEmail(formData.personalEmail)) {
      toast({
        title: 'Personal Email Required',
        description: 'Please use a personal email (Gmail, Yahoo, etc.) for registration.',
        variant: 'default',
        duration: 5000,
      })
      return
    }

    setIsLoading(true)
    try {
      const { apiClient } = await import('@/lib/api')
      await apiClient.sendSignupOtp(formData.personalEmail, formData.firstName, formData.lastName)

      setFormData({ ...formData, otpArray: ['', '', '', '', '', ''], otp: '' })

      toast({
        title: 'OTP Sent',
        description: `A verification code has been sent to ${formData.personalEmail}`,
      })
      setStep(2)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to send OTP'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Step 2: Verify OTP
   */
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const otpCode = formData.otpArray.join('')
    if (otpCode.length < 6) {
      setError('Please enter the complete 6-digit code.')
      return
    }

    setIsLoading(true)
    try {
      const { apiClient } = await import('@/lib/api')
      await apiClient.verifySignupOtp(formData.personalEmail, otpCode)

      toast({
        title: 'Email Verified!',
        description: 'Now set your password to complete your account.',
      })
      setStep(3)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Invalid verification code'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * OTP Input Helpers
   */
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return // Only allow numbers

    const newOtpArray = [...formData.otpArray]
    const char = value.slice(-1) // Get last character
    newOtpArray[index] = char
    setFormData({ ...formData, otpArray: newOtpArray })

    // Auto-focus next input
    if (char && index < 5) {
      otpInputs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !formData.otpArray[index] && index > 0) {
      otpInputs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('')
    if (pastedData.every((char) => /^\d$/.test(char))) {
      const newOtpArray = [...formData.otpArray]
      pastedData.forEach((char, i) => {
        if (i < 6) newOtpArray[i] = char
      })
      setFormData({ ...formData, otpArray: newOtpArray })
      otpInputs.current[Math.min(pastedData.length, 5)]?.focus()
    }
  }

  /**
   * Step 3: Complete Registration (Set Password)
   */
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsLoading(true)
    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
        emailAddress: formData.personalEmail,
      })

      toast({
        title: 'Registration Successful!',
        description: 'Taking you to the marketplace...',
      })

      // Auto-login after registration
      await login({
        email: formData.personalEmail,
        password: formData.password,
      })

      // Redirect happens automatically via the useEffect check for isLoggedIn
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e40af] via-[#1e3a8a] to-[#1e40af] overflow-y-auto">
      <div className="flex flex-col justify-center min-h-screen p-4 py-12 lg:py-20">
        <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-5 gap-8 items-center">
          {/* Left Panel - Hero Information */}
          <div className="hidden lg:flex lg:col-span-2 flex-col justify-center text-white space-y-8">
            <div>
              <Link href="/" className="inline-block">
                <div className="text-4xl font-bold font-display mb-4">
                  <span className="text-white">Globo</span>
                  <span className="text-brand-secondary">expats</span>
                </div>
              </Link>
              <h1 className="text-3xl font-bold leading-tight mb-4">
                Join the world&apos;s most trusted expat marketplace community
              </h1>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/20">
                  <Globe className="w-6 h-6 text-blue-200" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Global Community</h3>
                  <p className="text-blue-100 text-sm">Connect with verified expats worldwide</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/20">
                  <UserCheck className="w-6 h-6 text-green-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Verified Expats</h3>
                  <p className="text-blue-100 text-sm">
                    All expats are identity and organization verified
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/20">
                  <Briefcase className="w-6 h-6 text-purple-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Professional Network</h3>
                  <p className="text-blue-100 text-sm">
                    Connect and trade within your professional community
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Registration Form */}
          <div className="lg:col-span-3 flex items-center justify-center w-full">
            <Card className="w-full max-w-xl bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl border-0 overflow-hidden text-center">
              <CardHeader className="text-center space-y-2 pb-6 pt-8">
                <div className="lg:hidden mb-4">
                  <Link href="/" className="inline-block">
                    <div className="text-3xl font-bold font-display text-brand-primary">
                      Globo<span className="text-brand-secondary">expats</span>
                    </div>
                  </Link>
                </div>
                <CardTitle className="text-3xl font-bold text-neutral-800">
                  {step === 1 && "Create Your Account"}
                  {step === 2 && "Verify Your Email"}
                  {step === 3 && "Complete Security"}
                </CardTitle>
                <p className="text-neutral-500 font-medium">
                  {step === 2 && `Enter the code sent to ${formData.personalEmail}`}
                  {step === 3 && "Secure your account with a strong password"}
                </p>
                {step === 2 && (
                  <p className="text-sm font-semibold text-brand-primary mt-1">
                    Check JUNK/SPAM folder in your email account
                  </p>
                )}

                {/* Progress Indicators */}
                <div className="flex justify-center gap-2 mt-4">
                  <div className={`h-1.5 w-12 rounded-full ${step >= 1 ? 'bg-brand-primary' : 'bg-neutral-200'}`} />
                  <div className={`h-1.5 w-12 rounded-full ${step >= 2 ? 'bg-brand-primary' : 'bg-neutral-200'}`} />
                  <div className={`h-1.5 w-12 rounded-full ${step >= 3 ? 'bg-brand-primary' : 'bg-neutral-200'}`} />
                </div>
              </CardHeader>

              <CardContent className="px-6 pb-10 space-y-6 text-left">
                {error && (
                  <Alert variant="destructive" className="rounded-xl border-red-100 bg-red-50/50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {step === 1 && (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleGoogleRegister}
                      disabled={isLoading || socialLoading !== null}
                      className="w-full h-14 text-base border-2 border-neutral-300 hover:bg-neutral-50 transition-all duration-300 rounded-full font-semibold group translate-y-0 active:translate-y-px"
                    >
                      {socialLoading === 'google' ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <div className="flex items-center justify-center gap-3">
                          <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                          </svg>
                          <span>Sign up with Google</span>
                        </div>
                      )}
                    </Button>

                    <div className="relative">
                      <Separator className="w-full" />
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => setShowEmailForm(!showEmailForm)}
                      disabled={isLoading}
                      className="w-full h-14 text-base border-2 border-neutral-300 hover:bg-neutral-50 transition-all duration-300 rounded-full font-medium"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <Mail className="w-5 h-5 text-neutral-600" />
                        <span>Sign up with Email</span>
                      </div>
                    </Button>

                    <div className={`overflow-hidden transition-all duration-300 ${showEmailForm ? 'max-h-[800px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                      <form onSubmit={handleSendOtp} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-neutral-700 font-semibold px-1">First Name</Label>
                            <Input
                              placeholder="First Name"
                              className="h-11 rounded-xl bg-neutral-50"
                              value={formData.firstName}
                              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-neutral-700 font-semibold px-1">Last Name</Label>
                            <Input
                              placeholder="Last Name"
                              className="h-11 rounded-xl bg-neutral-50"
                              value={formData.lastName}
                              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-neutral-700 font-semibold px-1">Email Address</Label>
                          <Input
                            type="email"
                            placeholder="your.email@example.com"
                            className="h-11 rounded-xl bg-neutral-50"
                            value={formData.personalEmail}
                            onChange={(e) => setFormData({ ...formData, personalEmail: e.target.value })}
                            required
                          />
                        </div>

                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="w-full h-12 rounded-full font-bold bg-neutral-800 hover:bg-neutral-900"
                        >
                          {isLoading ? <Loader2 className="animate-spin" /> : 'Continue'}
                        </Button>
                      </form>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <form onSubmit={handleVerifyOtp} className="space-y-8">
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <Label className="text-neutral-700 font-semibold text-lg">
                          Verification Code
                        </Label>
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="text-sm font-medium text-brand-primary hover:underline"
                        >
                          Change Email
                        </button>
                      </div>

                      {/* Digit Boxes */}
                      <div className="flex justify-between gap-2 sm:gap-4" onPaste={handleOtpPaste}>
                        {formData.otpArray.map((digit, index) => (
                          <input
                            key={index}
                            ref={(el) => {
                              otpInputs.current[index] = el
                            }}
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            className="w-12 h-14 sm:w-16 sm:h-20 text-center text-2xl sm:text-3xl font-bold rounded-2xl bg-neutral-50 border-2 border-neutral-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none"
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            maxLength={1}
                            autoFocus={index === 0}
                          />
                        ))}
                      </div>

                      <p className="text-sm text-center text-neutral-500">
                        Didn't receive the code?{' '}
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          className="text-brand-primary font-bold hover:underline"
                          disabled={isLoading}
                        >
                          Resend Code
                        </button>
                      </p>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading || formData.otpArray.some((d) => !d)}
                      className="w-full h-14 rounded-full font-bold text-lg bg-neutral-800 hover:bg-neutral-900 shadow-xl shadow-neutral-200 transition-all active:scale-[0.98]"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="animate-spin" />
                          <span>Verifying...</span>
                        </div>
                      ) : (
                        'Verify & Continue'
                      )}
                    </Button>
                  </form>
                )}

                {step === 3 && (
                  <form onSubmit={handleCompleteRegistration} className="space-y-4">
                    <div className="space-y-1">
                      <Label className="text-neutral-700 font-semibold px-1">Create Password</Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="At least 8 characters"
                          className="h-11 rounded-xl bg-neutral-50 pr-10"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-neutral-700 font-semibold px-1">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Repeat password"
                          className="h-11 rounded-xl bg-neutral-50 pr-10"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading || !formData.password || formData.password !== formData.confirmPassword}
                      className="w-full h-12 rounded-full font-bold bg-neutral-800 hover:bg-neutral-900"
                    >
                      {isLoading ? <Loader2 className="animate-spin" /> : 'Complete Registration'}
                    </Button>
                  </form>
                )}

                <div className="text-center pt-4">
                  <p className="text-neutral-500">
                    Already have an account?{' '}
                    <Link href="/login" className="text-brand-primary font-bold hover:underline">
                      Sign In
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
