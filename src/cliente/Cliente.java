package cliente;

import comum.*;
import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;
import java.util.List;

/**
 * Cliente RMI interativo.
 *
 * Demonstra, em sequência:
 *  1. Conexão ao Registry e lookup do stub          (Registry + Stub)
 *  2. Registro de callback remoto                   (referência remota como parâmetro)
 *  3. Consulta de saldo                             (retorno de primitivo)
 *  4. Depósito com notificação                      (chamada remota + callback)
 *  5. Saque bem-sucedido com notificação            (chamada remota + callback)
 *  6. Saque com saldo insuficiente                  (exceção serializada trafega pela rede)
 *  7. Extrato completo                              (retorno de List<Transacao> serializada)
 */
public class Cliente {

    public static void main(String[] args) {

        System.out.println("==============================================");
        System.out.println("  Banco Distribuído — Java RMI");
        System.out.println("==============================================");

        try {
            // ── 1. Conectar ao Registry e obter o stub ──────────────────────
            System.out.println("\n[1] Conectando ao RMI Registry em localhost:1099...");
            Registry registry = LocateRegistry.getRegistry("localhost", 1099);
            BancoService banco = (BancoService) registry.lookup("BancoService");
            System.out.println("    Stub obtido com sucesso.");

            // ── 2. Registrar callback (referência remota) ───────────────────
            System.out.println("\n[2] Registrando listener de notificações para conta 'joao'...");
            ClienteListenerImpl listener = new ClienteListenerImpl("joao");
            banco.registrarListener("joao", listener);
            System.out.println("    Listener registrado. O servidor chamará de volta neste objeto.");

            // ── 3. Consultar saldo inicial ──────────────────────────────────
            System.out.println("\n[3] Consultando saldo inicial de 'joao'...");
            double saldo = banco.consultarSaldo("joao");
            System.out.printf("    Saldo atual: R$ %.2f%n", saldo);

            // ── 4. Depósito ─────────────────────────────────────────────────
            System.out.println("\n[4] Depositando R$ 250,00 na conta 'joao'...");
            banco.depositar("joao", 250.00);
            System.out.printf("    Saldo após depósito: R$ %.2f%n", banco.consultarSaldo("joao"));

            // ── 5. Saque bem-sucedido ───────────────────────────────────────
            System.out.println("\n[5] Sacando R$ 100,00 da conta 'joao'...");
            banco.sacar("joao", 100.00);
            System.out.printf("    Saldo após saque: R$ %.2f%n", banco.consultarSaldo("joao"));

            // ── 6. Saque com saldo insuficiente ────────────────────────────
            System.out.println("\n[6] Tentando sacar R$ 9.999,00 (deve falhar)...");
            try {
                banco.sacar("joao", 9999.00);
            } catch (SaldoInsuficienteException e) {
                System.out.println("    EXCEÇÃO CAPTURADA (trafegou pela rede serializada):");
                System.out.println("    " + e.getMessage());
            }

            // ── 7. Extrato completo ─────────────────────────────────────────
            System.out.println("\n[7] Buscando extrato completo da conta 'joao'...");
            List<Transacao> extrato = banco.getExtrato("joao");
            System.out.println("    Extrato (cada Transacao chegou como objeto serializado):");
            for (Transacao t : extrato) {
                System.out.println("      " + t);
            }

            System.out.println("\n==============================================");
            System.out.println("  Demonstração concluída com sucesso.");
            System.out.println("==============================================");

        } catch (Exception e) {
            System.err.println("[Cliente] Erro inesperado:");
            e.printStackTrace();
        }
    }
}
