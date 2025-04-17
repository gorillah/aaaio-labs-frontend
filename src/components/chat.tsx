import { useChatStream } from '@/hooks/use-chat-stream'
import { deviceTokenQueryOptions } from '@/lib/queries'
import { cn, formatToMarkdown, type Message } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { BsSoundwave } from 'react-icons/bs'
import { MdComputer } from 'react-icons/md'
import { MarkdownMessage } from './markdown-message'
import { Switch } from './ui/switch'
import { Textarea } from './ui/textarea'

export const Chat = ({
  hasStartedChat,
  setHasStartedChat,
  firstMessage,
  setFirstMessage,
  conversationId,
}: {
  hasStartedChat: boolean
  setHasStartedChat: (value: boolean) => void
  firstMessage: string | null
  setFirstMessage: (value: string) => void
  conversationId?: string
}) => {
  const { data: deviceToken } = useQuery(deviceTokenQueryOptions())
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const { streamedText, isStreaming, startStream } = useChatStream()
  const chatRef = useRef<HTMLDivElement>(null)

  const sendMessage = async () => {
    if (!input.trim()) return

    if (!hasStartedChat) setHasStartedChat(true) // <-- first message sent

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
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages, streamedText])

  return (
    <div className="flex flex-col h-full">
      {/* Messages container with overflow-y-auto for scrolling */}
      {hasStartedChat && (
        <div
          ref={chatRef}
          className="flex-1 space-y-4 p-4 overflow-y-auto mx-auto w-full"
        >
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
      )}
      <div
        className={cn('m-auto space-y-[32px] pb-4 w-full', {
          'w-[562px] ': !hasStartedChat,
          'px-20': hasStartedChat,
        })}
      >
        {!hasStartedChat && (
          <div className="space-y-[12px]">
            <img
              src="/aaaio-logo.svg"
              alt="Logo"
              className="size-[50px] mx-auto"
            />
            <p className="text-center text-[26px] font-[700]">
              Where knowledge begins
            </p>
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            sendMessage()
          }}
          className="p-2 rounded-xl border border-white/10 bg-[#181A19]"
        >
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Anything..."
              disabled={isStreaming}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              className={cn(
                'resize-none rounded-lg bg-white/10! min-h-[50px] pr-24 placeholder:text-[16px] font-[500]',
                {
                  'opacity-50': isStreaming,
                },
              )}
            />

            {/* Right-side container */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              {/* Mic Icon */}
              <img
                src="./mic-01.svg"
                alt="Mic"
                className="size-7 cursor-pointer"
              />

              {/* Send button only if there's text */}
              {input.trim() && (
                <button
                  type="submit"
                  className="bg-white text-black rounded-full p-1.5 size-7 flex items-center justify-center cursor-pointer"
                >
                  ➤
                </button>
              )}
            </div>
          </div>

          <div className="pt-3.5 pb-2.5 px-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-1 text-xs text-[#757575]"
              >
                <Plus className="size-4" />
                Attach
              </Link>
              <Link
                to="/"
                className="flex items-center gap-1 text-xs text-[#757575]"
              >
                <BsSoundwave className="size-4" />
                Voice
              </Link>
              <Link
                to="/"
                className="flex items-center gap-1 text-xs text-[#757575]"
              >
                <MdComputer className="size-4" />
                Screen
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Switch />
              <select
                value={'select'}
                name="select"
                className="text-white text-[12px] font-[500] bg-transparent"
              >
                <option value="1">gpt-4o-mini</option>
              </select>
            </div>
          </div>
        </form>
      </div>
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
      'px-20 py-3 rounded-lg text-white',
      message.role === 'user'
        ? 'bg-[#FEFF1F08] text-right rounded-full w-fit ml-auto'
        : '',
    )}
  >
    <MarkdownMessage content={message.content} />
    {isStreaming && <span className="ml-2 animate-pulse">▌</span>}
  </div>
)
