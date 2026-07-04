import './GameFooter.css'

type GameFooterProps = {
  disabled: boolean
  onRevealCat: () => void
  onRecoverLife: () => void
}

export function GameFooter({ disabled, onRevealCat, onRecoverLife }: GameFooterProps) {
  return (
    <footer className="game-footer" aria-label="Ferramentas de ajuda">
      <button type="button" disabled={disabled} onClick={onRevealCat}>
        Revelar gato
      </button>
      <button type="button" onClick={onRecoverLife}>
        Recuperar vida
      </button>
    </footer>
  )
}
