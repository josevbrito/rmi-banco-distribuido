package comum;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class Transacao implements Serializable {

    private static final long serialVersionUID = 1L;

    public enum Tipo { DEPOSITO, SAQUE }

    private final Tipo tipo;
    private final double valor;
    private final LocalDateTime dataHora;
    private final double saldoApos;

    public Transacao(Tipo tipo, double valor, double saldoApos) {
        this.tipo = tipo;
        this.valor = valor;
        this.saldoApos = saldoApos;
        this.dataHora = LocalDateTime.now();
    }

    public Tipo getTipo()               { return tipo; }
    public double getValor()            { return valor; }
    public LocalDateTime getDataHora()  { return dataHora; }
    public double getSaldoApos()        { return saldoApos; }

    @Override
    public String toString() {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
        return String.format("[%s] %-8s R$ %8.2f  | Saldo: R$ %.2f",
                dataHora.format(fmt), tipo, valor, saldoApos);
    }
}
