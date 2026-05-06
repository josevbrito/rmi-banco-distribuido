package servidor;

import com.sun.net.httpserver.*;
import comum.Transacao;
import comum.SaldoInsuficienteException;

import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.*;

/**
 * Servidor HTTP leve que expõe o BancoService via REST + SSE.
 * Usa apenas com.sun.net.httpserver — zero dependências externas.
 *
 * Endpoints:
 *   GET  /contas            — lista todas as contas com saldo atual
 *   POST /depositar         — body: {"conta":"joao","valor":100}
 *   POST /sacar             — body: {"conta":"joao","valor":100}
 *   GET  /extrato?conta=joao — lista de transações da conta
 *   GET  /eventos           — SSE stream de notificações em tempo real
 */
public class ApiRest {

    private final BancoServiceImpl banco;
    private final List<PrintWriter> sseClients = new CopyOnWriteArrayList<>();
    private com.sun.net.httpserver.HttpServer httpServer;

    public ApiRest(BancoServiceImpl banco) {
        this.banco = banco;
    }

    public void start(int porta) throws IOException {
        httpServer = com.sun.net.httpserver.HttpServer.create(
                new InetSocketAddress(porta), 0);

        httpServer.createContext("/contas",    this::handleContas);
        httpServer.createContext("/depositar", this::handleDepositar);
        httpServer.createContext("/sacar",     this::handleSacar);
        httpServer.createContext("/extrato",   this::handleExtrato);
        httpServer.createContext("/eventos",   this::handleEventos);

        httpServer.setExecutor(Executors.newCachedThreadPool());
        httpServer.start();
        System.out.printf("[API] HTTP server iniciado na porta %d%n", porta);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    /** Adiciona headers CORS e Content-Type a toda resposta */
    private void corsHeaders(HttpExchange ex, String contentType) {
        Headers h = ex.getResponseHeaders();
        h.add("Access-Control-Allow-Origin", "*");
        h.add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        h.add("Access-Control-Allow-Headers", "Content-Type");
        h.add("Content-Type", contentType);
    }

    /** Lê o body da requisição como String */
    private String lerBody(HttpExchange ex) throws IOException {
        return new String(ex.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
    }

    /** Envia resposta JSON simples */
    private void responder(HttpExchange ex, int status, String json) throws IOException {
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        ex.sendResponseHeaders(status, bytes.length);
        try (OutputStream os = ex.getResponseBody()) {
            os.write(bytes);
        }
    }

    /** Extrai valor de um JSON simples do tipo {"chave":"valor"} ou {"chave":123} */
    private String extrairJson(String json, String chave) {
        // Parser mínimo — sem biblioteca externa
        String busca = "\"" + chave + "\"";
        int idx = json.indexOf(busca);
        if (idx == -1) return null;
        int colon = json.indexOf(":", idx);
        int start = colon + 1;
        while (start < json.length() && (json.charAt(start) == ' ' || json.charAt(start) == '"')) start++;
        int end = start;
        while (end < json.length() && json.charAt(end) != '"' && json.charAt(end) != ',' && json.charAt(end) != '}') end++;
        return json.substring(start, end).trim();
    }

    /** Notifica todos os clientes SSE conectados */
    public void broadcast(String evento, String dados) {
        String mensagem = "event: " + evento + "\ndata: " + dados + "\n\n";
        List<PrintWriter> mortos = new ArrayList<>();
        for (PrintWriter pw : sseClients) {
            try {
                pw.print(mensagem);
                pw.flush();
                if (pw.checkError()) mortos.add(pw);
            } catch (Exception e) {
                mortos.add(pw);
            }
        }
        sseClients.removeAll(mortos);
    }

    // ── Handlers ─────────────────────────────────────────────────────────────

    /** GET /contas — retorna JSON com saldo de todas as contas */
    private void handleContas(HttpExchange ex) throws IOException {
        if (ex.getRequestMethod().equals("OPTIONS")) {
            corsHeaders(ex, "application/json");
            ex.sendResponseHeaders(204, -1);
            return;
        }
        corsHeaders(ex, "application/json");
        try {
            Map<String, Double> saldos = banco.getSaldos();
            StringBuilder sb = new StringBuilder("[");
            boolean first = true;
            for (Map.Entry<String, Double> e : saldos.entrySet()) {
                if (!first) sb.append(",");
                sb.append(String.format("{\"conta\":\"%s\",\"saldo\":%.2f}",
                        e.getKey(), e.getValue()));
                first = false;
            }
            sb.append("]");
            responder(ex, 200, sb.toString());
        } catch (Exception e) {
            responder(ex, 500, "{\"erro\":\"" + e.getMessage() + "\"}");
        }
    }

    /** POST /depositar — body: {"conta":"joao","valor":100} */
    private void handleDepositar(HttpExchange ex) throws IOException {
        if (ex.getRequestMethod().equals("OPTIONS")) {
            corsHeaders(ex, "application/json");
            ex.sendResponseHeaders(204, -1);
            return;
        }
        corsHeaders(ex, "application/json");
        try {
            String body = lerBody(ex);
            String conta = extrairJson(body, "conta");
            double valor = Double.parseDouble(extrairJson(body, "valor"));
            banco.depositar(conta, valor);
            double novoSaldo = banco.consultarSaldo(conta);
            responder(ex, 200, String.format(
                    "{\"ok\":true,\"conta\":\"%s\",\"saldo\":%.2f}", conta, novoSaldo));
        } catch (Exception e) {
            responder(ex, 400, "{\"ok\":false,\"erro\":\"" + e.getMessage() + "\"}");
        }
    }

    /** POST /sacar — body: {"conta":"joao","valor":100} */
    private void handleSacar(HttpExchange ex) throws IOException {
        if (ex.getRequestMethod().equals("OPTIONS")) {
            corsHeaders(ex, "application/json");
            ex.sendResponseHeaders(204, -1);
            return;
        }
        corsHeaders(ex, "application/json");
        try {
            String body = lerBody(ex);
            String conta = extrairJson(body, "conta");
            double valor = Double.parseDouble(extrairJson(body, "valor"));
            banco.sacar(conta, valor);
            double novoSaldo = banco.consultarSaldo(conta);
            responder(ex, 200, String.format(
                    "{\"ok\":true,\"conta\":\"%s\",\"saldo\":%.2f}", conta, novoSaldo));
        } catch (SaldoInsuficienteException e) {
            responder(ex, 422, String.format(
                    "{\"ok\":false,\"erro\":\"%s\",\"saldoAtual\":%.2f,\"valorSolicitado\":%.2f}",
                    e.getMessage(), e.getSaldoAtual(), e.getValorSolicitado()));
        } catch (Exception e) {
            responder(ex, 400, "{\"ok\":false,\"erro\":\"" + e.getMessage() + "\"}");
        }
    }

    /** GET /extrato?conta=joao */
    private void handleExtrato(HttpExchange ex) throws IOException {
        if (ex.getRequestMethod().equals("OPTIONS")) {
            corsHeaders(ex, "application/json");
            ex.sendResponseHeaders(204, -1);
            return;
        }
        corsHeaders(ex, "application/json");
        try {
            String query = ex.getRequestURI().getQuery(); // "conta=joao"
            String conta = query != null && query.startsWith("conta=")
                    ? query.substring(6) : null;
            if (conta == null) {
                responder(ex, 400, "{\"erro\":\"parametro conta obrigatorio\"}");
                return;
            }
            List<Transacao> extrato = banco.getExtrato(conta);
            StringBuilder sb = new StringBuilder("[");
            boolean first = true;
            for (Transacao t : extrato) {
                if (!first) sb.append(",");
                sb.append(String.format(
                        "{\"tipo\":\"%s\",\"valor\":%.2f,\"saldo\":%.2f,\"dataHora\":\"%s\"}",
                        t.getTipo(), t.getValor(), t.getSaldoApos(), t.getDataHora()));
                first = false;
            }
            sb.append("]");
            responder(ex, 200, sb.toString());
        } catch (Exception e) {
            responder(ex, 500, "{\"erro\":\"" + e.getMessage() + "\"}");
        }
    }

    /**
     * GET /eventos — SSE stream.
     * Mantém a conexão aberta e envia eventos conforme o banco os produz.
     * O broadcast() é chamado pelo BancoServiceImpl a cada operação.
     */
    private void handleEventos(HttpExchange ex) throws IOException {
        corsHeaders(ex, "text/event-stream; charset=utf-8");
        ex.getResponseHeaders().add("Cache-Control", "no-cache");
        ex.getResponseHeaders().add("X-Accel-Buffering", "no");
        ex.sendResponseHeaders(200, 0);

        PrintWriter pw = new PrintWriter(
                new OutputStreamWriter(ex.getResponseBody(), StandardCharsets.UTF_8));
        sseClients.add(pw);
        System.out.println("[API] Cliente SSE conectado. Total: " + sseClients.size());

        // Mantém a thread viva enquanto o cliente estiver conectado
        try {
            while (!pw.checkError()) {
                pw.print(": keep-alive\n\n");
                pw.flush();
                Thread.sleep(15000);
            }
        } catch (InterruptedException ignored) {
        } finally {
            sseClients.remove(pw);
            System.out.println("[API] Cliente SSE desconectado. Total: " + sseClients.size());
        }
    }
}
