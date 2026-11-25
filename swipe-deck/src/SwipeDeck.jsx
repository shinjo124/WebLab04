import { useState } from 'react'
export default function SwipeDeck({ profiles }) {
  const [history, setHistory] = useState([])
  const current = profiles[history.length]
  const score = history.reduce((total, swipe) => total + (swipe.direction === 'right' ? 10 : -5), 0)
  function swipe(direction) { if (current) setHistory(previous => [...previous, { profileId: current._id, direction }]) }
  return <main><h1>Swipe Deck</h1><p aria-live="polite">Score: {score}</p>{current ? <section aria-label="Current profile"><h2>{current.name}</h2><p>{current.bio}</p><button onClick={() => swipe('left')}>Pass</button><button onClick={() => swipe('right')}>Like</button><button onClick={() => swipe('up')}>Super</button></section> : <p>No more profiles.</p>}<button disabled={!history.length} onClick={() => setHistory(previous => previous.slice(0, -1))}>Undo</button></main>
}
