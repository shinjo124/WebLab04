import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { randomUUID } from 'node:crypto'
import { execFile } from 'node:child_process'
import { createServer } from 'node:http'
import { promisify } from 'node:util'
import mongoose from 'mongoose'
import { app } from './app.js'
import { Profile, Swipe } from './models.js'

const enabled = process.env.MONGO_INTEGRATION === '1'
const dbName = `lab4_swipe_test_${randomUUID().replaceAll('-', '')}`
const uri = `mongodb://127.0.0.1:27017/${dbName}`
const execute = promisify(execFile)
let server, base

describe.skipIf(!enabled)('MongoDB integration', () => {
  beforeAll(async () => {
    await execute(process.execPath, ['server/seed.js'], { env: { ...process.env, MONGODB_URI: uri } })
    await execute(process.execPath, ['server/seed.js'], { env: { ...process.env, MONGODB_URI: uri } })
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
    server = createServer(app)
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
    base = `http://127.0.0.1:${server.address().port}`
  }, 30000)

  afterAll(async () => {
    if (server?.listening) await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
    if (mongoose.connection.readyState === 1) {
      if (mongoose.connection.name !== dbName) throw new Error('Refusing to remove an unexpected database')
      await mongoose.connection.dropDatabase()
    }
    await mongoose.disconnect()
  }, 30000)

  it('seeds ten profiles idempotently and returns them through the API', async () => {
    expect(await Profile.countDocuments()).toBe(10)
    const response = await fetch(`${base}/api/profiles`)
    expect(response.status).toBe(200)
    const profiles = await response.json()
    expect(profiles).toHaveLength(10)
    expect(new Set(profiles.map((profile) => profile.seedKey)).size).toBe(10)
  })

  it('persists a valid swipe and rejects invalid and unknown profiles without writing', async () => {
    const profile = await Profile.findOne().lean()
    const post = (body) => fetch(`${base}/api/swipe`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const response = await post({ profileId: String(profile._id), direction: 'right' })
    expect(response.status).toBe(201)
    const saved = await response.json()
    const record = await Swipe.findById(saved._id).lean()
    expect(String(record.profileId)).toBe(String(profile._id))
    expect(record.direction).toBe('right')
    expect((await post({ profileId: String(profile._id), direction: 'invalid' })).status).toBe(400)
    expect((await post({ profileId: new mongoose.Types.ObjectId().toString(), direction: 'left' })).status).toBe(404)
    expect(await Swipe.countDocuments()).toBe(1)
  })
})
