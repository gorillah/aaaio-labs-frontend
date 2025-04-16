import { Chat } from '@/components/chat'
import { createFileRoute, useParams } from '@tanstack/react-router'

export const Route = createFileRoute('/_index/c/$id')({
  component: ConversationComponent,
})

function ConversationComponent() {
  const { id: conversationId } = useParams({ from: '/_index/c/$id' })

  return <Chat conversationId={conversationId} />
}
