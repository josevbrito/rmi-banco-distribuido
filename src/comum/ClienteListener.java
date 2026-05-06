package comum;

import java.rmi.Remote;
import java.rmi.RemoteException;

/**
 * Interface de callback — referência remota de volta ao cliente.
 * Permite que o servidor notifique o cliente sobre transações.
 * Demonstra passagem de objeto remoto como parâmetro (por referência remota).
 */
public interface ClienteListener extends Remote {

    // TODO: void onTransacao(Transacao t)
}
