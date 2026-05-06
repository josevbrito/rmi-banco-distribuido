import { useState, useEffect, useCallback } from 'react';
import { getContas, getExtrato, criarSSE } from './api';
import Header from './components/Header';
import ContaCard from './components/ContaCard';
import Operacoes from './components/Operacoes';
import Extrato from './components/Extrato';
import EventosFeed from './components/EventosFeed';
import './App.css';

export default function App() {
  const [contas, setContas] = useState([]);
  const [contaSelecionada, setContaSelecionada] = useState(null);
  const [extrato, setExtrato] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [servidorOnline, setServidorOnline] = useState(false);

  const carregarContas = useCallback(async () => {
    try {
      const data = await getContas();
      setContas(data);
      setServidorOnline(true);
    } catch {
      setServidorOnline(false);
    }
  }, []);

  const carregarExtrato = useCallback(async (conta) => {
    if (!conta) return;
    try {
      const data = await getExtrato(conta);
      setExtrato(data);
    } catch {
      setExtrato([]);
    }
  }, []);

  // Atualiza contas e extrato após operação
  const onOperacao = useCallback(() => {
    carregarContas();
    if (contaSelecionada) carregarExtrato(contaSelecionada);
  }, [carregarContas, carregarExtrato, contaSelecionada]);

  // Seleciona conta e carrega extrato
  function selecionarConta(conta) {
    setContaSelecionada(conta);
    carregarExtrato(conta);
  }

  // SSE — conecta uma vez
  useEffect(() => {
    const es = criarSSE((evento) => {
      setEventos(prev => [...prev.slice(-49), evento]); // mantém últimos 50
      carregarContas();
    });
    return () => es.close();
  }, [carregarContas]);

  // Polling leve de contas (fallback e atualização de saldo)
  useEffect(() => {
    carregarContas();
    const id = setInterval(carregarContas, 5000);
    return () => clearInterval(id);
  }, [carregarContas]);

  // Atualiza extrato quando SSE chega para conta selecionada
  useEffect(() => {
    if (eventos.length > 0 && contaSelecionada) {
      const ultimo = eventos[eventos.length - 1];
      if (ultimo.conta === contaSelecionada) carregarExtrato(contaSelecionada);
    }
  }, [eventos, contaSelecionada, carregarExtrato]);

  return (
    <div className="app">
      <Header servidorOnline={servidorOnline} />

      <main className="main">
        {/* Contas */}
        <section className="section-contas">
          <h2 className="section-title">Contas</h2>
          <div className="contas-grid">
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
        </section>

        {/* Grid principal */}
        <div className="grid-principal">
          <div className="col-esquerda">
            <Operacoes contaSelecionada={contaSelecionada} onOperacao={onOperacao} />
            <Extrato extrato={extrato} conta={contaSelecionada} />
          </div>
          <div className="col-direita">
            <EventosFeed eventos={eventos} />
          </div>
        </div>
      </main>
    </div>
  );
}
