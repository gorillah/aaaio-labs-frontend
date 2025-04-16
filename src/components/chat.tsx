import { useChatStream } from '@/hooks/use-chat-stream'
import { deviceTokenQueryOptions } from '@/lib/queries'
import { cn, formatToMarkdown, type Message } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { MarkdownMessage } from './markdown-message'
import { Textarea } from './ui/textarea'

export const Chat = ({ conversationId }: { conversationId?: string }) => {
  const { data: deviceToken } = useQuery(deviceTokenQueryOptions())
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const { streamedText, isStreaming, startStream } = useChatStream()
  const chatRef = useRef<HTMLDivElement>(null)

  const sendMessage = async () => {
    if (!input.trim()) return
    const userMsg = { role: 'user', content: input.trim() } as Message
    setMessages((prev) => [...prev, userMsg])
    setInput('')

    await startStream({
      messages: [...messages, userMsg],
      conversationId,
      deviceToken,
      onFinish: (finalText) =>
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: formatToMarkdown(finalText) },
        ]),
    })
  }

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, streamedText])

  return (
    <div className="flex flex-col flex-1">
      <div ref={chatRef} className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map((msg, i) => (
          <MessageItem key={i} message={msg} />
        ))}
        {isStreaming && (
          <MessageItem
            message={{
              role: 'assistant',
              content: streamedText,
            }}
            isStreaming
          />
        )}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          sendMessage()
        }}
        className="p-4 border-t border-white/10"
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isStreaming}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              sendMessage()
            }
          }}
          className={cn('resize-none', { 'opacity-50': isStreaming })}
        />
      </form>
    </div>
  )
}

const MessageItem = ({
  message,
  isStreaming,
}: {
  message: Message
  isStreaming?: boolean
}) => (
  <div
    className={cn(
      'px-5 py-3 rounded-lg text-white',
      message.role === 'user'
        ? 'bg-[#FEFF1F08] text-right rounded-full w-fit ml-auto'
        : '',
    )}
  >
    <MarkdownMessage content={message.content} />
    {isStreaming && <span className="ml-2 animate-pulse">▌</span>}
  </div>
)
