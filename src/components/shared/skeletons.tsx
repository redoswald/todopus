import { Skeleton } from '@/components/ui/skeleton'

// Cycle of title widths so skeleton rows read as real content, not stripes
const TITLE_WIDTHS = ['w-2/3', 'w-1/2', 'w-3/4', 'w-2/5', 'w-3/5']

export function TaskListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-1" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 px-3 py-2">
          <Skeleton className="mt-0.5 w-5 h-5 rounded-full flex-shrink-0" />
          <div className="flex-1 min-w-0 py-1">
            <Skeleton className={`h-3.5 ${TITLE_WIDTHS[i % TITLE_WIDTHS.length]}`} />
          </div>
          {i % 2 === 0 && <Skeleton className="h-4 w-12 rounded" />}
        </div>
      ))}
    </div>
  )
}

export function ProjectHeaderSkeleton() {
  return (
    <div className="mb-8 border border-gray-200 rounded-lg overflow-hidden" aria-hidden="true">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <Skeleton className="h-6 w-48 mb-3" />
        <Skeleton className="h-3.5 w-full mb-2" />
        <Skeleton className="h-3.5 w-5/6" />
      </div>
      <div className="p-4 bg-white">
        <Skeleton className="h-4 w-20 mb-3" />
        <Skeleton className="h-3.5 w-32" />
      </div>
    </div>
  )
}

export function ProjectListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-1" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2">
          <Skeleton className="w-2.5 h-2.5 rounded-full flex-shrink-0" />
          <Skeleton className={`h-3.5 ${TITLE_WIDTHS[i % TITLE_WIDTHS.length]}`} />
        </div>
      ))}
    </div>
  )
}

export function ProjectTreeSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-0.5" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2">
          <Skeleton className="w-2.5 h-2.5 rounded-full flex-shrink-0" />
          <Skeleton className={`h-3 ${TITLE_WIDTHS[i % TITLE_WIDTHS.length]}`} />
        </div>
      ))}
    </div>
  )
}
