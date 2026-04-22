import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';

type Confidence = 'low' | 'medium' | 'high';
type CapsuleTone = 'confidence' | 'gray';
type HoverVariant = 'text' | 'image';

interface SourceLinkCapsuleProps {
  url: string;
  label: string;
  confidence: Confidence;
  tone: CapsuleTone;
  hoverVariant: HoverVariant;
  title?: string;
  showUrl?: boolean;
  imageUrl?: string;
  summary?: string;
}

export default function SourceLinkCapsule({
  url,
  label,
  confidence,
  tone,
  hoverVariant,
  title,
  showUrl = true,
  imageUrl,
  summary,
}: SourceLinkCapsuleProps) {
  const [isOpen, setIsOpen] = useState(false);

  const confidenceColors = {
    low: 'text-[#A61E57] border-[#EA4C89]/40 bg-[#EA4C89]/15 hover:bg-[#EA4C89]/25',
    medium: 'text-[#A96B11] border-[#F5A623]/45 bg-[#F5A623]/15 hover:bg-[#F5A623]/25',
    high: 'text-[#1F5EA8] border-[#4A90E2]/45 bg-[#4A90E2]/15 hover:bg-[#4A90E2]/25'
  };

  const grayColor = 'text-gray-700 border-gray-300 bg-gray-100 hover:bg-gray-200';
  const capsuleClass = tone === 'gray' ? grayColor : confidenceColors[confidence];
  const hoverTitle = title ?? label;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium align-middle transition-colors cursor-pointer ${capsuleClass}`}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          {label}
        </a>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" side="top" align="center">
        <div className="space-y-2">
          {hoverVariant === 'image' && imageUrl && (
            <img
              src={imageUrl}
              alt={label}
              className="w-full h-48 object-cover rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3EImage not available%3C/text%3E%3C/svg%3E';
              }}
            />
          )}
          <div>
            <h4 className="font-semibold text-sm">{hoverTitle}</h4>
            {summary && <p className="mt-2 text-xs text-gray-600 leading-relaxed">{summary}</p>}
            {showUrl && <p className="mt-1 text-xs text-gray-500 break-all">{url}</p>}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
