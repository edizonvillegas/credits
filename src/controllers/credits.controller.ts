import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { calculateCreditsFromDollars, canUseExport } from '../utils/credits';
import { buildUserResponse } from '../utils/user';

const purchaseSchema = z.object({
  dollars: z.number().positive(),
});

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
