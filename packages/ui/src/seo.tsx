import type { SeoAnalysis, SeoCheck, SeoDocument } from '@typseo/core';

export interface SEOScoreProps {
  analysis: SeoAnalysis;
  className?: string;
  label?: string;
}

export function SEOScore({
  analysis,
  className,
  label = 'SEO score',
}: SEOScoreProps) {
  return (
    <div
      className={className}
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={analysis.score}
      data-score={analysis.score}
    >
      <strong>{analysis.score}</strong>
      <span aria-hidden="true">/100</span>
    </div>
  );
}

export interface SEOChecklistProps {
  analysis: SeoAnalysis;
  className?: string;
  onSelectIssue?: (check: SeoCheck) => void;
}

function checkLabel(id: string): string {
  return id
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function SEOChecklist({
  analysis,
  className,
  onSelectIssue,
}: SEOChecklistProps) {
  return (
    <ul className={className} aria-label="SEO checklist">
      {analysis.checks.map((check) => {
        const content = (
          <>
            <span>{checkLabel(check.id)}</span>
            <span>{check.status}</span>
            {check.issue && <small>{check.issue.message}</small>}
          </>
        );
        return (
          <li key={check.id} data-status={check.status}>
            {onSelectIssue && check.issue ? (
              <button type="button" onClick={() => onSelectIssue(check)}>
                {content}
              </button>
            ) : (
              <div>{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export interface SERPPreviewProps {
  document: Pick<SeoDocument, 'title' | 'metaDescription'>;
  url: string;
  className?: string;
}

export function SERPPreview({ document, url, className }: SERPPreviewProps) {
  const displayUrl = (() => {
    try {
      const parsed = new URL(url);
      return `${parsed.host}${parsed.pathname}${parsed.search}`;
    } catch {
      return url;
    }
  })();

  return (
    <div className={className} aria-label="Search result preview">
      <small>{displayUrl}</small>
      <strong>{document.title.trim() || 'Untitled page'}</strong>
      <p>{document.metaDescription?.trim() || 'No meta description yet.'}</p>
    </div>
  );
}

export interface SEOSidebarProps {
  analysis: SeoAnalysis;
  document: Pick<SeoDocument, 'title' | 'metaDescription'>;
  url: string;
  className?: string;
  onSelectIssue?: (check: SeoCheck) => void;
}

export function SEOSidebar({
  analysis,
  document,
  url,
  className,
  onSelectIssue,
}: SEOSidebarProps) {
  return (
    <aside className={className} aria-label="SEO analysis">
      <SEOScore analysis={analysis} />
      <SEOChecklist
        analysis={analysis}
        {...(onSelectIssue ? { onSelectIssue } : {})}
      />
      <SERPPreview document={document} url={url} />
    </aside>
  );
}
