import { cn } from '@/lib/utils'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { BiHomeAlt } from 'react-icons/bi'
import { MdOutlineExplore, MdOutlineSettings } from 'react-icons/md'
import { PiBuildingsBold, PiUsersThreeBold } from 'react-icons/pi'

const sidebarItems = [
  { label: 'Home', icon: BiHomeAlt },
  { label: 'Spaces', icon: PiBuildingsBold },
  { label: 'Assistants', icon: PiUsersThreeBold },
  { label: 'Discover', icon: MdOutlineExplore },
]

const recentItems = [
  'What are the average AWS cost...',
  'For tools like ChatGPT and Clause...',
  'Top 10 AI models today',
  'Search for Omi at CES. What do...',
  'Whats the home camera startup...',
  'Why do we only see one side of...',
  'Who are the 10 largest Tesla share...',
  'Breakdown of Google revenues...',
  'What are the average AWS cost...',
  'For tools like ChatGPT and Clause...',
]

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState('Home') // Default active item

  return (
    <div className="w-[280px] flex flex-col h-screen bg-black">
      {/* Header */}
      <Link
        className="h-[60px] px-4 flex items-center space-x-2 border-b border-white/10"
        to="/"
      >
        <img src="/aaaio-logo.svg" alt="Logo" />
        <p className="font-bold font-urbanist text-lg">AAAIO</p>
      </Link>

      {/* Sidebar items */}
      <div className="py-8 px-4 space-y-2 overflow-auto border-b border-white/10">
        {sidebarItems.map(({ label, icon: Icon }) => {
          const isActive = label === activeItem
          return (
            <button
              key={label}
              onClick={() => setActiveItem(label)}
              className={cn(
                'w-full flex items-center justify-start h-[50px] rounded-lg p-4 gap-2 font-urbanist cursor-pointer font-semibold text-base leading-normal',
                {
                  'bg-[#FEFF1F1A] text-[#FEFF1F]': isActive,
                  'bg-transparent text-white': !isActive,
                },
              )}
            >
              <Icon
                className={cn('text-xl', {
                  'text-[#FEFF1F]': isActive,
                  'text-white': !isActive,
                })}
              />
              {label}
            </button>
          )
        })}
      </div>

      {/* Recents section with clickable links */}
      <div className="h-[415px] py-8 px-4 space-y-4 overflow-auto">
        <h3 className="text-base font-urbanist font-semibold">Recents</h3>
        <div className="p-4 font-normal text-sm text-white/70 font-urbanist space-y-2 truncate rounded-sm bg-yellow-400/5">
          {recentItems.slice(0, 10).map((item, index) => (
            <a
              key={index}
              href="#"
              className={cn('block cursor-pointer', {
                'text-white/90 hover:text-yellow-400': true,
              })}
            >
              {item}
            </a>
          ))}
        </div>
      </div>

      {/* Footer (user info) */}
      <div className="h-20 bg-black mt-auto flex items-center py-8 px-4 justify-between border-t border-white/10">
        <div className="flex items-center space-x-2">
          <img src="/ellipse-1.png" alt="User" />
          <h4 className="text-white font-urbanist font-semibold">Husso G.</h4>
        </div>
        <MdOutlineSettings color="white" size={20} />
      </div>
    </div>
  )
}

export default Sidebar
