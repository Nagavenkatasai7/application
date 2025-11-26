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
const mockSelectWhere = vi.fn()
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
  resumes: { id: 'id', userId: 'user_id', updatedAt: 'updated_at' },
}))

// Mock uuid
vi.mock('uuid', () => ({
  v4: () => 'resume-uuid-123',
}))

// Mock drizzle-orm
vi.mock('drizzle-orm', () => ({
  eq: vi.fn((field, value) => ({ field, value })),
  desc: vi.fn((field) => ({ field, direction: 'desc' })),
}))

describe('Resumes API Route', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    // Reset the mock implementations for each test
    const { db } = await import('@/lib/db')
    ;(db.select as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      from: vi.fn(() => ({
        where: vi.fn((condition: { value?: string } | undefined) => {
          // For POST route - returns without orderBy
          if (condition?.value === 'resume-uuid-123') {
            return mockSelectWhere()
          }
          // For GET route - returns with orderBy
          return { orderBy: mockOrderBy }
        }),
      })),
    }))
  })

  describe('GET /api/resumes', () => {
    it('should return all resumes for current user', async () => {
      const mockResumes = [
        { id: 'resume-1', name: 'Master Resume', isMaster: true, userId: 'user-123' },
        { id: 'resume-2', name: 'Job-Specific Resume', isMaster: false, userId: 'user-123' },
      ]

      mockOrderBy.mockResolvedValue(mockResumes)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockResumes)
      expect(data.meta.total).toBe(2)
    })

    it('should return empty array when user has no resumes', async () => {
      mockOrderBy.mockResolvedValue([])

      const response = await GET()
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.data).toEqual([])
      expect(data.meta.total).toBe(0)
    })

    it('should handle database errors', async () => {
      mockOrderBy.mockRejectedValue(new Error('DB error'))

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error.code).toBe('FETCH_ERROR')
    })
  })

  describe('POST /api/resumes', () => {
    it('should create a new resume with provided data', async () => {
      const mockCreatedResume = {
        id: 'resume-uuid-123',
        name: 'My Resume',
        content: { name: 'John' },
        userId: 'user-123',
        isMaster: false,
      }

      mockValues.mockResolvedValue(undefined)
      mockSelectWhere.mockResolvedValue([mockCreatedResume])

      const request = new Request('http://localhost/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'My Resume',
          content: { name: 'John' },
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.name).toBe('My Resume')
    })

    it('should use default name when not provided', async () => {
      mockValues.mockResolvedValue(undefined)
      mockSelectWhere.mockResolvedValue([
        { id: 'resume-uuid-123', name: 'Untitled Resume', userId: 'user-123' },
      ])

      const request = new Request('http://localhost/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.data.name).toBe('Untitled Resume')
    })

    it('should handle database errors on create', async () => {
      mockValues.mockRejectedValue(new Error('Insert failed'))

      const request = new Request('http://localhost/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error.code).toBe('CREATE_ERROR')
    })
  })
})
