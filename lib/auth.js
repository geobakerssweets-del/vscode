import { db } from './db';
import { checkPw, currentUser } from './session';
// Admin approval (void / edit bills): the password of any active Admin or Owner.
export const isAdmin = async (pw) =>
  !!pw && (await db.list('users')).some((u) => u.active !== false && /admin/i.test(u.role) && checkPw(String(pw), u.passwordHash));
// Approval for returns over the limit: any active Admin, Owner or Accountant.
export const isApprover = async (pw) =>
  !!pw && (await db.list('users')).some((u) => u.active !== false && /admin|accountant/i.test(u.role) && checkPw(String(pw), u.passwordHash));
export const isAdminUser = async () => /admin/i.test((await currentUser())?.role || '');
export const canApproveRole = (role) => /admin|accountant/i.test(role || '');
export const myLimits = async () => {
  const me = await currentUser(); if (!me) return {};
  const u = (await db.list('users')).find((x) => x.id === me.uid) || {};
  return { dailyDiscountLimit: u.dailyDiscountLimit ?? null, creditLimit: u.creditLimit ?? null, role: me.role, uid: me.uid };
};
