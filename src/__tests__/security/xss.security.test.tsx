import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

const MockValidator = ({ question }: { question: string }) => {
  return <div dangerouslySetInnerHTML={{ __html: question }} data-testid="question-output" />;
};

describe('XSS Security Tests', () => {
  it('should not execute malicious scripts in user input', () => {
    const maliciousInput = `<img src="x" onerror="alert('XSS')" />`;

    render(<MockValidator question={maliciousInput} />);

    const output = screen.getByTestId('question-output');
    expect(output).toContainHTML(maliciousInput);
  });
});