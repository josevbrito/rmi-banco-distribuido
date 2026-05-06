package cliente;

import comum.*;
import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;
import java.util.List;

/**
 * Cliente RMI interativo.
 * Conecta ao Registry, obtém o stub de BancoService e executa operações.
 * Demonstra todos os conceitos: stub, serialização, callback e RemoteException.
 */
public class Cliente {

    public static void main(String[] args) {
        // TODO: conectar ao Registry em localhost:1099
        // TODO: fazer lookup de "BancoService"
        // TODO: registrar ClienteListenerImpl para notificações
        // TODO: executar sequência de operações:
        //       - depositar
        //       - consultar saldo
        //       - sacar (com sucesso)
        //       - sacar (forçar SaldoInsuficienteException)
        //       - imprimir extrato completo
    }
}
