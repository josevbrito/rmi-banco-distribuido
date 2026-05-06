package comum;

import java.rmi.Remote;
import java.rmi.RemoteException;

public interface ClienteListener extends Remote {
    void onTransacao(Transacao transacao) throws RemoteException;
}
