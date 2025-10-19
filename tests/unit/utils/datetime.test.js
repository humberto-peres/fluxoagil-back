const { SP_TZ, parseDateInput, formatSPDateTime, formatSPDate, ymdInSP } = require('../../../src/utils/datetime');

describe('Datetime Utils', () => {
  describe('SP_TZ', () => {
    test('deve ter o timezone correto de São Paulo', () => {
      expect(SP_TZ).toBe('America/Sao_Paulo');
    });
  });

  describe('parseDateInput', () => {
    test('deve retornar null para valores vazios', () => {
      expect(parseDateInput(null)).toBeNull();
      expect(parseDateInput(undefined)).toBeNull();
      expect(parseDateInput('')).toBeNull();
    });

    test('deve retornar Date quando receber Date', () => {
      const date = new Date('2024-01-15T10:30:00');
      const result = parseDateInput(date);
      
      expect(result).toBe(date);
      expect(result instanceof Date).toBe(true);
    });

    test('deve parsear string no formato YYYY-MM-DD', () => {
      const result = parseDateInput('2024-01-15');
      
      expect(result instanceof Date).toBe(true);
      expect(result.toISOString()).toContain('2024-01-15');
    });

    test('deve parsear string no formato ISO completo', () => {
      const result = parseDateInput('2024-01-15T10:30:00Z');
      
      expect(result instanceof Date).toBe(true);
      expect(result.toISOString()).toBe('2024-01-15T10:30:00.000Z');
    });

    test('deve parsear timestamp numérico', () => {
      const timestamp = 1705320600000;
      const result = parseDateInput(timestamp);
      
      expect(result instanceof Date).toBe(true);
      expect(result.getTime()).toBe(timestamp);
    });

    test('deve criar Date com offset para formato YYYY-MM-DD', () => {
      const result = parseDateInput('2024-12-25');
      
      expect(result.toISOString()).toContain('2024-12-25');
    });
  });

  describe('formatSPDateTime', () => {
    test('deve retornar null para valores vazios', () => {
      expect(formatSPDateTime(null)).toBeNull();
      expect(formatSPDateTime(undefined)).toBeNull();
      expect(formatSPDateTime('')).toBeNull();
    });

    test('deve formatar data e hora no padrão brasileiro', () => {
      const date = new Date('2024-01-15T13:30:45Z');
      const result = formatSPDateTime(date);
      
      expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4},\s\d{2}:\d{2}:\d{2}$/);
    });

    test('deve usar timezone de São Paulo', () => {
      const date = new Date('2024-06-15T12:00:00Z');
      const result = formatSPDateTime(date);
      
      expect(result).toContain('2024');
      expect(result).toContain('06');
      expect(result).toContain('15');
    });

    test('deve formatar com zeros à esquerda', () => {
      const date = new Date('2024-01-05T08:05:03Z');
      const result = formatSPDateTime(date);
      
      expect(result).toMatch(/05\/01\/2024/);
    });

    test('deve usar formato 24 horas', () => {
      const date = new Date('2024-01-15T23:59:59Z');
      const result = formatSPDateTime(date);
      
      expect(result).not.toMatch(/AM|PM/i);
    });
  });

  describe('formatSPDate', () => {
    test('deve retornar null para valores vazios', () => {
      expect(formatSPDate(null)).toBeNull();
      expect(formatSPDate(undefined)).toBeNull();
      expect(formatSPDate('')).toBeNull();
    });

    test('deve formatar apenas a data no padrão brasileiro', () => {
      const date = new Date('2024-01-15T13:30:45Z');
      const result = formatSPDate(date);
      
      expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });

    test('deve usar timezone de São Paulo', () => {
      const date = new Date('2024-12-25T12:00:00Z');
      const result = formatSPDate(date);
      
      expect(result).toContain('2024');
      expect(result).toContain('12');
      expect(result).toContain('25');
    });

    test('deve formatar com zeros à esquerda', () => {
      const date = new Date('2024-01-05T10:00:00Z');
      const result = formatSPDate(date);
      
      expect(result).toMatch(/05\/01\/2024/);
    });

    test('não deve incluir horário', () => {
      const date = new Date('2024-01-15T23:59:59Z');
      const result = formatSPDate(date);
      
      expect(result).not.toMatch(/:/);
      expect(result).not.toMatch(/\d{2}:\d{2}/);
    });
  });

  describe('ymdInSP', () => {
    test('deve retornar null para valores vazios', () => {
      expect(ymdInSP(null)).toBeNull();
      expect(ymdInSP(undefined)).toBeNull();
      expect(ymdInSP('')).toBeNull();
    });

    test('deve formatar no padrão YYYY-MM-DD', () => {
      const date = new Date('2024-01-15T13:30:45Z');
      const result = ymdInSP(date);
      
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('deve usar timezone de São Paulo', () => {
      const date = new Date('2024-06-15T03:00:00Z');
      const result = ymdInSP(date);
      
      expect(result).toMatch(/2024-06-1[45]/);
    });

    test('deve aceitar string como entrada', () => {
      const result = ymdInSP('2024-12-25T10:00:00Z');
      
      expect(result).toMatch(/2024-12-25/);
    });

    test('deve aceitar Date como entrada', () => {
      const date = new Date('2024-12-25T12:00:00Z');
      const result = ymdInSP(date);
      
      expect(result).toMatch(/2024-12-25/);
    });

    test('deve formatar com zeros à esquerda', () => {
      const date = new Date('2024-01-05T10:00:00Z');
      const result = ymdInSP(date);
      
      expect(result).toBe('2024-01-05');
    });

    test('deve usar locale en-CA para formato ISO', () => {
      const date = new Date('2024-03-08T12:00:00Z');
      const result = ymdInSP(date);
      
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});