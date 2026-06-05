import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSession, getSession, destroySession } from '@/lib/auth/session';
import type { SessionData } from '@/lib/auth/session';

// ─── Mock next/headers ────────────────────────────────────────────────────────

const cookieStore: Record<string, string> = {};

vi.mock('next/headers', () => ({
  cookies: async () => ({
    set: (name: string, value: string) => {
      cookieStore[name] = value;
    },
    get: (name: string) =>
      cookieStore[name] !== undefined ? { value: cookieStore[name] } : undefined,
    delete: (name: string) => {
      delete cookieStore[name];
    },
  }),
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('session — createSession / getSession / destroySession', () => {
  const sampleData: SessionData = {
    userId: 'user-001',
    userName: 'Rö',
    createdAt: 1700000000000,
  };

  beforeEach(() => {
    // Reset cookie store before each test
    Object.keys(cookieStore).forEach((k) => delete cookieStore[k]);
  });

  it('stores a signed token — raw value is not plain JSON', async () => {
    await createSession(sampleData);
    const raw = cookieStore['auth-session'];
    expect(raw).toBeDefined();
    // Should not be parseable as plain JSON
    expect(() => JSON.parse(raw)).toThrow();
    // Should have the payload.signature format (contains a dot)
    expect(raw).toContain('.');
  });

  it('round-trips session data correctly', async () => {
    await createSession(sampleData);
    const result = await getSession();
    expect(result).not.toBeNull();
    expect(result?.userId).toBe(sampleData.userId);
    expect(result?.userName).toBe(sampleData.userName);
    expect(result?.createdAt).toBe(sampleData.createdAt);
  });

  it('returns null when no cookie is set', async () => {
    const result = await getSession();
    expect(result).toBeNull();
  });

  it('returns null for a tampered payload', async () => {
    await createSession(sampleData);
    const raw = cookieStore['auth-session'];
    const dot = raw.lastIndexOf('.');
    // Flip a character in the payload section to simulate tampering
    const tampered = raw.slice(0, dot - 1) + 'X' + raw.slice(dot);
    cookieStore['auth-session'] = tampered;
    const result = await getSession();
    expect(result).toBeNull();
  });

  it('returns null for a tampered signature', async () => {
    await createSession(sampleData);
    const raw = cookieStore['auth-session'];
    const dot = raw.lastIndexOf('.');
    // Replace signature with garbage
    cookieStore['auth-session'] = raw.slice(0, dot) + '.invalidsignature';
    const result = await getSession();
    expect(result).toBeNull();
  });

  it('returns null for a completely invalid token', async () => {
    cookieStore['auth-session'] = 'not-a-valid-token';
    const result = await getSession();
    expect(result).toBeNull();
  });

  it('destroys the session', async () => {
    await createSession(sampleData);
    await destroySession();
    const result = await getSession();
    expect(result).toBeNull();
  });
});
