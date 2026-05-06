import { useState, useEffect, useRef } from 'react';

const FILTERS = ['ALL', 'INFO', 'RMI', 'SSE', 'WARN', 'ERROR'];

function fmtTs(date) {
  return date.toLocaleTimeString('pt-BR', { hour12: false }) +
    '.' + String(date.getMilliseconds()).padStart(3, '0');
}

export default function SistemaLog({ logs, onLimpar }) {
  const [filtro, setFiltro] = useState('ALL');
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef(null);

  const visíveis = filtro === 'ALL'
    ? logs
    : logs.filter(l => l.level === filtro || (filtro === 'SSE' && l.source === 'SSE'));

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  return (
    <div className="log-page">
      <div className="log-toolbar">
        {FILTERS.map(f => (
          <button
            key={f}
            className={`log-filter-btn ${filtro === f ? 'active' : ''}`}
            onClick={() => setFiltro(f)}
          >
            {f}
          </button>
        ))}
        <label style={{ display:'flex', alignItems:'center', gap:'.35rem', marginLeft:'.5rem',
                        fontSize:'.72rem', color:'var(--text2)', cursor:'pointer' }}>
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={e => setAutoScroll(e.target.checked)}
            style={{ accentColor: 'var(--accent)' }}
          />
          auto-scroll
        </label>
        <span className="log-count">{visíveis.length} entradas</span>
        <button className="log-clear" onClick={onLimpar}>Limpar</button>
      </div>

      <div className="log-console">
        <div className="log-console-header">
          <span className="log-console-title">sistema.log</span>
          <span style={{ fontSize:'.65rem', fontFamily:'var(--mono)', color:'var(--text2)' }}>
            {logs.length}/300
          </span>
        </div>

        <div className="log-scroll" ref={scrollRef}>
          {visíveis.length === 0 ? (
            <div className="log-empty">Nenhuma entrada de log.</div>
          ) : (
            <table className="log-table">
              <tbody>
                {visíveis.map(entry => (
                  <tr key={entry.id}>
                    <td className="log-ts">{fmtTs(entry.ts)}</td>
                    <td className="log-level">
                      <span className={`lvl lvl-${entry.level}`}>{entry.level}</span>
                    </td>
                    <td className="log-source"
                        style={{ color: srcColor(entry.source) }}>
                      {entry.source}
                    </td>
                    <td className="log-msg">{entry.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function srcColor(src) {
  switch (src) {
    case 'API': return 'var(--cyan)';
    case 'SSE': return 'var(--purple)';
    case 'UI':  return 'var(--text2)';
    default:    return 'var(--text2)';
  }
}
