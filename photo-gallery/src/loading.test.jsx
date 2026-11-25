// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from './App.jsx'

vi.mock('./PhotoContent.jsx', () => new Promise(() => {}))
afterEach(cleanup)
it('reserves the photo space and announces loading while the lightbox module loads', async () => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', '') }
  render(<MemoryRouter initialEntries={['/?photoId=1']}><App /></MemoryRouter>)
  expect(await screen.findByRole('status', { name: 'Loading photo' })).toBeTruthy()
})
