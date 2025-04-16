import { queryOptions } from '@tanstack/react-query'

export type Message = {
  id?: string
  conversation_id?: string
  user_id?: string
  content: string
  role: 'user' | 'assistant'
  created_at?: string
}

export const API_BASE_URL = 'http://localhost:8080/api/v1'

// Get or create a device token for anonymous users
export const deviceTokenQueryOptions = () =>
  queryOptions({
    queryKey: ['auth', 'device-token'],
    queryFn: async () => {
      try {
        // For production, use localStorage to persist the token
        // const existingToken = localStorage.getItem('aaaio-device-token')
        // if (existingToken) return existingToken

        const res = await fetch(`${API_BASE_URL}/auth/device/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        })

        if (!res.ok) {
          throw new Error('Failed to register device')
        }

        const data = await res.json()
        // localStorage.setItem('aaaio-device-token', data.device_token)
        return data.device_token
      } catch (error) {
        console.error('Device token error:', error)
        throw error
      }
    },
    staleTime: Infinity, // Never refetch unless explicitly invalidated
  })

// Get conversation messages with pagination support
export const conversationMessagesQueryOptions = (
  conversationId: string,
  page?: number,
  itemsPerPage?: number,
) =>
  queryOptions({
    queryKey: [
      'conversations',
      conversationId,
      'messages',
      { page, itemsPerPage },
    ],
    queryFn: async (): Promise<Message[]> => {
      // Default pagination values
      const currentPage = page ?? 1
      const currentItemsPerPage = itemsPerPage ?? 50 // Increased to load more messages

      const res = await fetch(
        `${API_BASE_URL}/crud/conversations/${conversationId}/messages?page=${currentPage}&itemsPerPage=${currentItemsPerPage}`,
        {
          method: 'GET',
          headers: { Accept: 'application/json' },
          credentials: 'include',
        },
      )

      if (!res.ok) {
        throw new Error(`Error fetching messages: ${res.statusText}`)
      }

      const data = await res.json()
      return data
    },
    staleTime: 30000, // 30 seconds
  })
