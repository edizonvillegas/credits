import { describe, expect, it } from 'vitest';
import { calculateCreditsFromDollars, canUseExport, getLowCreditStatus } from '../src/utils/credits';

describe('credit helpers', () => {
  it('allows export only when credits are available', () => {
    expect(canUseExport(0)).toBe(false);
    expect(canUseExport(1)).toBe(true);
    expect(canUseExport(5)).toBe(true);
  });

  it('marks low credit when credits are at or below one', () => {
    expect(getLowCreditStatus(0)).toBe(true);
    expect(getLowCreditStatus(1)).toBe(true);
    expect(getLowCreditStatus(2)).toBe(false);
  });

  it('converts dollars to credits using the 3 credits per dollar rule', () => {
    expect(calculateCreditsFromDollars(1)).toBe(3);
    expect(calculateCreditsFromDollars(2)).toBe(6);
  });
});
