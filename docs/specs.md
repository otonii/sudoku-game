# Neko Battle — Especificação de Requisitos do Jogo

## 1. Visão geral

Neko Battle é um puzzle lógico em matriz quadrada inspirado em Star Battle. O tabuleiro é dividido em regiões coloridas irregulares. O objetivo do jogador é descobrir a posição oculta de exatamente 1 gato por linha, por coluna e por região, sem permitir adjacência entre gatos.

A interface e as regras visuais devem seguir a imagem de referência abaixo.

![Referência visual do tabuleiro Neko Battle](../images/IMG-20260630-WA0001.jpg)

## 2. Objetivo do jogador

O jogador vence o nível quando posiciona corretamente todos os gatos exigidos pelo tabuleiro.

Para um tabuleiro `N x N`, devem existir exatamente `N` gatos corretos:

- 1 gato em cada linha.
- 1 gato em cada coluna.
- 1 gato em cada região colorida.
- Nenhum gato adjacente a outro, incluindo diagonais.

## 3. Regras do jogo

### 3.1 Regra de região

Cada região contígua colorida deve conter exatamente 1 gato.

### 3.2 Regra de linha e coluna

Cada linha horizontal e cada coluna vertical deve conter exatamente 1 gato.

### 3.3 Regra de proximidade

Um gato não pode tocar outro gato em nenhuma das 8 direções ao redor da célula:

- Cima.
- Baixo.
- Esquerda.
- Direita.
- Diagonais.

As células adjacentes a um gato são consideradas logicamente bloqueadas para a solução.

## 4. Estados da célula

Cada célula do tabuleiro possui um estado visual e lógico.

| Estado | Tipo | Descrição | Interação futura |
| --- | --- | --- | --- |
| `VAZIA` | Temporário | Estado inicial. Exibe apenas a cor da região. | Permitida |
| `X_BRANCO` | Temporário | Marcação de rascunho/nota. Exibe um `X` branco translúcido. | Permitida |
| `GATO` | Permanente | Acerto. Exibe o ícone de gato. | Bloqueada |
| `X_VERMELHO` | Permanente | Erro. Exibe um `X` vermelho opaco. | Bloqueada |

## 5. Sistema de input

O input principal diferencia clique simples de clique duplo rápido na mesma célula.

- Clique simples: alterna marcação auxiliar `VAZIA` ⇄ `X_BRANCO`.
- Clique duplo rápido: valida a célula contra a solução do nível.
- O atraso para detectar clique duplo deve ser aproximadamente entre `250ms` e `300ms`.
- Estados permanentes devem ignorar qualquer novo input.

### 5.1 Transições de estado

| Estado atual | Clique simples | Clique duplo rápido |
| --- | --- | --- |
| `VAZIA` | Altera para `X_BRANCO` | Se correto, altera para `GATO`; se incorreto, altera para `X_VERMELHO` |
| `X_BRANCO` | Altera para `VAZIA` | Se correto, altera para `GATO`; se incorreto, altera para `X_VERMELHO` |
| `GATO` | Ignorado | Ignorado |
| `X_VERMELHO` | Ignorado | Ignorado |

### 5.2 Fluxo lógico

```text
VAZIA
├─ clique simples ───────> X_BRANCO
└─ clique duplo correto ─> GATO
└─ clique duplo errado ──> X_VERMELHO

X_BRANCO
├─ clique simples ───────> VAZIA
└─ clique duplo correto ─> GATO
└─ clique duplo errado ──> X_VERMELHO
```

### 5.3 Antirrepetição visual

O primeiro clique de um clique duplo não deve renderizar um `X_BRANCO` momentâneo antes da validação.

Implementação esperada:

1. Ao receber um clique, iniciar um temporizador curto.
2. Se um segundo clique na mesma célula ocorrer dentro do intervalo, cancelar o clique simples.
3. Executar apenas a validação de clique duplo.
4. Se o intervalo expirar sem segundo clique, aplicar a transição de clique simples.

## 6. Interface do usuário

### 6.1 Header

A barra superior deve conter:

- Botão de sair/voltar para o menu de seleção de níveis.
- Indicador central com o texto `Nível [X]`.
- Indicador de pontuação com o texto `Pontuação [Y]`.
- Botão de configurações.

O menu de configurações deve abrir em overlay e conter, no mínimo:

- Som.
- Vibração.
- Reiniciar nível.

### 6.2 Barra de status

A barra de status deve conter:

- Contador de gatos descobertos no formato `🐱 atual/total`.
- Indicador de vidas com 3 peixes dourados: `🐟 🐟 🐟`.

Regras das vidas:

