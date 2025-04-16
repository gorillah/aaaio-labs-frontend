import Sidebar from '@/components/Sidebar'

import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_index')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex">
      <Sidebar />
      <Outlet />
    </div>
  )
}
