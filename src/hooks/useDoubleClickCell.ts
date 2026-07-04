import { useCallback, useEffect, useRef } from 'react'

const DEFAULT_DELAY = 280

type CellInput = {
  row: number
  column: number
}

type UseDoubleClickCellOptions = {
  delay?: number
  onSingleClick: (row: number, column: number) => void
  onDoubleClick: (row: number, column: number) => void
}

export function useDoubleClickCell({
  delay = DEFAULT_DELAY,
  onSingleClick,
  onDoubleClick,
}: UseDoubleClickCellOptions) {
  const pendingCellRef = useRef<CellInput | null>(null)
  const timeoutRef = useRef<number | null>(null)

  const clearPendingClick = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    pendingCellRef.current = null
  }, [])

  useEffect(() => clearPendingClick, [clearPendingClick])

  return useCallback(
    (row: number, column: number) => {
      const pendingCell = pendingCellRef.current
      const isDoubleClickOnSameCell =
        pendingCell?.row === row && pendingCell.column === column

      if (isDoubleClickOnSameCell) {
        clearPendingClick()
        onDoubleClick(row, column)
        return
      }

      clearPendingClick()
      pendingCellRef.current = { row, column }
      timeoutRef.current = window.setTimeout(() => {
        onSingleClick(row, column)
        pendingCellRef.current = null
        timeoutRef.current = null
      }, delay)
    },
    [clearPendingClick, delay, onDoubleClick, onSingleClick],
  )
}
