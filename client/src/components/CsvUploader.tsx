import { useRef, useState, type ChangeEvent } from 'react'

interface UploadResponse {
  inserted: number
  rejected: Array<{ row: number; reason: string }>
}

interface CsvUploaderProps {
  onUploadComplete?: (data: UploadResponse) => void
}

export default function CsvUploader({ onUploadComplete }: CsvUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setError('')
    setSuccess('')
    setFileName(file.name)

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Only CSV files are allowed.')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/holdings/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed (${response.status} ${response.statusText})`)
      }

      const data: UploadResponse = await response.json()

      if (data.rejected.length > 0) {
        setError(`Upload rejected: ${data.rejected.length} invalid row(s) found.`)
      } else {
        setSuccess(`Uploaded ${data.inserted} rows from ${file.name}.`)
      }

      onUploadComplete?.(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-slate-400">
        Upload Portfolio
      </h2>

      {error && (
        <p className="mb-4 rounded-lg border border-red-900/50 bg-red-950/50 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      {success && (
        <p className="mb-4 rounded-lg border border-emerald-900/50 bg-emerald-950/50 px-3 py-2 text-sm text-emerald-300">
          {success}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="rounded-full bg-teal-500 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-teal-400 disabled:cursor-not-allowed disabled:bg-slate-600"
        >
          {loading ? 'Uploading...' : 'Upload Portfolio'}
        </button>

        {fileName && !loading && (
          <span className="font-mono text-xs text-slate-400">{fileName}</span>
        )}
      </div>
    </section>
  )
}
