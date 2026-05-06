#!/bin/bash

# ── Banco Distribuído — Java RMI ──────────────────────────────────────────────
# Lança servidor Java (RMI + REST) e frontend React em paralelo.
# Uso: ./run.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${CYAN}[run]${NC} $1"; }
ok()   { echo -e "${GREEN}[ok]${NC}  $1"; }
warn() { echo -e "${YELLOW}[!]${NC}   $1"; }
err()  { echo -e "${RED}[erro]${NC} $1"; }

# ── Cleanup ao sair ───────────────────────────────────────────────────────────
cleanup() {
  echo ""
  warn "Encerrando processos..."
  [ -n "$PID_JAVA" ]  && kill "$PID_JAVA"  2>/dev/null && ok  "Servidor Java encerrado."
  [ -n "$PID_REACT" ] && kill "$PID_REACT" 2>/dev/null && ok  "Frontend React encerrado."
  exit 0
}
trap cleanup SIGINT SIGTERM

# ── 1. Compilar Java ──────────────────────────────────────────────────────────
log "Compilando Java..."
mkdir -p "$ROOT/out"
if javac -d "$ROOT/out" -sourcepath "$ROOT/src" \
    "$ROOT/src/comum/"*.java \
    "$ROOT/src/servidor/"*.java \
    "$ROOT/src/cliente/"*.java 2>&1; then
  ok "Compilação concluída."
else
  err "Falha na compilação. Abortando."
  exit 1
fi

# ── 2. Instalar dependências do frontend (se necessário) ──────────────────────
if [ ! -d "$ROOT/frontend/node_modules" ]; then
  log "Instalando dependências do frontend..."
  cd "$ROOT/frontend" && npm install --silent
  ok "Dependências instaladas."
fi

# ── 3. Subir servidor Java ────────────────────────────────────────────────────
log "Iniciando servidor Java (RMI :1099 + REST :8080)..."
cd "$ROOT"
java -cp out servidor.Servidor &
PID_JAVA=$!
sleep 2

if kill -0 "$PID_JAVA" 2>/dev/null; then
  ok "Servidor Java rodando (PID $PID_JAVA)."
else
  err "Servidor Java falhou ao iniciar."
  exit 1
fi

# ── 4. Subir frontend React ───────────────────────────────────────────────────
log "Iniciando frontend React..."
cd "$ROOT/frontend"
npm run dev --silent &
PID_REACT=$!
sleep 3

if kill -0 "$PID_REACT" 2>/dev/null; then
  ok "Frontend React rodando (PID $PID_REACT)."
else
  err "Frontend React falhou ao iniciar."
  cleanup
fi

# ── 5. Pronto ─────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Banco Distribuído — Java RMI           ║${NC}"
echo -e "${GREEN}║                                          ║${NC}"
echo -e "${GREEN}║   Frontend  →  http://localhost:5173     ║${NC}"
echo -e "${GREEN}║   API REST  →  http://localhost:8080     ║${NC}"
echo -e "${GREEN}║   RMI       →  localhost:1099            ║${NC}"
echo -e "${GREEN}║                                          ║${NC}"
echo -e "${GREEN}║   Ctrl+C para encerrar tudo              ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""

# Aguarda até Ctrl+C
wait
