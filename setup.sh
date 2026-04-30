#!/usr/bin/env bash
# setup.sh — Migración Windows → MacBook M1 para iBisneVC
# Sitio estático (HTML + CSS + JS vanilla). Cero frameworks, cero DB.
# Idempotente: lo puedes correr varias veces sin romper nada.

set -u

# ──────────────────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
DIM='\033[2m'
BOLD='\033[1m'
RESET='\033[0m'

ok()    { printf "${GREEN}✔${RESET} %s\n" "$*"; }
info()  { printf "${DIM}→${RESET} %s\n" "$*"; }
warn()  { printf "${YELLOW}⚠${RESET} %s\n" "$*"; }
fail()  { printf "${RED}✖${RESET} %s\n" "$*"; }
head1() { printf "\n${BOLD}§ %s${RESET}\n" "$*"; }

PORT=8787
PID_FILE=".devserver.pid"
PY_VERSION=""
VENV_STATUS="skipped"
VSCODE_STATUS="not found"
SERVER_STATUS="not started"

cd "$(dirname "$0")"

printf "${BOLD}iBisne — setup MacBook M1${RESET}\n"
printf "${DIM}Repo: %s${RESET}\n" "$(pwd)"

# ──────────────────────────────────────────────────────────────────────────────
# 1. Entorno macOS
# ──────────────────────────────────────────────────────────────────────────────
head1 "01 — Entorno"
OS="$(uname -s)"
ARCH="$(uname -m)"
if [ "$OS" = "Darwin" ]; then
  ok "macOS detectado ($ARCH)"
  if [ "$ARCH" = "arm64" ]; then
    ok "Apple Silicon (M1/M2/M3)"
  else
    warn "Arquitectura $ARCH — el script está pensado para M1 pero debería funcionar"
  fi
else
  warn "No estás en macOS ($OS). El script seguirá pero algunos pasos pueden no aplicar."
fi

# ──────────────────────────────────────────────────────────────────────────────
# 2. python3
# ──────────────────────────────────────────────────────────────────────────────
head1 "02 — python3"
if command -v python3 >/dev/null 2>&1; then
  PY_VERSION="$(python3 --version 2>&1)"
  ok "$PY_VERSION"
else
  fail "python3 no encontrado."
  info "Instálalo con:  xcode-select --install   (o)   brew install python"
  exit 1
fi

# ──────────────────────────────────────────────────────────────────────────────
# 3. git (solo verifica)
# ──────────────────────────────────────────────────────────────────────────────
head1 "03 — git"
if command -v git >/dev/null 2>&1; then
  ok "$(git --version)"
  if [ -d ".git" ]; then
    ok "Repo git ya inicializado"
  else
    warn "No hay .git/ — al final te digo cómo conectarlo a un remoto"
  fi
else
  warn "git no encontrado. Instálalo con:  xcode-select --install"
fi

# ──────────────────────────────────────────────────────────────────────────────
# 4. Homebrew (informativo)
# ──────────────────────────────────────────────────────────────────────────────
head1 "04 — Homebrew"
if command -v brew >/dev/null 2>&1; then
  ok "Homebrew disponible ($(brew --version | head -1))"
else
  info "Homebrew no instalado (opcional). Si lo quieres:"
  info '  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
fi

