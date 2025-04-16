import { Chat } from '@/components/chat'
import { cn } from '@/lib/utils'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

// Root index route - starts a new conversation
export const Route = createFileRoute('/_index/')({
  component: IndexRoute,
})

function IndexRoute() {
  const [activeTab, setActiveTab] = useState('chat')

  return (
    <div className="flex flex-col h-screen w-full">
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
      <div className="flex-1 overflow-hidden">
        <Chat />
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
