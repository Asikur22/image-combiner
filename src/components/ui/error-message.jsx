import React from 'react';

export function ErrorMessage({ message, className = '', onDismiss }) {
  if (!message) return null;

  return (
    <div className={`relative bg-red-500/10 border border-red-500/20 rounded-lg p-3 pr-10 text-red-500 text-sm ${className}`}>
      {message}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-1/2 transform -translate-y-1/2 right-2 p-1 hover:bg-red-500/20 rounded-md transition-colors"
          aria-label="Dismiss error"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  );
}