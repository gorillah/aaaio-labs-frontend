import { Chat } from '@/components/chat'
import { cn } from '@/lib/utils'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { FaHeadphonesSimple } from 'react-icons/fa6'
import { FiUpload } from 'react-icons/fi'
import { HiOutlineDotsHorizontal } from 'react-icons/hi'
import { IoIosArrowBack } from 'react-icons/io'

// Define the route for the root page ('/')
export const Route = createFileRoute('/_index/')({
  component: IndexRoute,
})

function IndexRoute() {
  // State to track which tab is active ('chat', 'search', or 'research')
  const [activeTab, setActiveTab] = useState('chat')
  // State to check if user has started a chat session
  const [hasStartedChat, setHasStartedChat] = useState(false)
  // State to store the first user message (optional)
  const [firstMessage, setFirstMessage] = useState<string | null>(null)

  return (
    <div className="flex flex-col h-screen w-full bg-black">
      {/* Top navigation bar */}
      <nav
        className={cn('h-[60px] flex justify-center items-center gap-x-2', {
          'border-b border-white/10': !hasStartedChat, // Show border only if chat hasn't started
        })}
      >
        {/* If no chat started yet, show tab buttons */}
        {!hasStartedChat &&
          ['Search', 'Chat', 'Research'].map((label) => (
            <NavButton
              key={label}
              label={label}
              isActive={activeTab === label.toLowerCase()}
              onClick={() => setActiveTab(label.toLowerCase())}
            />
          ))}
        {/* If chat has started, show back button and actions */}
        {hasStartedChat && (
          <div className="flex justify-between flex-1 p-14">
            {/* Back button with title */}
            <Link to="." className="flex items-center gap-2">
              <IoIosArrowBack className="size-5" />
              <p>What’s the cost of 1M token of chat completion per each model?</p>
            </Link>
            {/* Action buttons: Support, Upload, More */}
            <button className="flex items-center gap-3 cursor-pointer">
              <div className="bg-white/10 p-2.5 rounded-full">
                <FaHeadphonesSimple />
              </div>
              <button className="bg-white/10 p-2.5 rounded-full cursor-pointer">
                <FiUpload />
              </button>
              <button className="bg-white/10 p-2.5 rounded-full cursor-pointer">
                <HiOutlineDotsHorizontal />
              </button>
            </button>
          </div>
        )}
      </nav>

      {/* Main chat area */}
      <div className="flex-1 overflow-hidden">
        <Chat
          hasStartedChat={hasStartedChat}
          setHasStartedChat={setHasStartedChat}
          firstMessage={firstMessage}
          setFirstMessage={setFirstMessage}
        />
      </div>
    </div>
  )
}

// Component for rendering navigation tab buttons
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
        ? 'border-[#FEFF1F] border text-[#FEFF1F]' // Active tab styling
        : 'text-white hover:border-[#FEFF1F] hover:text-[#FEFF1F]' // Inactive tab styling
    )}
    onClick
