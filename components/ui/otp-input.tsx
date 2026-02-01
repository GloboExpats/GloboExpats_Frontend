'use client'

/**
 * =============================================================================
 * OTP INPUT COMPONENT
 * =============================================================================
 *
 * A beautiful 6-digit OTP input component with individual boxes for each digit.
 * Features:
 * - Auto-focus navigation between inputs
 * - Paste support for full code
 * - Backspace navigation
 * - Visual feedback for filled/focused states
 * - Accessible with keyboard navigation
 */

import React, { useRef, useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface OtpInputProps {
    /** Number of OTP digits */
    length?: number
    /** Callback when all digits are filled */
    onComplete?: (otp: string) => void
    /** Callback on value change */
    onChange?: (otp: string) => void
    /** Disable the input */
    disabled?: boolean
    /** Show error state */
    error?: boolean
    /** Auto focus first input on mount */
    autoFocus?: boolean
    /** Additional className for container */
    className?: string
}

export function OtpInput({
    length = 6,
    onComplete,
    onChange,
    disabled = false,
    error = false,
    autoFocus = true,
    className,
}: OtpInputProps) {
    const [values, setValues] = useState<string[]>(Array(length).fill(''))
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    // Initialize refs array
    useEffect(() => {
        inputRefs.current = inputRefs.current.slice(0, length)
    }, [length])

    // Auto focus first input
    useEffect(() => {
        if (autoFocus && inputRefs.current[0]) {
            inputRefs.current[0].focus()
        }
    }, [autoFocus])

    // Notify parent of changes
    useEffect(() => {
        const otp = values.join('')
        onChange?.(otp)
        if (otp.length === length && !values.includes('')) {
            onComplete?.(otp)
        }
    }, [values, length, onChange, onComplete])

    const focusInput = useCallback((index: number) => {
        if (index >= 0 && index < length && inputRefs.current[index]) {
            inputRefs.current[index]?.focus()
        }
    }, [length])

    const handleChange = useCallback((index: number, value: string) => {
        // Only allow single digit
        const digit = value.replace(/\D/g, '').slice(-1)

        const newValues = [...values]
        newValues[index] = digit
        setValues(newValues)

        // Move to next input if digit entered
        if (digit && index < length - 1) {
            focusInput(index + 1)
        }
    }, [values, length, focusInput])

    const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        switch (e.key) {
            case 'Backspace':
                e.preventDefault()
                if (values[index]) {
                    // Clear current if it has value
                    const newValues = [...values]
                    newValues[index] = ''
                    setValues(newValues)
                } else if (index > 0) {
                    // Move to previous and clear it
                    const newValues = [...values]
                    newValues[index - 1] = ''
                    setValues(newValues)
                    focusInput(index - 1)
                }
                break
            case 'ArrowLeft':
                e.preventDefault()
                focusInput(index - 1)
                break
            case 'ArrowRight':
                e.preventDefault()
                focusInput(index + 1)
                break
            case 'Delete':
                e.preventDefault()
                const newValues = [...values]
                newValues[index] = ''
                setValues(newValues)
                break
        }
    }, [values, focusInput])

    const handlePaste = useCallback((e: React.ClipboardEvent) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)

        if (pastedData) {
            const newValues = [...values]
            for (let i = 0; i < pastedData.length; i++) {
                newValues[i] = pastedData[i]
            }
            setValues(newValues)

            // Focus the next empty input or last input
            const nextEmptyIndex = newValues.findIndex((v) => !v)
            focusInput(nextEmptyIndex >= 0 ? nextEmptyIndex : length - 1)
        }
    }, [values, length, focusInput])

    const handleFocus = useCallback((index: number) => {
        // Select the input content on focus
        inputRefs.current[index]?.select()
    }, [])

    return (
        <div className={cn('flex items-center justify-center gap-2 sm:gap-3', className)}>
            {/* First 3 digits */}
            <div className="flex gap-2">
                {values.slice(0, 3).map((value, index) => (
                    <input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={value}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        onFocus={() => handleFocus(index)}
                        disabled={disabled}
                        autoComplete="one-time-code"
                        className={cn(
                            'w-11 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold',
                            'border-2 rounded-xl transition-all duration-200',
                            'focus:outline-none focus:ring-2 focus:ring-offset-1',
                            'bg-white disabled:bg-neutral-100 disabled:cursor-not-allowed',
                            {
                                'border-neutral-200 focus:border-brand-primary focus:ring-brand-primary/20':
                                    !error && !value,
                                'border-brand-primary bg-brand-primary/5 focus:ring-brand-primary/20':
                                    !error && value,
                                'border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50': error,
                            }
                        )}
                        aria-label={`Digit ${index + 1}`}
                    />
                ))}
            </div>

            {/* Separator dash */}
            <span className="text-2xl font-bold text-neutral-300 select-none">—</span>

            {/* Last 3 digits */}
            <div className="flex gap-2">
                {values.slice(3, 6).map((value, index) => {
                    const actualIndex = index + 3
                    return (
                        <input
                            key={actualIndex}
                            ref={(el) => { inputRefs.current[actualIndex] = el }}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={1}
                            value={value}
                            onChange={(e) => handleChange(actualIndex, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(actualIndex, e)}
                            onPaste={handlePaste}
                            onFocus={() => handleFocus(actualIndex)}
                            disabled={disabled}
                            autoComplete="one-time-code"
                            className={cn(
                                'w-11 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold',
                                'border-2 rounded-xl transition-all duration-200',
                                'focus:outline-none focus:ring-2 focus:ring-offset-1',
                                'bg-white disabled:bg-neutral-100 disabled:cursor-not-allowed',
                                {
                                    'border-neutral-200 focus:border-brand-primary focus:ring-brand-primary/20':
                                        !error && !value,
                                    'border-brand-primary bg-brand-primary/5 focus:ring-brand-primary/20':
                                        !error && value,
                                    'border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50': error,
                                }
                            )}
                            aria-label={`Digit ${actualIndex + 1}`}
                        />
                    )
                })}
            </div>
        </div>
    )
}

export default OtpInput
