import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'

// Opens the view's add-task editor when the URL carries ?add=true, then
// strips the param. Used by the command palette's "Add Task" entry and the
// global "q" shortcut.
export function useAddTaskParam(onAdd: () => void) {
  const [searchParams, setSearchParams] = useSearchParams()
  const onAddRef = useRef(onAdd)
  onAddRef.current = onAdd

  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      onAddRef.current()
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])
}
