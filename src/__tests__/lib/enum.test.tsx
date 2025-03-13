import { CauseStatus } from '../../lib/enum';

describe('CauseStatus Enum', () => {
  test('should have correct values', () => {
    expect(CauseStatus.Incorrect).toBe('INCORRECT');
    expect(CauseStatus.CorrectNotRoot).toBe('CORRECT_NOT_ROOT');
    expect(CauseStatus.CorrectRoot).toBe('CORRECT_ROOT');
    expect(CauseStatus.Resolved).toBe('RESOLVED');
    expect(CauseStatus.Unchecked).toBe('UNCHECKED');
  });
});
