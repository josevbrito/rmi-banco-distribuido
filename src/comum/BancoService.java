package comum;

import java.rmi.Remote;
import java.rmi.RemoteException;
import java.util.List;

/**
 * Interface remota principal do banco.
 * Estende Remote para ser utilizável via RMI.
 * Todo método declara throws RemoteException.
 */
public interface BancoService extends Remote {

    // TODO: void depositar(String conta, double valor)
    // TODO: void sacar(String conta, double valor) throws SaldoInsuficienteException
    // TODO: double consultarSaldo(String conta)
    // TODO: List<Transacao> getExtrato(String conta)
    // TODO: void registrarListener(String conta, ClienteListener listener)
}
