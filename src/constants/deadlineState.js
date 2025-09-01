const DEADLINE_STATE = Object.freeze({
  NONE: 0,
  TODAY: 1,
  EXPIRED: 2,
  FUTURE: 3,
});

const DEADLINE_STATE_LABEL = Object.freeze({
  [DEADLINE_STATE.NONE]: 'Sem prazo',
  [DEADLINE_STATE.TODAY]: 'Hoje',
  [DEADLINE_STATE.EXPIRED]: 'Em atraso',
  [DEADLINE_STATE.FUTURE]: 'Em dia',
});

const DEADLINE_STATE_TYPE = Object.freeze({
  [DEADLINE_STATE.NONE]: 'default',
  [DEADLINE_STATE.TODAY]: 'warning',
  [DEADLINE_STATE.EXPIRED]: 'danger',
  [DEADLINE_STATE.FUTURE]: 'success',
});

module.exports = { DEADLINE_STATE, DEADLINE_STATE_LABEL, DEADLINE_STATE_TYPE };
