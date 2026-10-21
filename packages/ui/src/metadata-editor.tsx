'use client';

import type { SeoDocument } from '@typseo/core';
import { useId } from 'react';

export type EditableMetadata = Pick<
  SeoDocument,
  'title' | 'metaDescription' | 'focusKeyword'
>;

export interface KeywordInputProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  className?: string;
  disabled?: boolean;
}

export function KeywordInput({
  value,
  onChange,
  id,
  className,
  disabled,
}: KeywordInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <div className={className}>
      <label htmlFor={inputId}>Focus keyword</label>
      <input
        id={inputId}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export interface MetadataEditorProps {
  value: EditableMetadata;
  onChange: (next: EditableMetadata) => void;
  className?: string;
  disabled?: boolean;
}

export function MetadataEditor({
  value,
  onChange,
  className,
  disabled,
}: MetadataEditorProps) {
  const titleId = useId();
  const descriptionId = useId();
  return (
    <div className={className}>
      <div>
        <label htmlFor={titleId}>Page title</label>
        <input
          id={titleId}
          value={value.title}
          disabled={disabled}
          onChange={(event) =>
            onChange({ ...value, title: event.target.value })
          }
        />
      </div>
      <div>
        <label htmlFor={descriptionId}>Meta description</label>
        <textarea
          id={descriptionId}
          value={value.metaDescription ?? ''}
          disabled={disabled}
          onChange={(event) =>
            onChange({ ...value, metaDescription: event.target.value })
          }
        />
      </div>
      <KeywordInput
        value={value.focusKeyword ?? ''}
        disabled={Boolean(disabled)}
        onChange={(focusKeyword) => onChange({ ...value, focusKeyword })}
      />
    </div>
  );
}
