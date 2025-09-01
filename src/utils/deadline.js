const { DEADLINE_STATE, DEADLINE_STATE_LABEL, DEADLINE_STATE_TYPE } = require('../constants/deadlineState');
const { ymdInSP } = require('./datetime');

function deadlineState(deadline) {
  const dl = ymdInSP(deadline);
  const today = ymdInSP(new Date());
    
  if (!dl) {
    return {
        "label": DEADLINE_STATE_LABEL[DEADLINE_STATE.NONE],
        "type": DEADLINE_STATE_TYPE[DEADLINE_STATE.NONE]
    }
  } else if (today === dl) {
    return {
        "label": DEADLINE_STATE_LABEL[DEADLINE_STATE.TODAY],
        "type": DEADLINE_STATE_TYPE[DEADLINE_STATE.TODAY]
    }
  } else if (today > dl) {
    return {
        "label": DEADLINE_STATE_LABEL[DEADLINE_STATE.EXPIRED],
        "type": DEADLINE_STATE_TYPE[DEADLINE_STATE.EXPIRED]
    }
  } else {
    return {
        "label": DEADLINE_STATE_LABEL[DEADLINE_STATE.FUTURE],
        "type": DEADLINE_STATE_TYPE[DEADLINE_STATE.FUTURE]
    }
  }
}

module.exports = { deadlineState };
