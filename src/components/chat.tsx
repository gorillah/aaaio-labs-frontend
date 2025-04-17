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

// Chat component handles the whole messaging UI and logic
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
  // Fetch the device token using react-query
  const { data: deviceToken } = useQuery(deviceTokenQueryOptions())

  // Local state to manage messages and user input
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')

  // Custom hook to manage streamed responses from the AI
  const { streamedText, isStreaming, startStream } = useChatStream()

  // Ref to auto-scroll chat window on new messages
  const chatRef = useRef<HTMLDivElement>(null)

  // Function to send a message
  const sendMessage = async () => {
    if (!input.trim()) return // Prevent sending empty messages

    if (!hasStartedChat) setHasStartedChat(true) // Mark the chat as started

    const userMsg = { role: 'user', content: input.trim() } as Message
    setMessages((prev) => [...prev, userMsg]) // Add user's message to list
    setInput('') // Clear input field

    // Start streaming AI response
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

  // Auto-scroll to the latest message when messages or streamed text update
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages, streamedText])

  return (
    <div className="flex flex-col h-full">
      {/* Messages list */}
      {hasStartedChat && (
        <div
          ref={chatRef}
          className="flex-1 space-y-4 p-4 overflow-y-auto mx-auto w-full"
        >
          {/* Display past messages */}
          {messages.map((msg, i) => (
            <MessageItem key={i} message={msg} />
          ))}

          {/* Display streaming assistant message */}
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

      {/* Input area */}
      <div
        className={cn('m-auto space-y-[32px] pb-4 w-full', {
          'w-[562px] ': !hasStartedChat, // Wider input for initial screen
          'px-20': hasStartedChat, // Padding after chat starts
        })}
      >
        {/* Initial welcome screen */}
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

        {/* Form for sending messages */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            sendMessage()
          }}
          className="p-2 rounded-xl border border-white/10 bg-[#181A19]"
        >
          <div className="relative">
            {/* Textarea for typing messages */}
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
                  'opacity-50': isStreaming, // Dim input when streaming
                },
              )}
            />

            {/* Right side controls: Mic and Send */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              {/* Mic icon (for future voice input) */}
              <img
                src="./mic-01.svg"
                alt="Mic"
                className="size-7 cursor-pointer"
              />

              {/* Send button, visible when there's text */}
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

          {/* Attachments and settings */}
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
              {/* Switch (maybe for model toggling or feature control) */}
              <Switch />
              {/* Model selection dropdown */}
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

// Single message display component
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
        ? 'bg-[#FEFF1F08] text-right rounded-full w-fit ml-auto' // Style for user messages
        : '',
    )}
  >
    {/* Render the message with Markdown support */}
    <MarkdownMessage content={message.content} />
    {/* Blinking cursor if message is still streaming */}
    {isStreaming && <span className="ml-2 animate-pulse">▌</span>}
  </div>
)
