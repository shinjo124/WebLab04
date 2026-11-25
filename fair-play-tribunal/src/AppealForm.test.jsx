// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from './App.jsx'

afterEach(cleanup)
it('validates synchronously, associates errors, and shows valid submitted values in a definition list', () => {
  render(<MemoryRouter initialEntries={['/dossier/himass']}><App /></MemoryRouter>)
  const current = screen.getByLabelText('Current suspension (days)')
  const requested = screen.getByLabelText('Requested suspension (days)')
  const reason = screen.getByLabelText('Reason for appeal')
  fireEvent.change(requested, { target: { value: '30' } })
  expect(requested.getAttribute('aria-invalid')).toBe('true')
  const message = screen.getByText('Requested suspension must be less than the current suspension.')
  expect(requested.getAttribute('aria-describedby')).toBe(message.id)
  fireEvent.change(current, { target: { value: '31' } })
  expect(requested.getAttribute('aria-invalid')).toBe('false')
  expect(screen.queryByText('Requested suspension must be less than the current suspension.')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Review appeal' }))
  expect(reason.getAttribute('aria-invalid')).toBe('true')
  expect(screen.queryByRole('heading', { name: 'Submitted appeal' })).toBeNull()
  fireEvent.change(reason, { target: { value: 'Please reconsider the duration.' } })
  fireEvent.click(screen.getByRole('button', { name: 'Review appeal' }))
  const result = screen.getByRole('region', { name: 'Submitted appeal' })
  expect(within(result).getByText('31')).toBeTruthy()
  expect(within(result).getByText('30')).toBeTruthy()
  expect(within(result).getByText('Please reconsider the duration.')).toBeTruthy()
  expect(result.querySelector('dl')).toBeTruthy()
})
