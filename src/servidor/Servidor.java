package servidor;

import comum.BancoService;
import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;

public class Servidor {

    public static void main(String[] args) {
        try {
            BancoServiceImpl banco = new BancoServiceImpl();

            Registry registry = LocateRegistry.createRegistry(1099);
            registry.rebind("BancoService", banco);

            System.out.println("[Servidor] RMI Registry iniciado na porta 1099.");
            System.out.println("[Servidor] BancoService registrado. Aguardando clientes...");

        } catch (Exception e) {
            System.err.println("[Servidor] Erro ao iniciar:");
            e.printStackTrace();
        }
    }
}
