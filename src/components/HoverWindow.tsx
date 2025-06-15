import React from 'react';

interface ExtractedMatch {
  value: string;
  patternName: string;
}

interface HoverWindowProps {
  matches: ExtractedMatch[];
  onCopy: (value: string) => void;
}

const HoverWindow: React.FC<HoverWindowProps> = ({ matches, onCopy }) => {
  return (
    <div className="hover-copy-window">
      <div className="hover-copy-header">Extracted Matches</div>
      <div className="hover-copy-items">
        {matches.map((match, index) => (
          <div key={index} className="hover-copy-item">
            <span className="match-value">{match.value}</span>
            <button
              className="copy-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onCopy(match.value);
              }}
            >
              Copy
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HoverWindow;