const { deadlineState } = require('../../../src/utils/deadline');
const { ymdInSP } = require('../../../src/utils/datetime');

jest.mock('../../../src/utils/datetime', () => ({
  ymdInSP: jest.fn(),
}));

jest.mock('../../../src/constants/deadlineState', () => ({
  DEADLINE_STATE: {
    NONE: 'NONE',
    TODAY: 'TODAY',
    EXPIRED: 'EXPIRED',
    FUTURE: 'FUTURE',
  },
  DEADLINE_STATE_LABEL: {
    NONE: 'Sem prazo',
    TODAY: 'Hoje',
    EXPIRED: 'Atrasado',
    FUTURE: 'Futuro',
  },
  DEADLINE_STATE_TYPE: {
    NONE: 'none',
    TODAY: 'warning',
    EXPIRED: 'error',
    FUTURE: 'success',
  },
}));

describe('Deadline Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('deadlineState', () => {
    test('deve retornar NONE quando deadline for null', () => {
      ymdInSP.mockReturnValueOnce(null);
      ymdInSP.mockReturnValueOnce('2024-01-15');

      const result = deadlineState(null);

      expect(result).toEqual({
        label: 'Sem prazo',
        type: 'none',
      });
    });

    test('deve retornar NONE quando deadline for undefined', () => {
      ymdInSP.mockReturnValueOnce(null);
      ymdInSP.mockReturnValueOnce('2024-01-15');

      const result = deadlineState(undefined);

      expect(result).toEqual({
        label: 'Sem prazo',
        type: 'none',
      });
    });

    test('deve retornar TODAY quando deadline for hoje', () => {
      ymdInSP.mockReturnValueOnce('2024-01-15');
      ymdInSP.mockReturnValueOnce('2024-01-15');

      const result = deadlineState(new Date('2024-01-15'));

      expect(result).toEqual({
        label: 'Hoje',
        type: 'warning',
      });
    });

    test('deve retornar EXPIRED quando deadline for no passado', () => {
      ymdInSP.mockReturnValueOnce('2024-01-10');
      ymdInSP.mockReturnValueOnce('2024-01-15');

      const result = deadlineState(new Date('2024-01-10'));

      expect(result).toEqual({
        label: 'Atrasado',
        type: 'error',
      });
    });

    test('deve retornar FUTURE quando deadline for no futuro', () => {
      ymdInSP.mockReturnValueOnce('2024-01-20');
      ymdInSP.mockReturnValueOnce('2024-01-15');

      const result = deadlineState(new Date('2024-01-20'));

      expect(result).toEqual({
        label: 'Futuro',
        type: 'success',
      });
    });

    test('deve comparar datas usando ymdInSP', () => {
      ymdInSP.mockReturnValueOnce('2024-12-25');
      ymdInSP.mockReturnValueOnce('2024-12-20');

      deadlineState(new Date('2024-12-25'));

      expect(ymdInSP).toHaveBeenCalledTimes(2);
      expect(ymdInSP).toHaveBeenNthCalledWith(1, expect.any(Date));
      expect(ymdInSP).toHaveBeenNthCalledWith(2, expect.any(Date));
    });

    test('deve usar comparação de strings para datas', () => {
      ymdInSP.mockReturnValueOnce('2024-01-20');
      ymdInSP.mockReturnValueOnce('2024-01-15');

      const result = deadlineState(new Date());

      expect(result.label).toBe('Futuro');
    });

    test('deve usar comparação de strings para passado', () => {
      ymdInSP.mockReturnValueOnce('2024-01-10');
      ymdInSP.mockReturnValueOnce('2024-01-15');

      const result = deadlineState(new Date());

      expect(result.label).toBe('Atrasado');
    });

    test('deve tratar deadline 1 dia antes como EXPIRED', () => {
      ymdInSP.mockReturnValueOnce('2024-01-14');
      ymdInSP.mockReturnValueOnce('2024-01-15');

      const result = deadlineState(new Date('2024-01-14'));

      expect(result).toEqual({
        label: 'Atrasado',
        type: 'error',
      });
    });

    test('deve tratar deadline 1 dia depois como FUTURE', () => {
      ymdInSP.mockReturnValueOnce('2024-01-16');
      ymdInSP.mockReturnValueOnce('2024-01-15');

      const result = deadlineState(new Date('2024-01-16'));

      expect(result).toEqual({
        label: 'Futuro',
        type: 'success',
      });
    });

    test('deve chamar ymdInSP com deadline e Date atual', () => {
      const mockDeadline = new Date('2024-06-15');
      ymdInSP.mockReturnValueOnce('2024-06-15');
      ymdInSP.mockReturnValueOnce('2024-06-10');

      deadlineState(mockDeadline);

      expect(ymdInSP).toHaveBeenCalledWith(mockDeadline);
      expect(ymdInSP).toHaveBeenCalledWith(expect.any(Date));
    });
  });
});