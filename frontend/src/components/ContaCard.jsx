export default function ContaCard({ conta, saldo, selecionada, onSelecionar }) {
  return (
    <button
      className={`conta-card ${selecionada ? 'selecionada' : ''}`}
      onClick={() => onSelecionar(conta)}
    >
      <div className="conta-sigla">{conta.slice(0, 2).toUpperCase()}</div>
      <div className="conta-info-row">
        <span className="conta-id">{conta}</span>
        <span className="conta-valor">
          R$ {Number(saldo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
      </div>
    </button>
  );
}
