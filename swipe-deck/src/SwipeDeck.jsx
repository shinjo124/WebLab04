import { useCallback, useRef, useState } from 'react'

export default function SwipeDeck({ profiles }) {
  const [history, setHistory] = useState([])
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const request = useRef(null)
  const start = useRef(null)
  const current = profiles[history.length]
  const score = history.reduce((total, swipe) => total + (swipe.direction === 'right' ? 10 : -5), 0)
  const deckRef = useCallback((node) => {
    if (node) return () => { request.current?.abort(); request.current = null }
  }, [])
  async function swipe(direction) {
    if (!current || request.current) return
    const controller = new AbortController()
    request.current = controller
    setPending(true)
    setError('')
    try {
      const response = await fetch('/api/swipe', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: current._id, direction }), signal: controller.signal,
      })
      if (!response.ok) throw new Error('Save failed')
      if (!controller.signal.aborted) setHistory((previous) => [...previous, { profileId: current._id, direction }])
    } catch {
      if (!controller.signal.aborted) setError('Could not save the swipe. Please try again.')
    } finally {
      if (!controller.signal.aborted) { request.current = null; setPending(false) }
    }
  }
  function undo() {
    if (!request.current) { setError(''); setHistory((previous) => previous.slice(0, -1)) }
  }
  function onKeyDown(event) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.repeat) return
    const direction = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up' }[event.key]
    if (direction) { event.preventDefault(); swipe(direction) }
    else if (event.key === 'Backspace') { event.preventDefault(); undo() }
  }
  function onPointerDown(event) {
    if (pending || event.button !== 0 || event.target.closest('button')) return
    start.current = { x: event.clientX, y: event.clientY, id: event.pointerId }
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }
  function onPointerUp(event) {
    if (!start.current || start.current.id !== event.pointerId) return
    const dx = event.clientX - start.current.x
    const dy = event.clientY - start.current.y
    start.current = null
    if (Math.abs(dx) >= 50 && Math.abs(dx) >= Math.abs(dy)) swipe(dx < 0 ? 'left' : 'right')
    else if (dy <= -50 && Math.abs(dy) > Math.abs(dx)) swipe('up')
  }
  return (
    <main ref={deckRef} tabIndex={0} onKeyDown={onKeyDown}>
      <h1>Swipe Deck</h1>
      <p>Use arrow keys to swipe and Backspace to undo.</p>
      <p aria-live="polite">Score: {score}</p>
      {pending && <p role="status">Saving swipe…</p>}
      {error && <p role="alert">{error}</p>}
      {current ? (
        <section aria-label="Current profile" className="swipe-card" onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => { start.current = null }}>
          <h2>{current.name}</h2>
          <p>{current.bio}</p>
          <button type="button" disabled={pending} onClick={() => swipe('left')}>Pass</button>{' '}
          <button type="button" disabled={pending} onClick={() => swipe('right')}>Like</button>{' '}
          <button type="button" disabled={pending} onClick={() => swipe('up')}>Super</button>
        </section>
      ) : <p>No more profiles.</p>}
      <p><button type="button" disabled={!history.length || pending} onClick={undo}>Undo</button></p>
    </main>
  )
}
