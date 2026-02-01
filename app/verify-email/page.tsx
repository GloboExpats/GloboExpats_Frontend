'use client'

/**
 * =============================================================================
 * EMAIL VERIFICATION PAGE
 * =============================================================================
 *
 * This page handles email verification after user registration.
 * Features:
 * - Beautiful centered design inspired by x.ai
 * - 6-digit OTP input with split box design
 * - Resend OTP functionality with countdown timer
 * - Loading states and error handling
 * - Auto-redirect after successful verification
 */

import React, { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { OtpInput } from '@/components/ui/otp-input'
import { AlertCircle, Loader2, CheckCircle2, ArrowLeft, Mail } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { apiClient } from '@/lib/api'

const RESEND_COOLDOWN_SECONDS = 60

// Separate content component that uses useSearchParams
function VerifyEmailContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { toast } = useToast()

    // Get email from URL params
    const email = searchParams.get('email') || ''
    const returnUrl = searchParams.get('returnUrl') || '/'

    const [otp, setOtp] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isResending, setIsResending] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isSuccess, setIsSuccess] = useState(false)
    const [resendCooldown, setResendCooldown] = useState(0)

    // Resend cooldown timer
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [resendCooldown])

    // Redirect if no email provided
    useEffect(() => {
        if (!email) {
            router.push('/register')
        }
    }, [email, router])

    const handleVerifyOtp = useCallback(
        async (otpValue: string) => {
            if (!email || otpValue.length !== 6) return

            setIsLoading(true)
            setError(null)

            try {
                await apiClient.verifySignupOtp(email, otpValue)

                setIsSuccess(true)
                toast({
                    title: 'Email Verified!',
                    description: 'Your email has been verified successfully. Redirecting to login...',
                    variant: 'default',
                })

                // Redirect to login after a short delay
                setTimeout(() => {
                    router.push(
                        `/login?verified=true&email=${encodeURIComponent(email)}&returnUrl=${encodeURIComponent(returnUrl)}`
                    )
                }, 2000)
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : 'Verification failed. Please try again.'
                setError(errorMessage)
                toast({
                    title: 'Verification Failed',
                    description: errorMessage,
                    variant: 'destructive',
                })
            } finally {
                setIsLoading(false)
            }
        },
        [email, router, returnUrl, toast]
    )

    const handleResendOtp = useCallback(async () => {
        if (!email || resendCooldown > 0) return

        setIsResending(true)
        setError(null)

        try {
            await apiClient.sendSignupOtp(email)
            setResendCooldown(RESEND_COOLDOWN_SECONDS)
            toast({
                title: 'Code Sent!',
                description: 'A new verification code has been sent to your email.',
                variant: 'default',
            })
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Failed to resend code. Please try again.'
            setError(errorMessage)
            toast({
                title: 'Failed to Send Code',
                description: errorMessage,
                variant: 'destructive',
            })
        } finally {
            setIsResending(false)
        }
    }, [email, resendCooldown, toast])

    const handleOtpComplete = useCallback(
        (otpValue: string) => {
            handleVerifyOtp(otpValue)
        },
        [handleVerifyOtp]
    )

    const handleOtpChange = useCallback((otpValue: string) => {
        setOtp(otpValue)
        setError(null) // Clear error on change
    }, [])

    // Format email for display (hide part of it)
    const maskedEmail = email ? email.replace(/(.{2})(.+)(@.+)/, '$1***$3') : ''

    if (!email) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white flex flex-col items-center justify-center p-4">
            {/* Logo */}
            <div className="mb-8">
                <Link href="/" className="inline-block">
                    <div className="text-3xl font-bold font-display">
                        <span className="text-brand-primary">Globo</span>
                        <span className="text-brand-secondary">expats</span>
                    </div>
                </Link>
            </div>

            <Card className="w-full max-w-md bg-white shadow-xl rounded-3xl border-0 overflow-hidden">
                <CardHeader className="text-center space-y-4 pb-4 pt-8">
                    {/* Success State */}
                    {isSuccess ? (
                        <>
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-8 h-8 text-green-600" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-neutral-800">Email Verified!</CardTitle>
                            <p className="text-neutral-500">Redirecting you to login...</p>
                        </>
                    ) : (
                        <>
                            <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto">
                                <Mail className="w-8 h-8 text-brand-primary" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-neutral-800">
                                Verify your email
                            </CardTitle>
                            <p className="text-neutral-500 text-sm leading-relaxed px-4">
                                We&apos;ve emailed a one time security code to{' '}
                                <span className="font-semibold text-brand-primary">{maskedEmail}</span>. It should
                                arrive in the next few minutes. If you don&apos;t see it in your inbox, please check
                                your spam/junk folder. Please enter it below:
                            </p>
                        </>
                    )}
                </CardHeader>

                {!isSuccess && (
                    <CardContent className="px-6 pb-8 space-y-6">
                        {/* Error Alert */}
                        {error && (
                            <Alert variant="destructive" className="rounded-xl border-red-100 bg-red-50/50">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {/* OTP Input */}
                        <div className="py-4">
                            <OtpInput
                                length={6}
                                onComplete={handleOtpComplete}
                                onChange={handleOtpChange}
                                disabled={isLoading}
                                error={!!error}
                                autoFocus
                            />
                        </div>

                        {/* Verify Button */}
                        <Button
                            onClick={() => handleVerifyOtp(otp)}
                            disabled={otp.length !== 6 || isLoading}
                            className="w-full h-14 rounded-full font-bold text-lg bg-neutral-800 hover:bg-neutral-900 transition-all duration-300"
                        >
                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Confirm email'}
                        </Button>

                        {/* Resend Code */}
                        <div className="text-center">
                            {resendCooldown > 0 ? (
                                <p className="text-neutral-500 text-sm">
                                    Resend code in <span className="font-semibold">{resendCooldown}s</span>
                                </p>
                            ) : (
                                <button
                                    onClick={handleResendOtp}
                                    disabled={isResending}
                                    className="text-brand-primary font-semibold text-sm hover:underline disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                                >
                                    {isResending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        "Didn't receive the code? Resend"
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Go Back Button */}
                        <Button
                            variant="outline"
                            onClick={() => router.push('/register')}
                            className="w-full h-14 rounded-full font-medium text-base border-2 border-neutral-200 hover:bg-neutral-50 transition-all duration-300"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Go back
                        </Button>
                    </CardContent>
                )}
            </Card>

            {/* Footer */}
            <p className="mt-8 text-sm text-neutral-400">
                Having trouble?{' '}
                <Link href="/contact" className="text-brand-primary hover:underline">
                    Contact support
                </Link>
            </p>
        </div>
    )
}

// Loading fallback for Suspense
function VerifyEmailLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
    )
}

// Main export wrapped in Suspense
export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<VerifyEmailLoading />}>
            <VerifyEmailContent />
        </Suspense>
    )
}
