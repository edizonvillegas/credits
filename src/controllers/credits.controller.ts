import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { calculateCreditsFromDollars, canUseExport } from '../utils/credits';
import { buildUserResponse } from '../utils/user';

const purchaseSchema = z.object({
  dollars: z.number().positive(),
});

const templateSchema = z.object({
  name: z.string().min(1),
  content: z.string().min(1),
});

export async function getCredits(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as Request & { user?: { id: string } }).user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({ success: true, data: buildUserResponse(user) });
  } catch (error) {
    next(error);
  }
}

export async function buyCredits(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = purchaseSchema.parse(req.body);
    const userId = (req as Request & { user?: { id: string } }).user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const purchasedCredits = calculateCreditsFromDollars(parsed.dollars);
    user.credits += purchasedCredits;
    user.datePurchased = new Date();
    await user.save();

    return res.status(200).json({
      success: true,
      message: `${purchasedCredits} credits added successfully.`,
      data: buildUserResponse(user),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.issues[0]?.message || 'Validation failed.' });
    }

    next(error);
  }
}

export async function saveTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = templateSchema.parse(req.body);
    const userId = (req as Request & { user?: { id: string } }).user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.templates = [
      ...(user.templates ?? []),
      {
        name: parsed.name,
        content: parsed.content,
        createdAt: new Date(),
      },
    ];

    await user.save();

    return res.status(201).json({
      success: true,
      message: 'Template saved successfully.',
      data: {
        templates: user.templates,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.issues[0]?.message || 'Validation failed.' });
    }

    next(error);
  }
}

export async function handleStripeWebhook(req: Request, res: Response, next: NextFunction) {
  try {
    const event = req.body;
    const eventType = event?.type;

    if (eventType !== 'checkout.session.completed') {
      return res.status(200).json({ success: true, received: true });
    }

    const userId = event?.data?.object?.metadata?.userId;
    const creditsToAdd = Number(event?.data?.object?.metadata?.credits ?? 0);

    if (!userId || !Number.isFinite(creditsToAdd) || creditsToAdd <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid Stripe webhook payload.' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.credits += creditsToAdd;
    user.datePurchased = new Date();
    await user.save();

    return res.status(200).json({ success: true, message: 'Credits synced from Stripe.' });
  } catch (error) {
    next(error);
  }
}

export async function exportData(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as Request & { user?: { id: string } }).user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (!canUseExport(user.credits)) {
      return res.status(403).json({
        success: false,
        message: 'You need at least 1 credit to export.',
        data: buildUserResponse(user),
      });
    }

    user.credits -= 1;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Export completed.',
      data: buildUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
}
