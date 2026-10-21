// @vitest-environment jsdom

import { analyzeSeoDocument } from '@typseo/core';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  MetadataEditor,
  type EditableMetadata,
} from '../src/metadata-editor.js';
import { SEOChecklist, SEOScore, SERPPreview, SEOSidebar } from '../src/seo.js';

afterEach(cleanup);

const document = {
  title: 'A sample page',
  metaDescription: 'A description for the page',
  bodyText: 'A sample page\nShort body.',
  headings: [{ level: 1 as const, text: 'A sample page' }],
};

describe('reusable SEO UI', () => {
  it('renders the real score and checklist statuses and allows issue selection', () => {
    const analysis = analyzeSeoDocument(document);
    const onSelectIssue = vi.fn();
    render(
      <>
        <SEOScore analysis={analysis} />
        <SEOChecklist analysis={analysis} onSelectIssue={onSelectIssue} />
      </>,
    );
    expect(
      screen
        .getByRole('meter', { name: 'SEO score' })
        .getAttribute('aria-valuenow'),
    ).toBe(String(analysis.score));
    expect(screen.getAllByRole('listitem')).toHaveLength(
      analysis.checks.length,
    );
    fireEvent.click(screen.getByRole('button', { name: /Body Length/i }));
    expect(onSelectIssue).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'body-length', status: 'fail' }),
    );
  });

  it('shows preview text and composes a sidebar without generating a score', () => {
    const analysis = analyzeSeoDocument(document);
    render(
      <>
        <SERPPreview document={document} url="https://example.com/article" />
        <SEOSidebar analysis={analysis} document={document} url="/article" />
      </>,
    );
    expect(screen.getAllByText('A sample page')).toHaveLength(2);
    expect(
      screen.getByRole('complementary', { name: 'SEO analysis' }),
    ).toBeTruthy();
    expect(screen.getAllByText('A description for the page')).toHaveLength(2);
  });

  it('emits controlled metadata and keyword edits without hidden state', () => {
    function Harness() {
      const [value, setValue] = useState<EditableMetadata>({
        title: 'Before',
        metaDescription: '',
        focusKeyword: '',
      });
      return <MetadataEditor value={value} onChange={setValue} />;
    }
    render(<Harness />);
    fireEvent.change(screen.getByLabelText('Page title'), {
      target: { value: 'After' },
    });
    fireEvent.change(screen.getByLabelText('Meta description'), {
      target: { value: 'A summary' },
    });
    fireEvent.change(screen.getByLabelText('Focus keyword'), {
      target: { value: 'SEO' },
    });
    expect(screen.getByLabelText('Page title')).toHaveProperty(
      'value',
      'After',
    );
    expect(screen.getByLabelText('Meta description')).toHaveProperty(
      'value',
      'A summary',
    );
    expect(screen.getByLabelText('Focus keyword')).toHaveProperty(
      'value',
      'SEO',
    );
  });
});
