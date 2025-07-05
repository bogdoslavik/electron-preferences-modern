import { describe, it, expect, vi } from 'vitest';
import debounce from '../src/app/utils/debounce';
import { newGuid } from '../src/app/utils/newGuid';
import keycodeToChar from '../src/app/utils/keycodeToChar';
import { isArray } from '../src/app/utils/isArray';

describe('debounce', () => {
  it('delays execution', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    debounced('a');
    vi.advanceTimersByTime(99);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledWith('a');
    vi.useRealTimers();
  });

  it('supports abort', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 50);
    debounced('a');
    debounced({ abort: true });
    vi.advanceTimersByTime(60);
    expect(fn).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});

describe('newGuid', () => {
  it('creates unique guids', () => {
    const a = newGuid();
    const b = newGuid();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i);
    expect(b).toMatch(/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i);
  });
});

describe('keycodeToChar', () => {
  it('returns correct mapping', () => {
    expect(keycodeToChar[65]).toBe('A');
  });
});

describe('isArray', () => {
  it('detects arrays correctly', () => {
    expect(isArray([1, 2])).toBe(true);
    expect(isArray('foo')).toBe(false);
  });
});
