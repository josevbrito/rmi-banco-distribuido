package comum;

import java.io.Serializable;

public class SaldoInsuficienteException extends Exception implements Serializable {

    private static final long serialVersionUID = 1L;

    private final double saldoAtual;
    private final double valorSolicitado;

    public SaldoInsuficienteException(double saldoAtual, double valorSolicitado) {
        super(String.format(
            "Saldo insuficiente. Saldo atual: R$ %.2f | Valor solicitado: R$ %.2f",
            saldoAtual, valorSolicitado));
        this.saldoAtual = saldoAtual;
        this.valorSolicitado = valorSolicitado;
    }

    public double getSaldoAtual()       { return saldoAtual; }
    public double getValorSolicitado()  { return valorSolicitado; }
}
