# Contribuição

## Setup

```bash
npm install
npm run dev
```

## Validação

Antes de entregar mudanças de código, rode:

```bash
npm run lint
npm run build
```

Para mudanças apenas em documentação, não há comando de formatação específico configurado.

## Organização das mudanças

- Mantenha mudanças pequenas e focadas.
- Atualize documentação quando alterar comportamento, arquitetura ou comandos.
- Não misture refatorações grandes com mudanças de gameplay.
- Preserve a separação entre UI, hooks e domínio.

## Convenção de commits

Use mensagens em inglês no formato:

```text
type(scope): summary
```

Tipos permitidos:

- `feat`: nova funcionalidade
- `fix`: correção de bug
- `refactor`: mudança interna sem alterar comportamento esperado
- `docs`: documentação
- `test`: testes
- `chore`: manutenção/tooling

Regras:

- Use resumo curto e específico.
- Use modo imperativo.
- Não termine com ponto.
- Use `scope` quando a mudança for localizada.
- Prefira letras minúsculas no tipo e escopo.

Exemplos:

```text
feat(generator): add hard level generation
fix(board): keep cells square
docs(readme): add project setup
```