- Cada transição para `X_VERMELHO` consome 1 peixe.
- Ao chegar a `0` vidas, o jogo entra em estado de derrota.
- Após a derrota, o tabuleiro deve bloquear novas interações.

### 6.3 Tabuleiro

O tabuleiro deve ser uma matriz quadrada centralizada.

Requisitos visuais:

- Cada célula usa a cor da sua região.
- Regiões devem usar cores pastel e suaves.
- Linhas internas da grade devem ser sutis.
- Bordas externas entre regiões diferentes devem ser ligeiramente mais grossas ou mais escuras.
- O `X_BRANCO` deve ser translúcido e legível.
- O `X_VERMELHO` deve ser opaco e claramente associado a erro.
- O ícone de gato deve ter bom contraste sobre todas as cores de região.

### 6.4 Footer / ferramentas

A barra inferior deve conter ações de ajuda.

#### Revelar gato

Revela uma célula correta aleatória ainda não resolvida.

Critérios:

- Só pode escolher células da solução.
- Só pode escolher células com estado `VAZIA` ou `X_BRANCO`.
- Deve aplicar o estado permanente `GATO`.
- Deve atualizar o contador de gatos.
- Pode consumir uma ação de auxílio ou exigir anúncio, dependendo da monetização definida.

#### Limpar erro / ajuda extra

Permite recuperar uma vida ou limpar um erro cometido.

Critérios mínimos:

- Não deve remover gatos corretos.
- Não deve permitir vidas acima do máximo configurado.
- Se usado após game over, deve desbloquear o tabuleiro apenas se o jogador voltar a ter ao menos 1 vida.

## 7. Estados globais da partida

| Estado | Descrição | Interações permitidas |
| --- | --- | --- |
| `PLAYING` | Partida ativa. | Tabuleiro e ferramentas habilitados |
| `WON` | Todos os gatos foram encontrados. | Tabuleiro bloqueado; modal de vitória |
| `GAME_OVER` | Vidas chegaram a 0. | Tabuleiro bloqueado; modal de derrota |
| `PAUSED` | Overlay de configurações aberto. | Tabuleiro bloqueado ou suspenso |

## 8. Condições de vitória e derrota

### 8.1 Vitória

A vitória deve ser verificada sempre que uma célula muda para `GATO`.

Condição:

```text
currentCatsFound == totalCatsRequired
```

Ao vencer:

- Alterar estado global para `WON`.
- Bloquear interações do tabuleiro.
- Exibir tela/modal de vitória.
- Atualizar progresso do nível, quando houver persistência.

### 8.2 Derrota

A derrota deve ser verificada sempre que uma célula muda para `X_VERMELHO`.

Condição:

```text
lives == 0
```

Ao perder:

- Alterar estado global para `GAME_OVER`.
- Bloquear interações do tabuleiro.
- Exibir modal de fim de jogo.
- Oferecer opções de reiniciar ou continuar via anúncio, se disponível.

## 9. Estrutura de dados do nível

Cada nível deve ser descrito em JSON.

### 9.1 Modelo

```json
{
  "level_id": 83,
  "grid_size": 10,
  "total_cats_required": 10,
  "regions": [
    {
      "region_id": 0,
      "color": "#A2D2FF",
      "cells": [[0, 0], [0, 1], [0, 2], [1, 1]]
    },
    {
      "region_id": 1,
      "color": "#BDE0FE",
      "cells": [[0, 3], [0, 4], [0, 5], [0, 6]]
    }
  ],
  "solution": [[0, 5], [1, 1], [2, 8]]
}
```

### 9.2 Campos

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `level_id` | number/string | Sim | Identificador único do nível |
| `grid_size` | number | Sim | Tamanho da matriz `N x N` |
| `total_cats_required` | number | Sim | Total de gatos necessários para vencer |
| `regions` | array | Sim | Lista de regiões coloridas |
| `regions[].region_id` | number/string | Sim | Identificador único da região |
| `regions[].color` | string | Sim | Cor hexadecimal da região |
| `regions[].cells` | array | Sim | Coordenadas pertencentes à região |
| `solution` | array | Sim | Coordenadas corretas dos gatos |

### 9.3 Convenção de coordenadas

As coordenadas devem usar o formato:

```text
[row, column]
```

Com índices iniciando em `0`.

Exemplo:

```text
[0, 5] = linha 0, coluna 5
```

### 9.4 Validações do nível

Antes de carregar um nível, o jogo deve validar:

