export function buildUserResponse(user: {
  _id: { toString: () => string };
  name: string;
  email: string;
  credits: number;
  datePurchased: Date | null;
}) {
  return {
    name: user.name,
    userid: user._id.toString(),
    email: user.email,
    credits: user.credits,
    canExport: user.credits > 0,
    datePurchased: user.datePurchased?.toISOString() ?? null,
    lowCredit: user.credits <= 1,
  };
}
