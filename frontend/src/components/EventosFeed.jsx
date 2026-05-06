export default function EventosFeed({ eventos }) {
  return (
    <div className="card feed-card">
      <h2 className="card-title">
        <span className="feed-dot" /> Feed RMI em tempo real
      </h2>
      <p className="feed-sub">Notificações via SSE — callback RMI → servidor → browser</p>
      {eventos.length === 0
        ? <p className="hint">Aguardando operações...</p>
        : (
          <div className="feed-lista">
            {[...eventos].reverse().map((ev, i) => (
              <div key={i} className={`feed-item ${ev.tipo.toLowerCase()}`}>
                <span className="feed-conta">{ev.conta}</span>
                <span className="feed-tipo">{ev.tipo === 'DEPOSITO' ? '↑' : '↓'} {ev.tipo}</span>
                <span className="feed-valor">R$ {Number(ev.valor).toFixed(2)}</span>
                <span className="feed-saldo">→ R$ {Number(ev.saldo).toFixed(2)}</span>
                <span className="feed-hora">{new Date(ev.dataHora).toLocaleTimeString('pt-BR')}</span>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
