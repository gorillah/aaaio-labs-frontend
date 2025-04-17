import { Chat } from '@/components/chat'
import { cn } from '@/lib/utils'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { FaHeadphonesSimple } from 'react-icons/fa6'
import { FiUpload } from 'react-icons/fi'
import { HiOutlineDotsHorizontal } from 'react-icons/hi'
import { IoIosArrowBack } from 'react-icons/io'

// Root index route - starts a new conversation
export const Route = createFileRoute('/_index/')({
  component: IndexRoute,
})

function IndexRoute() {
  const [activeTab, setActiveTab] = useState('chat')
  const [hasStartedChat, setHasStartedChat] = useState(false)
  const [firstMessage, setFirstMessage] = useState<string | null>(null)

  return (
    <div className="flex flex-col h-screen w-full bg-black">
      <nav
        className={cn('h-[60px] flex justify-center items-center gap-x-2', {
          'border-b border-white/10': !hasStartedChat,
        })}
      >
        {!hasStartedChat &&
          ['Search', 'Chat', 'Research'].map((label) => (
            <NavButton
              key={label}
              label={label}
              isActive={activeTab === label.toLowerCase()}
              onClick={() => setActiveTab(label.toLowerCase())}
            />
          ))}
        {hasStartedChat && (
          <div className="flex justify-between flex-1 p-14">
            <Link to="." className="flex items-center gap-2">
              <IoIosArrowBack className="size-5" />
              <p>
                What’s the cost of 1M token of chat completion per each model?
              </p>
            </Link>
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
