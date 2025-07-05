import { describe, it, expect } from 'vitest';
import { lightenWithWhite } from '../src/lightenWithWhite';

describe('lightenWithWhite', () => {
    it('lightens black by 50%', () => {
        const result = lightenWithWhite('#000000', 0.5);
        expect(result).toBe('#808080');
    });

    it('lightens color with custom ratio', () => {
        const result = lightenWithWhite('#123456', 0.2);
        expect(result).toBe('#415d78');
    });
});
