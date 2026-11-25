// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, renderHook } from '@testing-library/react'
import { useAppealSlaTimer } from './useAppealSlaTimer.js'

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date('2026-01-01T00:00:00Z')) })
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks() })

describe('useAppealSlaTimer', () => {
  it('uses the absolute deadline, resynchronizes after clock jumps, and clamps at zero', () => {
    const deadline = Date.now() + 10_000
    const { result } = renderHook(() => useAppealSlaTimer(deadline))
    expect(result.current).toBe(10_000)
    act(() => { vi.advanceTimersByTime(2_000) })
    expect(result.current).toBe(8_000)
    act(() => { vi.setSystemTime(deadline - 1_500); document.dispatchEvent(new Event('visibilitychange')) })
    expect(result.current).toBe(1_500)
    act(() => { vi.setSystemTime(deadline + 5_000); document.dispatchEvent(new Event('visibilitychange')) })
    expect(result.current).toBe(0)
  })
  it('updates for a new deadline and removes the interval and listener on unmount', () => {
    const remove = vi.spyOn(document, 'removeEventListener')
    const clear = vi.spyOn(globalThis, 'clearInterval')
    const { result, rerender, unmount } = renderHook(({ deadline }) => useAppealSlaTimer(deadline), { initialProps: { deadline: Date.now() + 5_000 } })
    rerender({ deadline: Date.now() + 20_000 })
    expect(result.current).toBe(20_000)
    unmount()
    expect(clear).toHaveBeenCalled()
    expect(remove).toHaveBeenCalledWith('visibilitychange', expect.any(Function))
    expect(vi.getTimerCount()).toBe(0)
  })
})
