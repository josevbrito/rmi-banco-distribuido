const BASE = 'http://localhost:8080';

export async function getContas() {
  const res = await fetch(`${BASE}/contas`);
  return res.json();
}

export async function depositar(conta, valor) {
  const res = await fetch(`${BASE}/depositar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conta, valor }),
  });
  return res.json();
}

export async function sacar(conta, valor) {
  const res = await fetch(`${BASE}/sacar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conta, valor }),
  });
  return res.json();
}

export async function getExtrato(conta) {
  const res = await fetch(`${BASE}/extrato?conta=${conta}`);
  return res.json();
}

export function criarSSE(onEvento, onOpen, onError) {
  const es = new EventSource(`${BASE}/eventos`);
  es.addEventListener('transacao', (e) => onEvento(JSON.parse(e.data)));
  es.onopen  = () => onOpen?.();
  es.onerror = () => onError?.();
  return es;
}
