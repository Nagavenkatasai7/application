import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from './route'

// Mock the auth module
vi.mock('@/lib/auth', () => ({
  getOrCreateLocalUser: vi.fn().mockResolvedValue({
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
  }),
}))

// Create mock functions for chained calls
const mockOrderBy = vi.fn()
const mockValues = vi.fn()

// Mock the database module
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: mockOrderBy,
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: mockValues,
    })),
  },
  applications: { id: 'id', userId: 'user_id', status: 'status', createdAt: 'created_at' },
}))

// Mock uuid
vi.mock('uuid', () => ({
  v4: () => 'app-uuid-123',
}))

describe('Applications API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/applications', () => {
    it('should return all applications for current user', async () => {
      const mockApplications = [
        { id: 'app-1', jobId: 'job-1', status: 'saved', userId: 'user-123' },
        { id: 'app-2', jobId: 'job-2', status: 'applied', userId: 'user-123' },
      ]

      mockOrderBy.mockResolvedValue(mockApplications)

      const request = new Request('http://localhost/api/applications')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockApplications)
      expect(data.meta.total).toBe(2)
    })

    it('should filter by status when provided', async () => {
      const allApplications = [
        { id: 'app-1', jobId: 'job-1', status: 'saved', userId: 'user-123' },
        { id: 'app-2', jobId: 'job-2', status: 'applied', userId: 'user-123' },
        { id: 'app-3', jobId: 'job-3', status: 'saved', userId: 'user-123' },
      ]

      mockOrderBy.mockResolvedValue(allApplications)

      const request = new Request('http://localhost/api/applications?status=saved')
      const response = await GET(request)
      const data = await response.json()

      expect(data.data.length).toBe(2)
      expect(data.data.every((app: { status: string }) => app.status === 'saved')).toBe(true)
    })

    it('should return empty array when no applications exist', async () => {
      mockOrderBy.mockResolvedValue([])

      const request = new Request('http://localhost/api/applications')
      const response = await GET(request)
      const data = await response.json()

      expect(data.data).toEqual([])
      expect(data.meta.total).toBe(0)
    })

    it('should handle database errors', async () => {
      mockOrderBy.mockRejectedValue(new Error('DB error'))

      const request = new Request('http://localhost/api/applications')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error.code).toBe('FETCH_ERROR')
    })
  })

  describe('POST /api/applications', () => {
    it('should create a new application with jobId', async () => {
      mockValues.mockResolvedValue(undefined)

      const request = new Request('http://localhost/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: 'job-123',
          resumeId: 'resume-1',
          status: 'applied',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.id).toBe('app-uuid-123')
      expect(data.data.jobId).toBe('job-123')
      expect(data.data.status).toBe('applied')
    })

    it('should use default status when not provided', async () => {
      mockValues.mockResolvedValue(undefined)

      const request = new Request('http://localhost/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: 'job-123' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.data.status).toBe('saved')
    })

    it('should return 400 when jobId is missing', async () => {
      const request = new Request('http://localhost/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error.code).toBe('VALIDATION_ERROR')
      expect(data.error.message).toBe('jobId is required')
    })

    it('should handle database errors on create', async () => {
      mockValues.mockRejectedValue(new Error('Insert failed'))

      const request = new Request('http://localhost/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: 'job-123' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error.code).toBe('CREATE_ERROR')
    })
  })
})
