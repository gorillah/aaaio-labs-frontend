import { fixSpacing, type Message } from '@/lib/utils'
import type { EventSourceMessage, ParseError } from 'eventsource-parser'
import { createParser } from 'eventsource-parser'
import { useCallback, useState } from 'react'

// Custom React hook to manage streaming chat responses
export function useChatStream() {
  const [streamedText, setStreamedText] = useState('') // Full streamed text
  const [isStreaming, setIsStreaming] = useState(false) // Whether a stream is active

  const startStream = useCallback(
    async ({
      messages,
      conversationId,
      deviceToken,
      onFinish,
      onFirstEvent,
      onError,
    }: {
      messages: Message[]
      conversationId?: string
      deviceToken?: string
      onFinish: (text: string) => void
      onFirstEvent?: (event: any) => void
      onError?: (e: Error) => void
    }) => {
      try {
        setIsStreaming(true)
        setStreamedText('')

        // Choose endpoint based on conversation status
        const res = await fetch(
          conversationId
            ? `http://localhost:8080/api/v1/llm/chat/${conversationId}`
            : 'http://localhost:8080/api/v1/llm/chat/new',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Device-Token': deviceToken || '',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini', // Specify the model
              stream: true, // Ask for streamed responses
              messages, // Pass message history
            }),
          },
        )

        if (!res.ok || !res.body) throw new Error('Failed to fetch stream.')

        const reader = res.body.getReader() // Read streamed chunks
        const decoder = new TextDecoder()
        let text = ''

        // Create event stream parser
        const parser = createParser({
          onEvent(event: EventSourceMessage) {
            const { event: eventName, data } = event

            // Handle "message" events (or no event type)
            if (!eventName || eventName === 'message') {
              try {
                const parsedData = JSON.parse(data)
                let content = parsedData.content
                  .replace(/^data:\s*/g, '') // Clean up "data:" prefixes
                  .trim()

                // Smart spacing between chunks
                const prevEnd = text.slice(-1)
                const currStart = content.charAt(0)

                if (
                  text.length > 0 &&
                  !/\s$/.test(text) &&
                  !/[!?.,:-]$/.test(prevEnd) &&
                  !/^[!?.,:-]/.test(currStart)
                ) {
                  content = ' ' + content
                }

                text += content
                setStreamedText((prev) => prev + content)
              } catch (e) {
                console.error('Error parsing message:', e, data)
              }
            }
          },
          onError(error: ParseError) {
            console.error('Parser error:', error)
          },
        })

        // Read the response body chunk by chunk
        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            parser.reset()
            setIsStreaming(false)

            const fixedText = fixSpacing(text) // Clean up final spacing
            onFinish(fixedText) // Trigger the provided callback
            break
          }

          const chunk = decoder.decode(value, { stream: true })
          parser.feed(chunk) // Feed each chunk to the parser
        }
      } catch (e) {
        setIsStreaming(false)
        setStreamedText('')
        onError?.(e as Error) // If provided, call error callback
      }
    },
    [],
  )

  return { streamedText, isStreaming, startStream }
}
