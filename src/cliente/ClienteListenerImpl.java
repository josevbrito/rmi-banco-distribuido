package cliente;

import comum.ClienteListener;
import comum.Transacao;
import java.rmi.RemoteException;
import java.rmi.server.UnicastRemoteObject;

/**
 * Implementação do callback ClienteListener.
 *
 * Esta classe é exportada como objeto remoto via UnicastRemoteObject.
 * O servidor recebe um stub dela e chama onTransacao() de volta ao cliente.
 * Isso demonstra passagem de referência remota como parâmetro no RMI.
 */
public class ClienteListenerImpl extends UnicastRemoteObject implements ClienteListener {

    private static final long serialVersionUID = 1L;
    private final String nomeConta;

    public ClienteListenerImpl(String nomeConta) throws RemoteException {
        super();
        this.nomeConta = nomeConta;
    }

    @Override
    public void onTransacao(Transacao transacao) throws RemoteException {
        System.out.println();
        System.out.println("  ╔══════════════════════════════════════════════╗");
        System.out.printf ("  ║  NOTIFICAÇÃO — Conta: %-22s║%n", nomeConta);
        System.out.printf ("  ║  %s  ║%n", transacao.toString());
        System.out.println("  ╚══════════════════════════════════════════════╝");
        System.out.println();
    }
}
