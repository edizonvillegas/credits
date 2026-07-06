import bcrypt from 'bcryptjs';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env';
import { User } from '../models/User';
import { buildUserResponse } from '../utils/user';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = registerSchema.parse(req.body);
    const existingUser = await User.findOne({ email: parsed.email });

    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const passwordHash = await bcrypt.hash(parsed.password, 10);
    const user = await User.create({
      name: parsed.name,
      email: parsed.email,
      passwordHash,
      credits: 0,
      datePurchased: null,
    });

    const token = jwt.sign({ id: user._id.toString() }, env.JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      success: true,
      message: 'Registration succeeded. Buy credits to enable exports.',
      data: {
        token,
        user: buildUserResponse(user),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.issues[0]?.message || 'Validation failed.' });
    }

    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = loginSchema.parse(req.body);
    const user = await User.findOne({ email: parsed.email });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isPasswordValid = await bcrypt.compare(parsed.password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user._id.toString() }, env.JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({
      success: true,
      message: 'Signed in successfully.',
      data: {
        token,
        user: buildUserResponse(user),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.issues[0]?.message || 'Validation failed.' });
    }

    next(error);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
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
