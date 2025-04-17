import 'highlight.js/styles/github-dark.css' // Import GitHub dark theme for syntax highlighting
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight' // Plugin to highlight code blocks
import rehypeRaw from 'rehype-raw' // Allows rendering of raw HTML inside markdown
import rehypeSanitize from 'rehype-sanitize' // Sanitize HTML to prevent XSS attacks
import remarkGfm from 'remark-gfm' // Enables GitHub-flavored markdown (tables, strikethrough, etc.)

// Component to render markdown content with styling and safe HTML support
export function MarkdownMessage({ content }: { content: string }) {
  return (
    <ReactMarkdown
      // Add plugins for extended features and safety
      rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight, remarkGfm]}
      // Apply Tailwind and prose classes for styling
      className="prose prose-invert max-w-none whitespace-pre-wrap"
    >
      {content || ' '}
    </ReactMarkdown>
  )
}
