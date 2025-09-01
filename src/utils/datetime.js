const SP_TZ = 'America/Sao_Paulo';

function parseDateInput(v) {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) {
    return new Date(`${v}T00:00:00-03:00`);
  }
  return new Date(v);
}

function formatSPDateTime(v) {
  if (!v) return null;
  return new Date(v).toLocaleString('pt-BR', {
    timeZone: SP_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function formatSPDate(v) {
  if (!v) return null;
  return new Date(v).toLocaleDateString('pt-BR', {
    timeZone: SP_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function ymdInSP(v) {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: SP_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

module.exports = { SP_TZ, parseDateInput, formatSPDateTime, formatSPDate, ymdInSP };
