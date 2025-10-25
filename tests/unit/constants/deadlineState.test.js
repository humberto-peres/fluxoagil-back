const {
  DEADLINE_STATE,
  DEADLINE_STATE_LABEL,
  DEADLINE_STATE_TYPE,
} = require('../../../src/constants/deadlineState');

describe('DEADLINE_STATE constants', () => {
  it('deve conter todos os estados esperados', () => {
    expect(Object.values(DEADLINE_STATE)).toEqual(
      expect.arrayContaining([0, 1, 2, 3])
    );
  });

  it('deve ter labels válidos para cada estado', () => {
    for (const value of Object.values(DEADLINE_STATE)) {
      expect(DEADLINE_STATE_LABEL[value]).toEqual(
        expect.stringMatching(/Sem prazo|Hoje|Em atraso|Em dia/)
      );
    }
  });

  it('deve ter types válidos para cada estado', () => {
    for (const value of Object.values(DEADLINE_STATE)) {
      expect(DEADLINE_STATE_TYPE[value]).toEqual(
        expect.stringMatching(/default|warning|danger|success/)
      );
    }
  });
});
