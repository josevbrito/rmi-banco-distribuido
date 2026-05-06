import { useState, useEffect, useCallback, useRef } from 'react';
import { getContas, getExtrato, criarSSE } from './api';
import Header from './components/Header';
import ContaCard from './components/ContaCard';
import Operacoes from './components/Operacoes';
import Extrato from './components/Extrato';
import EventosFeed from './components/EventosFeed';
import SistemaLog from './components/SistemaLog';
import ReferenciaRMI from './components/ReferenciaRMI';
import './App.css';

export default function App() {
  const [contas, setContas] = useState([]);
  const [contaSelecionada, setContaSelecionada] = useState(null);
  const [extrato, setExtrato] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [servidorOnline, setServidorOnline] = useState(false);
  const [aba, setAba] = useState('dashboard');
  const [logs, setLogs] = useState([]);
  const logSeq = useRef(0);
  const prevOnline = useRef(false);

  const addLog = useCallback((level, source, message) => {
    setLogs(prev => [...prev.slice(-299), {
      id: logSeq.current++,
      ts: new Date(),
      level,
      source,
      message,
    }]);
  }, []);

  const carregarContas = useCallback(async () => {
    try {
      const data = await getContas();
      setContas(data);
      if (!prevOnline.current) {
        addLog('INFO', 'API', 'Conexão com o servidor estabelecida — GET /contas OK');
        prevOnline.current = true;
      }
      setServidorOnline(true);
    } catch {
      if (prevOnline.current) {
        addLog('WARN', 'API', 'Servidor inacessível — GET /contas falhou');
        prevOnline.current = false;
      }
      setServidorOnline(false);
    }
  }, [addLog]);

  const carregarExtrato = useCallback(async (conta) => {
    if (!conta) return;
    try {
      const data = await getExtrato(conta);
      setExtrato(data);
    } catch {
      setExtrato([]);
    }
  }, []);

  const onOperacao = useCallback(() => {
    carregarContas();
    if (contaSelecionada) carregarExtrato(contaSelecionada);
  }, [carregarContas, carregarExtrato, contaSelecionada]);

  function selecionarConta(conta) {
    setContaSelecionada(conta);
    carregarExtrato(conta);
    addLog('INFO', 'UI', `Conta selecionada: ${conta} — GET /extrato?conta=${conta}`);
  }

  useEffect(() => {
    addLog('INFO', 'SSE', 'EventSource inicializando — conectando a /eventos');
    const es = criarSSE((evento) => {
      setEventos(prev => [...prev.slice(-99), evento]);
      addLog(
        'RMI', 'SSE',
        `onTransacao() recebido via callback — ${evento.conta} ${evento.tipo} ` +
        `R$ ${Number(evento.valor).toFixed(2)} → saldo R$ ${Number(evento.saldo).toFixed(2)}`
      );
      carregarContas();
    }, () => {
      addLog('INFO', 'SSE', 'EventSource conectado em GET /eventos');
    }, () => {
      addLog('WARN', 'SSE', 'EventSource perdeu conexão — tentando reconectar');
    });
    return () => es.close();
  }, [carregarContas, addLog]);

  useEffect(() => {
    carregarContas();
    const id = setInterval(carregarContas, 5000);
    return () => clearInterval(id);
  }, [carregarContas]);

  useEffect(() => {
    if (eventos.length > 0 && contaSelecionada) {
      const ultimo = eventos[eventos.length - 1];
      if (ultimo.conta === contaSelecionada) carregarExtrato(contaSelecionada);
    }
  }, [eventos, contaSelecionada, carregarExtrato]);

  return (
    <div className="app">
      <Header servidorOnline={servidorOnline} aba={aba} setAba={setAba} logCount={logs.length} />

      {aba === 'dashboard' && (
        <main className="main">
          <div className="contas-bar">
            <span className="bar-label">CONTAS</span>
            <div className="contas-row">
              {contas.map(c => (
                <ContaCard
                  key={c.conta}
                  conta={c.conta}
                  saldo={c.saldo}
                  selecionada={contaSelecionada === c.conta}
                  onSelecionar={selecionarConta}
                />
              ))}
            </div>
          </div>

          <div className="grid-principal">
            <div className="col-esquerda">
              <Operacoes contaSelecionada={contaSelecionada} onOperacao={onOperacao} addLog={addLog} />
              <Extrato extrato={extrato} conta={contaSelecionada} />
            </div>
            <div className="col-direita">
              <EventosFeed eventos={eventos} />
            </div>
          </div>
        </main>
      )}

      {aba === 'log' && <SistemaLog logs={logs} onLimpar={() => setLogs([])} />}
      {aba === 'referencia' && <ReferenciaRMI />}
    </div>
  );
}
