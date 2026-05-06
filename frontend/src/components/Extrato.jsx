function fmtData(iso) {
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit' });
}

export default function Extrato({ extrato, conta }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">Extrato</span>
        {conta
          ? <span className="panel-sub" style={{fontFamily:'var(--mono)',color:'var(--accent)'}}>{conta}</span>
          : <span className="panel-sub">—</span>}
      </div>

      {!conta ? (
        <div className="extrato-empty">Selecione uma conta para ver o extrato.</div>
      ) : extrato.length === 0 ? (
        <div className="extrato-empty">Nenhuma transação registrada.</div>
      ) : (
        <div className="extrato-scroll">
          <table className="extrato-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Data / Hora</th>
                <th>Valor</th>
                <th>Saldo após</th>
              </tr>
            </thead>
            <tbody>
              {[...extrato].reverse().map((t, i) => {
                const dep = t.tipo === 'DEPOSITO';
                const cls = dep ? 'deposito' : 'saque';
                return (
                  <tr key={i}>
                    <td className={`td-tipo ${cls}`}>{dep ? '+ DEPÓSITO' : '- SAQUE'}</td>
                    <td className="td-data">{fmtData(t.dataHora)}</td>
                    <td className={`td-valor ${cls}`}>
                      {dep ? '+' : '-'} R$ {Number(t.valor).toFixed(2)}
                    </td>
                    <td className="td-saldo">R$ {Number(t.saldo).toFixed(2)}</td>
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
