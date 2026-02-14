import { useState, useMemo } from 'react'
import { isToday, isPast, parseISO } from 'date-fns'
import { MainPanel } from '@/components/layout/MainPanel'
import { TaskList } from '@/components/tasks/TaskList'
import { TaskEditor } from '@/components/tasks/TaskEditor'
import { useTasks } from '@/hooks/useTasks'
import type { Task } from '@/types'

export function TodayView() {
  const { data: tasks = [], isLoading } = useTasks({ today: true })
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const { overdue, today } = useMemo(() => {
    const overdue: Task[] = []
    const today: Task[] = []

    tasks.forEach((task) => {
      if (!task.due_date) return

      const date = parseISO(task.due_date)
      if (isToday(date)) {
        today.push(task)
      } else if (isPast(date)) {
        overdue.push(task)
      }
    })

    return { overdue, today }
  }, [tasks])

  return (
    <MainPanel title="Today">
      <div className="max-w-2xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-500" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No tasks due today. Enjoy your day!
          </div>
        ) : (
          <div className="space-y-6">
            {overdue.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-red-600 mb-2">Overdue</h2>
                <TaskList
                  tasks={overdue}
                  showProject
                  onTaskClick={(task) => setEditingTask(task)}
                />
              </section>
            )}

            {today.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-600 mb-2">Today</h2>
                <TaskList
                  tasks={today}
                  showProject
                  onTaskClick={(task) => setEditingTask(task)}
                />
              </section>
            )}
          </div>
        )}

        {editingTask && (
          <div className="mt-4">
            <TaskEditor
              task={editingTask}
              onClose={() => setEditingTask(null)}
            />
          </div>
        )}
      </div>
    </MainPanel>
  )
}
