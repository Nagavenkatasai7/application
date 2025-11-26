// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

// Mock data
const mockUser = {
  id: 'local-user',
  email: 'user@local.app',
  name: 'Local User',
  createdAt: new Date().toISOString(),
}

const mockResumes: Array<{
  id: string
  userId: string
  title: string
  type: string
  content: unknown
  createdAt: string
  updatedAt: string
}> = []

const mockJobs: Array<{
  id: string
  platform: string
  title: string
  companyName: string
  location: string
  description: string
  createdAt: string
}> = []

// API handlers
export const handlers = [
  // User endpoints
  http.get('/api/users/me', () => {
    return HttpResponse.json({
      success: true,
      data: mockUser,
    })
  }),

  http.patch('/api/users/me', async ({ request }) => {
    const body = await request.json()
    const updatedUser = { ...mockUser, ...(body as object) }
    return HttpResponse.json({
      success: true,
      data: updatedUser,
    })
  }),

  // Resume endpoints
  http.get('/api/resumes', () => {
    return HttpResponse.json({
      success: true,
      data: mockResumes,
      meta: { limit: 50, offset: 0, total: mockResumes.length },
    })
  }),

  http.post('/api/resumes', async ({ request }) => {
    const body = await request.json()
    const newResume = {
      id: `resume-${Date.now()}`,
      userId: mockUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...(body as object),
    }
    mockResumes.push(newResume as typeof mockResumes[0])
    return HttpResponse.json({ success: true, data: newResume }, { status: 201 })
  }),

  http.get('/api/resumes/:id', ({ params }) => {
    const resume = mockResumes.find((r) => r.id === params.id)
    if (!resume) {
      return HttpResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Resume not found' } },
        { status: 404 }
      )
    }
    return HttpResponse.json({ success: true, data: resume })
  }),

  http.patch('/api/resumes/:id', async ({ params, request }) => {
    const body = await request.json()
    const index = mockResumes.findIndex((r) => r.id === params.id)
    if (index === -1) {
      return HttpResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Resume not found' } },
        { status: 404 }
      )
    }
    mockResumes[index] = { ...mockResumes[index], ...(body as object), updatedAt: new Date().toISOString() }
    return HttpResponse.json({ success: true, data: mockResumes[index] })
  }),

  http.delete('/api/resumes/:id', ({ params }) => {
    const index = mockResumes.findIndex((r) => r.id === params.id)
    if (index === -1) {
      return HttpResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Resume not found' } },
        { status: 404 }
      )
    }
    mockResumes.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),

  // Job endpoints
  http.get('/api/jobs', () => {
    return HttpResponse.json({
      success: true,
      data: mockJobs,
      meta: { limit: 50, offset: 0, total: mockJobs.length },
    })
  }),

  http.post('/api/jobs', async ({ request }) => {
    const body = await request.json()
    const newJob = {
      id: `job-${Date.now()}`,
      platform: 'manual',
      createdAt: new Date().toISOString(),
      ...(body as object),
    }
    mockJobs.push(newJob as typeof mockJobs[0])
    return HttpResponse.json({ success: true, data: newJob }, { status: 201 })
  }),

  // AI generation mock (for future use)
  http.post('/api/ai/generate', async ({ request }) => {
    const { prompt } = (await request.json()) as { prompt: string }
    return HttpResponse.json({
      text: `AI-generated response for: ${prompt.slice(0, 50)}...`,
    })
  }),
]
