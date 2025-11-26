import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from './route'
import { NextResponse } from 'next/server'

// Mock the database module
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue(undefined),
  },
  jobs: { id: 'id', createdAt: 'created_at' },
}))

// Mock uuid
vi.mock('uuid', () => ({
  v4: () => 'test-uuid-123',
}))

describe('Jobs API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/jobs', () => {
    it('should return jobs with default pagination', async () => {
      const { db } = await import('@/lib/db')
      const mockJobs = [
        { id: '1', title: 'Software Engineer', platform: 'linkedin' },
        { id: '2', title: 'Product Manager', platform: 'indeed' },
      ]

      vi.mocked(db.select().from).mockReturnThis()
      vi.mocked(db.select().from().orderBy).mockReturnThis()
      vi.mocked(db.select().from().orderBy().limit).mockReturnThis()
      vi.mocked(db.select().from().orderBy().limit().offset).mockResolvedValue(mockJobs)

      const request = new Request('http://localhost/api/jobs')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockJobs)
      expect(data.meta).toEqual({ limit: 50, offset: 0, total: 2 })
    })

    it('should handle custom pagination parameters', async () => {
      const { db } = await import('@/lib/db')
      vi.mocked(db.select().from().orderBy().limit().offset).mockResolvedValue([])

      const request = new Request('http://localhost/api/jobs?limit=10&offset=5')
      const response = await GET(request)
      const data = await response.json()

      expect(data.meta.limit).toBe(10)
      expect(data.meta.offset).toBe(5)
    })

    it('should handle database errors gracefully', async () => {
      const { db } = await import('@/lib/db')
      vi.mocked(db.select().from().orderBy().limit().offset).mockRejectedValue(
        new Error('Database error')
      )

      const request = new Request('http://localhost/api/jobs')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('FETCH_ERROR')
    })
  })

  describe('POST /api/jobs', () => {
    it('should create a job with required fields', async () => {
      const { db } = await import('@/lib/db')
      vi.mocked(db.insert).mockReturnThis()
      vi.mocked(db.insert().values).mockResolvedValue(undefined)

      const request = new Request('http://localhost/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Software Engineer',
          platform: 'linkedin',
          companyName: 'Acme Corp',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.title).toBe('Software Engineer')
      expect(data.data.id).toBe('test-uuid-123')
    })

    it('should use default platform when not provided', async () => {
      const { db } = await import('@/lib/db')
      vi.mocked(db.insert().values).mockResolvedValue(undefined)

      const request = new Request('http://localhost/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Developer' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.data.platform).toBe('manual')
    })

    it('should handle database errors on create', async () => {
      const { db } = await import('@/lib/db')
      vi.mocked(db.insert().values).mockRejectedValue(new Error('Insert failed'))

      const request = new Request('http://localhost/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Developer' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error.code).toBe('CREATE_ERROR')
    })
  })
})
