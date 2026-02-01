'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Mail, AlertTriangle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'
import { apiClient } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'

export default function VerificationPage() {
  const {
    verifyOrganizationEmail,
    completeVerificationForTesting,
    verificationStatus,
    refreshSession,
    updateUser,
    user,
  } = useAuth()

  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [organizationEmail, setOrganizationEmail] = useState('')
  const [organizationName, setOrganizationName] = useState(user?.organization || '')
  const [otpSent, setOtpSent] = useState(false)
  const [otpArray, setOtpArray] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const otpInputs = useRef<(HTMLInputElement | null)[]>([])

  // Pre-fill organization name when user data is available
  useEffect(() => {
    if (user?.organization && !organizationName) {
      setOrganizationName(user.organization)
    }
  }, [user?.organization, organizationName])

  // Get verification status
  const isOrganizationEmailVerified = verificationStatus?.isOrganizationEmailVerified || false
  const isFullyVerified = verificationStatus?.isFullyVerified || false

  // Auto-redirect when verification status changes to verified
  useEffect(() => {
    if (isOrganizationEmailVerified || isFullyVerified) {
      const timeoutId = setTimeout(() => {
        toast({
          title: 'Already Verified',
          description:
            'Your account is already verified. All features are unlocked. Redirecting you to the homepage...',
          variant: 'default',
        })

        setTimeout(() => {
          router.push('/')
        }, 1000)
      }, 2000)

      return () => clearTimeout(timeoutId)
    }
  }, [isOrganizationEmailVerified, isFullyVerified, router, toast])

  /**
   * OTP Input Helpers
   */
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newOtpArray = [...otpArray]
    const char = value.slice(-1)
    newOtpArray[index] = char
    setOtpArray(newOtpArray)

    if (char && index < 5) {
      otpInputs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpArray[index] && index > 0) {
      otpInputs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('')
    if (pastedData.every((char) => /^\d$/.test(char))) {
      const newOtpArray = [...otpArray]
      pastedData.forEach((char, i) => {
        if (i < 6) newOtpArray[i] = char
      })
      setOtpArray(newOtpArray)
      otpInputs.current[Math.min(pastedData.length, 5)]?.focus()
    }
  }

  const handleVerifyOTP = async () => {
    const otpCode = otpArray.join('')
    if (otpCode.length < 6) {
      setError('Please enter the complete 6-digit code.')
      return
    }

    setIsSubmitting(true)
    setError('')
    setSuccess('')
    try {
      await verifyOrganizationEmail(organizationEmail, otpCode)
      setSuccess('Email verified successfully')
      setOtpSent(false)
      setOtpArray(['', '', '', '', '', ''])

      toast({
        title: 'Success - Email Verified',
        description:
          'Your organization email has been verified successfully. All platform features are now unlocked. Redirecting you to the homepage...',
        variant: 'default',
      })

      setTimeout(async () => {
        try {
          await refreshSession()
          setTimeout(async () => {
            try {
              await refreshSession()
            } catch (error) {
              console.error('❌ Failed second refresh:', error)
            }
          }, 500)
        } catch (error) {
          console.error('❌ Failed to refresh session after verification:', error)
        }
      }, 1000)

      setTimeout(() => {
        router.push('/')
      }, 2500)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid OTP. Please try again.'
      setError(errorMessage)
      toast({
        title: 'Verification Failed',
        description: `${errorMessage} Please double-check your code and try again.`,
        variant: 'default',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCompleteVerificationForTesting = async () => {
    if (!organizationEmail) {
      setError('Please enter your organization email address')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(organizationEmail)) {
      setError('Please enter a valid email address')
      return
    }

    const personalEmailProviders = [
      'gmail.com', 'googlemail.com', 'yahoo.', 'hotmail.', 'icloud.com',
      'outlook.', 'live.', 'msn.', 'tutamail.', 'tutanota.', 'tuta.',
      'aol.', 'protonmail.', 'mail.com', 'zoho.'
    ]

    const emailDomain = organizationEmail.toLowerCase().split('@')[1]
    const isPersonalEmail = personalEmailProviders.some(
      (provider) => emailDomain.startsWith(provider) || emailDomain.includes(provider)
    )

    if (isPersonalEmail) {
      const errorMsg = 'Please use your organization email address. Personal emails are not accepted.'
      setError(errorMsg)
      return
    }

    setIsSubmitting(true)
    setError('')
    setSuccess('')
    try {
      // Step 1: Update organization name if provided
      if (organizationName) {
        try {
          // Explicitly set token if available just in case
          const token = localStorage.getItem('expat_auth_token')
          if (token) apiClient.setAuthToken(token)

          const updateResult = await apiClient.editProfile({ organization: organizationName })
          if (updateResult.success) {
            updateUser({ organization: organizationName })
            toast({
              title: 'Profile Updated',
              description: 'Your organization has been saved to your profile.',
            })
          }
        } catch (profileError) {
          console.error('Failed to update organization in profile:', profileError)
          toast({
            title: 'Profile Update Hint',
            description: 'Could not sync organization to profile, but proceeding with verification.',
            variant: 'default',
          })
        }
      }

      await completeVerificationForTesting(organizationEmail)
      setOtpSent(true)
      setOtpArray(['', '', '', '', '', ''])
      setSuccess('Verification code sent! Check your email.')
      toast({
        title: 'Verification Code Sent',
        description: 'We have sent a 6-digit verification code to your organization email.',
        variant: 'default',
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send OTP.'

      // Handle "Email already in use" specifically with a toast
      if (errorMessage.toLowerCase().includes('already registered') ||
        errorMessage.toLowerCase().includes('already in use')) {
        setError('') // Clear the red error message from UI
        toast({
          title: 'Email Already in Use',
          description: 'This organization email is already associated with another account. Please use a different email or log in with that account.',
          variant: 'destructive',
        })
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isFullyVerified) {
    return (
      <div className="min-h-screen bg-[#F8FAFB] py-12">
        <div className="container max-w-4xl mx-auto px-4">
          <Card className="border border-[#E2E8F0] bg-white">
            <CardContent className="pt-8 text-center">
              <div className="w-16 h-16 bg-[#1E3A8A]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-[#1E3A8A]" />
              </div>
              <h2 className="text-2xl font-semibold text-[#0F172A] mb-2">Account Fully Verified</h2>
              <p className="text-base text-[#64748B] mb-8">All platform features are now unlocked.</p>
              <Button onClick={() => router.push('/browse')} size="lg" className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white rounded-full px-12">
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] py-12">
      <div className="container max-w-2xl mx-auto px-4">
        <Card className="border border-[#E2E8F0] bg-white overflow-hidden rounded-3xl shadow-xl shadow-blue-900/5">
          <CardHeader className="bg-white border-b border-[#E2E8F0] p-8 text-center">
            <CardTitle className="text-2xl font-bold text-[#0F172A]">
              {otpSent ? 'Enter Verification Code' : 'Organization Email Verification'}
            </CardTitle>
            <p className="text-[#64748B] mt-2">
              {otpSent ? (
                <span className="flex flex-col gap-1">
                  <span>Verify your identity to unlock all features</span>
                  <span className="text-sm font-semibold text-[#1E3A8A]">Check JUNK/SPAM folder in your email account</span>
                </span>
              ) : 'Unlock buying and selling by verifying your organization email'}
            </p>
          </CardHeader>
          <CardContent className="p-8">
            {!isOrganizationEmailVerified && (
              <div className="space-y-6">
                {!otpSent ? (
                  <div className="space-y-6">
                    <Alert className="bg-blue-50 border-blue-100 rounded-2xl">
                      <Mail className="h-5 w-5 text-[#1E3A8A]" />
                      <AlertDescription className="text-blue-900 text-sm">
                        Be sure to check your <strong>JUNK or SPAM</strong> folder!
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <Label htmlFor="organizationName" className="font-semibold text-neutral-700">Organization / Office</Label>
                      <Input
                        id="organizationName"
                        type="text"
                        placeholder="e.g. UN, WFP, UNICEF, Embassy"
                        value={organizationName}
                        onChange={(e) => setOrganizationName(e.target.value)}
                        className="h-12 rounded-2xl border-neutral-200 focus:border-brand-primary"
                      />
                      <p className="text-xs text-neutral-400 px-1">Which organization or office are you with?</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="organizationEmail" className="font-semibold text-neutral-700">Organization Email Address</Label>
                      <Input
                        id="organizationEmail"
                        type="email"
                        placeholder="name@yourcompany.com"
                        value={organizationEmail}
                        onChange={(e) => setOrganizationEmail(e.target.value)}
                        className="h-12 rounded-2xl border-neutral-200 focus:border-brand-primary"
                      />
                      <p className="text-xs text-neutral-400 px-1">Use your organization email (not Gmail, Yahoo, etc.)</p>
                    </div>

                    {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

                    <Button
                      onClick={handleCompleteVerificationForTesting}
                      disabled={isSubmitting || !organizationEmail}
                      size="lg"
                      className="w-full bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white h-14 rounded-full font-bold shadow-lg shadow-blue-900/10"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" /> : 'Send Verification Code'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center space-y-2">
                      <p className="text-neutral-600">Code sent to <span className="text-neutral-900 font-bold">{organizationEmail}</span></p>
                      <button onClick={() => setOtpSent(false)} className="text-brand-primary text-sm font-bold hover:underline">Change Email</button>
                    </div>

                    <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
                      {otpArray.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => { otpInputs.current[index] = el }}
                          type="text"
                          inputMode="numeric"
                          className="w-full h-16 sm:h-20 text-center text-3xl font-bold rounded-2xl bg-neutral-50 border-2 border-neutral-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all"
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          maxLength={1}
                          autoFocus={index === 0}
                        />
                      ))}
                    </div>

                    {error && <p className="text-sm text-center text-red-500 font-medium">{error}</p>}

                    <div className="space-y-4">
                      <Button
                        onClick={handleVerifyOTP}
                        disabled={isSubmitting || otpArray.some((d) => !d)}
                        className="w-full bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white h-14 rounded-full font-bold text-lg shadow-xl shadow-blue-900/10"
                      >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : 'Verify Email'}
                      </Button>
                      <button onClick={handleCompleteVerificationForTesting} className="w-full text-center text-sm font-bold text-neutral-500 hover:text-brand-primary">Resend Code</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {isOrganizationEmailVerified && (
              <div className="text-center space-y-6">
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <AlertDescription className="text-green-800">Email verified! Redirecting...</AlertDescription>
                </Alert>
                <Button onClick={() => router.push('/')} className="w-full bg-[#1E3A8A] h-12 rounded-full font-bold">Continue to Home</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
