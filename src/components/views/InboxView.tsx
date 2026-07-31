import { useState } from 'react'
import { Inbox } from 'lucide-react'
import { MainPanel } from '@/components/layout/MainPanel'
import { TaskList } from '@/components/tasks/TaskList'
import { TaskEditor } from '@/components/tasks/TaskEditor'
import { EmptyState } from '@/components/shared/EmptyState'
import { TaskListSkeleton } from '@/components/shared/skeletons'
import { useTasks } from '@/hooks/useTasks'
import { useAddTaskParam } from '@/hooks/useAddTaskParam'
import type { Task } from '@/types'

export function InboxView() {
  const { data: tasks = [], isLoading } = useTasks({ inbox: true })
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showAddTask, setShowAddTask] = useState(false)
  useAddTaskParam(() => setShowAddTask(true))

  return (
    <MainPanel title="Inbox">
      <div className="max-w-2xl mx-auto">
        {isLoading ? (
          <TaskListSkeleton />
        ) : tasks.length === 0 && !showAddTask ? (
          <EmptyState
            icon={Inbox}
            title="Inbox zero"
            description="New tasks without a project land here. Capture a thought now and sort it later."
            action={{ label: 'Add task', onClick: () => setShowAddTask(true) }}
          />
        ) : (
          <>
            <TaskList
              tasks={tasks}
              onTaskClick={(task) => setEditingTask(task)}
              emptyMessage="Your inbox is empty"
              editingTask={editingTask}
              onEditClose={() => setEditingTask(null)}
            />

            {!showAddTask ? (
              <button
                onClick={() => setShowAddTask(true)}
                className="mt-4 flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-accent-600 transition-colors"
              >
                <PlusIcon />
                <span>Add task</span>
              </button>
            ) : (
              <div className="mt-4">
                <TaskEditor
                  onClose={() => setShowAddTask(false)}
                />
              </div>
            )}
          </>
        )}
      </div>
    </MainPanel>
  )
}

function PlusIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  )
}
