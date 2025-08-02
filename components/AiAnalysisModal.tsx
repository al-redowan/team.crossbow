
import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface AiAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  analysis: string | null;
}

// A simple component to render the markdown-like text from the AI
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const lines = content.split('\n');

    return (
        <div className="text-cyber-text-secondary whitespace-pre-wrap font-sans text-sm leading-relaxed">
            {lines.map((line, index) => {
                line = line.trim();
                
                // Render headings (###)
                if (line.startsWith('### ')) {
                    return <h3 key={index} className="text-lg font-bold text-cyber-neon-blue mt-4 mb-2">{line.substring(4)}</h3>;
                }

                // Render list items (* or - or 1.)
                if (line.startsWith('* ') || line.startsWith('- ') || /^\d+\.\s/.test(line)) {
                    const lineContent = line.replace(/^(\* | - | \d+\.\s)/, '');
                    return (
                        <div key={index} className="flex items-start my-1">
                            <span className="text-cyber-neon-pink mr-3 mt-1">&#8227;</span>
                            <p className="flex-1" dangerouslySetInnerHTML={{ __html: lineContent.replace(/\*\*(.*?)\*\*/g, '<strong class="text-cyber-text-primary">$1</strong>') }} />
                        </div>
                    );
                }

                // Render bold text and paragraphs
                return <p key={index} className="my-2" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-cyber-text-primary">$1</strong>') }} />;
            })}
        </div>
    );
};

const AiAnalysisModal: React.FC<AiAnalysisModalProps> = ({ isOpen, onClose, isLoading, analysis }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-cyber-surface border border-cyber-border rounded-xl shadow-2xl shadow-cyber-neon-blue/10 w-full max-w-2xl max-h-[90vh] flex flex-col animate-slide-in"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <header className="flex justify-between items-center p-4 border-b border-cyber-border">
          <h2 className="text-xl font-bold text-cyber-text-primary">AI Performance Analysis</h2>
          <button onClick={onClose} className="text-2xl text-cyber-text-secondary hover:text-cyber-neon-pink transition-colors">&times;</button>
        </header>
        
        <div className="p-6 overflow-y-auto">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-64">
              <LoadingSpinner />
            </div>
          )}
          {analysis && <MarkdownRenderer content={analysis} />}
        </div>
      </div>
    </div>
  );
};

export default AiAnalysisModal;
