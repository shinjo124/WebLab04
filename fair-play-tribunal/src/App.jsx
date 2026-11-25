import { useMemo } from 'react'
import { Link, Route, Routes, useParams } from 'react-router'

const dossiers = {
  himass: { name: 'Himass', comparisons: [{ label: 'Suspension', proposedDays: 30, referenceDays: 10 }] },
  tanvuu: { name: 'TanVuu', comparisons: [{ label: 'Suspension', proposedDays: 14, referenceDays: 10 }] },
}

function Dossier() {
  const { playerID } = useParams()
  const dossier = Object.hasOwn(dossiers, playerID) ? dossiers[playerID] : null
  const matrix = useMemo(() => dossier?.comparisons.map((item) => ({
    ...item, difference: item.proposedDays - item.referenceDays,
  })) ?? [], [dossier])
  if (!dossier) return <main><h1>404: Dossier not found</h1><Link to="/">All dossiers</Link></main>
  return (
    <main>
      <Link to="/">All dossiers</Link>
      <h1>{dossier.name} dossier</h1>
      <p>Illustrative sample data; these figures are not verified case facts.</p>
      <h2>Disproportionality matrix</h2>
      <p>Difference is proposed duration minus reference duration, in days.</p>
      <table aria-label="Disproportionality matrix">
        <thead><tr><th scope="col">Measure</th><th scope="col">Proposed days</th><th scope="col">Reference days</th><th scope="col">Difference</th></tr></thead>
        <tbody>{matrix.map((row) => <tr key={row.label}><th scope="row">{row.label}</th><td>{row.proposedDays}</td><td>{row.referenceDays}</td><td>{row.difference > 0 ? `+${row.difference}` : row.difference}</td></tr>)}</tbody>
      </table>
    </main>
  )
}

function Home() {
  return <main><h1>Fair-Play Tribunal</h1><p>Select a dossier:</p><ul><li><Link to="/dossier/himass">Himass</Link></li><li><Link to="/dossier/tanvuu">TanVuu</Link></li></ul></main>
}

export default function App() {
  return <Routes><Route path="/" element={<Home />} /><Route path="/dossier/:playerID" element={<Dossier />} /><Route path="*" element={<main><h1>404: Page not found</h1><Link to="/">All dossiers</Link></main>} /></Routes>
}
