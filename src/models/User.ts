import mongoose, { Schema, type Document } from 'mongoose';

export interface ITemplate {
  name: string;
  content: string;
  createdAt: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  credits: number;
  canExport: boolean;
  datePurchased: Date | null;
  lowCredit: boolean;
  isVerified: boolean;
  verificationToken: string | null;
  verificationTokenExpiresAt: Date | null;
  templates: ITemplate[];
  createdAt: Date;
  updatedAt: Date;
}

const templateSchema = new Schema<ITemplate>(
  {
    name: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    credits: { type: Number, default: 0, min: 0 },
    canExport: { type: Boolean, default: false },
    datePurchased: { type: Date, default: null },
    lowCredit: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String, default: null },
    verificationTokenExpiresAt: { type: Date, default: null },
    templates: { type: [templateSchema], default: [] },
  },
  { timestamps: true },
);

userSchema.pre('save', function (next) {
  this.canExport = this.credits > 0;
  this.lowCredit = this.credits <= 1;
  next();
});

export const User = mongoose.model<IUser>('User', userSchema);
