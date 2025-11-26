import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, PATCH } from './route'

// Mock the auth module
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: new Date(),
}

vi.mock('@/lib/auth', () => ({
  getOrCreateLocalUser: vi.fn().mockResolvedValue({
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date(),
  }),
  updateUser: vi.fn().mockImplementation((id, data) =>
    Promise.resolve({
      ...mockUser,
      ...data,
    })
  ),
}))

describe('Users Me API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/users/me', () => {
    it('should return current user', async () => {
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.id).toBe('user-123')
      expect(data.data.email).toBe('test@example.com')
      expect(data.data.name).toBe('Test User')
    })

    it('should handle errors when getting user', async () => {
      const { getOrCreateLocalUser } = await import('@/lib/auth')
      vi.mocked(getOrCreateLocalUser).mockRejectedValueOnce(new Error('Auth error'))

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error.code).toBe('USER_ERROR')
    })
  })

  describe('PATCH /api/users/me', () => {
    it('should update user name', async () => {
      const request = new Request('http://localhost/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Updated Name' }),
      })

      const response = await PATCH(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.name).toBe('Updated Name')
    })

    it('should update user email', async () => {
      const request = new Request('http://localhost/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'newemail@example.com' }),
      })

      const response = await PATCH(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.email).toBe('newemail@example.com')
    })

    it('should update both name and email', async () => {
      const request = new Request('http://localhost/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New Name',
          email: 'new@example.com',
        }),
      })

      const response = await PATCH(request)
      const data = await response.json()

      expect(data.data.name).toBe('New Name')
      expect(data.data.email).toBe('new@example.com')
    })

    it('should handle errors when updating user', async () => {
      const { updateUser } = await import('@/lib/auth')
      vi.mocked(updateUser).mockRejectedValueOnce(new Error('Update error'))

      const request = new Request('http://localhost/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test' }),
      })

      const response = await PATCH(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error.code).toBe('UPDATE_ERROR')
    })
  })
})
