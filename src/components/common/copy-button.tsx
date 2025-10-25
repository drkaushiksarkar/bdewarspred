'use client';
import * as React from 'react';

export function CopyButton({ text }: { text: string }) {
  const onCopy = async () => {
    if (typeof window === 'undefined') return;

    if (navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch {
        // fallback below
      }
    }

    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
    } finally {
      document.body.removeChild(ta);
    }
  };

  return (
    <button type="button" onClick={onCopy} aria-label="Copy to clipboard">
      Copy
    </button>
  );
}
