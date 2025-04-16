import { fixSpacing, type Message } from '@/lib/utils'
import type { EventSourceMessage, ParseError } from 'eventsource-parser'
import { createParser } from 'eventsource-parser'
import { useCallback, useState } from 'react'

export function useChatStream() {
  const [streamedText, setStreamedText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)

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
              model: 'gpt-4o-mini',
              stream: true,
              messages,
            }),
          },
        )

        if (!res.ok || !res.body) throw new Error('Failed to fetch stream.')

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let text = ''

        // Create the parser with appropriate callbacks in an object
        const parser = createParser({
          onEvent(event: EventSourceMessage) {
            const { event: eventName, data } = event

            // Handle both explicit 'message' events and default (no event type)
            if (!eventName || eventName === 'message') {
              try {
                const parsedData = JSON.parse(data)
                let content = parsedData.content
                  .replace(/^data:\s*/g, '') // Handle multiple "data: " prefixes
                  .trim()

                // Handle smart concatenation
                const prevEnd = text.slice(-1)
                const currStart = content.charAt(0)

                // Add space if needed between words
                if (
                  text.length > 0 &&
                  !/\s$/.test(text) &&
                  !/[!?.,:-]$/.test(prevEnd) &&
                  !/^[!?.,:-]/.test(currStart)
                ) {
                  content = ' ' + content
                }

                text += content
                setStreamedText((prev) => prev + content) // Use functional update
              } catch (e) {
                console.error('Error parsing message:', e, data)
              }
            }
          },
          onError(error: ParseError) {
            console.error('Parser error:', error)
          },
        })

        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            // Reset parser when done
            parser.reset()
            setIsStreaming(false)
            const fixedText = fixSpacing(text)
            onFinish(fixedText)
            break
          }

          const chunk = decoder.decode(value, { stream: true })
          parser.feed(chunk)
        }
      } catch (e) {
        setIsStreaming(false)
        setStreamedText('')
        onError?.(e as Error)
      }
    },
    [],
  )

  return { streamedText, isStreaming, startStream }
}
