# Imagen del worker del agente de código de JOLUP para Easypanel (Docker Swarm).
# Dos etapas: la primera compila TypeScript con las dependencias de desarrollo;
# la segunda lleva git, Claude Code y solo las dependencias de producción.
# No expone puertos: el worker solo hace llamadas salientes.

FROM node:24-slim AS build
# La misma versión de pnpm que en local, para que el lockfile se lea igual.
RUN npm install -g pnpm@11.13.0
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Los scripts de postinstall (esbuild) se omiten: no hacen falta para compilar.
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN pnpm exec tsc -p tsconfig.build.json
RUN pnpm prune --prod --ignore-scripts

FROM node:24-slim
ARG CLAUDE_CODE_VERSION=latest
RUN apt-get update \
  && apt-get install -y --no-install-recommends git ca-certificates tini \
  && rm -rf /var/lib/apt/lists/*
# corepack deja disponibles pnpm y yarn para los repos que clone el agente.
RUN corepack enable
RUN npm install -g @anthropic-ai/claude-code@${CLAUDE_CODE_VERSION} \
  && npm cache clean --force
ENV NODE_ENV=production
ENV WORK_DIR=/tmp/code-agent-runs
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
RUN mkdir -p "$WORK_DIR" /home/node/.claude && chown node:node "$WORK_DIR" /home/node/.claude
# Convenciones de JP Development para todos los repos: Claude Code lee
# ~/.claude/CLAUDE.md en cada sesión, además del CLAUDE.md del propio repo.
COPY --chown=node:node agent-config/CLAUDE.md /home/node/.claude/CLAUDE.md
# Claude Code se niega a usar --dangerously-skip-permissions como root.
USER node
# tini como PID 1: recoge los procesos huérfanos que dejen los tests o servidores
# que lance Claude, y reenvía SIGTERM a Node para que se apague limpio.
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "dist/main.js"]
