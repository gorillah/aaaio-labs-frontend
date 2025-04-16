import { queryOptions } from '@tanstack/react-query'

export type Message = {
  id?: string
  conversation_id?: string
  user_id?: string
  content: string
  role: 'user' | 'assistant'
  created_at?: string
}

export const deviceTokenQueryOptions = () =>
  queryOptions({
    queryKey: ['auth', 'device-token'],
    queryFn: async () => {
      // const existingToken = localStorage.getItem('aaaio-device-token')
      // if (existingToken) return existingToken

      const res = await fetch(
        'http://localhost:8080/api/v1/auth/device/register',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        },
      )

      const data = await res.json()
      // localStorage.setItem('aaaio-device-token', data.device_token)
      return data.device_token
    },
    staleTime: Infinity,
  })

export const conversationMessagesQueryOptions = (
  conversationId: string,
  page?: number,
  itemsPerPage?: number,
) =>
  queryOptions({
    queryKey: ['crud', 'conversations', conversationId, 'messages'],
    queryFn: async (): Promise<Message[]> => {
      // Use default values if page or itemsPerPage are not provided
      const currentPage = page ?? 1 // Default to page 1
      const currentItemsPerPage = itemsPerPage ?? 10 // Default to 10 items per page

      const res = await fetch(
        `http://localhost:8080/api/v1/crud/conversations/${conversationId}/messages?page=${currentPage}&itemsPerPage=${currentItemsPerPage}`,
        {
          method: 'GET',
          headers: { Accept: 'application/json' },
          credentials: 'include',
        },
      )

      if (!res.ok) {
        throw new Error('Error fetching messages')
      }

      const data = await res.json()
      return data
    },
    staleTime: Infinity,
  })
