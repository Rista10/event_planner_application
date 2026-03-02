import {
    signupSchema,
    loginSchema,
    verifyEmailSchema,
    resendVerificationSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    verifyTwoFactorSchema,
    enable2FASchema,
} from '../validation.js';

describe('signupSchema', () => {
    const validInput = { name: 'John Doe', email: 'john@example.com', password: 'Password1' }

    it('should accept valid signup data', () => {
        const result = signupSchema.safeParse(validInput)
        expect(result.success).toBe(true)
    })

    it('should lowercase and trim email', () => {
        const result = signupSchema.safeParse({ ...validInput, email: '  John@Example.COM  ' })
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.email).toBe('john@example.com')
        }
    })

    it('should reject when name is missing', () => {
        const result = signupSchema.safeParse({ email: 'a@b.com', password: 'Password1' })
        expect(result.success).toBe(false)
    })

    it('should reject empty name', () => {
        const result = signupSchema.safeParse({ ...validInput, name: '' })
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues[0].message).toBe('Please enter your name')
        }
    })

    it('should reject invalid email format', () => {
        const result = signupSchema.safeParse({ ...validInput, email: 'not-an-email' })
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues[0].message).toBe('Please enter a valid email address')
        }
    })

    it('should reject short password', () => {
        const result = signupSchema.safeParse({ ...validInput, password: 'Pass1' })
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues[0].message).toBe('Password must be at least 8 characters long')
        }
    })

    it('should reject password without uppercase letter', () => {
        const result = signupSchema.safeParse({ ...validInput, password: 'password1' })
        expect(result.success).toBe(false)
    })

    it('should reject password without digit', () => {
        const result = signupSchema.safeParse({ ...validInput, password: 'PasswordOnly' })
        expect(result.success).toBe(false)
    })
})

describe('loginSchema', () => {
    const validInput = { email: 'user@test.com', password: 'mypassword' }

    it('should accept valid login data', () => {
        const result = loginSchema.safeParse(validInput)
        expect(result.success).toBe(true)
    })

    it('should reject empty email', () => {
        const result = loginSchema.safeParse({ ...validInput, email: '' })
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues[0].message).toBe('Please enter your email address')
        }
    })

    it('should reject empty password', () => {
        const result = loginSchema.safeParse({ ...validInput, password: '' })
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues[0].message).toBe('Please enter your password')
        }
    })
})

describe('verifyEmailSchema', () => {
    it('should accept a valid token', () => {
        const result = verifyEmailSchema.safeParse({ token: 'some-verification-token' })
        expect(result.success).toBe(true)
    })

    it('should reject empty token', () => {
        const result = verifyEmailSchema.safeParse({ token: '' })
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues[0].message).toBe('Verification token is missing')
        }
    })
})

describe('resendVerificationSchema', () => {
    it('should accept valid email', () => {
        const result = resendVerificationSchema.safeParse({ email: 'user@test.com' })
        expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
        const result = resendVerificationSchema.safeParse({ email: 'bad-email' })
        expect(result.success).toBe(false)
    })
})

describe('forgotPasswordSchema', () => {
    it('should accept valid email', () => {
        const result = forgotPasswordSchema.safeParse({ email: 'user@test.com' })
        expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
        const result = forgotPasswordSchema.safeParse({ email: 'xyz' })
        expect(result.success).toBe(false)
    })
})

describe('resetPasswordSchema', () => {
    const validInput = { token: 'reset-token-abc', newPassword: 'NewPass1' }

    it('should accept valid reset data', () => {
        const result = resetPasswordSchema.safeParse(validInput)
        expect(result.success).toBe(true)
    })

    it('should reject empty token', () => {
        const result = resetPasswordSchema.safeParse({ ...validInput, token: '' })
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues[0].message).toBe('Reset token is missing')
        }
    })

    it('should reject weak password', () => {
        const result = resetPasswordSchema.safeParse({ ...validInput, newPassword: 'weak' })
        expect(result.success).toBe(false)
    })
})

describe('verifyTwoFactorSchema', () => {
    const validUUID = '550e8400-e29b-41d4-a716-446655440000'
    const validInput = { userId: validUUID, otp: '123456' }

    it('should accept valid 2FA input', () => {
        const result = verifyTwoFactorSchema.safeParse(validInput)
        expect(result.success).toBe(true)
    })

    it('should reject non-UUID userId', () => {
        const result = verifyTwoFactorSchema.safeParse({ ...validInput, userId: 'not-a-uuid' })
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues[0].message).toBe('Invalid session. Please try logging in again.')
        }
    })

    it('should reject OTP with wrong length', () => {
        const result = verifyTwoFactorSchema.safeParse({ ...validInput, otp: '12345' })
        expect(result.success).toBe(false)
    })

    it('should reject OTP with letters', () => {
        const result = verifyTwoFactorSchema.safeParse({ ...validInput, otp: '12ab56' })
        expect(result.success).toBe(false)
    })
})

describe('enable2FASchema', () => {
    it('should accept true', () => {
        const result = enable2FASchema.safeParse({ enable: true })
        expect(result.success).toBe(true)
    })

    it('should accept false', () => {
        const result = enable2FASchema.safeParse({ enable: false })
        expect(result.success).toBe(true)
    })

    it('should reject non-boolean', () => {
        const result = enable2FASchema.safeParse({ enable: 'yes' })
        expect(result.success).toBe(false)
    })

    it('should reject missing field', () => {
        const result = enable2FASchema.safeParse({})
        expect(result.success).toBe(false)
    })
})