// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router'
import App from './App.jsx'

function Location() {
  const { search } = useLocation()
  return <output data-testid="location">{search}</output>
}
function setup(url = '/') {
  return render(<MemoryRouter initialEntries={[url]}><App /><Location /></MemoryRouter>)
}
function params() { return new URLSearchParams(screen.getByTestId('location').textContent) }

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', '') }
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open') }
})
afterEach(cleanup)

describe('gallery URL state', () => {
  it('shows 12 photos by default and filters a direct category link', () => {
    const view = setup()
    expect(within(screen.getByRole('list', { name: 'Photos' })).getAllByRole('button')).toHaveLength(12)
    view.unmount()
    setup('/?category=nature')
    expect(screen.getByLabelText('Category').value).toBe('nature')
    expect(within(screen.getByRole('list', { name: 'Photos' })).getAllByRole('button')).toHaveLength(4)
  })
  it('updates category while preserving other URL parameters', () => {
    setup('/?photoId=1&other=keep')
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'city' } })
    expect(params().get('category')).toBe('city')
    expect(params().get('photoId')).toBe('1')
    expect(params().get('other')).toBe('keep')
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: '' } })
    expect(params().has('category')).toBe(false)
  })
  it('opens a direct photo link and preserves category when closed', async () => {
    setup('/?category=nature&photoId=1&other=keep')
    expect(screen.getByRole('dialog').hasAttribute('open')).toBe(true)
    expect((await within(screen.getByRole('dialog')).findByRole('img')).alt).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Close photo' }))
    expect(params().has('photoId')).toBe(false)
    expect(params().get('category')).toBe('nature')
    expect(params().get('other')).toBe('keep')
  })
  it('sets photoId when selecting a photo and handles invalid photo IDs', () => {
    const view = setup('/?category=city')
    fireEvent.click(within(screen.getByRole('list', { name: 'Photos' })).getAllByRole('button')[0])
    expect(params().get('photoId')).toBeTruthy()
    expect(params().get('category')).toBe('city')
    view.unmount()
    setup('/?photoId=missing')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByText('Photo not found.')).toBeTruthy()
  })
})

it('closes on Escape, keeps the filter, and returns focus to the photo', () => {
  setup('/?category=nature&other=keep')
  const photo = within(screen.getByRole('list', { name: 'Photos' })).getAllByRole('button')[0]
  photo.focus()
  fireEvent.click(photo)
  expect(screen.getByRole('dialog').hasAttribute('open')).toBe(true)
  fireEvent(screen.getByRole('dialog'), new Event('cancel', { bubbles: false, cancelable: true }))
  expect(params().has('photoId')).toBe(false)
  expect(params().get('category')).toBe('nature')
  expect(params().get('other')).toBe('keep')
  expect(document.activeElement).toBe(photo)
})

it('moves focus to the gallery heading after closing a direct photo link', () => {
  setup('/?photoId=1')
  fireEvent.click(screen.getByRole('button', { name: 'Close photo' }))
  expect(document.activeElement).toBe(screen.getByRole('heading', { name: 'Photo Gallery' }))
})


it('keeps the selected category and filtered photos after closing a photo opened from the gallery', () => {
  setup('/?other=keep')
  fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'city' } })
  const gallery = screen.getByRole('list', { name: 'Photos' })
  fireEvent.click(within(gallery).getAllByRole('button')[0])
  expect(params().get('photoId')).toBe('5')
  fireEvent.click(screen.getByRole('button', { name: 'Close photo' }))
  expect(screen.queryByRole('dialog')).toBeNull()
  expect(params().has('photoId')).toBe(false)
  expect(params().get('category')).toBe('city')
  expect(params().get('other')).toBe('keep')
  expect(screen.getByLabelText('Category').value).toBe('city')
  expect(within(gallery).getAllByRole('button')).toHaveLength(4)
})
