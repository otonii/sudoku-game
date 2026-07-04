import { useMemo } from "react";
import "./App.css";
import { GameBoard } from "./components/GameBoard/GameBoard";

import { GameHeader } from "./components/GameHeader/GameHeader";
import { GameModal } from "./components/GameModal/GameModal";
import { GameStatus } from "./components/GameStatus/GameStatus";
import { levels } from "./data/levels";
import { validateLevel } from "./domain/levelValidation";
import { useDoubleClickCell } from "./hooks/useDoubleClickCell";
import { useGameState } from "./hooks/useGameState";

const firstLevel = levels[0];

function App() {
  const levelErrors = useMemo(() => validateLevel(firstLevel), []);
  const {
    gameState,
    markCell,
    markCellNote,
    validateCell,
    recoverLife,
    resetLevel,
    pauseGame,
    resumeGame,
  } = useGameState(firstLevel);
  const handleCellInput = useDoubleClickCell({
    onSingleClick: markCell,
    onDoubleClick: validateCell,
  });

  if (levelErrors.length > 0) {
    return (
      <main className="app-shell app-shell--centered">
        <section className="technical-error">
          <h1>Nível inválido</h1>
          <p>Corrija os dados do nível antes de iniciar o jogo.</p>
          <ul>
            {levelErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </section>
      </main>
    );
  }

  const isBoardDisabled = gameState.status !== "PLAYING";

  return (
    <main className="app-shell">
      <GameHeader
        levelId={gameState.level.levelId}
        score={gameState.score}
        onBack={resetLevel}
        onOpenSettings={pauseGame}
      />

      <section className="rules-panel" aria-label="Regras do jogo">
        <article className="rule-card">1 gato por cor</article>
        <article className="rule-card">1 gato por linha e coluna</article>
        <article className="rule-card rule-card--touch">
          <span className="rule-card__icon" aria-hidden="true">
            ⊠⊠⊠
            <br />
            ⊠×⊠
            <br />
            ⊠⊠⊠
          </span>
          <span>Os gatos não podem se tocar</span>
        </article>
      </section>

      <section className="game-stage" aria-label="Partida">
        <GameStatus
          catsFound={gameState.catsFound}
          totalCats={gameState.level.totalCatsRequired}
          lives={gameState.lives}
          maxLives={gameState.maxLives}
        />

        <GameBoard
          cells={gameState.cells}
          disabled={isBoardDisabled}
          onCellInput={handleCellInput}
          onCellDragMark={markCellNote}
        />
      </section>

      {gameState.status === "WON" ? (
        <GameModal
          title="Você venceu!"
          description="Todos os gatos foram encontrados sem quebrar as regras."
          actions={[{ label: "Jogar novamente", onClick: resetLevel }]}
        />
      ) : null}

      {gameState.status === "GAME_OVER" ? (
        <GameModal
          title="Fim de jogo"
          description="Você ficou sem peixes. Recupere uma vida ou reinicie o nível."
          actions={[
            { label: "Continuar", onClick: recoverLife },
            { label: "Reiniciar", onClick: resetLevel, variant: "secondary" },
          ]}
        />
      ) : null}

      {gameState.status === "PAUSED" ? (
        <GameModal
          title="Configurações"
          description="Som e vibração entram em uma próxima versão."
          actions={[
            { label: "Continuar", onClick: resumeGame },
            {
              label: "Reiniciar nível",
              onClick: resetLevel,
              variant: "secondary",
            },
          ]}
        />
      ) : null}
    </main>
  );
}

export default App;
