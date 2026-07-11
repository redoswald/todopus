import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Copy, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'

export const MCP_CONNECTOR_URL = 'https://intend-mcp.vercel.app/api/mcp'

const EXAMPLE_ASKS = [
  'Plan my day — what should I focus on?',
  'Add "book dentist appointment" for next Tuesday',
  "What's overdue, and what can we reschedule?",
  'Break down my "Kitchen remodel" project into next steps',
]

export function ConnectPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-50 via-white to-accent-50">
      <div className="max-w-3xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex p-3 rounded-2xl bg-accent-50 text-accent-500 mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
            Connect Intend to <span className="text-accent-500">your AI</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed max-w-xl mx-auto">
            Intend has no chatbot of its own — instead, it plugs into the AI you
            already use. Connect once and your assistant can see, plan, and manage
            your tasks with you.
          </p>
        </div>

        {/* Connector URL */}
        <div className="mb-10">
          <p className="text-sm font-medium text-gray-700 mb-2 text-center">
            Your connector URL
          </p>
          <CopyUrlBox />
        </div>

        {/* Steps */}
        <div className="space-y-6">
          <Step n={1} title="Have an Intend account">
            <p>
              Sign in to Intend — with Google or email — and that same account
              is what you'll approve access with.{' '}
              {user ? (
                <span className="text-accent-600 font-medium">
                  You're signed in and ready. ✓
                </span>
              ) : (
                <Link to="/signup" className="text-accent-600 font-medium hover:underline">
                  Create your account first →
                </Link>
              )}
            </p>
          </Step>

          <Step n={2} title="Add the connector in your AI">
            <div className="space-y-4">
              <div>
                <p className="font-medium text-gray-800 mb-1">Claude (claude.ai, desktop, or mobile)</p>
                <p>
                  Go to <span className="font-medium">Settings → Connectors → Add custom connector</span>,
                  paste the URL above, and click Add. Then enable it in any chat
                  from the <span className="font-medium">+</span> menu.
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-800 mb-1">Other assistants</p>
                <p>
                  Any client that supports remote MCP connectors works — look for
                  "connectors," "integrations," or "MCP servers" in its settings
                  and paste the same URL.
                </p>
              </div>
            </div>
          </Step>

          <Step n={3} title="Approve access">
            <p>
              Your AI will open an Intend authorization page. Sign in with the
              same account and click <span className="font-medium">Approve</span>.
              That's it — your assistant only ever sees <em>your</em> tasks, and
              you can revoke access from your AI's connector settings anytime.
            </p>
          </Step>
        </div>

        {/* Try it */}
        <div className="mt-12 border border-gray-200 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-3">Then try asking</h2>
          <ul className="space-y-2">
            {EXAMPLE_ASKS.map((ask) => (
              <li key={ask} className="flex items-start gap-2 text-sm text-gray-600">
                <Check className="w-4 h-4 text-accent-500 mt-0.5 flex-shrink-0" />
                <span>"{ask}"</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-gray-500">
            Tip: in Claude, the connector also adds ready-made prompts — look for{' '}
            <span className="font-medium">Plan my day</span>,{' '}
            <span className="font-medium">Portfolio review</span>, and{' '}
            <span className="font-medium">Break down a project</span> in the + menu.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <Link to={user ? '/inbox' : '/'} className="text-sm text-gray-500 hover:text-accent-600">
            ← Back to Intend
          </Link>
        </div>
      </div>
    </div>
  )
}

function CopyUrlBox() {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(MCP_CONNECTOR_URL)
      setCopied(true)
      toast.success('Connector URL copied')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not copy — select the URL manually')
    }
  }

  return (
    <div className="flex items-center gap-2 max-w-xl mx-auto">
      <code className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 overflow-x-auto whitespace-nowrap shadow-sm">
        {MCP_CONNECTOR_URL}
      </code>
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 px-4 py-3 bg-accent-500 text-white text-sm font-medium rounded-xl hover:bg-accent-600 transition-colors flex-shrink-0"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-200 rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="w-8 h-8 rounded-full bg-accent-500 text-white flex items-center justify-center font-semibold flex-shrink-0">
          {n}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-gray-900 mb-2">{title}</h2>
          <div className="text-sm text-gray-600 leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  )
}
