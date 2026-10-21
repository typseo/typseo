'use client';

import type { AiCommand } from '@typseo/ai';
import { useId } from 'react';

const commands: { id: Exclude<AiCommand, 'custom'>; label: string }[] = [
  { id: 'clarity', label: 'Improve clarity' },
  { id: 'shorten', label: 'Shorten' },
  { id: 'seo', label: 'Improve SEO' },
];

export interface AICommandMenuProps {
  value: AiCommand;
  onChange: (command: AiCommand) => void;
  disabled?: boolean;
  className?: string;
}

export function AICommandMenu({
  value,
  onChange,
  disabled,
  className,
}: AICommandMenuProps) {
  return (
    <div className={className} role="group" aria-label="AI writing command">
      {commands.map((command) => (
        <button
          key={command.id}
          type="button"
          disabled={disabled}
          aria-pressed={value === command.id}
          onClick={() => onChange(command.id)}
        >
          {command.label}
        </button>
      ))}
    </div>
  );
}

export interface AIChatPanelProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  busy?: boolean;
  className?: string;
}

export function AIChatPanel({
  value,
  onChange,
  onSubmit,
  disabled,
  busy,
  className,
}: AIChatPanelProps) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id}>Custom editing instruction</label>
      <textarea
        id={id}
        value={value}
        maxLength={1000}
        disabled={disabled || busy}
        onChange={(event) => onChange(event.target.value)}
      />
      <button
        type="button"
        disabled={disabled || busy || !value.trim()}
        onClick={onSubmit}
      >
        {busy ? 'Generating…' : 'Generate custom suggestion'}
      </button>
    </div>
  );
}

export interface AIChangesPreviewProps {
  original: string;
  replacement: string;
  onAccept: () => void;
  onReject: () => void;
  disabled?: boolean;
  className?: string;
}

export function AIChangesPreview({
  original,
  replacement,
  onAccept,
  onReject,
  disabled,
  className,
}: AIChangesPreviewProps) {
  return (
    <section className={className} aria-label="Review AI suggestion">
      <div>
        <h3>Original</h3>
        <p>{original}</p>
      </div>
      <div>
        <h3>Suggested</h3>
        <p>{replacement}</p>
      </div>
      <div>
        <button type="button" disabled={disabled} onClick={onReject}>
          Reject
        </button>
        <button type="button" disabled={disabled} onClick={onAccept}>
          Accept change
        </button>
      </div>
    </section>
  );
}
