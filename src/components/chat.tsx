import { useChatStream } from '@/hooks/use-chat-stream'
import {
  conversationMessagesQueryOptions,
  deviceTokenQueryOptions,
} from '@/lib/queries'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { FaPlus } from 'react-icons/fa'
import { LuAudioWaveform } from 'react-icons/lu'
import { MdOutlineComputer } from 'react-icons/md'
import { toast } from 'sonner'
import { MarkdownMessage } from './markdown-message'
import { Switch } from './ui/switch'
import { Textarea } from './ui/textarea'

export type Message = {
  id?: string
  conversation_id?: string
  user_id?: string
  content: string
  role: 'user' | 'assistant'
  created_at?: string
}

const formatToMarkdown = (text: string): string => {
  let formatted = text.trim()
  formatted = formatted.replace(/\*\*\s*Title\s*:\s*(.*?)\s*\*\*/gi, '# $1')
  formatted = formatted.replace(/([a-zA-Z0-9])([.!?])\s+(?=[A-Z])/g, '$1$2\n\n')
  formatted = formatted.replace(/\s{2,}/g, ' ')
  return formatted
}
export const Chat = ({ conversationId }: { conversationId?: string }) => {
  const { data: deviceToken } = useQuery(deviceTokenQueryOptions())
  const { data: conversationMessages } = useQuery({
    ...conversationMessagesQueryOptions(conversationId || ''),
    enabled: !!conversationId,
  })

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const { streamedText, isStreaming, startStream } = useChatStream()

  useEffect(() => {
    if (conversationMessages?.length) {
      const sorted = [...conversationMessages].sort(
        (a, b) =>
          new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime(),
      )
      setMessages(sorted.slice(-20))
    }
  }, [conversationMessages])

  const handleRetry = () => {
    retryCount < 3
      ? (setRetryCount((r) => r + 1), sendMessage(true))
      : (toast.error('Too many retry attempts.'), setRetryCount(0))
  }

  const sendMessage = async (isRetry = false) => {
    const currentInput = input.trim()
    if (!currentInput && !isRetry) return

    const userMessage = { role: 'user' as const, content: currentInput }
    const updatedMessages = isRetry ? [...messages] : [...messages, userMessage]

    if (!isRetry) {
      setMessages(updatedMessages)
      setInput('')
    }

    setIsLoading(true)

    await startStream({
      messages: updatedMessages,
      deviceToken,
      conversationId,
      onFinish: (finalText) => {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: formatToMarkdown(finalText) },
        ])
        setRetryCount(0)
        setIsLoading(false)
      },
      onError: (e) => {
        toast.error(`Stream failed: ${e.message}`, {
          action: { label: 'Retry', onClick: handleRetry },
        })
        if (!isRetry) setMessages((prev) => prev.slice(0, -1))
        setIsLoading(false)
      },
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
    })
  }, [messages, streamedText])

  return (
    <div className="flex flex-1 bg-black">
      <section className="flex flex-col flex-1 overflow-hidden">
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-4 pt-4"
        >
          <div className="max-w-5xl mx-auto space-y-4">
            {messages.map((msg, i) => (
              <MessageItem key={i} message={msg} />
            ))}
            {streamedText && (
              <div className="p-4 rounded-lg text-white">
                <MarkdownMessage content={formatToMarkdown(streamedText)} />
              </div>
            )}
            {isLoading && !streamedText && (
              <div className="flex justify-center my-2">
                <div className="animate-pulse flex space-x-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-2 w-2 bg-gray-500 rounded-full" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <footer className="w-full max-w-5xl mx-auto px-4 sm:px-6 pb-4">
          <div className="bg-[#181A19] rounded-xl p-2 border border-white/10">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                sendMessage()
              }}
              className="relative"
            >
              <Textarea
                ref={textareaRef}
                placeholder="Ask Anything..."
                autoFocus
                className="resize-none max-h-[200px] min-h-[50px] overflow-y-auto"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isStreaming}
              />
              <img
                src="/mic-01.svg"
                alt="mic"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 cursor-pointer"
              />
            </form>

            <div className="flex items-center justify-between px-4 pt-3">
              <div className="flex gap-x-4 text-[#757575] text-xs">
                {[
                  { Icon: FaPlus, label: 'Attach' },
                  { Icon: LuAudioWaveform, label: 'Voice' },
                  { Icon: MdOutlineComputer, label: 'Screen' },
                ].map(({ Icon, label }, i) => (
                  <InputActionButton key={i} icon={<Icon />} label={label} />
                ))}
              </div>
              <div className="flex items-center gap-x-2">
                <Switch />
                <h4 className="text-xs font-medium text-white">
                  Model Selection
                </h4>
              </div>
            </div>
          </div>
        </footer>
      </section>
    </div>
  )
}

const MessageItem = ({ message }: { message: Message }) => (
  <div
    className={cn(
      'px-5 py-3 rounded-lg text-white',
      message.role === 'user'
        ? 'ml-auto w-fit text-right rounded-full border border-white/10 bg-[#FEFF1F08]'
        : 'mr-4',
    )}
  >
    <MarkdownMessage content={message.content} />
  </div>
)

const InputActionButton = ({
  icon,
  label,
}: {
  icon: React.ReactNode
  label: string
}) => (
  <div className="flex items-center gap-x-1 cursor-pointer hover:text-white">
    {icon}
    {label}
  </div>
)
