// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from './App.jsx'

function open(path) { render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>) }
afterEach(cleanup)

describe('dossiers', () => {
  it.each([['himass', 'Himass'], ['tanvuu', 'TanVuu']])('opens the %s dossier from its URL', (id, name) => {
    open(`/dossier/${id}`)
    expect(screen.getByRole('heading', { name: `${name} dossier` })).toBeTruthy()
    expect(screen.getByText(/illustrative sample data/i)).toBeTruthy()
    expect(screen.getByRole('table', { name: 'Disproportionality matrix' })).toBeTruthy()
  })
  it('derives the difference between proposed and reference days', () => {
    open('/dossier/himass')
    const row = screen.getByRole('row', { name: /suspension/i })
    expect(within(row).getByText('30')).toBeTruthy()
    expect(within(row).getByText('10')).toBeTruthy()
    expect(within(row).getByText('+20')).toBeTruthy()
  })
  it('shows a 404 for unknown dossier IDs and unknown routes', () => {
    const view = render(<MemoryRouter initialEntries={['/dossier/unknown']}><App /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: '404: Dossier not found' })).toBeTruthy()
    view.unmount()
    open('/missing')
    expect(screen.getByRole('heading', { name: '404: Page not found' })).toBeTruthy()
  })
  it('provides navigation to both dossiers', () => {
    open('/')
    expect(screen.getByRole('link', { name: 'Himass' }).getAttribute('href')).toBe('/dossier/himass')
    expect(screen.getByRole('link', { name: 'TanVuu' }).getAttribute('href')).toBe('/dossier/tanvuu')
  })
})
