import { Chat } from '@/components/chat'
import { createFileRoute } from '@tanstack/react-router'

// Root index route - starts a new conversation
export const Route = createFileRoute('/_index/')({
  component: IndexRoute,
})

function IndexRoute() {
  return <Chat />
}
