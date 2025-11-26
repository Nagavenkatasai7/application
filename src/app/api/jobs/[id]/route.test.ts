import { describe, it, expect, vi, beforeEach } from 'vitest'

// Create mock functions
const mockSelectWhere = vi.fn()
const mockDeleteWhere = vi.fn()

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
  },
  jobs: { id: 'id' },
}))

// Import after mocking
import { GET, DELETE } from './route'

describe('Jobs [id] API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSelectWhere.mockReset()
    mockDeleteWhere.mockReset()
  })

  describe('GET /api/jobs/:id', () => {
    it('should return a job when found', async () => {
      const mockJob = { id: 'job-1', title: 'Software Engineer', platform: 'linkedin' }
      mockSelectWhere.mockResolvedValue([mockJob])

      const request = new Request('http://localhost/api/jobs/job-1')
      const params = Promise.resolve({ id: 'job-1' })
      const response = await GET(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockJob)
    })

    it('should return 404 when job not found', async () => {
      mockSelectWhere.mockResolvedValue([])

      const request = new Request('http://localhost/api/jobs/non-existent')
      const params = Promise.resolve({ id: 'non-existent' })
      const response = await GET(request, { params })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('NOT_FOUND')
    })

    it('should handle database errors', async () => {
      mockSelectWhere.mockRejectedValue(new Error('Database error'))

      const request = new Request('http://localhost/api/jobs/job-1')
      const params = Promise.resolve({ id: 'job-1' })
      const response = await GET(request, { params })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error.code).toBe('FETCH_ERROR')
    })
  })

  describe('DELETE /api/jobs/:id', () => {
    it('should delete a job when found', async () => {
      const mockJob = { id: 'job-1', title: 'Software Engineer' }
      mockSelectWhere.mockResolvedValue([mockJob])
      mockDeleteWhere.mockResolvedValue(undefined)

      const request = new Request('http://localhost/api/jobs/job-1', { method: 'DELETE' })
      const params = Promise.resolve({ id: 'job-1' })
      const response = await DELETE(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.deleted).toBe(true)
    })

    it('should return 404 when deleting non-existent job', async () => {
      mockSelectWhere.mockResolvedValue([])

      const request = new Request('http://localhost/api/jobs/non-existent', { method: 'DELETE' })
      const params = Promise.resolve({ id: 'non-existent' })
      const response = await DELETE(request, { params })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error.code).toBe('NOT_FOUND')
    })

    it('should handle database errors on delete', async () => {
      mockSelectWhere.mockResolvedValue([{ id: 'job-1' }])
      mockDeleteWhere.mockRejectedValue(new Error('Delete failed'))

      const request = new Request('http://localhost/api/jobs/job-1', { method: 'DELETE' })
      const params = Promise.resolve({ id: 'job-1' })
      const response = await DELETE(request, { params })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error.code).toBe('DELETE_ERROR')
    })
  })
})
