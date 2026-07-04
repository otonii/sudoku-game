import './GameStatus.css'

type GameStatusProps = {
  catsFound: number
  totalCats: number
  lives: number
  maxLives: number
}

export function GameStatus({ catsFound, totalCats, lives, maxLives }: GameStatusProps) {
  return (
    <section className="game-status" aria-label="Status da partida">
      <div className="status-pill" aria-label={`${catsFound} de ${totalCats} gatos encontrados`}>
        <span aria-hidden="true">🐱</span>
        <strong>
          {catsFound}/{totalCats}
        </strong>
      </div>

      <div className="status-pill" aria-label={`${lives} de ${maxLives} vidas restantes`}>
        {Array.from({ length: maxLives }, (_, index) => (
          <span
            className={index < lives ? 'life-fish' : 'life-fish life-fish--lost'}
            aria-hidden="true"
            key={index}
          >
            🐟
          </span>
        ))}
      </div>
    </section>
  )
}
