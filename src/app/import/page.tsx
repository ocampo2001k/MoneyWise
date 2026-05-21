import ImportFlow from '@/app/import/ui/ImportFlow'

export default function ImportPage() {
  return (
    <div className="mx-auto max-w-4xl w-full py-6 px-2 space-y-6">
      <header className="space-y-2">
        <h1 className="h1">Import CSV</h1>
        <p className="text-muted">Upload a Scotiabank CSV statement to bulk-import transactions.</p>
      </header>
      <ImportFlow />
    </div>
  )
}
