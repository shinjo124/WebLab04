import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { createServer } from 'node:http'

const mocks = vi.hoisted(() => ({ lean: vi.fn(), find: vi.fn(), exists: vi.fn(), create: vi.fn() }))
vi.mock('./models.js', () => ({ Profile: { find: mocks.find, exists: mocks.exists }, Swipe: { create: mocks.create } }))
import { app } from './app.js'

let server, base
beforeAll(async () => {
  server = createServer(app)
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  base = `http://127.0.0.1:${server.address().port}`
})
afterAll(() => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())))
beforeEach(() => { vi.resetAllMocks(); mocks.find.mockReturnValue({ lean: mocks.lean }) })
const id = '507f1f77bcf86cd799439011'
const post = (body) => fetch(`${base}/api/swipe`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })

describe('server', () => {
  it('responds to health checks', async () => {
    expect(await (await fetch(`${base}/api/health`)).json()).toEqual({ status: 'ok' })
  })
  it('returns profiles using a lean query', async () => {
    mocks.lean.mockResolvedValue([{ _id: id, name: 'An' }])
    const response = await fetch(`${base}/api/profiles`)
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual([{ _id: id, name: 'An' }])
    expect(mocks.find).toHaveBeenCalledOnce()
    expect(mocks.lean).toHaveBeenCalledOnce()
  })
  it.each([{}, { profileId: 'bad', direction: 'left' }, { profileId: id, direction: 'down' }, { profileId: id, direction: 'left', extra: true }, null, []])('rejects invalid payload %j', async (body) => {
    expect((await post(body)).status).toBe(400)
    expect(mocks.create).not.toHaveBeenCalled()
  })
  it('returns 404 for an unknown profile', async () => {
    mocks.exists.mockResolvedValue(null)
    expect((await post({ profileId: id, direction: 'left' })).status).toBe(404)
    expect(mocks.create).not.toHaveBeenCalled()
  })
  it('persists a validated swipe', async () => {
    mocks.exists.mockResolvedValue({ _id: id })
    mocks.create.mockResolvedValue({ profileId: id, direction: 'right' })
    const response = await post({ profileId: id, direction: 'right' })
    expect(response.status).toBe(201)
    expect(await response.json()).toEqual({ profileId: id, direction: 'right' })
    expect(mocks.create).toHaveBeenCalledWith({ profileId: id, direction: 'right' })
  })
  it('returns a generic server error when the database fails', async () => {
    mocks.lean.mockRejectedValue(new Error('secret database details'))
    const response = await fetch(`${base}/api/profiles`)
    expect(response.status).toBe(500)
    expect(await response.text()).not.toContain('secret database details')
  })
})
