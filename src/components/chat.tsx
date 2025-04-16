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
  const { data: conversationMessages, error: messagesError } = useQuery({
    ...conversationMessagesQueryOptions(conversationId || ''),
    enabled: !!conversationId,
  })

  const [activeTab, setActiveTab] = useState('chat')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const { streamedText, isStreaming, startStream } = useChatStream()

  useEffect(() => {
    if (messagesError) {
      toast.error('Failed to load conversation history.')
    }
  }, [messagesError])

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages, streamedText])

  useEffect(() => {
    if (conversationMessages && conversationMessages.length > 0) {
      const sortedMessages = [...conversationMessages]
        .sort(
          (a, b) =>
            new Date(a.created_at!).getTime() -
            new Date(b.created_at!).getTime(),
        )
        .slice(-20)
      setMessages(sortedMessages)
    }
  }, [conversationMessages])

  const handleRetry = () => {
    if (retryCount < 3) {
      setRetryCount((prev) => prev + 1)
      sendMessage(true)
    } else {
      toast.error('Too many retry attempts.')
      setRetryCount(0)
    }
  }

  const sendMessage = async (isRetry = false) => {
    const currentInput = input.trim()
    if (!currentInput && !isRetry) return

    const updatedMessages = isRetry
      ? [...messages]
      : [...messages, { role: 'user', content: currentInput }]

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
        const markdown = formatToMarkdown(finalText)

        // Ensure role is 'assistant'
        const updated: Message[] = [
          ...updatedMessages,
          { role: 'assistant', content: markdown },
        ]
        setMessages(updated)
        setRetryCount(0)

        const convoId = conversationId || 'new'
        sessionStorage.setItem(
          `conversation-${convoId}`,
          JSON.stringify(updated),
        )
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

  const hasContent = messages.length > 0 || streamedText || isLoading

  return (
    <div className="flex flex-1 bg-black">
      <main className="h-screen flex flex-1 flex-col">
        <nav className="h-[60px] flex justify-center items-center gap-x-2 border-b border-white/10">
          {['Search', 'Chat', 'Research'].map((label) => (
            <NavButton
              key={label}
              label={label}
              isActive={activeTab === label.toLowerCase()}
              onClick={() => setActiveTab(label.toLowerCase())}
            />
          ))}
        </nav>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col">
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto">
              <div className="flex flex-col items-center pt-4">
                <div className="w-full max-w-5xl px-4 flex flex-col gap-4">
                  {messages.map((msg, i) => (
                    <MessageItem key={i} message={msg} />
                  ))}
                  {streamedText && (
                    <div className="p-4 rounded-lg text-white">
                      <MarkdownMessage
                        content={formatToMarkdown(streamedText)}
                      />
                    </div>
                  )}
                  {isLoading && !streamedText && (
                    <div className="flex justify-center my-2">
                      <div className="animate-pulse flex space-x-2">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className="h-2 w-2 bg-gray-500 rounded-full"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-4 sm:px-6 pb-4 max-w-5xl mx-auto w-full">
              <div className="bg-[#181A19] w-full rounded-xl p-2 flex flex-col border border-white/10">
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
                    disabled={isLoading}
                  />
                  <img
                    src="/mic-01.svg"
                    alt="mic"
                    className="absolute right-[16px] top-1/2 transform -translate-y-1/2 w-7 h-7 cursor-pointer"
                  />
                </form>
                <div className="flex items-center justify-between px-4 gap-x-4 pb-2 pt-3">
                  <div className="flex gap-x-4 text-[#757575] text-[12px]">
                    {[FaPlus, LuAudioWaveform, MdOutlineComputer].map(
                      (Icon, i) => (
                        <InputActionButton
                          key={i}
                          icon={<Icon />}
                          label={['Attach', 'Voice', 'Screen'][i]}
                        />
                      ),
                    )}
                  </div>
                  <div className="flex items-center gap-x-2">
                    <Switch />
                    <h4 className="text-[12px] font-medium text-white">
                      Model Selection
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

const NavButton = ({
  label,
  isActive,
  onClick,
}: {
  label: string
  isActive: boolean
  onClick: () => void
}) => (
  <button
    className={cn(
      'rounded-full w-[120px] font-urbanist font-semibold text-[16px] h-[42px] transition-colors',
      isActive
        ? 'border-[#FEFF1F] border text-[#FEFF1F]'
        : 'text-white hover:border-[#FEFF1F] hover:text-[#FEFF1F]',
    )}
    onClick={onClick}
  >
    {label}
  </button>
)

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
