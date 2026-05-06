export default function ContaCard({ conta, saldo, selecionada, onSelecionar }) {
  return (
    <button
      className={`conta-card ${selecionada ? 'selecionada' : ''}`}
      onClick={() => onSelecionar(conta)}
    >
      <div className="conta-avatar">{conta[0].toUpperCase()}</div>
      <div className="conta-info">
        <span className="conta-nome">{conta}</span>
        <span className="conta-saldo">
          R$ {Number(saldo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
      </div>
    </button>
  );
}
