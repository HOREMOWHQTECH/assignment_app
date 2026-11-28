import bcrypt from 'bcryptjs'
import { connectDB, disconnectDB } from '../lib/db.js'
import { User } from '../schema/User.js'

const email = process.argv[2]?.trim().toLowerCase()
const password = process.argv[3]
const name = process.argv[4]?.trim() || 'HOREMOW Admin'

if (!email || !password) {
  console.error('Usage: npm run create-admin -- <email> <password> [name]')
  process.exit(1)
}

if (password.length < 6) {
  console.error('Password must be at least 6 characters.')
  process.exit(1)
}

try {
  await connectDB()
  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.findOneAndUpdate(
    { email },
    { $set: { name, role: 'admin', passwordHash }, $setOnInsert: { email } },
    { upsert: true, new: true, runValidators: true },
  )
  console.log(`Admin ready: ${user.email} (${user._id})`)
} catch (error) {
  console.error('Could not create admin:', error)
  process.exitCode = 1
} finally {
  await disconnectDB()
}
