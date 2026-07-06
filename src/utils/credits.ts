export function canUseExport(credits: number): boolean {
  return credits > 0;
}

export function getLowCreditStatus(credits: number): boolean {
  return credits <= 1;
}

export function calculateCreditsFromDollars(dollars: number): number {
  return Math.max(0, Math.floor(dollars * 3));
}
