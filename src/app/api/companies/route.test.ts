import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from './route'

// Create mock functions for chained calls
const mockOffset = vi.fn()
const mockValues = vi.fn()

// Mock the database module
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        orderBy: vi.fn(() => ({
          limit: vi.fn(() => ({
            offset: mockOffset,
          })),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: mockValues,
    })),
  },
  companies: { id: 'id', cachedAt: 'cached_at' },
}))

// Mock uuid
vi.mock('uuid', () => ({
  v4: () => 'company-uuid-123',
}))

describe('Companies API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/companies', () => {
    it('should return companies with default pagination', async () => {
      const mockCompanies = [
        { id: 'company-1', name: 'Acme Corp' },
        { id: 'company-2', name: 'Tech Inc' },
      ]

      mockOffset.mockResolvedValue(mockCompanies)

      const request = new Request('http://localhost/api/companies')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockCompanies)
      expect(data.meta).toEqual({ limit: 50, offset: 0, total: 2 })
    })

    it('should handle custom pagination parameters', async () => {
      mockOffset.mockResolvedValue([])

      const request = new Request('http://localhost/api/companies?limit=25&offset=10')
      const response = await GET(request)
      const data = await response.json()

      expect(data.meta.limit).toBe(25)
      expect(data.meta.offset).toBe(10)
    })

    it('should return empty array when no companies exist', async () => {
      mockOffset.mockResolvedValue([])

      const request = new Request('http://localhost/api/companies')
      const response = await GET(request)
      const data = await response.json()

      expect(data.data).toEqual([])
      expect(data.meta.total).toBe(0)
    })

    it('should handle database errors', async () => {
      mockOffset.mockRejectedValue(new Error('Database error'))

      const request = new Request('http://localhost/api/companies')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error.code).toBe('FETCH_ERROR')
    })
  })

  describe('POST /api/companies', () => {
    it('should create a company with required name', async () => {
      mockValues.mockResolvedValue(undefined)

      const request = new Request('http://localhost/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New Company',
          glassdoorData: { rating: 4.2 },
          fundingData: { rounds: 3 },
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.id).toBe('company-uuid-123')
      expect(data.data.name).toBe('New Company')
      expect(data.data.glassdoorData).toEqual({ rating: 4.2 })
    })

    it('should return 400 when name is missing', async () => {
      const request = new Request('http://localhost/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error.code).toBe('VALIDATION_ERROR')
      expect(data.error.message).toBe('Company name is required')
    })

    it('should handle optional fields as null', async () => {
      mockValues.mockResolvedValue(undefined)

      const request = new Request('http://localhost/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Minimal Company' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.data.glassdoorData).toBeNull()
      expect(data.data.fundingData).toBeNull()
      expect(data.data.cultureSignals).toBeNull()
      expect(data.data.competitors).toBeNull()
    })

    it('should handle database errors on create', async () => {
      mockValues.mockRejectedValue(new Error('Insert failed'))

      const request = new Request('http://localhost/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test Company' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error.code).toBe('CREATE_ERROR')
    })
  })
})
