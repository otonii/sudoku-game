# Neko Battle

Neko Battle é um puzzle lógico web inspirado em Star Battle. O jogador encontra gatos ocultos em um grid colorido, respeitando as regras de linha, coluna, região e adjacência.

O projeto é uma aplicação frontend feita com Vite, React e TypeScript. Os níveis hard são gerados dinamicamente no navegador.

## Stack

- Vite
- React
- TypeScript
- CSS puro por componente
- Oxlint

## Requisitos

- Node.js compatível com Vite 8
- npm

## Setup local

```bash
npm install
npm run dev
```

O app roda pelo servidor de desenvolvimento do Vite.

## Comandos

```bash
npm run dev      # inicia o ambiente local
npm run build    # valida TypeScript e gera build de produção
npm run lint     # roda oxlint
npm run preview  # serve o build localmente
```

## Estrutura

```text
src/
├── App.tsx
├── App.css
├── components/          # componentes visuais do jogo
├── data/                # níveis estáticos legados / exemplos
├── domain/              # regras, tipos, validações e gerador
├── hooks/               # estado do jogo e input
├── utils/               # utilitários reutilizáveis
├── index.css
└── main.tsx
```

## Gameplay atual

- Grid hard `10x10` gerado dinamicamente.
- Exatamente 1 gato por linha.
- Exatamente 1 gato por coluna.
- Exatamente 1 gato por região.
- Gatos não podem se tocar nas 8 direções.
- Clique simples alterna nota `X_BRANCO`.
- Clique duplo valida gato ou erro.
- Clicar e arrastar marca `X_BRANCO` nas células atravessadas.
- Gatos e erros permanentes ignoram novas interações.
- O jogador tem 3 vidas.

## Documentação

- [Especificação do jogo](./docs/specs.md)
- [Plano de implementação](./docs/implementation-plan.md)
- [Arquitetura](./docs/architecture.md)
- [Design visual](./DESIGN.md)
- [Estilo de código](./docs/code-styles.md)
- [Contribuição](./CONTRIBUTING.md)
- [Instruções para agentes](./AGENTS.md)

## Estado atual

O projeto é frontend-only. Não há backend, persistência, autenticação, analytics, anúncios reais ou testes automatizados configurados no momento.
