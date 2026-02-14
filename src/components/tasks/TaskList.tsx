import { TaskItem } from './TaskItem'
import type { Task } from '@/types'

interface TaskListProps {
  tasks: Task[]
  showProject?: boolean
  onTaskClick?: (task: Task) => void
  emptyMessage?: string
}

export function TaskList({ tasks, showProject = false, onTaskClick, emptyMessage = 'No tasks' }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-100">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          showProject={showProject}
          onClick={onTaskClick ? () => onTaskClick(task) : undefined}
        />
      ))}
    </div>
  )
}
