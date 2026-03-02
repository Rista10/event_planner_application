import { jest } from '@jest/globals';

const mockFindByEmail = jest.fn<(...args: any[]) => any>();
const mockFindById = jest.fn<(...args: any[]) => any>();
const mockCreateUser = jest.fn<(...args: any[]) => any>();
const mockUpdateEmailVerified = jest.fn<(...args: any[]) => any>();
const mockUpdatePassword = jest.fn<(...args: any[]) => any>();

jest.unstable_mockModule('../repository.js', () => ({
    findByEmail: mockFindByEmail,
    findById: mockFindById,
    createUser: mockCreateUser,
    updateEmailVerified: mockUpdateEmailVerified,
    updatePassword: mockUpdatePassword,
}));

const mockCreateToken = jest.fn<(...args: any[]) => any>();
const mockVerifyToken = jest.fn<(...args: any[]) => any>();
const mockVerifyOtpForUser = jest.fn<(...args: any[]) => any>();
const mockConsumeToken = jest.fn<(...args: any[]) => any>();

jest.unstable_mockModule('../../token/service.js', () => ({
    createToken: mockCreateToken,
    verifyToken: mockVerifyToken,
    verifyOtpForUser: mockVerifyOtpForUser,
    consumeToken: mockConsumeToken,
    TokenType: {
        EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
        PASSWORD_RESET: 'PASSWORD_RESET',
        TWO_FACTOR: 'TWO_FACTOR',
    },
}));

const mockSendVerificationEmail = jest.fn<(...args: any[]) => any>();
const mockSendTwoFactorOtpEmail = jest.fn<(...args: any[]) => any>();
const mockSendPasswordResetEmail = jest.fn<(...args: any[]) => any>();

jest.unstable_mockModule('../../email/service.js', () => ({
    sendVerificationEmail: mockSendVerificationEmail,
    sendTwoFactorOtpEmail: mockSendTwoFactorOtpEmail,
    sendPasswordResetEmail: mockSendPasswordResetEmail,
}));

const mockHash = jest.fn<(...args: any[]) => any>();
const mockCompare = jest.fn<(...args: any[]) => any>();

jest.unstable_mockModule('bcrypt', () => ({
    default: { hash: mockHash, compare: mockCompare },
}));

const mockSign = jest.fn<(...args: any[]) => any>();
const mockVerify = jest.fn<(...args: any[]) => any>();

jest.unstable_mockModule('jsonwebtoken', () => ({
    default: { sign: mockSign, verify: mockVerify },
}));

jest.unstable_mockModule('../../../config/env.js', () => ({
    env: {
        JWT_SECRET: 'test-secret',
        JWT_REFRESH_SECRET: 'test-refresh-secret',
        JWT_ACCESS_EXPIRY: '15m',
        JWT_REFRESH_EXPIRY: '7d',
        BCRYPT_SALT_ROUNDS: 10,
        EMAIL_VERIFICATION_EXPIRY_MINUTES: 1440,
        PASSWORD_RESET_EXPIRY_MINUTES: 60,
        TWO_FACTOR_EXPIRY_MINUTES: 10,
    },
}));

const { signup, login, refreshAccessToken, resetPassword, verifyEmail } = await import('../service.js');

const fakeUser = {
    id: 'user-uuid-1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashed-password',
    is_email_verified: false,
    two_factor_enabled: false,
    created_at: new Date(),
    updated_at: new Date(),
};

beforeEach(() => {
    jest.clearAllMocks();
    mockSign.mockReturnValue('mock-jwt-token');
});


describe('signup', () => {
    it('should throw 409 when email already exists', async () => {
        mockFindByEmail.mockResolvedValue(fakeUser);
        await expect(
            signup({ name: 'X', email: 'test@example.com', password: 'Password1' })
        ).rejects.toThrow('Email already in use');
    });

    it('should create user and return tokens', async () => {
        mockFindByEmail.mockResolvedValue(undefined);
        mockHash.mockResolvedValue('hashed-pw');
        mockCreateUser.mockResolvedValue({ ...fakeUser, password: 'hashed-pw' });
        mockCreateToken.mockResolvedValue({ token: { id: 'tok-1' }, plaintext: 'verify-token' });
        mockSendVerificationEmail.mockResolvedValue(undefined);

        const result = await signup({ name: 'Test User', email: 'test@example.com', password: 'Password1' });

        expect(mockCreateUser).toHaveBeenCalled();
        expect(mockSendVerificationEmail).toHaveBeenCalled();
        expect(result.auth.user.email).toBe('test@example.com');
        expect(result.auth.accessToken).toBe('mock-jwt-token');
    });
});


