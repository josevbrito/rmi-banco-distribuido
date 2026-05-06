function fmtHora(iso) {
  return new Date(iso).toLocaleTimeString('pt-BR');
}

export default function EventosFeed({ eventos }) {
  return (
    <div className="panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header">
        <span className="panel-title">Feed RMI</span>
        <div className="feed-indicator">
          <span className="live-dot" />
          <span className="panel-sub">SSE · callback → browser</span>
        </div>
      </div>

      {eventos.length === 0 ? (
        <div className="feed-empty">Aguardando eventos RMI...</div>
      ) : (
        <div className="feed-scroll">
          <table className="feed-table">
            <thead>
              <tr>
                <th>Hora</th>
                <th>Conta</th>
                <th>Operação</th>
                <th>Valor</th>
                <th>Saldo</th>
              </tr>
            </thead>
            <tbody>
              {[...eventos].reverse().map((ev, i) => {
                const dep = ev.tipo === 'DEPOSITO';
                return (
                  <tr key={i}>
                    <td style={{ color: 'var(--text2)', fontSize: '.65rem' }}>{fmtHora(ev.dataHora)}</td>
                    <td style={{ color: 'var(--accent)', fontWeight: 700 }}>{ev.conta}</td>
                    <td style={{ color: dep ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
                      {dep ? '+' : '-'} {ev.tipo}
                    </td>
                    <td style={{ color: 'var(--text)' }}>R$ {Number(ev.valor).toFixed(2)}</td>
                    <td style={{ color: 'var(--text2)' }}>R$ {Number(ev.saldo).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
