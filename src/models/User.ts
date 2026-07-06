import mongoose, { Schema, type Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  credits: number;
  canExport: boolean;
  datePurchased: Date | null;
  lowCredit: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    credits: { type: Number, default: 0, min: 0 },
    canExport: { type: Boolean, default: false },
    datePurchased: { type: Date, default: null },
    lowCredit: { type: Boolean, default: true },
  },
  { timestamps: true },
);

userSchema.pre('save', function (next) {
  this.canExport = this.credits > 0;
  this.lowCredit = this.credits <= 1;
  next();
});

export const User = mongoose.model<IUser>('User', userSchema);
