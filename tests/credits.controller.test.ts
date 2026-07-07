import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockFindById, mockSave } = vi.hoisted(() => ({
  mockFindById: vi.fn(),
  mockSave: vi.fn(),
}));

vi.mock('../src/models/User', () => ({
  User: {
    findById: mockFindById,
  },
}));

import { getCredits, handleStripeWebhook, saveTemplate } from '../src/controllers/credits.controller';

describe('credits controller', () => {
  beforeEach(() => {
    mockFindById.mockReset();
    mockSave.mockReset();
  });

  it('returns the current credits for the authenticated user', async () => {
    const user = {
      _id: { toString: () => 'user-1' },
      name: 'Jane',
      email: 'jane@example.com',
      credits: 4,
      datePurchased: null,
      templates: [],
      save: mockSave,
    };

    mockFindById.mockResolvedValue(user);

    const req = { user: { id: 'user-1' } } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;

    await getCredits(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ credits: 4 }),
      }),
    );
  });

  it('saves a template to the user record', async () => {
    const user = {
      _id: { toString: () => 'user-1' },
      name: 'Jane',
      email: 'jane@example.com',
      credits: 2,
      datePurchased: null,
      templates: [],
      save: mockSave.mockResolvedValue(true),
    };

    mockFindById.mockResolvedValue(user);

    const req = {
      user: { id: 'user-1' },
      body: { name: 'Welcome', content: 'Hello there' },
    } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;

    await saveTemplate(req, res, vi.fn());

    expect(user.templates).toHaveLength(1);
    expect(user.templates[0]).toEqual(
      expect.objectContaining({ name: 'Welcome', content: 'Hello there' }),
    );
    expect(mockSave).toHaveBeenCalled();
  });

  it('adds credits for a completed Stripe checkout event', async () => {
    const user = {
      _id: { toString: () => 'user-1' },
      name: 'Jane',
      email: 'jane@example.com',
      credits: 0,
      datePurchased: null,
      templates: [],
      save: mockSave.mockResolvedValue(true),
    };

    mockFindById.mockResolvedValue(user);

    const req = {
      body: {
        type: 'checkout.session.completed',
        data: {
          object: {
            metadata: {
              userId: 'user-1',
              credits: '9',
            },
          },
        },
      },
      headers: {},
    } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;

    await handleStripeWebhook(req, res, vi.fn());

    expect(user.credits).toBe(9);
    expect(mockSave).toHaveBeenCalled();
  });
});
