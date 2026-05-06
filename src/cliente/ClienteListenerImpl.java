package cliente;

import comum.ClienteListener;
import comum.Transacao;
import java.rmi.RemoteException;
import java.rmi.server.UnicastRemoteObject;

/**
 * Implementação local do callback ClienteListener.
 * Estende UnicastRemoteObject para ser exportável como referência remota.
 * O servidor chamará onTransacao() neste objeto de volta ao cliente.
 */
public class ClienteListenerImpl extends UnicastRemoteObject implements ClienteListener {

    private static final long serialVersionUID = 1L;
    private final String nomeConta;

    public ClienteListenerImpl(String nomeConta) throws RemoteException {
        super();
        this.nomeConta = nomeConta;
    }

    // TODO: implementar onTransacao exibindo a notificação recebida
    @Override
    public void onTransacao(Transacao transacao) throws RemoteException {
        // TODO: exibir notificação recebida
    }
}
