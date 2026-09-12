export interface AuthUser {
  email: string
  tenantId: number
  tenantName: string
}

export interface SummaryData {
  byAssetClass: Array<{ assetClass: string; marketValue: number }>
  periodReturn: number | null
  startDate: string | null
  endDate: string | null
}

export interface HoldingRow {
  date: string
  ticker: string
  assetClass: string
  quantity: number
  price: number
}

export interface UploadResponse {
  inserted: number
  rejected: Array<{ row: number; reason: string }>
  rows?: HoldingRow[]
  error?: string
}

const UNREACHABLE = 'Cannot reach the API. Is it running? Try: docker compose up -d'

export function getToken() {
  return localStorage.getItem('token')
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem('user')
  return raw ? (JSON.parse(raw) as AuthUser) : null
}

export function clearSession() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

async function request(url: string, options: RequestInit = {}) {
  let response: Response
  try {
    response = await fetch(url, options)
  } catch {
    throw new Error(UNREACHABLE)
  }

  const text = await response.text()
  let data: Record<string, unknown> = {}
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      throw new Error(UNREACHABLE)
    }
  }

  // The dev proxy answers with an empty 5xx when nothing is listening on the
  // API port, which is indistinguishable from a real server error by status alone.
  if (!response.ok && !data.error && response.status >= 500) {
    throw new Error(UNREACHABLE)
  }

  return { response, data }
}

export async function login(email: string, password: string) {
  const { response, data } = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) throw new Error((data.error as string) || 'Login failed.')

  localStorage.setItem('token', data.token as string)
  localStorage.setItem('user', JSON.stringify(data.user))
  return data.user as AuthUser
}

export async function fetchSummary(): Promise<SummaryData> {
  const { response, data } = await request('/api/holdings/summary', {
    headers: { Authorization: `Bearer ${getToken()}` },
  })

  if (!response.ok) {
    throw new Error((data.error as string) || 'Could not load portfolio data.')
  }
  return data as unknown as SummaryData
}

export async function uploadHoldings(file: File): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const { response, data } = await request('/api/holdings/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  })

  if (!response.ok) {
    const error = new Error((data.error as string) || 'Upload failed.') as Error & {
      rejected?: UploadResponse['rejected']
    }
    error.rejected = data.rejected as UploadResponse['rejected']
    throw error
  }

  return data as unknown as UploadResponse
}
