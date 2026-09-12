import { useRef, useState, type ChangeEvent } from 'react'
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { uploadHoldings, type UploadResponse } from '../api'

interface CsvUploaderProps {
  onUploadComplete?: (data: UploadResponse) => void
}

export default function CsvUploader({ onUploadComplete }: CsvUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rejected, setRejected] = useState<UploadResponse['rejected']>([])
  const [success, setSuccess] = useState('')

  function clearMessages() {
    setError('')
    setSuccess('')
    setRejected([])
  }

  // Cleared here as well as on selection: cancelling the file dialog fires no
  // change event, which would otherwise leave the previous result on screen.
  function openFilePicker() {
    clearMessages()
    setFileName('')
    inputRef.current?.click()
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    clearMessages()
    setFileName(file.name)

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Only CSV files are allowed.')
      return
    }

    setLoading(true)
    try {
      const data = await uploadHoldings(file)
      // Bad rows are flagged and skipped, not treated as a reason to fail
      // the whole upload — every valid row still gets loaded.
      setSuccess(
        data.rejected.length > 0
          ? `Loaded ${data.inserted} row(s) from ${file.name}. ${data.rejected.length} row(s) were skipped — see below.`
          : `Uploaded ${data.inserted} rows from ${file.name}.`
      )
      setRejected(data.rejected)
      onUploadComplete?.(data)
    } catch (err) {
      const failure = err as Error & { rejected?: UploadResponse['rejected'] }
      setError(failure.message)
      setRejected(failure.rejected ?? [])
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
        <div className="mb-4 rounded-lg border border-red-900/50 bg-red-950/50 p-4 text-sm text-red-300">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Upload failed</p>
              <p className="mt-0.5 text-red-400">{error}</p>
            </div>
          </div>
          <p className="mt-3 border-t border-red-900/50 pt-3 text-xs text-red-400/80">
            Your existing holdings are unchanged.
          </p>
        </div>
      )}

      {success && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-emerald-900/50 bg-emerald-950/50 p-4 text-sm text-emerald-300">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Upload complete</p>
            <p className="mt-0.5 text-emerald-400">{success}</p>
          </div>
        </div>
      )}

      {rejected.length > 0 && (
        <div className="mb-4 rounded-lg border border-amber-900/50 bg-amber-950/40 p-4 text-sm text-amber-300">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <p className="font-medium">{rejected.length} row(s) flagged and skipped</p>
          </div>
          <ul className="mt-2 space-y-1 border-t border-amber-900/50 pt-2 font-mono text-xs text-amber-400">
            {rejected.map((item) => (
              <li key={`${item.row}-${item.reason}`}>
                Row {item.row}: {item.reason}
              </li>
            ))}
          </ul>
        </div>
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
          onClick={openFilePicker}
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
