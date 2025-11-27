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

// Mock the database module with leftJoin support
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        leftJoin: vi.fn(() => ({
          leftJoin: vi.fn(() => ({
            where: vi.fn(() => ({
              orderBy: mockOrderBy,
            })),
          })),
        })),
        where: vi.fn(() => ({
          orderBy: mockOrderBy,
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: mockValues,
    })),
  },
  applications: { id: 'id', userId: 'user_id', status: 'status', jobId: 'job_id', resumeId: 'resume_id', createdAt: 'created_at' },
  jobs: { id: 'id', title: 'title', companyName: 'company_name', location: 'location' },
  resumes: { id: 'id', name: 'name' },
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
      // Mock data now has flattened structure from JOIN
      const mockDbResults = [
        { id: 'app-1', jobId: 'job-1', status: 'saved', userId: 'user-123', resumeId: null, appliedAt: null, notes: null, createdAt: null, updatedAt: null, jobTitle: 'Engineer', jobCompanyName: 'Acme', jobLocation: 'Remote', resumeName: null },
        { id: 'app-2', jobId: 'job-2', status: 'applied', userId: 'user-123', resumeId: 'resume-1', appliedAt: null, notes: null, createdAt: null, updatedAt: null, jobTitle: 'Manager', jobCompanyName: 'Corp', jobLocation: 'NYC', resumeName: 'My Resume' },
      ]

      mockOrderBy.mockResolvedValue(mockDbResults)

      const request = new Request('http://localhost/api/applications')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.length).toBe(2)
      // Check that response includes nested job object
      expect(data.data[0].job.title).toBe('Engineer')
      expect(data.data[1].resume.name).toBe('My Resume')
      expect(data.meta.total).toBe(2)
    })

    it('should filter by status when provided', async () => {
      const allDbResults = [
        { id: 'app-1', jobId: 'job-1', status: 'saved', userId: 'user-123', resumeId: null, appliedAt: null, notes: null, createdAt: null, updatedAt: null, jobTitle: 'Engineer', jobCompanyName: 'Acme', jobLocation: 'Remote', resumeName: null },
        { id: 'app-2', jobId: 'job-2', status: 'applied', userId: 'user-123', resumeId: null, appliedAt: null, notes: null, createdAt: null, updatedAt: null, jobTitle: 'Manager', jobCompanyName: 'Corp', jobLocation: 'NYC', resumeName: null },
        { id: 'app-3', jobId: 'job-3', status: 'saved', userId: 'user-123', resumeId: null, appliedAt: null, notes: null, createdAt: null, updatedAt: null, jobTitle: 'Dev', jobCompanyName: 'Startup', jobLocation: 'LA', resumeName: null },
      ]

      mockOrderBy.mockResolvedValue(allDbResults)

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
