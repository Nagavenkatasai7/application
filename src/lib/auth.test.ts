import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock NextAuth before importing auth module
vi.mock('@/auth', () => ({
  auth: vi.fn(() => Promise.resolve(null)),
}))

import { getOrCreateLocalUser, getUserById, updateUser, getAuthUser } from './auth'

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

  describe('getAuthUser', () => {
    it('should return null when no session exists', async () => {
      const { auth } = await import('@/auth')
      vi.mocked(auth as () => Promise<null>).mockResolvedValue(null)

      const user = await getAuthUser()

      expect(user).toBeNull()
    })

    it('should return user when session exists', async () => {
      const { auth } = await import('@/auth')
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
        expires: new Date().toISOString(),
      } as unknown as Awaited<ReturnType<typeof auth>>)

      const user = await getAuthUser()

      expect(user).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      })
    })
  })

  describe('getOrCreateLocalUser (deprecated)', () => {
    it('should throw error when no session exists', async () => {
      const { auth } = await import('@/auth')
      vi.mocked(auth as () => Promise<null>).mockResolvedValue(null)

      await expect(getOrCreateLocalUser()).rejects.toThrow('Authentication required')
    })

    it('should return user when session exists', async () => {
      const { auth } = await import('@/auth')
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: null,
        image: null,
        createdAt: new Date(),
      }

      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
        expires: new Date().toISOString(),
      } as unknown as Awaited<ReturnType<typeof auth>>)

      mockSelectWhere.mockResolvedValue([mockUser])

      const user = await getOrCreateLocalUser()

      expect(user).toEqual(mockUser)
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
