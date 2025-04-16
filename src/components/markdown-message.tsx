import 'highlight.js/styles/github-dark.css' // For syntax highlighting
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'

export function MarkdownMessage({ content }: { content: string }) {
  return (
    <ReactMarkdown
      rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight, remarkGfm]}
      className="prose prose-invert max-w-none whitespace-pre-wrap"
    >
      {content || ' '}
    </ReactMarkdown>
  )
}
