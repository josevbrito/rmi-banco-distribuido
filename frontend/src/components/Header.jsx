export default function Header({ servidorOnline, aba, setAba, logCount }) {
  const tabs = [
    { id: 'dashboard',  label: 'Dashboard' },
    { id: 'log',        label: 'Log do Sistema', badge: logCount > 0 ? logCount : null },
    { id: 'referencia', label: 'Referência RMI' },
  ];

  return (
    <header className="header">
      <div className="header-brand">
        <div className="brand-icon">BD</div>
        <span className="brand-name">Banco Distribuído</span>
        <span className="brand-tag">RMI</span>
      </div>

      <nav className="header-nav">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`nav-tab ${aba === t.id ? 'active' : ''}`}
            onClick={() => setAba(t.id)}
          >
            {t.label}
            {t.badge != null && (
              <span className="nav-badge">{t.badge > 999 ? '999+' : t.badge}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="header-right">
        <div className="status-item">
          <span className={`status-dot ${servidorOnline ? 'online' : 'offline'}`} />
          <span className={`status-label ${servidorOnline ? 'online' : 'offline'}`}>
            {servidorOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        <div className="status-ports">
          <span>RMI :1099</span>
          <span>REST :8080</span>
        </div>
      </div>
    </header>
  );
}
