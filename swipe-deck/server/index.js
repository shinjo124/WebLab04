import mongoose from 'mongoose'
import { app } from './app.js'

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is required')
  process.exit(1)
}

try {
  await mongoose.connect(process.env.MONGODB_URI)
  const port = process.env.PORT || 3000
  app.listen(port, () => console.log(`Server listening on port ${port}`))
} catch (error) {
  console.error('MongoDB connection failed:', error.message)
  process.exit(1)
}
