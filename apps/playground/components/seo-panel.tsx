'use client';

import type { SeoAnalysis, SeoCheck, SeoDocument } from '@typseo/core';
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleAlert,
  Clipboard,
  Info,
  RefreshCw,
  Search,
  Sparkles,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { PlaygroundDocument } from '@/lib/documents';
import { countSentences, countWords } from '@/lib/seo';

export type PanelTab = 'analysis' | 'brief' | 'assistant' | 'outline';

interface SeoPanelProps {
  activeTab: PanelTab;
  onTabChange: (tab: PanelTab) => void;
  document: PlaygroundDocument;
  analysis: SeoAnalysis;
  snapshot: SeoDocument;
  selectedText: string;
  onUpdateDocument: (patch: Partial<PlaygroundDocument>) => void;
  onRefresh: () => void;
  onFocusField: (field: string) => void;
  onJumpToHeading: (index: number) => void;
}

const labels: Record<string, string> = {
  'title-present': 'Page title added',
  'title-length': 'Title length',
  'description-present': 'Meta description added',
  'description-length': 'Description length',
  'body-length': 'Useful body content',
  'h1-count': 'One H1 heading',
  'heading-order': 'Heading structure',
  'image-alt': 'Image alt text',
  'keyword-title': 'Keyword in title',
  'keyword-body': 'Keyword in body',
};

function ScoreCard({
  analysis,
  onRefresh,
}: Pick<SeoPanelProps, 'analysis' | 'onRefresh'>) {
  const color =
    analysis.score >= 80
      ? 'var(--score-good)'
      : analysis.score >= 50
        ? 'var(--score-warn)'
        : 'var(--score-low)';
  const applicable = analysis.checks.filter((check) => check.status !== 'skip');
  const passed = applicable.filter((check) => check.status === 'pass').length;
  return (
    <section className="seo-card score-card" aria-label="SEO score">
      <div className="seo-card-title">
        <h2>SEO Score</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          aria-label="Refresh SEO analysis"
        >
          <RefreshCw className="size-3.5" />
          Refresh
        </Button>
      </div>
      <div className="score-main">
        <div
          className="score-ring"
          role="img"
          aria-label={`SEO score ${analysis.score} out of 100`}
        >
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle
              cx="60"
              cy="60"
              r="52"
              pathLength="100"
              className="score-track"
            />
            <circle
              cx="60"
              cy="60"
              r="52"
              pathLength="100"
              stroke={color}
              strokeDasharray={`${analysis.score} 100`}
              className="score-value"
            />
          </svg>
          <div>
            <strong>{analysis.score}</strong>
            <span>/ 100</span>
          </div>
        </div>
        <div className="score-summary">
          <strong>
            {analysis.score >= 80
              ? 'Looking good'
              : analysis.score >= 50
                ? 'Keep improving'
                : 'Needs attention'}
          </strong>
          <p>
            {passed} of {applicable.length} applicable checks pass. This score
            comes from the Typseo SEO engine.
          </p>
        </div>
      </div>
      <div className="score-legend">
        <span>
          <i className="legend-dot pass" />
          Passed {passed}
        </span>
        <span>
          <i className="legend-dot fail" />
          To improve {applicable.length - passed}
        </span>
        <span>
          <i className="legend-dot skip" />
          Skipped {analysis.checks.length - applicable.length}
        </span>
      </div>
    </section>
  );
}

