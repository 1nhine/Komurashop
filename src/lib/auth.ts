import crypto from 'crypto';
import { cookies } from 'next/headers';
import { supabase } from './supabase';

const SECRET = process.env.AUTH_SECRET || 'fallback_secret_key_mb9006688668';

// Hash mật khẩu
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, key] = stored.split(':');
    const keyBuffer = Buffer.from(key, 'hex');
    const derived = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derived);
  } catch {
    return false;
  }
}

// Token phiên đăng nhập an toàn lưu cookie
export function createToken(userId: string): string {
  const payload = Buffer.from(JSON.stringify({ userId, exp: Date.now() + 14 * 24 * 3600 * 1000 })).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function verifyToken(token: string): string | null {
  try {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return null;

    const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
    if (signature !== expected) return null;

    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (Date.now() > data.exp) return null;

    return data.userId;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = cookies();
  const token = cookieStore.get('shop_session')?.value;
  if (!token) return null;

  const userId = verifyToken(token);
  if (!userId) return null;

  const { data, error } = await supabase
    .from('users')
    .select('id, email, name, balance')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return data;
}
