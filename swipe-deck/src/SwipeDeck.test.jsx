// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import SwipeDeck from './SwipeDeck.jsx'

const profiles = [
  { _id: 'a', name: 'An', bio: 'A' },
  { _id: 'b', name: 'Binh', bio: 'B' },
  { _id: 'c', name: 'Chi', bio: 'C' },
]
beforeEach(() => { vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true })) })
afterEach(() => { cleanup(); vi.unstubAllGlobals() })

describe('swipe deck', () => {
  it('derives score from history and undoes in last-in-first-out order', async () => {
    render(<SwipeDeck profiles={profiles} />)
    expect(screen.getByText('Score: 0')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Undo' }).disabled).toBe(true)
    expect(screen.getByRole('heading', { name: 'An' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Like' }))
    await screen.findByText('Score: 10')
    expect(screen.getByRole('heading', { name: 'Binh' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Pass' }))
    await screen.findByText('Score: 5')
    expect(screen.getByRole('heading', { name: 'Chi' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expect(screen.getByText('Score: 10')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Binh' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expect(screen.getByText('Score: 0')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'An' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Undo' }).disabled).toBe(true)
  })
  it('scores non-like actions at minus five and restores the last card after the deck ends', async () => {
    render(<SwipeDeck profiles={profiles.slice(0, 1)} />)
    fireEvent.click(screen.getByRole('button', { name: 'Super' }))
    await screen.findByText('Score: -5')
    expect(screen.getByText('No more profiles.')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expect(screen.getByRole('heading', { name: 'An' })).toBeTruthy()
    expect(screen.getByText('Score: 0')).toBeTruthy()
  })
})


it('supports arrow keys and Backspace undo, and saves each swipe', async () => {
  render(<SwipeDeck profiles={profiles} />)
  const deck = screen.getByRole('main')
  fireEvent.keyDown(deck, { key: 'ArrowRight' })
  await screen.findByText('Score: 10')
  expect(fetch).toHaveBeenCalledWith('/api/swipe', expect.objectContaining({ method: 'POST', body: JSON.stringify({ profileId: 'a', direction: 'right' }), signal: expect.any(AbortSignal) }))
  fireEvent.keyDown(deck, { key: 'ArrowLeft' })
  await screen.findByText('Score: 5')
  fireEvent.keyDown(deck, { key: 'ArrowUp' })
  await screen.findByText('Score: 0')
  fireEvent.keyDown(deck, { key: 'Backspace' })
  expect(screen.getByRole('heading', { name: 'Chi' })).toBeTruthy()
})

it('recognizes pointer gestures at 50 pixels and ignores shorter gestures', async () => {
  vi.stubGlobal('PointerEvent', MouseEvent)
  render(<SwipeDeck profiles={profiles} />)
  const card = screen.getByRole('region', { name: 'Current profile' })
  fireEvent.pointerDown(card, { clientX: 100, clientY: 100, button: 0 })
  fireEvent.pointerUp(card, { clientX: 149, clientY: 100 })
  expect(fetch).not.toHaveBeenCalled()
  fireEvent.pointerDown(card, { clientX: 100, clientY: 100, button: 0 })
  fireEvent.pointerUp(card, { clientX: 50, clientY: 100 })
  await screen.findByText('Score: -5')
  expect(JSON.parse(fetch.mock.calls[0][1].body).direction).toBe('left')
})

it('shows pending and failure without advancing the card', async () => {
  let rejectSave
  fetch.mockReturnValueOnce(new Promise((_resolve, reject) => { rejectSave = reject }))
  render(<SwipeDeck profiles={profiles} />)
  fireEvent.click(screen.getByRole('button', { name: 'Like' }))
  expect(screen.getByText('Saving swipe…')).toBeTruthy()
  expect(screen.getByRole('button', { name: 'Like' }).disabled).toBe(true)
  rejectSave(new Error('offline'))
  expect(await screen.findByRole('alert')).toBeTruthy()
  expect(screen.getByRole('heading', { name: 'An' })).toBeTruthy()
  expect(screen.getByText('Score: 0')).toBeTruthy()
})

it('aborts an in-flight save on unmount', async () => {
  fetch.mockReturnValueOnce(new Promise(() => {}))
  const view = render(<SwipeDeck profiles={profiles} />)
  fireEvent.click(screen.getByRole('button', { name: 'Like' }))
  const signal = fetch.mock.calls[0][1].signal
  view.unmount()
  await waitFor(() => expect(signal.aborted).toBe(true))
})
