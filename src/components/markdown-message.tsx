// components/markdown-message.tsx
import 'highlight.js/styles/github-dark.css' // For syntax highlighting
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'

export function MarkdownMessage({ content }: { content: string }) {
  return (
    <ReactMarkdown
      rehypePlugins={[rehypeHighlight]} // Enable syntax highlighting for code blocks
      className="prose prose-invert max-w-none whitespace-pre-wrap"
      components={{
        h1: ({ node, ...props }) => (
          <h1 {...props} className="text-3xl font-bold mt-4 mb-2 text-white" />
        ),
        h2: ({ node, ...props }) => (
          <h2
            {...props}
            className="text-2xl font-semibold mt-4 mb-2 text-white"
          />
        ),
        h3: ({ node, ...props }) => (
          <h3
            {...props}
            className="text-xl font-semibold mt-4 mb-2 text-white"
          />
        ),
        p: ({ node, ...props }) => (
          <p {...props} className=" leading-relaxed text-white" />
        ),
        ul: ({ node, ...props }) => (
          <ul {...props} className="list-disc pl-5 text-white">
            {props.children}
          </ul>
        ),
        ol: ({ node, ...props }) => (
          <ol {...props} className="list-decimal pl-5 text-white">
            {props.children}
          </ol>
        ),
        li: ({ node, ...props }) => (
          <li {...props} className="mb-2 text-white" />
        ),
        blockquote: ({ node, ...props }) => (
          <blockquote
            {...props}
            className="border-l-4 pl-4 italic text-white border-gray-500"
          >
            {props.children}
          </blockquote>
        ),
        code: ({ node, ...props }) => (
          <code {...props} className="bg-gray-800 p-2 rounded-md text-white">
            {props.children}
          </code>
        ),
        pre: ({ node, ...props }) => (
          <pre
            {...props}
            className="bg-gray-800 p-4 rounded-md overflow-x-auto"
          >
            {props.children}
          </pre>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
