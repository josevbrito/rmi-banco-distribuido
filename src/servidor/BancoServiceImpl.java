package servidor;

import comum.*;
import java.rmi.RemoteException;
import java.rmi.server.UnicastRemoteObject;
import java.util.*;

public class BancoServiceImpl extends UnicastRemoteObject implements BancoService {

    private static final long serialVersionUID = 1L;

    // Armazena saldo de cada conta
    private final Map<String, Double> saldos = new HashMap<>();

    // Armazena histórico de transações por conta
    private final Map<String, List<Transacao>> extratos = new HashMap<>();

    // Armazena listeners registrados por conta
    private final Map<String, List<ClienteListener>> listeners = new HashMap<>();

    public BancoServiceImpl() throws RemoteException {
        super();
        // Cria duas contas de teste com saldo inicial
        criarConta("joao", 1000.0);
        criarConta("maria", 500.0);
    }

    // Método auxiliar interno — não faz parte da interface remota
    private void criarConta(String conta, double saldoInicial) {
        saldos.put(conta, saldoInicial);
        extratos.put(conta, new ArrayList<>());
        listeners.put(conta, new ArrayList<>());
        System.out.printf("[Banco] Conta criada: %s | Saldo inicial: R$ %.2f%n", conta, saldoInicial);
    }

    @Override
    public synchronized void depositar(String conta, double valor) throws RemoteException {
        validarConta(conta);
        double novoSaldo = saldos.get(conta) + valor;
        saldos.put(conta, novoSaldo);

        Transacao t = new Transacao(Transacao.Tipo.DEPOSITO, valor, novoSaldo);
        extratos.get(conta).add(t);

        System.out.printf("[Banco] Depósito em %s: R$ %.2f | Novo saldo: R$ %.2f%n", conta, valor, novoSaldo);
        notificarListeners(conta, t);
    }

    @Override
    public synchronized void sacar(String conta, double valor)
            throws RemoteException, SaldoInsuficienteException {
        validarConta(conta);
        double saldoAtual = saldos.get(conta);

        if (valor > saldoAtual) {
            throw new SaldoInsuficienteException(saldoAtual, valor);
        }

        double novoSaldo = saldoAtual - valor;
        saldos.put(conta, novoSaldo);

        Transacao t = new Transacao(Transacao.Tipo.SAQUE, valor, novoSaldo);
        extratos.get(conta).add(t);

        System.out.printf("[Banco] Saque em %s: R$ %.2f | Novo saldo: R$ %.2f%n", conta, valor, novoSaldo);
        notificarListeners(conta, t);
    }

    @Override
    public synchronized double consultarSaldo(String conta) throws RemoteException {
        validarConta(conta);
        return saldos.get(conta);
    }

    @Override
    public synchronized List<Transacao> getExtrato(String conta) throws RemoteException {
        validarConta(conta);
        // Retorna cópia da lista — cada Transacao viaja como objeto serializado (por valor)
        return new ArrayList<>(extratos.get(conta));
    }

    @Override
    public synchronized void registrarListener(String conta, ClienteListener listener)
            throws RemoteException {
        validarConta(conta);
        listeners.get(conta).add(listener);
        System.out.printf("[Banco] Listener registrado para conta: %s%n", conta);
    }

    // Notifica todos os listeners registrados para a conta
    // Listeners que falharem são removidos silenciosamente
    private void notificarListeners(String conta, Transacao t) {
        List<ClienteListener> lista = listeners.get(conta);
        List<ClienteListener> mortos = new ArrayList<>();

        for (ClienteListener listener : lista) {
            try {
                listener.onTransacao(t);
            } catch (RemoteException e) {
                System.out.printf("[Banco] Listener indisponível para conta %s — removendo.%n", conta);
                mortos.add(listener);
            }
        }
        lista.removeAll(mortos);
    }

    // Lança RemoteException se a conta não existir
    private void validarConta(String conta) throws RemoteException {
        if (!saldos.containsKey(conta)) {
            throw new RemoteException("Conta não encontrada: " + conta);
        }
    }
}
