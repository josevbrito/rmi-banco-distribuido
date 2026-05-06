package comum;

import java.io.Serializable;

/**
 * Exceção de domínio lançada quando o saldo é insuficiente para saque.
 * Implementa Serializable pois trafega pela rede via RMI.
 */
public class SaldoInsuficienteException extends Exception implements Serializable {

    private static final long serialVersionUID = 1L;

    // TODO: construtor com mensagem
    // TODO: construtor com saldoAtual e valorSolicitado
}
