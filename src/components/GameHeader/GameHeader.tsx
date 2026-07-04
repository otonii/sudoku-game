import type { Level } from "../../domain/gameTypes";
import "./GameHeader.css";

type GameHeaderProps = {
  levelId: Level["levelId"];
  score: number;
  onBack: () => void;
  onOpenSettings: () => void;
};

export function GameHeader({
  levelId,
  score,
  onBack,
  onOpenSettings,
}: GameHeaderProps) {
  return (
    <header className="game-header" aria-label="Topo do jogo">
      <button className="icon-button" type="button" onClick={onBack}>
        ←<span className="sr-only">Voltar</span>
      </button>

      <div className="game-header__info">
        <div className="game-header__metric">
          <span>Nível</span>
          <strong>{levelId}</strong>
        </div>
        <div className="game-header__metric">
          <span>Pontuação</span>
          <strong>{score}</strong>
        </div>
      </div>

      <button className="icon-button" type="button" onClick={onOpenSettings}>
        ⚙️
        <span className="sr-only">Configurações</span>
      </button>
    </header>
  );
}