- `grid_size > 0`.
- `total_cats_required == grid_size`.
- Todas as células do grid pertencem a exatamente uma região.
- Nenhuma célula existe em mais de uma região.
- Todas as coordenadas estão dentro dos limites do grid.
- `solution.length == total_cats_required`.
- Cada coordenada da solução pertence ao grid.
- A solução possui exatamente 1 gato por linha.
- A solução possui exatamente 1 gato por coluna.
- A solução possui exatamente 1 gato por região.
- Nenhuma coordenada da solução é adjacente a outra.
- Cada região respeita o tamanho mínimo de `3` células.
- Cada região respeita o tamanho máximo de `2N - 2` células.
- Nenhuma região ocupa mais de `60%` de uma mesma linha ou coluna.
- Nenhuma região forma um retângulo perfeito estritamente vertical ou horizontal.

## 10. Complexidade das regiões

A composição das regiões coloridas deve evitar pistas óbvias, mapas impossíveis ou formatos visualmente pobres. Essas regras se aplicam tanto a níveis criados manualmente quanto a níveis gerados por algoritmo.

### 10.1 Distribuição de tamanho

Em um grid `N x N`, o tamanho médio teórico de cada região é `N` células.

Exemplo:

```text
Grid 10 x 10 = 100 células
10 regiões esperadas
Tamanho médio ideal = 10 células por região
```

Limites obrigatórios:

| Regra | Fórmula | Exemplo em `10 x 10` | Motivo |
| --- | --- | --- | --- |
| Tamanho mínimo | `3` células | `3` células | Evita dedução imediata e regiões triviais |
| Tamanho máximo | `2N - 2` células | `18` células | Evita que uma região domine o mapa |

### 10.2 Regras contra linearidade

As regiões devem ter dispersão suficiente para forçar cruzamento lógico entre linhas, colunas e regiões.

#### Extensão máxima por linha ou coluna

Uma única região não pode ocupar mais do que `60%` de uma mesma linha ou coluna.

Exemplo em grid `10 x 10`:

```text
Limite por linha/coluna = 10 * 0.6 = 6 células
```

Uma região com 10 células pode ocupar, por exemplo:

```text
Linha 1: 4 células
Linha 2: 4 células
Linha 3: 2 células
```

Mas não pode ocupar 7 ou 8 células em uma única linha reta.

#### Bloqueio de formas perfeitas

O gerador e o validador devem rejeitar regiões que sejam retângulos perfeitos orientados estritamente na vertical ou horizontal.

Exemplos proibidos:

- `1 x 6`.
- `6 x 1`.
- `2 x 5` totalmente preenchido.
- `5 x 2` totalmente preenchido.

Formatos desejáveis:

- `L`.
- `T`.
- Escada.
- Blocos sinuosos.
- Regiões compactas irregulares.
- Regiões entrelaçadas.

### 10.3 Dificuldade por composição de cores

A dificuldade real do nível não depende apenas do tamanho do grid. O formato das regiões também deve ser usado para classificar dificuldade.

```text
NÍVEL FÁCIL: regiões pequenas e compactas.
NÍVEL DIFÍCIL: regiões longas, entrelaçadas e sinuosas.
```

#### Níveis fáceis

Fora do escopo do produto atual.

Características esperadas, caso voltem a existir no futuro:

- Regiões compactas.
- Formatos próximos de peças de Tetris.
- Poucas ramificações.
- Menor quantidade de linhas/colunas tocadas por região.
- Mais facilidade para marcar `X_BRANCO` rapidamente.

#### Níveis difíceis

Recomendado para grids `10 x 10`.

Características:

- Regiões sinuosas.
- Regiões que se entrelaçam ou abraçam outras regiões.
- O gerador planeja 6 regiões iniciais de referência para criar mais pontos iniciais de dedução.
- Exatamente 2 regiões micro aparecem no hard, sempre contendo 1 gato; o gerador garante uma com 2 células, e a outra tende a ser maior, com baixa chance de ficar em 1 célula.
- Pelo menos 2 regiões concentradas devem compartilhar linha ou coluna.
- Uma mesma região pode passar por 4 ou 5 linhas/colunas diferentes.
- O jogador precisa cruzar informações de múltiplas regiões antes de usar o clique duplo.

### 10.4 Filtro de qualidade da geração

A geração de regiões coloridas deve ter uma etapa de validação geométrica. Se qualquer regra falhar, o mapa deve ser descartado e gerado novamente.

Exemplo de contrato esperado:

```javascript
function validateRegionGeometry(grid) {
  // 1. Conta quantas células cada region_id possui.
  // 2. Valida tamanho mínimo e máximo por região.
  // 3. Verifica ocupação máxima por linha e coluna.
  // 4. Rejeita retângulos perfeitos ou linhas longas demais.

  for (let row = 0; row < GRID_SIZE; row++) {
    if (countMaxRegionInRow(grid, row) > GRID_SIZE * 0.6) {
      return false;
    }
  }

  for (let column = 0; column < GRID_SIZE; column++) {
    if (countMaxRegionInColumn(grid, column) > GRID_SIZE * 0.6) {
      return false;
    }
  }

  return true;
}
```

