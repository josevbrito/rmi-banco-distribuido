export default function Extrato({ extrato, conta }) {
  if (!conta) return (
    <div className="card">
      <h2 className="card-title">Extrato</h2>
      <p className="hint">Selecione uma conta para ver o extrato.</p>
    </div>
  );

  return (
    <div className="card">
      <h2 className="card-title">Extrato — {conta}</h2>
      {extrato.length === 0
        ? <p className="hint">Nenhuma transação ainda.</p>
        : (
          <div className="extrato-lista">
            {[...extrato].reverse().map((t, i) => (
              <div key={i} className={`extrato-item ${t.tipo.toLowerCase()}`}>
                <div className="extrato-left">
                  <span className="extrato-tipo">{t.tipo === 'DEPOSITO' ? '↑ Depósito' : '↓ Saque'}</span>
                  <span className="extrato-data">{new Date(t.dataHora).toLocaleString('pt-BR')}</span>
                </div>
                <div className="extrato-right">
                  <span className="extrato-valor">
                    {t.tipo === 'DEPOSITO' ? '+' : '-'} R$ {Number(t.valor).toFixed(2)}
                  </span>
                  <span className="extrato-saldo">Saldo: R$ {Number(t.saldo).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
