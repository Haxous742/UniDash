import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

const MarkdownRenderer = ({ content, className = "" }) => {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-xl font-bold text-white mb-3 border-b border-gray-600/50 pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-bold text-white mb-2 mt-4">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-md font-semibold text-white mb-2 mt-3">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-sm font-semibold text-white mb-2 mt-3">
              {children}
            </h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-sm font-medium text-white mb-1 mt-2">
              {children}
            </h5>
          ),
          h6: ({ children }) => (
            <h6 className="text-sm font-medium text-gray-200 mb-1 mt-2">
              {children}
            </h6>
          ),
          
          p: ({ children }) => (
            <p className="mb-3 leading-relaxed text-gray-100 last:mb-0">
              {children}
            </p>
          ),
          
          ul: ({ children }) => (
            <ul className="mb-3 pl-5 space-y-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-3 pl-5 space-y-1 list-decimal">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-gray-100 leading-relaxed">
              <span className="text-blue-400 mr-2">•</span>
              {children}
            </li>
          ),
          
          // Code
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            
            if (!inline && match) {
              return (
                <div className="mb-4">
                  <div className="bg-gray-900/80 border border-gray-700/50 rounded-lg overflow-hidden">
                    <div className="bg-gray-800/80 px-3 py-1 border-b border-gray-700/50">
                      <span className="text-xs text-gray-400 font-mono">
                        {match[1]}
                      </span>
                    </div>
                    <pre className="p-4 overflow-x-auto">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  </div>
                </div>
              );
            } else {
              return (
                <code 
                  className="bg-gray-800/60 text-blue-300 px-1.5 py-0.5 rounded text-sm font-mono border border-gray-700/50"
                  {...props}
                >
                  {children}
                </code>
              );
            }
          },
          
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 py-2 mb-4 bg-blue-500/5 rounded-r-lg">
              <div className="text-gray-200 italic">
                {children}
              </div>
            </blockquote>
          ),
          
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline decoration-blue-400/50 hover:decoration-blue-300 transition-colors"
            >
              {children}
            </a>
          ),
          
          table: ({ children }) => (
            <div className="mb-4 overflow-x-auto">
              <table className="min-w-full border border-gray-700/50 rounded-lg overflow-hidden">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-800/80">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="bg-gray-900/20">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="border-b border-gray-700/30">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 text-left text-sm font-semibold text-white">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-sm text-gray-200">
              {children}
            </td>
          ),
          
          strong: ({ children }) => (
            <strong className="font-bold text-white">
              {children}
            </strong>
          ),
          
          em: ({ children }) => (
            <em className="italic text-gray-200">
              {children}
            </em>
          ),

          hr: () => (
            <hr className="my-6 border-gray-600/50" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
