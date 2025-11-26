import { describe, it, expect, vi, beforeEach } from 'vitest'

// Create mock functions
const mockSelectWhere = vi.fn()
const mockDeleteWhere = vi.fn()
const mockUpdateSetWhere = vi.fn()

// Mock the auth module
vi.mock('@/lib/auth', () => ({
  getOrCreateLocalUser: vi.fn().mockResolvedValue({
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
  }),
}))

// Mock the database module
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: mockSelectWhere,
      })),
    })),
    delete: vi.fn(() => ({
      where: mockDeleteWhere,
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: mockUpdateSetWhere,
      })),
    })),
  },
  applications: { id: 'id', userId: 'user_id' },
}))

// Import after mocking
import { GET, PATCH, DELETE } from './route'

describe('Applications [id] API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSelectWhere.mockReset()
    mockDeleteWhere.mockReset()
    mockUpdateSetWhere.mockReset()
  })

  describe('GET /api/applications/:id', () => {
    it('should return an application when found', async () => {
      const mockApplication = {
        id: 'app-1',
        jobId: 'job-1',
        status: 'applied',
        userId: 'user-123',
      }
      mockSelectWhere.mockResolvedValue([mockApplication])

      const request = new Request('http://localhost/api/applications/app-1')
      const params = Promise.resolve({ id: 'app-1' })
      const response = await GET(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockApplication)
    })

    it('should return 404 when application not found', async () => {
      mockSelectWhere.mockResolvedValue([])

      const request = new Request('http://localhost/api/applications/non-existent')
      const params = Promise.resolve({ id: 'non-existent' })
      const response = await GET(request, { params })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error.code).toBe('NOT_FOUND')
    })

    it('should handle database errors', async () => {
      mockSelectWhere.mockRejectedValue(new Error('Database error'))

      const request = new Request('http://localhost/api/applications/app-1')
      const params = Promise.resolve({ id: 'app-1' })
      const response = await GET(request, { params })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error.code).toBe('FETCH_ERROR')
    })
  })

  describe('PATCH /api/applications/:id', () => {
    it('should update an application when found', async () => {
      const existingApp = {
        id: 'app-1',
        jobId: 'job-1',
        status: 'saved',
        userId: 'user-123',
        resumeId: null,
        appliedAt: null,
        notes: null,
      }
      const updatedApp = { ...existingApp, status: 'applied' }

      mockSelectWhere
        .mockResolvedValueOnce([existingApp])
        .mockResolvedValueOnce([updatedApp])
      mockUpdateSetWhere.mockResolvedValue(undefined)

      const request = new Request('http://localhost/api/applications/app-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'applied' }),
      })
      const params = Promise.resolve({ id: 'app-1' })
      const response = await PATCH(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.status).toBe('applied')
    })

    it('should update notes field', async () => {
      const existingApp = {
        id: 'app-1',
        jobId: 'job-1',
        status: 'saved',
        userId: 'user-123',
        notes: null,
      }
      const updatedApp = { ...existingApp, notes: 'Great company!' }

      mockSelectWhere
        .mockResolvedValueOnce([existingApp])
        .mockResolvedValueOnce([updatedApp])
      mockUpdateSetWhere.mockResolvedValue(undefined)

      const request = new Request('http://localhost/api/applications/app-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: 'Great company!' }),
      })
      const params = Promise.resolve({ id: 'app-1' })
      const response = await PATCH(request, { params })
      const data = await response.json()

      expect(data.data.notes).toBe('Great company!')
    })

    it('should return 404 when updating non-existent application', async () => {
      mockSelectWhere.mockResolvedValue([])

      const request = new Request('http://localhost/api/applications/non-existent', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'applied' }),
      })
      const params = Promise.resolve({ id: 'non-existent' })
      const response = await PATCH(request, { params })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error.code).toBe('NOT_FOUND')
    })

    it('should handle database errors on update', async () => {
      mockSelectWhere.mockResolvedValue([
        { id: 'app-1', userId: 'user-123', status: 'saved' },
      ])
      mockUpdateSetWhere.mockRejectedValue(new Error('Update failed'))

      const request = new Request('http://localhost/api/applications/app-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'applied' }),
      })
      const params = Promise.resolve({ id: 'app-1' })
      const response = await PATCH(request, { params })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error.code).toBe('UPDATE_ERROR')
    })
  })

  describe('DELETE /api/applications/:id', () => {
    it('should delete an application when found', async () => {
      mockSelectWhere.mockResolvedValue([
        { id: 'app-1', userId: 'user-123' },
      ])
      mockDeleteWhere.mockResolvedValue(undefined)

      const request = new Request('http://localhost/api/applications/app-1', { method: 'DELETE' })
      const params = Promise.resolve({ id: 'app-1' })
      const response = await DELETE(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.deleted).toBe(true)
    })

    it('should return 404 when deleting non-existent application', async () => {
      mockSelectWhere.mockResolvedValue([])

      const request = new Request('http://localhost/api/applications/non-existent', {
        method: 'DELETE',
      })
      const params = Promise.resolve({ id: 'non-existent' })
      const response = await DELETE(request, { params })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error.code).toBe('NOT_FOUND')
    })

    it('should handle database errors on delete', async () => {
      mockSelectWhere.mockResolvedValue([{ id: 'app-1', userId: 'user-123' }])
      mockDeleteWhere.mockRejectedValue(new Error('Delete failed'))

      const request = new Request('http://localhost/api/applications/app-1', { method: 'DELETE' })
      const params = Promise.resolve({ id: 'app-1' })
      const response = await DELETE(request, { params })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error.code).toBe('DELETE_ERROR')
    })
  })
})
