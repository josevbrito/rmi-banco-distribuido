const METODOS = [
  {
    sig: 'depositar(String conta, double valor)',
    badge: 'badge-prim', badgeLabel: 'Primitivos',
    conceito: 'Passagem de tipos primitivos e String pela rede. O stub serializa os argumentos e os envia ao servidor via JRMP.',
    detalhe: [
      ['Parâmetros', 'String + double → serializados no stub'],
      ['Retorno', 'void (resultado chega via callback)'],
      ['Exceção', 'RemoteException (falha de rede)'],
    ],
  },
  {
    sig: 'sacar(String conta, double valor)',
    badge: 'badge-excecao', badgeLabel: 'Exceção Remota',
    conceito: 'Além da passagem de primitivos, demonstra exceção de aplicação serializada. Quando o saldo é insuficiente, o servidor instancia SaldoInsuficienteException, serializa e envia ao cliente.',
    detalhe: [
      ['Parâmetros', 'String + double → serializados no stub'],
      ['Exceção de negócio', 'SaldoInsuficienteException implements Serializable — viaja pela rede'],
      ['Captura no cliente', 'catch (SaldoInsuficienteException e) — parece local, é remoto'],
    ],
  },
  {
    sig: 'consultarSaldo(String conta)',
    badge: 'badge-prim', badgeLabel: 'Primitivos',
    conceito: 'Retorno de tipo primitivo (double) via RMI. O valor de retorno é serializado pelo servidor e desserializado pelo stub no cliente.',
    detalhe: [
      ['Parâmetros', 'String → serializada'],
      ['Retorno', 'double → desserializado no cliente'],
    ],
  },
  {
    sig: 'getExtrato(String conta)',
    badge: 'badge-valor', badgeLabel: 'Por valor',
    conceito: 'Retorna List<Transacao>. Cada Transacao implementa Serializable — objetos são copiados e enviados pela rede. Alterações no cliente não afetam o servidor.',
    detalhe: [
      ['Retorno', 'List<Transacao> — lista de cópias independentes'],
      ['Transacao', 'implements Serializable — serialVersionUID definido'],
      ['Semântica', 'Passagem por valor: cópia profunda viaja pela rede'],
    ],
  },
  {
    sig: 'registrarListener(String conta, ClienteListener l)',
    badge: 'badge-ref', badgeLabel: 'Ref. remota',
    conceito: 'Passagem por referência remota. ClienteListener estende Remote — o objeto real fica na JVM do cliente. O servidor recebe apenas um stub e pode chamar de volta o cliente.',
    detalhe: [
      ['ClienteListener', 'extends Remote — não é serializado, é exportado'],
      ['O que viaja', 'Stub do listener, não o objeto em si'],
      ['Inversão', 'Servidor chama o cliente: l.onTransacao(t)'],
    ],
  },
  {
    sig: 'SSE /eventos (feed em tempo real)',
    badge: 'badge-sse', badgeLabel: 'SSE',
    conceito: 'O servidor Java expõe um endpoint SSE (REST :8080). Quando o callback RMI onTransacao() é invocado, o servidor propaga o evento ao browser via Server-Sent Events.',
    detalhe: [
      ['Fluxo', 'depositar() → notifica listeners → ClienteListenerImpl → SSE → React'],
      ['Protocolo', 'text/event-stream — conexão persistente unidirecional'],
      ['No React', 'EventSource conectado a GET /eventos'],
    ],
  },
];

