import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getOrCreateLocalUser, getUserById, updateUser } from './auth'

// Create mock functions for chained calls
const mockLimit = vi.fn()
const mockSelectWhere = vi.fn()
const mockValues = vi.fn()
const mockUpdateWhere = vi.fn()

// Mock the database module
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: mockSelectWhere,
        limit: mockLimit,
      })),
    })),
    insert: vi.fn(() => ({
      values: mockValues,
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: mockUpdateWhere,
      })),
    })),
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
      const existingUser = {
        id: 'existing-user-id',
        email: 'user@local.app',
        name: 'Existing User',
        createdAt: new Date(),
      }

      mockLimit.mockResolvedValue([existingUser])

      const user = await getOrCreateLocalUser()

      expect(user).toEqual(existingUser)
    })

    it('should create new user if none exists', async () => {
      const newUser = {
        id: 'mock-uuid-123',
        email: 'user@local.app',
        name: 'Local User',
        createdAt: new Date(),
      }

      // First call - no existing users
      mockLimit.mockResolvedValueOnce([])
      // After insert - return the new user
      mockSelectWhere.mockResolvedValue([newUser])
      mockValues.mockResolvedValue(undefined)

      const user = await getOrCreateLocalUser()

      expect(user.id).toBe('mock-uuid-123')
      expect(user.email).toBe('user@local.app')
      expect(user.name).toBe('Local User')
    })

    it('should use default email and name for new user', async () => {
      mockLimit.mockResolvedValueOnce([])
      mockSelectWhere.mockResolvedValue([
        { id: 'mock-uuid-123', email: 'user@local.app', name: 'Local User' },
      ])
      mockValues.mockResolvedValue(undefined)

      await getOrCreateLocalUser()

      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'user@local.app',
          name: 'Local User',
        })
      )
    })
  })

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      }

      mockSelectWhere.mockResolvedValue([mockUser])

      const user = await getUserById('user-123')

      expect(user).toEqual(mockUser)
    })

    it('should return null when user not found', async () => {
      mockSelectWhere.mockResolvedValue([])

      const user = await getUserById('non-existent')

      expect(user).toBeNull()
    })
  })

  describe('updateUser', () => {
    it('should update user and return updated data', async () => {
      const updatedUser = {
        id: 'user-123',
        email: 'newemail@example.com',
        name: 'Updated Name',
      }

      mockUpdateWhere.mockResolvedValue(undefined)
      mockSelectWhere.mockResolvedValue([updatedUser])

      const result = await updateUser('user-123', {
        name: 'Updated Name',
        email: 'newemail@example.com',
      })

      expect(result).toEqual(updatedUser)
    })

    it('should update only name', async () => {
      const updatedUser = {
        id: 'user-123',
        email: 'original@example.com',
        name: 'New Name',
      }

      mockUpdateWhere.mockResolvedValue(undefined)
      mockSelectWhere.mockResolvedValue([updatedUser])

      const result = await updateUser('user-123', { name: 'New Name' })

      expect(result?.name).toBe('New Name')
    })

    it('should update only email', async () => {
      const updatedUser = {
        id: 'user-123',
        email: 'new@example.com',
        name: 'Original Name',
      }

      mockUpdateWhere.mockResolvedValue(undefined)
      mockSelectWhere.mockResolvedValue([updatedUser])

      const result = await updateUser('user-123', { email: 'new@example.com' })

      expect(result?.email).toBe('new@example.com')
    })

    it('should return null if user not found after update', async () => {
      mockUpdateWhere.mockResolvedValue(undefined)
      mockSelectWhere.mockResolvedValue([])

      const result = await updateUser('non-existent', { name: 'Test' })

      expect(result).toBeNull()
    })
  })
})