A função final deve validar todas as regiões, não apenas a maior ocorrência por linha/coluna.

## 11. Algoritmos principais

### 11.1 Validador de clique duplo

Entrada:

```text
row, column
```

Processo:

1. Ignorar se a célula está em estado permanente.
2. Verificar se `[row, column]` existe em `solution`.
3. Se existir, aplicar `GATO`.
4. Se não existir, aplicar `X_VERMELHO` e remover 1 vida.
5. Verificar vitória ou derrota.

### 11.2 Contagem de gatos encontrados

O contador deve considerar apenas células em estado `GATO`.

```text
currentCatsFound = count(cells where state == GATO)
```

### 11.3 Revelar gato aleatório

Processo:

1. Criar lista de coordenadas em `solution` cujo estado atual seja `VAZIA` ou `X_BRANCO`.
2. Se a lista estiver vazia, não fazer nada.
3. Escolher uma coordenada aleatória.
4. Aplicar `GATO`.
5. Verificar vitória.

### 11.4 Reset do nível

Ao reiniciar:

- Todas as células voltam para `VAZIA`.
- Vidas voltam para o máximo configurado.
- Contador de gatos volta para `0`.
- Estado global volta para `PLAYING`.
- Overlays de vitória/derrota são fechados.

## 12. Feedback visual e sonoro

### 12.1 Acerto

Ao aplicar `GATO`:

- Exibir animação leve de entrada do gato.
- Emitir som curto e suave, como miau ou estalo limpo, se som estiver habilitado.
- Opcionalmente exibir partículas leves.
- Atualizar contador imediatamente.

### 12.2 Erro

Ao aplicar `X_VERMELHO`:

- Exibir shake leve na célula ou no tabuleiro.
- Remover um peixe com fade-out.
- Emitir feedback sonoro/visual de erro, se habilitado.
- Acionar vibração curta, se habilitada e suportada.

## 13. Requisitos de UX

- A ação comum deve exigir o mínimo de fricção.
- O estado da célula deve ser legível sem depender apenas de cor.
- O jogador deve entender rapidamente quantos gatos faltam e quantas vidas restam.
- Erros permanentes devem ser visualmente distintos de notas temporárias.
- A UI deve funcionar bem em telas pequenas, mantendo o tabuleiro centralizado.
- Áreas clicáveis devem ser confortáveis para toque em mobile.

## 14. Critérios de aceite

### Gameplay

- Dado um nível válido, o tabuleiro renderiza todas as regiões corretamente.
- Clique simples em célula `VAZIA` muda para `X_BRANCO`.
- Clique simples em célula `X_BRANCO` muda para `VAZIA`.
- Clique duplo em célula correta muda para `GATO`.
- Clique duplo em célula incorreta muda para `X_VERMELHO`.
- Células `GATO` e `X_VERMELHO` ignoram novos cliques.
- O primeiro clique de um clique duplo não deixa `X_BRANCO` piscando na tela.

### Vitória

- Ao encontrar todos os gatos corretos, o jogo exibe vitória.
- Após vitória, o tabuleiro não aceita novas interações.

### Derrota

- Cada erro reduz 1 vida.
- Ao chegar a 0 vidas, o jogo exibe game over.
- Após game over, o tabuleiro não aceita novas interações.

### Ajuda

- Revelar gato escolhe apenas células corretas ainda não resolvidas.
- Revelar gato atualiza contador e pode disparar vitória.
- Limpar erro/ajuda extra não aumenta vidas acima do máximo.

### Geometria das regiões

- Regiões com menos de `3` células são rejeitadas.
- Regiões com mais de `2N - 2` células são rejeitadas.
- Regiões que ocupam mais de `60%` de uma linha são rejeitadas.
- Regiões que ocupam mais de `60%` de uma coluna são rejeitadas.
- Regiões em formato de retângulo perfeito são rejeitadas, exceto quando forem regiões concentradas intencionais.
- Níveis fáceis priorizam regiões compactas.
- Níveis difíceis priorizam regiões sinuosas e entrelaçadas.
- Níveis hard possuem exatamente 6 regiões concentradas.
- Em níveis hard, pelo menos 2 regiões concentradas compartilham linha ou coluna.

## 15. Fora de escopo inicial

Estes itens não são obrigatórios para a primeira implementação, salvo decisão posterior:

- Editor visual de níveis.
- Geração procedural infinita em tempo real.
- Ranking online.
- Sincronização em nuvem.
- Monetização real com SDK de anúncios.
- Sistema completo de conquistas.
