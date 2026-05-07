import { describe, expect, it } from 'vitest';
import { formatStatus } from './formatStatus';

describe('formatStatus', () => {
  it('formats craft statuses for display', () => {
    expect(formatStatus('inspiration')).toBe('Inspiration');
    expect(formatStatus('work-in-progress')).toBe('Work in Progress');
    expect(formatStatus('completed')).toBe('Completed');
  });
});
