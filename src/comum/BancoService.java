package comum;

import java.rmi.Remote;
import java.rmi.RemoteException;
import java.util.List;

public interface BancoService extends Remote {

    void depositar(String conta, double valor)
            throws RemoteException;

    void sacar(String conta, double valor)
            throws RemoteException, SaldoInsuficienteException;

    double consultarSaldo(String conta)
            throws RemoteException;

    List<Transacao> getExtrato(String conta)
            throws RemoteException;

    void registrarListener(String conta, ClienteListener listener)
            throws RemoteException;
}
