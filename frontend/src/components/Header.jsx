export default function Header({ servidorOnline }) {
  return (
    <header className="header">
      <div className="header-left">
        <span className="header-logo">🏦</span>
        <div>
          <h1 className="header-title">Banco Distribuído</h1>
          <p className="header-sub">Java RMI · Sistemas Distribuídos</p>
        </div>
      </div>
      <div className={`status-badge ${servidorOnline ? 'online' : 'offline'}`}>
        <span className="status-dot" />
        {servidorOnline ? 'Servidor Online' : 'Servidor Offline'}
      </div>
    </header>
  );
}
