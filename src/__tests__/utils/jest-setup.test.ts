import '@testing-library/jest-dom';
import React from 'react';

describe('jest-setup', () => {
    it('should import @testing-library/jest-dom', () => {
        expect(() => require('@testing-library/jest-dom')).not.toThrow();
    });

    it('should assign React to global.React', () => {
        expect(global.React).toBe(React);
    });
});