const GLOSSARIO = [
  { termo: 'Remote',                desc: 'Interface marcadora do java.rmi. Todo objeto que pode ser invocado remotamente deve ter sua interface estendendo Remote.',              nota: 'Obrigatório em toda interface remota' },
  { termo: 'RemoteException',       desc: 'Exceção checked que toda chamada remota pode lançar. Indica falhas de rede, timeout ou objeto indisponível.',                        nota: 'Deve ser declarada em todos os métodos remotos' },
  { termo: 'UnicastRemoteObject',   desc: 'Classe base para objetos remotos. Ao ser instanciada, exporta automaticamente o objeto em uma porta TCP e o registra no runtime RMI.', nota: 'A implementação do servidor deve estendê-la' },
  { termo: 'Stub (proxy)',          desc: 'Objeto gerado dinamicamente pelo RMI que representa o objeto remoto no lado do cliente. Intercepta chamadas, serializa parâmetros e envia pela rede.', nota: 'Gerado em tempo de execução desde Java 5; rmic removido no JDK 15' },
  { termo: 'RMI Registry',         desc: 'Serviço de nomes simples (porta padrão 1099). O servidor registra objetos com rebind("nome", obj); o cliente recupera com lookup("nome").', nota: 'Semelhante a um DNS local para objetos remotos' },
  { termo: 'Serializable',         desc: 'Interface marcadora. Objetos que implementam Serializable podem ser convertidos em bytes e enviados pela rede. Cópias independentes chegam no destino.', nota: 'Passagem por valor no RMI' },
  { termo: 'JRMP',                 desc: 'Java Remote Method Protocol — protocolo de transporte binário proprietário do RMI sobre TCP.',                                       nota: 'Alternativa IIOP existe para interoperabilidade com CORBA' },
  { termo: 'Marshalling',          desc: 'Processo de serializar parâmetros, retornos e exceções em bytes para transmissão pela rede. O stub faz o marshal; o lado receptor faz o unmarshal.', nota: 'Equivalente ao encoding em outros protocolos' },
  { termo: 'Callback (ref. rem.)', desc: 'Quando o cliente passa um objeto que estende Remote como parâmetro, o servidor recebe um stub desse objeto e pode chamar métodos nele — invertendo os papéis.', nota: 'Demonstrado por ClienteListener neste projeto' },
  { termo: 'SSE',                  desc: 'Server-Sent Events — mecanismo HTTP para o servidor empurrar dados ao browser em tempo real. Usado aqui para propagar eventos de callback RMI ao frontend React.', nota: 'Não é RMI; é a ponte entre o callback Java e o browser' },
];

export default function ReferenciaRMI() {
  return (
    <div className="ref-page">

      {/* Arquitetura */}
      <div>
        <div className="ref-section-title">Arquitetura do sistema</div>
        <div className="arch-box">
          <div>
            <span className="hl-g">Browser (React)</span>
            {' '}→ <span className="hl">REST :8080</span>
            {' '}→ <span className="hl">BancoServiceImpl</span>
            {' '}← <span style={{color:'var(--text2)'}}>Java RMI :1099 ←</span>
            {' '}<span className="hl-p">stub (cliente RMI)</span>
          </div>
          <div style={{marginTop:'.25rem'}}>
            <span style={{color:'var(--text2)'}}>{'                                 '}</span>
            <span className="hl">BancoServiceImpl</span>
            {' '}→ <span className="hl-p">ClienteListener.onTransacao()</span>
            {' '}→ <span className="hl-c">SSE /eventos</span>
            {' '}→ <span className="hl-g">React EventSource</span>
          </div>
          <div style={{marginTop:'.75rem', color:'var(--text2)'}}>
            Fluxo de uma operação:<br />
            <span className="hl-g">1. Browser</span> chama POST /depositar →{' '}
            <span className="hl">2. BancoServiceImpl.depositar()</span> executa →{' '}
            <span className="hl-p">3. notifica listeners via callback RMI</span> →{' '}
            <span className="hl-c">4. propaga via SSE</span> →{' '}
            <span className="hl-g">5. React atualiza</span>
          </div>
        </div>
      </div>

      {/* Métodos */}
      <div>
        <div className="ref-section-title">Métodos da interface BancoService</div>
        <div className="methods-grid">
          {METODOS.map((m, i) => (
            <div key={i} className="method-card">
              <div className="method-header">
                <code className="method-sig">{m.sig}</code>
                <span className={`method-badge ${m.badge}`}>{m.badgeLabel}</span>
              </div>
              <div className="method-body">
                <p className="method-concept">{m.conceito}</p>
                <div className="method-detail">
                  {m.detalhe.map(([k, v], j) => (
                    <div key={j}><span style={{color:'var(--text2)'}}>{k}:</span>{' '}<span>{v}</span></div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Glossário */}
      <div>
        <div className="ref-section-title">Glossário RMI</div>
        <div className="panel">
          <table className="glossary-table">
            <thead>
              <tr>
                <th style={{width:'160px'}}>Termo</th>
                <th>Descrição</th>
                <th style={{width:'220px'}}>Nota</th>
              </tr>
            </thead>
            <tbody>
              {GLOSSARIO.map((g, i) => (
                <tr key={i}>
                  <td className="gt-term">{g.termo}</td>
                  <td className="gt-desc">{g.desc}</td>
                  <td className="gt-note">{g.nota}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