# ──────────────────────────────────────────────────────────────────────────────
# 5. venv para scripts/ (P&L con openpyxl)
# ──────────────────────────────────────────────────────────────────────────────
head1 "05 — venv para scripts/ (openpyxl)"
if [ -d "scripts" ] && ls scripts/*.py >/dev/null 2>&1; then
  if [ ! -d "scripts/.venv" ]; then
    info "Creando venv en scripts/.venv ..."
    if python3 -m venv scripts/.venv 2>/dev/null; then
      # shellcheck disable=SC1091
      if scripts/.venv/bin/pip install --quiet --upgrade pip openpyxl 2>/dev/null; then
        ok "venv listo con openpyxl"
        VENV_STATUS="ok"
      else
        warn "venv creado pero falló pip install openpyxl — los scripts de P&L no correrán hasta arreglarlo"
        VENV_STATUS="partial"
      fi
    else
      warn "No se pudo crear venv (sigue, no bloquea el sitio)"
      VENV_STATUS="failed"
    fi
  else
    ok "venv ya existe en scripts/.venv"
    VENV_STATUS="ok"
  fi
else
  info "No hay scripts/*.py — skip"
fi

# ──────────────────────────────────────────────────────────────────────────────
# 6. VS Code
# ──────────────────────────────────────────────────────────────────────────────
head1 "06 — VS Code"
if command -v code >/dev/null 2>&1; then
  ok "VS Code CLI disponible — abriendo el repo ..."
  code . >/dev/null 2>&1 &
  VSCODE_STATUS="opened"
else
  warn "Comando 'code' no disponible."
  info "Instala VS Code (https://code.visualstudio.com) y luego:"
  info "  Cmd+Shift+P → 'Shell Command: Install code command in PATH'"
  VSCODE_STATUS="not installed"
fi

# ──────────────────────────────────────────────────────────────────────────────
# 7. Dev server
# ──────────────────────────────────────────────────────────────────────────────
head1 "07 — Dev server (puerto $PORT)"

# Si ya hay PID guardado y vivo, no levantar otro
if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE" 2>/dev/null)" 2>/dev/null; then
  ok "Server ya corriendo (PID $(cat "$PID_FILE"))"
  SERVER_STATUS="reused"
else
  # Verificar si el puerto está libre
  if lsof -ti tcp:$PORT >/dev/null 2>&1; then
    EXISTING_PID="$(lsof -ti tcp:$PORT | head -1)"
    warn "El puerto $PORT ya está ocupado por PID $EXISTING_PID — no levanto otro server"
    echo "$EXISTING_PID" > "$PID_FILE"
    SERVER_STATUS="port busy (reused PID $EXISTING_PID)"
  else
    info "Levantando python3 -m http.server $PORT en background ..."
    nohup python3 -m http.server "$PORT" >/dev/null 2>&1 &
    SERVER_PID=$!
    echo "$SERVER_PID" > "$PID_FILE"
    sleep 1
    if kill -0 "$SERVER_PID" 2>/dev/null; then
      ok "Server arriba (PID $SERVER_PID)"
      SERVER_STATUS="running (PID $SERVER_PID)"
      if command -v curl >/dev/null 2>&1; then
        if curl -sSf -o /dev/null "http://localhost:$PORT/"; then
          ok "Healthcheck 200 en http://localhost:$PORT/"
        else
          warn "Server arriba pero curl no obtuvo 200 — revisa manualmente"
        fi
      fi
    else
      fail "El server no arrancó"
      SERVER_STATUS="failed"
    fi
  fi
fi

# ──────────────────────────────────────────────────────────────────────────────
# Resumen
# ──────────────────────────────────────────────────────────────────────────────
head1 "Resumen"
printf "  Python ............ %s\n" "$PY_VERSION"
printf "  venv scripts/ ..... %s\n" "$VENV_STATUS"
printf "  VS Code ........... %s\n" "$VSCODE_STATUS"
printf "  Dev server ........ %s\n" "$SERVER_STATUS"
printf "\n${BOLD}URLs${RESET}\n"
printf "  Home (redirect) ... ${GREEN}http://localhost:%s/${RESET}\n" "$PORT"
printf "  UI Kit VAULT v2 ... ${GREEN}http://localhost:%s/design-system-v2/UI%%20Kit.html${RESET}\n" "$PORT"

printf "\n${BOLD}Para detener el server${RESET}\n"
printf "  kill \$(cat %s)\n" "$PID_FILE"

printf "\n${BOLD}Lectura obligatoria antes de tocar UI${RESET}\n"
printf "  CLAUDE.md\n"
printf "  design-system-v2/HANDOFF.md\n"
printf "  design-system-v2/README.md\n"
printf "  PROGRESS.md\n"

if [ ! -d ".git" ]; then
  printf "\n${YELLOW}Git${RESET}\n"
  printf "  No hay repo git. Para conectarlo a GitHub:\n"
  printf "    git init && git add . && git commit -m 'initial'\n"
  printf "    git branch -M main\n"
  printf "    git remote add origin git@github.com:<user>/<repo>.git\n"
  printf "    git push -u origin main\n"
elif ! git remote -v 2>/dev/null | grep -q .; then
  printf "\n${YELLOW}Git${RESET}\n"
  printf "  Repo local sin remoto. Conéctalo:\n"
  printf "    git remote add origin git@github.com:<user>/<repo>.git\n"
  printf "    git push -u origin main\n"
fi

printf "\n${GREEN}${BOLD}Setup completo.${RESET} Abre el navegador en http://localhost:%s/\n\n" "$PORT"