describe('login', () => {
    it('should throw 401 when user not found', async () => {
        mockFindByEmail.mockResolvedValue(undefined);
        await expect(
            login({ email: 'no@user.com', password: 'Password1' })
        ).rejects.toThrow('Invalid email or password');
    });

    it('should throw 401 when password is wrong', async () => {
        mockFindByEmail.mockResolvedValue(fakeUser);
        mockCompare.mockResolvedValue(false);
        await expect(
            login({ email: 'test@example.com', password: 'WrongPw1' })
        ).rejects.toThrow('Invalid email or password');
    });

    it('should return 2FA response when 2FA is enabled', async () => {
        mockFindByEmail.mockResolvedValue({ ...fakeUser, two_factor_enabled: true });
        mockCompare.mockResolvedValue(true);
        mockCreateToken.mockResolvedValue({ token: { id: 'tok-1' }, plaintext: '123456' });
        mockSendTwoFactorOtpEmail.mockResolvedValue(undefined);

        const result = await login({ email: 'test@example.com', password: 'Password1' });

        expect(result).toEqual({ requiresTwoFactor: true, userId: fakeUser.id });
        expect(mockSendTwoFactorOtpEmail).toHaveBeenCalled();
    });

    it('should return tokens for valid credentials', async () => {
        mockFindByEmail.mockResolvedValue(fakeUser);
        mockCompare.mockResolvedValue(true);

        const result = await login({ email: 'test@example.com', password: 'Password1' });

        expect(result).toHaveProperty('auth');
        expect(result).toHaveProperty('refreshToken');
    });
});


describe('refreshAccessToken', () => {
    it('should throw for invalid token', async () => {
        mockVerify.mockImplementation(() => { throw new Error('jwt expired'); });
        await expect(refreshAccessToken('bad-token')).rejects.toThrow('Invalid or expired refresh token');
    });

    it('should throw when user not found', async () => {
        mockVerify.mockReturnValue({ id: 'gone', email: 'x', name: 'x' });
        mockFindById.mockResolvedValue(undefined);
        await expect(refreshAccessToken('valid-token')).rejects.toThrow('User not found');
    });

    it('should return new tokens for valid refresh token', async () => {
        mockVerify.mockReturnValue({ id: fakeUser.id, email: fakeUser.email, name: fakeUser.name });
        mockFindById.mockResolvedValue(fakeUser);

        const result = await refreshAccessToken('valid-refresh-token');

        expect(result.auth.user.id).toBe(fakeUser.id);
        expect(result.refreshToken).toBe('mock-jwt-token');
    });
});


describe('resetPassword', () => {
    it('should throw when user not found after token verify', async () => {
        mockVerifyToken.mockResolvedValue({ id: 'tok-id', user_id: 'gone' });
        mockFindById.mockResolvedValue(undefined);
        await expect(resetPassword('token', 'NewPass1')).rejects.toThrow('Invalid or expired token');
    });

    it('should reset password successfully', async () => {
        mockVerifyToken.mockResolvedValue({ id: 'tok-id', user_id: fakeUser.id });
        mockFindById.mockResolvedValue(fakeUser);
        mockConsumeToken.mockResolvedValue(undefined);
        mockHash.mockResolvedValue('new-hashed-pw');
        mockUpdatePassword.mockResolvedValue(undefined);

        const result = await resetPassword('valid-token', 'NewPassword1');

        expect(result.message).toBe('Password reset successfully');
        expect(mockUpdatePassword).toHaveBeenCalledWith(fakeUser.id, 'new-hashed-pw');
    });
});


describe('verifyEmail', () => {
    it('should throw when email already verified', async () => {
        mockVerifyToken.mockResolvedValue({ id: 'tok-id', user_id: fakeUser.id });
        mockFindById.mockResolvedValue({ ...fakeUser, is_email_verified: true });
        await expect(verifyEmail('token')).rejects.toThrow('Email is already verified');
    });

    it('should verify email successfully', async () => {
        mockVerifyToken.mockResolvedValue({ id: 'tok-id', user_id: fakeUser.id });
        mockFindById.mockResolvedValue(fakeUser);
        mockConsumeToken.mockResolvedValue(undefined);
        mockUpdateEmailVerified.mockResolvedValue(undefined);

        const result = await verifyEmail('valid-token');

        expect(result.message).toBe('Email verified successfully');
        expect(mockUpdateEmailVerified).toHaveBeenCalledWith(fakeUser.id, true);
    });
});
