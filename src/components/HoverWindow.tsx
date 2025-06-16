import type React from "react";

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
        {matches.map((match) => (
          <div
            key={`${match.patternName}-${match.value}`}
            className="hover-copy-item"
          >
            <div className="match-info">
              <span className="pattern-name">{match.patternName}</span>
              <span className="match-value">{match.value}</span>
            </div>
            <button
              type="button"
              className="copy-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onCopy(match.value);
              }}
              title="Copy to clipboard"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HoverWindow;
