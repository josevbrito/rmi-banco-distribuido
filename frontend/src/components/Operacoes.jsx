import { useState } from 'react';
import { depositar, sacar } from '../api';

export default function Operacoes({ contaSelecionada, onOperacao, addLog }) {
  const [valor, setValor] = useState('');
  const [mensagem, setMensagem] = useState(null);
  const [loading, setLoading] = useState(false);

  async function executar(tipo) {
    if (!contaSelecionada) {
      setMensagem({ tipo: 'erro', texto: 'Nenhuma conta selecionada.' });
      return;
    }
    const num = parseFloat(valor.replace(',', '.'));
    if (!num || num <= 0) {
      setMensagem({ tipo: 'erro', texto: 'Valor inválido.' });
      return;
    }

    setLoading(true);
    setMensagem(null);

    const endpoint = tipo === 'depositar' ? '/depositar' : '/sacar';
    addLog('INFO', 'UI', `POST ${endpoint} — conta=${contaSelecionada} valor=${num.toFixed(2)}`);

    try {
      const res = tipo === 'depositar'
        ? await depositar(contaSelecionada, num)
        : await sacar(contaSelecionada, num);

      if (res.ok) {
        const novoSaldo = Number(res.saldo).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        addLog('INFO', 'API', `${tipo}() executado — novo saldo: R$ ${novoSaldo}`);
        setMensagem({ tipo: 'sucesso', texto: `OK — saldo: R$ ${novoSaldo}` });
        setValor('');
        onOperacao();
      } else {
        addLog('ERROR', 'API', `${tipo}() rejeitado — ${res.erro}`);
        setMensagem({ tipo: 'erro', texto: res.erro });
      }
    } catch {
      addLog('WARN', 'API', `POST ${endpoint} — falha de conexão`);
      setMensagem({ tipo: 'erro', texto: 'Falha de conexão com o servidor.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">Operações</span>
        {contaSelecionada
          ? <span className="panel-sub">conta: <strong style={{color:'var(--accent)'}}>{contaSelecionada}</strong></span>
          : <span className="panel-sub" style={{color:'var(--text2)'}}>selecione uma conta</span>}
      </div>
      <div className="panel-body">
        {!contaSelecionada && (
          <p className="op-hint">Selecione uma conta na barra acima para operar.</p>
        )}

        <input
          className="input-valor"
          type="number"
          placeholder="Valor em R$"
          value={valor}
          onChange={e => setValor(e.target.value)}
          disabled={loading || !contaSelecionada}
        />

        <div className="btn-group">
          <button className="btn btn-depositar" onClick={() => executar('depositar')}
            disabled={loading || !contaSelecionada}>
            + Depositar
          </button>
          <button className="btn btn-sacar" onClick={() => executar('sacar')}
            disabled={loading || !contaSelecionada}>
            - Sacar
          </button>
        </div>

        {mensagem && (
          <div className={`op-msg ${mensagem.tipo}`}>{mensagem.texto}</div>
        )}
      </div>
    </div>
  );
}
