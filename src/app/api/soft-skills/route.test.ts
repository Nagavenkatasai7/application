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
  softSkills: { id: 'id', userId: 'user_id', updatedAt: 'updated_at' },
}))

// Mock uuid
vi.mock('uuid', () => ({
  v4: () => 'skill-uuid-123',
}))

describe('Soft Skills API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/soft-skills', () => {
    it('should return all soft skills for current user', async () => {
      const mockSkills = [
        {
          id: 'skill-1',
          skillName: 'Leadership',
          evidenceScore: 4,
          userId: 'user-123',
        },
        {
          id: 'skill-2',
          skillName: 'Communication',
          evidenceScore: 5,
          userId: 'user-123',
        },
      ]

      mockOrderBy.mockResolvedValue(mockSkills)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockSkills)
      expect(data.meta.total).toBe(2)
    })

    it('should return empty array when user has no soft skills', async () => {
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

  describe('POST /api/soft-skills', () => {
    it('should create a new soft skill assessment', async () => {
      mockValues.mockResolvedValue(undefined)

      const request = new Request('http://localhost/api/soft-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillName: 'Problem Solving',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.id).toBe('skill-uuid-123')
      expect(data.data.skillName).toBe('Problem Solving')
      expect(data.data.evidenceScore).toBeNull()
      expect(data.data.conversation).toEqual([])
      expect(data.data.statement).toBeNull()
    })

    it('should return 400 when skillName is missing', async () => {
      const request = new Request('http://localhost/api/soft-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error.code).toBe('VALIDATION_ERROR')
      expect(data.error.message).toBe('skillName is required')
    })

    it('should handle database errors on create', async () => {
      mockValues.mockRejectedValue(new Error('Insert failed'))

      const request = new Request('http://localhost/api/soft-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillName: 'Leadership' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error.code).toBe('CREATE_ERROR')
    })
  })
})
