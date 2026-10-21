// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AIChangesPreview, AIChatPanel, AICommandMenu } from '../src/ai.js';

afterEach(cleanup);

describe('optional AI UI', () => {
  it('selects commands and keeps custom instruction controlled', () => {
    const onCommand = vi.fn();
    const onChange = vi.fn();
    const onSubmit = vi.fn();
    render(
      <>
        <AICommandMenu value="clarity" onChange={onCommand} />
        <AIChatPanel
          value="Change tone"
          onChange={onChange}
          onSubmit={onSubmit}
        />
      </>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Shorten' }));
    expect(onCommand).toHaveBeenCalledWith('shorten');
    fireEvent.change(screen.getByLabelText('Custom editing instruction'), {
      target: { value: 'More concise' },
    });
    expect(onChange).toHaveBeenCalledWith('More concise');
    fireEvent.click(
      screen.getByRole('button', { name: 'Generate custom suggestion' }),
    );
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('requires an explicit accept or reject action', () => {
    const onAccept = vi.fn();
    const onReject = vi.fn();
    render(
      <AIChangesPreview
        original="Before"
        replacement="After"
        onAccept={onAccept}
        onReject={onReject}
      />,
    );
    expect(screen.getByText('Before')).toBeTruthy();
    expect(screen.getByText('After')).toBeTruthy();
    expect(onAccept).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Reject' }));
    fireEvent.click(screen.getByRole('button', { name: 'Accept change' }));
    expect(onReject).toHaveBeenCalledOnce();
    expect(onAccept).toHaveBeenCalledOnce();
  });
});
