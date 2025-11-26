import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getOrCreateLocalUser, getUserById, updateUser } from './auth'

// Mock the database module
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
  },
  users: { id: 'id', email: 'email', name: 'name' },
}))

// Mock uuid
vi.mock('uuid', () => ({
  v4: () => 'mock-uuid-123',
}))

describe('Auth Module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getOrCreateLocalUser', () => {
    it('should return existing user if one exists', async () => {
      const { db } = await import('@/lib/db')
      const existingUser = {
        id: 'existing-user-id',
        email: 'user@local.app',
        name: 'Existing User',
        createdAt: new Date(),
      }

      vi.mocked(db.select().from().limit).mockResolvedValue([existingUser])

      const user = await getOrCreateLocalUser()

      expect(user).toEqual(existingUser)
      expect(db.insert).not.toHaveBeenCalled()
    })

    it('should create new user if none exists', async () => {
      const { db } = await import('@/lib/db')
      const newUser = {
        id: 'mock-uuid-123',
        email: 'user@local.app',
        name: 'Local User',
        createdAt: new Date(),
      }

      // First call - no existing users
      vi.mocked(db.select().from().limit).mockResolvedValueOnce([])
      // After insert - return the new user
      vi.mocked(db.select().from().where).mockResolvedValue([newUser])
      vi.mocked(db.insert().values).mockResolvedValue(undefined)

      const user = await getOrCreateLocalUser()

      expect(db.insert).toHaveBeenCalled()
      expect(user.id).toBe('mock-uuid-123')
      expect(user.email).toBe('user@local.app')
      expect(user.name).toBe('Local User')
    })

    it('should use default email and name for new user', async () => {
      const { db } = await import('@/lib/db')

      vi.mocked(db.select().from().limit).mockResolvedValueOnce([])
      vi.mocked(db.select().from().where).mockResolvedValue([
        { id: 'mock-uuid-123', email: 'user@local.app', name: 'Local User' },
      ])
      vi.mocked(db.insert().values).mockResolvedValue(undefined)

      await getOrCreateLocalUser()

      expect(db.insert().values).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'user@local.app',
          name: 'Local User',
        })
      )
    })
  })

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const { db } = await import('@/lib/db')
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      }

      vi.mocked(db.select().from().where).mockResolvedValue([mockUser])

      const user = await getUserById('user-123')

      expect(user).toEqual(mockUser)
    })

    it('should return null when user not found', async () => {
      const { db } = await import('@/lib/db')
      vi.mocked(db.select().from().where).mockResolvedValue([])

      const user = await getUserById('non-existent')

      expect(user).toBeNull()
    })
  })

  describe('updateUser', () => {
    it('should update user and return updated data', async () => {
      const { db } = await import('@/lib/db')
      const updatedUser = {
        id: 'user-123',
        email: 'newemail@example.com',
        name: 'Updated Name',
      }

      vi.mocked(db.update().set().where).mockResolvedValue(undefined)
      vi.mocked(db.select().from().where).mockResolvedValue([updatedUser])

      const result = await updateUser('user-123', {
        name: 'Updated Name',
        email: 'newemail@example.com',
      })

      expect(result).toEqual(updatedUser)
    })

    it('should update only name', async () => {
      const { db } = await import('@/lib/db')
      const updatedUser = {
        id: 'user-123',
        email: 'original@example.com',
        name: 'New Name',
      }

      vi.mocked(db.update().set().where).mockResolvedValue(undefined)
      vi.mocked(db.select().from().where).mockResolvedValue([updatedUser])

      const result = await updateUser('user-123', { name: 'New Name' })

      expect(result?.name).toBe('New Name')
    })

    it('should update only email', async () => {
      const { db } = await import('@/lib/db')
      const updatedUser = {
        id: 'user-123',
        email: 'new@example.com',
        name: 'Original Name',
      }

      vi.mocked(db.update().set().where).mockResolvedValue(undefined)
      vi.mocked(db.select().from().where).mockResolvedValue([updatedUser])

      const result = await updateUser('user-123', { email: 'new@example.com' })

      expect(result?.email).toBe('new@example.com')
    })

    it('should return null if user not found after update', async () => {
      const { db } = await import('@/lib/db')

      vi.mocked(db.update().set().where).mockResolvedValue(undefined)
      vi.mocked(db.select().from().where).mockResolvedValue([])

      const result = await updateUser('non-existent', { name: 'Test' })

      expect(result).toBeNull()
    })
  })
})
