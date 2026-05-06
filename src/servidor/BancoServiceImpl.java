package servidor;

import comum.*;
import java.rmi.RemoteException;
import java.rmi.server.UnicastRemoteObject;
import java.util.*;

/**
 * Implementação da interface remota BancoService.
 * Estende UnicastRemoteObject para ser exportável via RMI.
 * Mantém contas e listeners em memória.
 */
public class BancoServiceImpl extends UnicastRemoteObject implements BancoService {

    private static final long serialVersionUID = 1L;

    // TODO: Map<String, Double> saldos
    // TODO: Map<String, List<Transacao>> extratos
    // TODO: Map<String, List<ClienteListener>> listeners

    public BancoServiceImpl() throws RemoteException {
        super();
        // TODO: inicializar mapas e criar contas de teste
    }

    // TODO: implementar todos os métodos de BancoService
    // TODO: método privado notificarListeners(String conta, Transacao t)
}
