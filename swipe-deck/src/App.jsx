import { useLoaderData } from 'react-router'
import SwipeDeck from './SwipeDeck.jsx'

export default function App() {
  const profiles = useLoaderData()
  return <SwipeDeck profiles={profiles} />
}
