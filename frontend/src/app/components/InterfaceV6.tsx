import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { motion } from 'motion/react';
import { useLocation } from 'react-router';
import { getFollowUpPrompt, getFollowUpOptions } from '../interfaceConfig';
import SourceLinkCapsule from './SourceLinkCapsule';
import { getInitialConversation, getRandomAssistantResponse, resolveContentPackId, type LlmContentVersion } from '../llmContent';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const CONTENT_VERSION: LlmContentVersion = 'plain';

function MessageBubble({ message, index }: { message: Message; index: number }) {
  const isUser = message.type === 'user';

  const SOURCE_CARD_SUMMARIES: Record<string, string> = {
    'https://pubmed.ncbi.nlm.nih.gov/example1': 'Research findings on inflammatory skin conditions associated with metabolic changes and ketone elevation.',
    'https://pubmed.ncbi.nlm.nih.gov/example2': 'Metabolic effects of prolonged ketosis on immune function and systemic inflammation markers.',
    'https://pubmed.ncbi.nlm.nih.gov/example3': 'Lymphatic system changes and peripheral circulation alterations during sustained ketotic states.'
  };

  const renderFormattedContent = (content: string) => {
    const parts = content.split(/(\*\*.*?\*\*|\[high\].*?\[\/high\]|\[medium\].*?\[\/medium\]|\[low\].*?\[\/low\]|\[source:.*?\])/g);

    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('[high]') && part.endsWith('[/high]')) {
        return <span key={i}>{part.slice(6, -7)}</span>;
      }
      if (part.startsWith('[medium]') && part.endsWith('[/medium]')) {
        return <span key={i}>{part.slice(8, -9)}</span>;
      }
      if (part.startsWith('[low]') && part.endsWith('[/low]')) {
        return <span key={i}>{part.slice(5, -6)}</span>;
      }
      if (part.startsWith('[source:')) {
        const match = part.match(/\[source:(.*?):(low|medium|high)\]/);
        if (match) {
          const [, url, confidence] = match;

          let sourceLabel = 'Source';
          try {
            const hostname = new URL(url).hostname.replace(/^www\./, '');
            if (hostname.includes('pubmed.ncbi.nlm.nih.gov')) {
              sourceLabel = 'PubMed';
            } else if (hostname.includes('doi.org')) {
              sourceLabel = 'DOI';
            } else {
              sourceLabel = hostname;
            }
          } catch {
            sourceLabel = 'Source';
          }

          const imageUrl = `https://images.unsplash.com/photo-1516321318423-f06f70d504f0?w=400&h=300&fit=crop`;
          const summary = SOURCE_CARD_SUMMARIES[url] ?? '';

          return (
            <SourceLinkCapsule
              key={i}
              url={url}
              label={sourceLabel}
              confidence={confidence as 'low' | 'medium' | 'high'}
              tone="gray"
              hoverVariant="text"
              title="Clinical Insight Preview"
              showUrl
            />
          );
        }
      }
      return part;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05
      }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`max-w-[80%] ${
          isUser
            ? 'bg-gray-100 text-gray-900 rounded-3xl rounded-br-md'
            : 'bg-white text-gray-900 rounded-3xl rounded-bl-md'
        } px-5 py-3.5`}
      >
        <div className="text-[15px] leading-relaxed whitespace-pre-wrap">
          {isUser ? message.content : renderFormattedContent(message.content)}
        </div>
      </div>
    </motion.div>
  );
}

function FollowUpPromptBox({ pid, onOptionClick }: { pid: number; onOptionClick?: (option: string) => void }) {
  const followUpPrompt = getFollowUpPrompt(pid);
  const options = getFollowUpOptions(pid);

  if (!followUpPrompt) {
    return null;
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="rounded-3xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
        <p className="text-[15px] text-gray-800">{followUpPrompt}</p>
      </div>
      {options.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => onOptionClick?.(option)}
              className="inline-flex items-center rounded-full border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors cursor-pointer"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function InterfaceV6() {
  const pid = 6;
  const location = useLocation();
  const contentPackId = resolveContentPackId((location.state as { contentPackId?: string } | null | undefined)?.contentPackId);
  const [messages, setMessages] = useState<Message[]>(() => {
    const initialConversation = getInitialConversation(CONTENT_VERSION, contentPackId);

    return [
      {
        id: '1',
        type: 'user',
        content: initialConversation.user,
        timestamp: new Date(Date.now() - 120000)
      },
      {
        id: '2',
        type: 'assistant',
        content: initialConversation.assistant,
        timestamp: new Date(Date.now() - 60000)
      }
    ];
  });

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: getRandomAssistantResponse(CONTENT_VERSION, contentPackId),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, responseMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleOptionClick = (option: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: option,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  return (
    <div className="size-full bg-gradient-to-b from-[#ffffff] to-[#fcfcfc] flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-white/60">
        <h1 className="text-xl text-gray-800">
          Info Validation (Follow Up 2)
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-3xl mx-auto">
          {messages.map((message, index) => (
            <MessageBubble key={message.id} message={message} index={index} />
          ))}

          {messages.length > 1 && !isTyping && <FollowUpPromptBox pid={pid} onOptionClick={handleOptionClick} />}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start mb-4"
            >
              <div className="bg-white rounded-3xl rounded-bl-md px-5 py-3.5 shadow-sm">
                <div className="flex space-x-1.5">
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 bg-white/60">
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-center gap-3 bg-white rounded-3xl shadow-sm border border-gray-200 px-5 py-3">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Message..."
              className="flex-1 bg-transparent border-none outline-none text-[15px] text-gray-900 placeholder:text-gray-400"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-900 text-white disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
