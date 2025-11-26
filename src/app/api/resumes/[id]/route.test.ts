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
  resumes: { id: 'id', userId: 'user_id' },
}))

// Import after mocking
import { GET, PATCH, DELETE } from './route'

describe('Resumes [id] API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSelectWhere.mockReset()
    mockDeleteWhere.mockReset()
    mockUpdateSetWhere.mockReset()
  })

  describe('GET /api/resumes/:id', () => {
    it('should return a resume when found and owned by user', async () => {
      const mockResume = {
        id: 'resume-1',
        name: 'My Resume',
        content: {},
        userId: 'user-123',
      }
      mockSelectWhere.mockResolvedValue([mockResume])

      const request = new Request('http://localhost/api/resumes/resume-1')
      const params = Promise.resolve({ id: 'resume-1' })
      const response = await GET(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockResume)
    })

    it('should return 404 when resume not found', async () => {
      mockSelectWhere.mockResolvedValue([])

      const request = new Request('http://localhost/api/resumes/non-existent')
      const params = Promise.resolve({ id: 'non-existent' })
      const response = await GET(request, { params })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error.code).toBe('NOT_FOUND')
    })

    it('should handle database errors', async () => {
      mockSelectWhere.mockRejectedValue(new Error('Database error'))

      const request = new Request('http://localhost/api/resumes/resume-1')
      const params = Promise.resolve({ id: 'resume-1' })
      const response = await GET(request, { params })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error.code).toBe('FETCH_ERROR')
    })
  })

  describe('PATCH /api/resumes/:id', () => {
    it('should update a resume when found', async () => {
      const existingResume = {
        id: 'resume-1',
        name: 'Old Name',
        content: {},
        userId: 'user-123',
        isMaster: false,
        templateId: null,
      }
      const updatedResume = { ...existingResume, name: 'New Name' }

      // First call checks existence, second returns updated data
      mockSelectWhere
        .mockResolvedValueOnce([existingResume])
        .mockResolvedValueOnce([updatedResume])
      mockUpdateSetWhere.mockResolvedValue(undefined)

      const request = new Request('http://localhost/api/resumes/resume-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Name' }),
      })
      const params = Promise.resolve({ id: 'resume-1' })
      const response = await PATCH(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.name).toBe('New Name')
    })

    it('should return 404 when updating non-existent resume', async () => {
      mockSelectWhere.mockResolvedValue([])

      const request = new Request('http://localhost/api/resumes/non-existent', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Name' }),
      })
      const params = Promise.resolve({ id: 'non-existent' })
      const response = await PATCH(request, { params })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error.code).toBe('NOT_FOUND')
    })

    it('should handle database errors on update', async () => {
      mockSelectWhere.mockResolvedValue([
        { id: 'resume-1', name: 'Test', userId: 'user-123' },
      ])
      mockUpdateSetWhere.mockRejectedValue(new Error('Update failed'))

      const request = new Request('http://localhost/api/resumes/resume-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Name' }),
      })
      const params = Promise.resolve({ id: 'resume-1' })
      const response = await PATCH(request, { params })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error.code).toBe('UPDATE_ERROR')
    })
  })

  describe('DELETE /api/resumes/:id', () => {
    it('should delete a resume when found', async () => {
      mockSelectWhere.mockResolvedValue([
        { id: 'resume-1', userId: 'user-123' },
      ])
      mockDeleteWhere.mockResolvedValue(undefined)

      const request = new Request('http://localhost/api/resumes/resume-1', { method: 'DELETE' })
      const params = Promise.resolve({ id: 'resume-1' })
      const response = await DELETE(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.deleted).toBe(true)
    })

    it('should return 404 when deleting non-existent resume', async () => {
      mockSelectWhere.mockResolvedValue([])

      const request = new Request('http://localhost/api/resumes/non-existent', { method: 'DELETE' })
      const params = Promise.resolve({ id: 'non-existent' })
      const response = await DELETE(request, { params })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error.code).toBe('NOT_FOUND')
    })

    it('should handle database errors on delete', async () => {
      mockSelectWhere.mockResolvedValue([{ id: 'resume-1', userId: 'user-123' }])
      mockDeleteWhere.mockRejectedValue(new Error('Delete failed'))

      const request = new Request('http://localhost/api/resumes/resume-1', { method: 'DELETE' })
      const params = Promise.resolve({ id: 'resume-1' })
      const response = await DELETE(request, { params })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error.code).toBe('DELETE_ERROR')
    })
  })
})
