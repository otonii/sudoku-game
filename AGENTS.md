# AGENTS.md

## Leitura inicial

Antes de alterar o projeto, leia:

1. `README.md`
2. `docs/specs.md`
3. `docs/architecture.md`
4. `DESIGN.md` quando alterar UI/CSS
5. `docs/code-styles.md`

## Comandos

Use os scripts do `package.json`:

```bash
npm run dev
npm run lint
npm run build
npm run preview
```

Para mudanças de código, valide com:

```bash
npm run lint
npm run build
```

## Regras de implementação

- Mantenha `App.tsx` no root de `src/`.
- Não mova componentes sem necessidade.
- Preserve a separação:
  - UI em `src/components/`;
  - estado em `src/hooks/`;
  - regras em `src/domain/`;
  - utilitários em `src/utils/`.
- Não coloque regras de geração ou validação dentro dos componentes React.
- Não adicione dependências sem necessidade clara.

## Gameplay

Respeite os estados de célula:

- `VAZIA`
- `X_BRANCO`
- `GATO`
- `X_VERMELHO`

Estados permanentes (`GATO`, `X_VERMELHO`) não devem ser alterados por interações comuns.

## Layout

- Células devem permanecer quadradas.
- Não use bordas variáveis nas células.
- Use `gap` uniforme no grid.
- Mantenha a UI responsiva para mobile e desktop.

## Documentação

Atualize a documentação relevante quando mudar:

- regras do jogo;
- geração de níveis;
- estrutura do projeto;
- comandos;
- layout/design;
- fluxo de input.
