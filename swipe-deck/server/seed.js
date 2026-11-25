import mongoose from 'mongoose'
import { Profile } from './models.js'

const profiles = [
  ['an', 'An', 'Enjoys coffee and long walks.'],
  ['binh', 'Binh', 'Loves cooking and quiet weekends.'],
  ['chi', 'Chi', 'Finds joy in books and music.'],
  ['dung', 'Dung', 'Enjoys photography and exploring.'],
  ['giang', 'Giang', 'Loves films and trying new food.'],
  ['ha', 'Ha', 'Enjoys art and cycling.'],
  ['khanh', 'Khanh', 'Likes board games and tea.'],
  ['lan', 'Lan', 'Enjoys gardening and travel.'],
  ['minh', 'Minh', 'Loves live music and hiking.'],
  ['vy', 'Vy', 'Enjoys drawing and baking.'],
]

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is required')
  process.exit(1)
}
try {
  await mongoose.connect(process.env.MONGODB_URI)
  await Profile.bulkWrite(profiles.map(([seedKey, name, bio]) => ({
    updateOne: { filter: { seedKey }, update: { $set: { name, bio } }, upsert: true },
  })))
  console.log(`Seeded ${profiles.length} profiles`)
} catch (error) {
  console.error('Failed to seed profiles:', error.message)
  process.exitCode = 1
} finally {
  await mongoose.disconnect()
}
