import { describe, expect, it } from 'vitest';
import {
  allValid,
  hasImageExtension,
  isPositiveInteger,
  isPrime,
  validateDateRange,
  validateEmail,
  validateImageUrl,
  validateLength,
  validateLoginPassword,
  validateName,
  validatePositiveInteger,
  validatePrimeStoryPoint,
  validateRole,
  validateSignupPassword,
  validateTitle,
} from './validators';

describe('validateEmail', () => {
  it('accepts a normal address', () => {
    expect(validateEmail('jack@xyz.com')).toBeNull();
  });
  it('rejects empty and malformed addresses', () => {
    expect(validateEmail('')).toBe('Email is required');
    expect(validateEmail('jack@xyz')).not.toBeNull();
    expect(validateEmail('jack xyz.com')).not.toBeNull();
  });
});

describe('passwords', () => {
  it('login password needs 6+ characters and no spaces', () => {
    expect(validateLoginPassword('abc123')).toBeNull();
    expect(validateLoginPassword('abc')).not.toBeNull();
    expect(validateLoginPassword('abc 123')).not.toBeNull();
    expect(validateLoginPassword('')).toBe('Password is required');
  });
  it('sign-up password must be strong', () => {
    expect(validateSignupPassword('Secret@123')).toBeNull();
    expect(validateSignupPassword('secret@123')).not.toBeNull();
    expect(validateSignupPassword('Secret123')).not.toBeNull();
    expect(validateSignupPassword('Se@1')).not.toBeNull();
  });
});

describe('validateName and validateRole', () => {
  it('rejects blank names and digits', () => {
    expect(validateName('Jack Finn')).toBeNull();
    expect(validateName('   ')).toBe('Name is required');
    expect(validateName('Jack 007')).not.toBeNull();
  });
  it('requires a role', () => {
    expect(validateRole('')).not.toBeNull();
    expect(validateRole('assignee')).toBeNull();
  });
});

describe('image URLs', () => {
  it('validates the URL format', () => {
    expect(validateImageUrl('https://example.com/me.png')).toBeNull();
    expect(validateImageUrl('ftp://example.com/me.png')).not.toBeNull();
    expect(validateImageUrl('not a url')).not.toBeNull();
    expect(validateImageUrl('')).not.toBeNull();
  });
  it('detects image extensions, ignoring the query string', () => {
    expect(hasImageExtension('https://example.com/me.JPG?size=200')).toBe(true);
    expect(hasImageExtension('https://example.com/profile')).toBe(false);
  });
});

describe('validateTitle', () => {
  it('allows only - / | . as special characters', () => {
    expect(validateTitle('FedEx Courier - v1.2 / EU | UK', 'Project name', 150)).toBeNull();
    expect(validateTitle('Payments #1', 'Project name', 150)).not.toBeNull();
    expect(validateTitle('a'.repeat(151), 'Project name', 150)).not.toBeNull();
  });
  it('honours the minimum length', () => {
    expect(validateTitle('Bug', 'Summary', 100, 5)).not.toBeNull();
  });
});

describe('numbers', () => {
  it('recognises prime numbers', () => {
    expect([2, 3, 5, 7, 11, 13].every(isPrime)).toBe(true);
    expect([0, 1, 4, 9, 15].some(isPrime)).toBe(false);
  });
  it('validates prime story points (optional)', () => {
    expect(validatePrimeStoryPoint('')).toBeNull();
    expect(validatePrimeStoryPoint('5')).toBeNull();
    expect(validatePrimeStoryPoint('8')).not.toBeNull();
    expect(validatePrimeStoryPoint('2.5')).not.toBeNull();
  });
  it('validates positive integers', () => {
    expect(isPositiveInteger('3')).toBe(true);
    expect(isPositiveInteger('0')).toBe(false);
    expect(validatePositiveInteger('', 'Sprint', true)).toBe('Sprint is required');
    expect(validatePositiveInteger('', 'Sprint', false)).toBeNull();
    expect(validatePositiveInteger('-1', 'Sprint', false)).not.toBeNull();
  });
});

describe('misc', () => {
  it('checks date ranges', () => {
    expect(validateDateRange('2026-01-10', '2026-01-09')).not.toBeNull();
    expect(validateDateRange('2026-01-10', '2026-01-10')).toBeNull();
  });
  it('checks lengths', () => {
    expect(validateLength('short', 'Description', 10, 500)).not.toBeNull();
    expect(validateLength('long enough text', 'Description', 10, 500)).toBeNull();
  });
  it('allValid', () => {
    expect(allValid({ a: null, b: null })).toBe(true);
    expect(allValid({ a: null, b: 'x' })).toBe(false);
  });
});
