import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockFindOne, mockFindById, mockCreate, mockSave } = vi.hoisted(() => ({
  mockFindOne: vi.fn(),
  mockFindById: vi.fn(),
  mockCreate: vi.fn(),
  mockSave: vi.fn(),
}));

vi.mock('../src/models/User', () => ({
  User: {
    findOne: mockFindOne,
    findById: mockFindById,
    create: mockCreate,
  },
}));

vi.mock('../src/utils/email', () => ({
  sendVerificationEmail: vi.fn().mockResolvedValue(true),
}));

import { login, register, verifyEmail } from '../src/controllers/auth.controller';

describe('auth verification flow', () => {
  beforeEach(() => {
    mockFindOne.mockReset();
    mockFindById.mockReset();
    mockCreate.mockReset();
    mockSave.mockReset();
  });

  it('blocks login for unverified accounts', async () => {
    mockFindOne.mockResolvedValue({
      email: 'jane@example.com',
      passwordHash: 'hash',
      isVerified: false,
      save: mockSave,
    });

    const req = { body: { email: 'jane@example.com', password: 'secret123' } } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;

    await login(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('creates a user and sends a verification email during registration', async () => {
    mockFindOne.mockResolvedValue(null);
    mockCreate.mockResolvedValue({
      _id: { toString: () => 'user-1' },
      name: 'Jane',
      email: 'jane@example.com',
      passwordHash: 'hash',
      isVerified: false,
      verificationToken: 'token-123',
      save: mockSave,
    });

    const req = { body: { name: 'Jane', email: 'jane@example.com', password: 'secret123' } } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;

    await register(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(201);
    expect(mockCreate).toHaveBeenCalled();
  });

  it('marks the user as verified when the verification token is valid', async () => {
    const user = {
      _id: { toString: () => 'user-1' },
      isVerified: false,
      verificationToken: 'token-123',
      save: mockSave.mockResolvedValue(true),
    };

    mockFindOne.mockResolvedValue(user);

    const req = { params: { token: 'token-123' } } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;

    await verifyEmail(req, res, vi.fn());

    expect(user.isVerified).toBe(true);
    expect(mockSave).toHaveBeenCalled();
  });
});
