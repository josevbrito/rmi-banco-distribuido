import { useState } from 'react';
import { depositar, sacar } from '../api';

export default function Operacoes({ contaSelecionada, onOperacao }) {
  const [valor, setValor] = useState('');
  const [mensagem, setMensagem] = useState(null);
  const [loading, setLoading] = useState(false);

  async function executar(tipo) {
    if (!contaSelecionada) return setMensagem({ tipo: 'erro', texto: 'Selecione uma conta.' });
    const num = parseFloat(valor.replace(',', '.'));
    if (!num || num <= 0) return setMensagem({ tipo: 'erro', texto: 'Informe um valor válido.' });

    setLoading(true);
    setMensagem(null);
    try {
      const res = tipo === 'depositar'
        ? await depositar(contaSelecionada, num)
        : await sacar(contaSelecionada, num);

      if (res.ok) {
        setMensagem({ tipo: 'sucesso', texto: `${tipo === 'depositar' ? 'Depósito' : 'Saque'} realizado! Novo saldo: R$ ${Number(res.saldo).toFixed(2)}` });
        setValor('');
        onOperacao();
      } else {
        setMensagem({ tipo: 'erro', texto: res.erro });
      }
    } catch {
      setMensagem({ tipo: 'erro', texto: 'Erro de conexão com o servidor.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2 className="card-title">Operações</h2>
      {contaSelecionada
        ? <p className="conta-ativa">Conta ativa: <strong>{contaSelecionada}</strong></p>
        : <p className="hint">← Selecione uma conta</p>}

      <input
        className="input-valor"
        type="number"
        placeholder="Valor (R$)"
        value={valor}
        onChange={e => setValor(e.target.value)}
        disabled={loading}
      />

      <div className="btn-group">
        <button className="btn btn-depositar" onClick={() => executar('depositar')} disabled={loading}>
          ↑ Depositar
        </button>
        <button className="btn btn-sacar" onClick={() => executar('sacar')} disabled={loading}>
          ↓ Sacar
        </button>
      </div>

      {mensagem && (
        <div className={`mensagem ${mensagem.tipo}`}>{mensagem.texto}</div>
      )}
    </div>
  );
}
