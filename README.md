# 🚀 Sales System - Setup

## Pré-requisitos
- [Bun](https://bun.sh) >= 1.0
- [Docker](https://docker.com) >= 20.10
- [Docker Compose](https://docs.docker.com/compose/) >= 2.0

## 🏃 Quick Start

### Opção 1: Com Make (recomendado)
```bash
# Setup completo automático
make setup

# Outros comandos úteis
make up      # Sobe containers
make down    # Para containers
make logs    # Ver logs
make studio  # Abre Drizzle Studio
make clean   # Limpa tudo
make reset   # Reset completo
```

### Opção 2: Com npm scripts
```bash
# Setup completo
bun run setup

# Ou passo a passo:
cp .env.example .env
bun install
bun run docker:up
bun run db:generate
bun run db:migrate

# Rodar aplicação
bun run dev
```

## 📦 Serviços

| Serviço    | Porta | URL                    |
|------------|-------|------------------------|
| API        | 3000  | http://localhost:3000  |
| Postgres   | 5432  | localhost:5432         |
| Redis      | 6379  | localhost:6379         |
| Drizzle Studio | 4983 | https://local.drizzle.studio |

## 🛠️ Comandos úteis

```bash
# Desenvolvimento
bun run dev                 # Inicia em modo watch

# Database
bun run db:generate        # Gera migrations
bun run db:migrate         # Aplica migrations
bun run db:studio          # Abre Drizzle Studio
bun run db:push            # Push schema (dev only)

# Docker
bun run docker:up          # Sobe containers
bun run docker:down        # Para containers
bun run docker:logs        # Ver logs
bun run docker:clean       # Remove tudo
```

## 🔐 Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=sales_system

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis123

# Server
PORT=3000
NODE_ENV=development

# OpenAI (para docs)
OPENAI_API_KEY=your_key_here
```

## 🏗️ Estrutura do Projeto

```
src/
├── domain/              # Camada de domínio (entidades, VOs, interfaces)
├── application/         # Casos de uso
├── infrastructure/      # Banco, APIs externas, configs
│   ├── database/
│   │   ├── drizzle/
│   │   │   ├── schema/  # Schemas separados por entidade
│   │   │   └── migrations/
│   │   └── repositories/
│   └── config/
├── presentation/        # Controllers, rotas, middlewares
└── main.ts             # Entry point
```

## 🎯 Próximos passos

1. Configure suas variáveis de ambiente
2. Rode `make setup` ou `bun run setup`
3. Acesse http://localhost:3000
4. Comece a codar! 🚀
