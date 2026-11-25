import mongoose from 'mongoose'

const profileSchema = new mongoose.Schema({
  seedKey: { type: String, required: true, unique: true },
  name: { type: String, required: true, trim: true },
  bio: { type: String, required: true, trim: true },
})
const swipeSchema = new mongoose.Schema({
  profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
  direction: { type: String, enum: ['left', 'right', 'up'], required: true },
}, { timestamps: true })

export const Profile = mongoose.model('Profile', profileSchema)
export const Swipe = mongoose.model('Swipe', swipeSchema)
