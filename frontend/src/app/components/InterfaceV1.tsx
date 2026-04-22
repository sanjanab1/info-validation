import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { motion } from 'motion/react';
import SourceLinkCapsule from './SourceLinkCapsule';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SOURCE_CARD_TITLES: Record<string, string> = {
  'https://pubmed.ncbi.nlm.nih.gov/example1': 'Prurigo pigmentosa overview',
  'https://pubmed.ncbi.nlm.nih.gov/example2': 'Ketosis and skin inflammation',
  'https://pubmed.ncbi.nlm.nih.gov/example3': 'Peripheral lymphatic congestion hypothesis',
  'https://pubmed.ncbi.nlm.nih.gov/example4': 'Dermatology follow-up guidance',
  'https://pubmed.ncbi.nlm.nih.gov/example5': 'Diet and symptom tracking'
};

function getSourceCardTitle(url: string, sourceLabel: string): string {
  return SOURCE_CARD_TITLES[url] ?? sourceLabel;
}

function MessageBubble({ message, index }: { message: Message; index: number }) {
  const isUser = message.type === 'user';

  const renderFormattedContent = (content: string) => {
    // Split by patterns: bold text, confidence markers, and sources
    const parts = content.split(/(\*\*.*?\*\*|\[high\].*?\[\/high\]|\[medium\].*?\[\/medium\]|\[low\].*?\[\/low\]|\[source:.*?\])/g);

    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('[high]') && part.endsWith('[/high]')) {
        return (
          <span key={i} className="underline decoration-2 decoration-[#4A90E2]">
            {part.slice(6, -7)}
          </span>
        );
      }
      if (part.startsWith('[medium]') && part.endsWith('[/medium]')) {
        return (
          <span key={i} className="underline decoration-2 decoration-[#F5A623]">
            {part.slice(8, -9)}
          </span>
        );
      }
      if (part.startsWith('[low]') && part.endsWith('[/low]')) {
        return (
          <span key={i} className="underline decoration-2 decoration-[#EA4C89]">
            {part.slice(5, -6)}
          </span>
        );
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

          const sourceCardTitle = getSourceCardTitle(url, sourceLabel);

          return (
            <SourceLinkCapsule
              key={i}
              url={url}
              label={sourceLabel}
              confidence={confidence as 'low' | 'medium' | 'high'}
              tone="gray"
              hoverVariant="text"
              title={sourceCardTitle}
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

export default function InterfaceV1() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'user',
      content: 'I have been on a keto diet for the past 8 months and I suddenly noticed this rash on my upper arm. What could it be?',
      timestamp: new Date(Date.now() - 120000)
    },
    {
      id: '2',
      type: 'assistant',
      content: `Here are several **possible reasons** you might notice a new rash on your right upper arm after following a ketogenic (keto) diet for 8 months, based on medical sources:

**1. Keto-associated inflammatory rash (Prurigo pigmentosa)**

A rare inflammatory dermatosis sometimes linked to being in a state of ketosis. It typically presents with small, itchy bumps or raised patches that can form a net-like pattern on the skin. It most often appears on the trunk and upper body but can vary between individuals. Researchers aren't certain why only some people on a strict low-carbohydrate intake with the onset of this rash. [source:https://pubmed.ncbi.nlm.nih.gov/example1:high]

**2. Ketosis-related metabolic or inflammatory effects**

Elevated ketones in the bloodstream—especially during prolonged or deep ketosis—may provoke inflammatory responses in the skin or alter immune activity, which can manifest as irritation or rash. Changes in the gut microbiome induced by a ketogenic diet also may influence systemic inflammation and skin reactivity. [source:https://pubmed.ncbi.nlm.nih.gov/example2:medium]

**3. Keto-induced peripheral lymphatic congestion**

Sustained ketosis has been speculated to transiently impair peripheral lymphatic flow, leading to localized inflammatory skin changes in dependent or frequently used limbs. [source:https://pubmed.ncbi.nlm.nih.gov/example3:low]`,
      timestamp: new Date(Date.now() - 60000)
    }
  ]);

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
      const responses = [
        `Based on your symptoms, I'd recommend [high]consulting with a dermatologist[/high]. They can perform a proper examination and may suggest:

**Possible next steps:**
- [high]Clinical examination of the affected area[/high]
- [medium]Possibly adjusting your macronutrient ratios[/medium]
- [medium]Topical treatments if it's prurigo pigmentosa[/medium]

The rash might resolve on its own, but [high]professional evaluation is advisable[/high] to rule out other causes. [source:https://pubmed.ncbi.nlm.nih.gov/example4:high]`,
        `That's a great question. **Skin changes** on restrictive diets can happen for various reasons:

- **Nutrient deficiencies** [low](biotin, vitamin A, essential fatty acids)[/low]
- **Histamine reactions** [low]to certain keto foods[/low]
- **Contact dermatitis** [low]from new products[/low]

I'd suggest [medium]keeping a food diary to track any correlations[/medium] with the rash appearance. [source:https://pubmed.ncbi.nlm.nih.gov/example5:medium]`,
      ];

      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
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

  return (
    <div className="size-full bg-gradient-to-b from-[#ffffff] to-[#fcfcfc] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white/60">
        <h1 className="text-xl text-gray-800">
          Info Validation (Baseline)
        </h1>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-3xl mx-auto">
          {messages.map((message, index) => (
            <MessageBubble key={message.id} message={message} index={index} />
          ))}

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

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
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
