import { createParser } from 'eventsource-parser';
import type { Message } from "@/components/chat"
import { useState } from "react"

export function useChatStream() {
  const [streamedText, setStreamedText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)

  const startStream = async ({
    messages,
    conversationId,
    deviceToken,
    onFinish,
    onError,
    onFirstEvent,
  }: {
    messages: Message[]
    conversationId?: string
    deviceToken?: string
    onFinish: (finalResponse: string) => void
    onError?: (e: Error) => void
    onFirstEvent?: (event: { event?: string; conversation_id?: string }) => void
  }) => {
    setStreamedText('')
    setIsStreaming(true)

    try {
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
      const decoder = new TextDecoder('utf-8')

      const parser = createParser({
        onEvent: (event) => {
          if (event.data === '[DONE]') {
            setIsStreaming(false)
            onFinish(streamedText)
            return
          }

          try {
            const json = JSON.parse(event.data)

            if (json.event === 'conversation_created' && onFirstEvent) {
              onFirstEvent(json)
              return
            }

            if (json?.content) {
              const cleaned = json.content.replace(/^data: /, '')
              setStreamedText((prev) => prev + cleaned)
            }
          } catch (err) {
            console.error('Invalid JSON chunk:', event.data)
          }
        },
      })

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        parser.feed(decoder.decode(value))
      }

      setIsStreaming(false)
    } catch (e) {
      setIsStreaming(false)
      onError?.(e as Error)
    }
  }

  return {
    streamedText,
    isStreaming,
    startStream,
  }
}
