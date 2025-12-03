import { describe, it, expect, vi, beforeEach } from 'vitest'

// Create mock functions
const mockJobsSelectWhere = vi.fn()
const mockApplicationsSelectWhere = vi.fn()
const mockDeleteWhere = vi.fn()
let selectCallCount = 0

// Mock the database module
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn((_table) => ({
        where: vi.fn((condition) => {
          // Determine which mock to use based on call order
          // First call is for jobs, second call (if any) is for applications
          selectCallCount++
          if (selectCallCount % 2 === 1) {
            return mockJobsSelectWhere(condition)
          }
          // For applications, we need to chain .limit()
          return {
            limit: vi.fn(() => mockApplicationsSelectWhere(condition)),
          }
        }),
      })),
    })),
    delete: vi.fn(() => ({
      where: mockDeleteWhere,
    })),
  },
  jobs: { id: 'id' },
  applications: { jobId: 'jobId' },
}))

// Import after mocking
import { GET, DELETE } from './route'

describe('Jobs [id] API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockJobsSelectWhere.mockReset()
    mockApplicationsSelectWhere.mockReset()
    mockDeleteWhere.mockReset()
    selectCallCount = 0
  })

  describe('GET /api/jobs/:id', () => {
    it('should return a job when found', async () => {
      const mockJob = { id: 'job-1', title: 'Software Engineer', platform: 'linkedin' }
      mockJobsSelectWhere.mockResolvedValue([mockJob])

      const request = new Request('http://localhost/api/jobs/job-1')
      const params = Promise.resolve({ id: 'job-1' })
      const response = await GET(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockJob)
    })

    it('should return 404 when job not found', async () => {
      mockJobsSelectWhere.mockResolvedValue([])

      const request = new Request('http://localhost/api/jobs/non-existent')
      const params = Promise.resolve({ id: 'non-existent' })
      const response = await GET(request, { params })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('NOT_FOUND')
    })

    it('should handle database errors', async () => {
      mockJobsSelectWhere.mockRejectedValue(new Error('Database error'))

      const request = new Request('http://localhost/api/jobs/job-1')
      const params = Promise.resolve({ id: 'job-1' })
      const response = await GET(request, { params })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error.code).toBe('FETCH_ERROR')
    })
  })

  describe('DELETE /api/jobs/:id', () => {
    it('should delete a manual job with no applications', async () => {
      const mockJob = { id: 'job-1', title: 'Software Engineer', platform: 'manual' }
      mockJobsSelectWhere.mockResolvedValue([mockJob])
      mockApplicationsSelectWhere.mockResolvedValue([])
      mockDeleteWhere.mockResolvedValue(undefined)

      const request = new Request('http://localhost/api/jobs/job-1', { method: 'DELETE' })
      const params = Promise.resolve({ id: 'job-1' })
      const response = await DELETE(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.deleted).toBe(true)
    })

    it('should return 403 when trying to delete non-manual job', async () => {
      const mockJob = { id: 'job-1', title: 'Software Engineer', platform: 'linkedin' }
      mockJobsSelectWhere.mockResolvedValue([mockJob])

      const request = new Request('http://localhost/api/jobs/job-1', { method: 'DELETE' })
      const params = Promise.resolve({ id: 'job-1' })
      const response = await DELETE(request, { params })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error.code).toBe('FORBIDDEN')
    })

    it('should return 403 when job has applications', async () => {
      const mockJob = { id: 'job-1', title: 'Software Engineer', platform: 'manual' }
      mockJobsSelectWhere.mockResolvedValue([mockJob])
      mockApplicationsSelectWhere.mockResolvedValue([{ id: 'app-1' }])

      const request = new Request('http://localhost/api/jobs/job-1', { method: 'DELETE' })
      const params = Promise.resolve({ id: 'job-1' })
      const response = await DELETE(request, { params })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error.code).toBe('FORBIDDEN')
    })

    it('should return 404 when deleting non-existent job', async () => {
      mockJobsSelectWhere.mockResolvedValue([])

      const request = new Request('http://localhost/api/jobs/non-existent', { method: 'DELETE' })
      const params = Promise.resolve({ id: 'non-existent' })
      const response = await DELETE(request, { params })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error.code).toBe('NOT_FOUND')
    })

    it('should handle database errors on delete', async () => {
      const mockJob = { id: 'job-1', title: 'Software Engineer', platform: 'manual' }
      mockJobsSelectWhere.mockResolvedValue([mockJob])
      mockApplicationsSelectWhere.mockResolvedValue([])
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
