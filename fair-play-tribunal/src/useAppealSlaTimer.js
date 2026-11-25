import { useEffect, useState } from 'react'

// deadline is an absolute Unix timestamp in milliseconds; the return value is milliseconds remaining.
export function useAppealSlaTimer(deadline) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const sync = () => setNow(Date.now())
    const onVisibilityChange = () => { if (document.visibilityState === 'visible') sync() }
    sync()
    const interval = setInterval(sync, 1000)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [deadline])
  return Math.max(0, deadline - now)
}
