import 'highlight.js/styles/github-dark.css' // For syntax highlighting
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'

export function MarkdownMessage({ content }: { content: string }) {
  return (
    <ReactMarkdown
      rehypePlugins={[rehypeHighlight]}
      className="prose prose-invert max-w-none whitespace-pre-wrap"
      components={{
        p: ({ node, ...props }) => (
          <p
            {...props}
            className="leading-relaxed text-white animate-pulse-on-streaming"
          />
        ),
      }}
    >
      {content || ' '}
    </ReactMarkdown>
  )
}
