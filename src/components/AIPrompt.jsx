import { useState } from 'react'
import { Sparkles, ArrowUp } from 'lucide-react'
import { useToast } from './Toast'

/**
 * The hero AI assistant input on the Home page. UI-only for now — the submit
 * handler is a placeholder until the assistant backend is wired up.
 */
export default function AIPrompt() {
  const [value, setValue] = useState('')
  const toast = useToast()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!value.trim()) return
    // TODO: AI integration — send `value` to the assistant endpoint and
    // stream the response here. For now we just acknowledge the input.
    console.log('[AI prompt]', value)
    toast('Fitur AI segera hadir ✨')
    setValue('')
  }

  return (
    // Gradient halo ring + glow around the glass form (see .ai-halo).
    <div className="ai-halo rounded-2xl">
      <form
        onSubmit={handleSubmit}
        className="glass flex items-center gap-2 rounded-[calc(1rem-1.5px)] border-0 px-3.5 py-3"
      >
        <Sparkles size={18} strokeWidth={1.75} className="shrink-0 text-brand" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Apa yang bisa kubantu hari ini?"
        className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none dark:text-ink-dark"
        aria-label="Tanya asisten AI"
      />
      <button
        type="submit"
        aria-label="Kirim"
        disabled={!value.trim()}
        className="bg-brand flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-opacity disabled:opacity-30"
        >
          <ArrowUp size={16} strokeWidth={2.25} />
        </button>
      </form>
    </div>
  )
}
