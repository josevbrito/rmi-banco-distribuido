package comum;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Representa uma transação bancária.
 * Implementa Serializable para trafegar pela rede como cópia (por valor).
 * Demonstra passagem de objeto serializado no RMI.
 */
public class Transacao implements Serializable {

    private static final long serialVersionUID = 1L;

    // TODO: campos: tipo (DEPOSITO/SAQUE), valor, dataHora, saldoApos
    // TODO: construtor
    // TODO: getters
    // TODO: toString para exibição no extrato
}
