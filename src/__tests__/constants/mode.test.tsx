import Mode from '../../constants/mode';

describe('Mode Enum', () => {
  test('should have correct values', () => {
    expect(Mode.pribadi).toBe('PRIBADI');
    expect(Mode.pengawasan).toBe('PENGAWASAN');
  });
});
