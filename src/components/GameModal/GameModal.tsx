import './GameModal.css'

type GameModalAction = {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

type GameModalProps = {
  title: string
  description?: string
  actions: GameModalAction[]
}

export function GameModal({ title, description, actions }: GameModalProps) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="game-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h2 id="modal-title">{title}</h2>
        {description ? <p>{description}</p> : null}

        <div className="game-modal__actions">
          {actions.map((action) => (
            <button
              className={action.variant === 'secondary' ? 'button-secondary' : undefined}
              type="button"
              onClick={action.onClick}
              key={action.label}
            >
              {action.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