function Checklist({
  checks,
  onFocusField,
}: {
  checks: readonly SeoCheck[];
  onFocusField: SeoPanelProps['onFocusField'];
}) {
  const [filter, setFilter] = useState<'all' | 'issues' | 'passed'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const visible = checks.filter(
    (check) =>
      filter === 'all' ||
      (filter === 'issues' ? check.status === 'fail' : check.status === 'pass'),
  );
  const passed = checks.filter((check) => check.status === 'pass').length;
  const applicable = checks.filter((check) => check.status !== 'skip').length;
  return (
    <section className="seo-card checklist-card" aria-label="SEO checklist">
      <div className="seo-card-title">
        <h2>Checklist</h2>
        <span className="check-count">
          {passed}/{applicable}
        </span>
      </div>
      <div className="check-filters" role="group" aria-label="Filter checks">
        {(
          [
            ['all', 'All'],
            ['issues', 'Needs work'],
            ['passed', 'Passed'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={filter === value ? 'active' : ''}
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="check-list">
        {visible.length === 0 ? (
          <p className="empty-checks">No checks in this view.</p>
        ) : (
          visible.map((check) => (
            <div className="check-item" key={check.id}>
              <button
                type="button"
                className="check-row"
                aria-expanded={expanded === check.id}
                onClick={() =>
                  setExpanded(expanded === check.id ? null : check.id)
                }
              >
                {check.status === 'pass' ? (
                  <Check className="check-pass" />
                ) : check.status === 'fail' ? (
                  <CircleAlert className="check-fail" />
                ) : (
                  <Info className="check-skip" />
                )}
                <span>{labels[check.id] ?? check.id}</span>
                <small>
                  {check.status === 'pass'
                    ? 'Passed'
                    : check.status === 'skip'
                      ? 'N/A'
                      : 'Review'}
                </small>
                <ChevronRight
                  className={expanded === check.id ? 'chevron open' : 'chevron'}
                />
              </button>
              {expanded === check.id && (
                <div className="check-detail">
                  <p>
                    {check.issue?.message ??
                      (check.status === 'pass'
                        ? 'This check passes for the current document.'
                        : 'This check is not applicable yet.')}
                  </p>
                  {check.issue && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => onFocusField(check.issue!.field)}
                    >
                      Edit related field <ArrowUpRight className="size-3" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function KeywordAndReadability({
  snapshot,
  analysis,
}: {
  snapshot: SeoDocument;
  analysis: SeoAnalysis;
}) {
  const wordCount = countWords(snapshot.bodyText);
  const sentenceCount = countSentences(snapshot.bodyText);
  const keywordChecks = analysis.checks.filter((check) =>
    check.id.startsWith('keyword-'),
  );
  return (
    <section className="seo-card details-card">
      <div className="seo-card-title">
        <h2>Keywords & readability</h2>
      </div>
      <div className="details-grid">
        <div>
          <span className="detail-label">Focus keyword</span>
          <strong>{snapshot.focusKeyword || 'Not set'}</strong>
          <small>
            {snapshot.focusKeyword
              ? `${keywordChecks.filter((check) => check.status === 'pass').length} of ${keywordChecks.filter((check) => check.status !== 'skip').length} keyword checks pass`
              : 'Add one in Content brief'}
          </small>
        </div>
        <div>
          <span className="detail-label">Word count</span>
          <strong>{wordCount}</strong>
          <small>{Math.ceil(wordCount / 225)} min estimated read</small>
        </div>
        <div>
          <span className="detail-label">Sentences</span>
          <strong>{sentenceCount}</strong>
          <small>
            {sentenceCount ? Math.round(wordCount / sentenceCount) : 0} words
            per sentence
          </small>
        </div>
        <div>
          <span className="detail-label">Headings</span>
          <strong>{snapshot.headings?.length ?? 0}</strong>
          <small>Including the page title</small>
        </div>
      </div>
    </section>
  );
}

function SerpPreview({ document }: { document: PlaygroundDocument }) {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  return (
    <section className="seo-card serp-card" aria-label="SERP preview">
      <div className="seo-card-title">
        <h2>SERP Preview</h2>
        <div className="device-switch" role="group" aria-label="Preview device">
          <button
            type="button"
            aria-pressed={device === 'desktop'}
            onClick={() => setDevice('desktop')}
          >
            Desktop
          </button>
          <button
            type="button"
            aria-pressed={device === 'mobile'}
            onClick={() => setDevice('mobile')}
          >
            Mobile
          </button>
        </div>
      </div>
      <div className={`serp-result ${device}`}>
        <p className="serp-url">
          example.com › articles › {document.slug || 'untitled'}
        </p>
        <h3>{document.title || 'Untitled document'}</h3>
        <p>
          {document.metaDescription ||
            'Add a meta description in Content brief to preview how this page might appear in search.'}
        </p>
      </div>
      <p className="serp-note">
        Illustrative preview. Search engines may display different text.
      </p>
    </section>
  );
}

function ContentBrief({
  document,
  onUpdateDocument,
}: Pick<SeoPanelProps, 'document' | 'onUpdateDocument'>) {
  return (
    <div className="panel-stack brief-panel">
      <div className="panel-intro">
        <h2>Content brief</h2>
        <p>These fields feed the SEO analysis and search preview.</p>
      </div>
      <label htmlFor="brief-title">
        Page title <span>{document.title.length}/60</span>
      </label>
      <Input
        id="brief-title"
        value={document.title}
        onChange={(event) => onUpdateDocument({ title: event.target.value })}
        placeholder="A clear, descriptive title"
      />
      <label htmlFor="brief-description">
        Meta description <span>{document.metaDescription.length}/160</span>
      </label>
      <Textarea
        id="brief-description"
        value={document.metaDescription}
        onChange={(event) =>
          onUpdateDocument({ metaDescription: event.target.value })
        }
        placeholder="Summarize the page for search readers"
        rows={5}
      />
      <label htmlFor="brief-keyword">Focus keyword</label>
      <Input
        id="brief-keyword"
        value={document.focusKeyword}
        onChange={(event) =>
          onUpdateDocument({ focusKeyword: event.target.value })
        }
        placeholder="e.g. SEO for SaaS"
      />
      <label htmlFor="brief-slug">URL slug</label>
      <Input
        id="brief-slug"
        value={document.slug}
        onChange={(event) => onUpdateDocument({ slug: event.target.value })}
        placeholder="my-article"
      />
      <p className="brief-footnote">
        The slug affects the preview URL only. It is not scored by the current
        core rules.
      </p>
    </div>
  );
}

function AssistantPanel({
  document,
  selectedText,
}: Pick<SeoPanelProps, 'document' | 'selectedText'>) {
  const [task, setTask] = useState<'clarity' | 'shorten' | 'seo'>('clarity');
  const [copied, setCopied] = useState(false);
  const prompt = useMemo(() => {
    const instruction =
      task === 'clarity'
        ? 'Improve clarity while preserving the original meaning and tone.'
        : task === 'shorten'
          ? 'Shorten the passage without losing its key facts.'
          : `Suggest natural ways to improve relevance for the focus keyword "${document.focusKeyword || 'not set'}" without keyword stuffing.`;
    return `${instruction}\n\nArticle title: ${document.title || 'Untitled'}\nFocus keyword: ${document.focusKeyword || 'Not set'}\n\nPassage:\n${selectedText || 'Select text in the editor, then open AI Assistant to include it here.'}`;
  }, [document.title, document.focusKeyword, selectedText, task]);
  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }
  return (
    <div className="panel-stack assistant-panel">
      <div className="assistant-icon">
        <Sparkles className="size-5" />
      </div>
      <h2>AI Assistant</h2>
      <p>
        Prepare a prompt from your document or selected text. No AI provider is
        connected in this local playground; nothing is sent to a server.
      </p>
      <div className="assistant-tasks" role="group" aria-label="Writing task">
        {(
          [
            ['clarity', 'Improve clarity'],
            ['shorten', 'Shorten'],
            ['seo', 'SEO ideas'],
          ] as const
        ).map(([value, label]) => (
          <Button
            key={value}
            size="sm"
            variant={task === value ? 'secondary' : 'outline'}
            aria-pressed={task === value}
            onClick={() => {
              setTask(value);
              setCopied(false);
            }}
          >
            {label}
          </Button>
        ))}
      </div>
      <label htmlFor="assistant-prompt">Generated prompt</label>
      <Textarea id="assistant-prompt" readOnly value={prompt} rows={10} />
      <Button onClick={copyPrompt}>
        <Clipboard className="size-4" />
        {copied ? 'Copied' : 'Copy prompt'}
      </Button>
      {!selectedText && (
        <p className="brief-footnote">
          Tip: select a passage in the editor before opening this tab.
        </p>
      )}
    </div>
  );
}

function OutlinePanel({
  snapshot,
  onJumpToHeading,
}: Pick<SeoPanelProps, 'snapshot' | 'onJumpToHeading'>) {
  const headings = snapshot.headings ?? [];
  return (
    <div className="panel-stack outline-panel">
      <div className="panel-intro">
        <h2>Outline</h2>
        <p>Jump between headings in the current document.</p>
      </div>
      {headings.length ? (
        <nav aria-label="Document outline">
          {headings.map((heading, index) => (
            <button
              key={`${index}-${heading.text}`}
              type="button"
              className={`outline-item level-${heading.level}`}
              onClick={() => onJumpToHeading(index)}
            >
              <span>H{heading.level}</span>
              {heading.text || 'Untitled heading'}
            </button>
          ))}
        </nav>
      ) : (
        <p className="empty-checks">
          Add a title or heading to build an outline.
        </p>
      )}
    </div>
  );
}

export function SeoPanel(props: SeoPanelProps) {
  return (
    <aside className="analysis-pane" aria-label="Document analysis">
      <Tabs
        value={props.activeTab}
        onValueChange={(value) => props.onTabChange(value as PanelTab)}
        className="analysis-root"
      >
        <TabsList
          variant="line"
          className="analysis-tabs"
          aria-label="Analysis views"
        >
          <TabsTrigger value="analysis">SEO Analysis</TabsTrigger>
          <TabsTrigger value="brief">Content Brief</TabsTrigger>
          <TabsTrigger value="assistant">AI Assistant</TabsTrigger>
          <TabsTrigger value="outline">Outline</TabsTrigger>
        </TabsList>
        <div className="analysis-scroll">
          <TabsContent value="analysis" className="panel-stack">
            <ScoreCard analysis={props.analysis} onRefresh={props.onRefresh} />
            <Checklist
              checks={props.analysis.checks}
              onFocusField={props.onFocusField}
            />
            <KeywordAndReadability
              snapshot={props.snapshot}
              analysis={props.analysis}
            />
            <SerpPreview document={props.document} />
          </TabsContent>
          <TabsContent value="brief">
            <ContentBrief
              document={props.document}
              onUpdateDocument={props.onUpdateDocument}
            />
          </TabsContent>
          <TabsContent value="assistant">
            <AssistantPanel
              document={props.document}
              selectedText={props.selectedText}
            />
          </TabsContent>
          <TabsContent value="outline">
            <OutlinePanel
              snapshot={props.snapshot}
              onJumpToHeading={props.onJumpToHeading}
            />
          </TabsContent>
        </div>
      </Tabs>
    </aside>
  );
}
