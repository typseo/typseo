'use client';

import Image from '@tiptap/extension-image';
import { EditorContent } from '@tiptap/react';
import type { JSONContent } from '@tiptap/core';
import { useTypseoEditor } from '@typseo/react';
import {
  BookOpen,
  Check,
  ChevronDown,
  ClipboardList,
  Download,
  Eye,
  FileText,
  Feather,
  Menu,
  Moon,
  PanelRightOpen,
  Plus,
  Search,
  Sparkles,
  Sun,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { PlaygroundToolbar } from '@/components/playground-toolbar';
import { SeoPanel, type PanelTab } from '@/components/seo-panel';
import { analyzeEditorDocument, countWords } from '@/lib/seo';
import { useDocumentWorkspace } from '@/lib/use-document-workspace';

const themeKey = 'typseo-playground-theme';
const editorExtensions = [Image];
const editorProps = {
  attributes: { 'aria-label': 'Article body', class: 'prose-editor' },
};
const emptyJson: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
};

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        character
      ] ?? character,
  );
}

function downloadFile(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function PlaygroundApp() {
  const {
    documents,
    activeId,
    activeDocument,
    saveState,
    scheduleBodySave,
    selectDocument,
    createDocument: createWorkspaceDocument,
    updateDocument,
  } = useDocumentWorkspace();
  const [search, setSearch] = useState('');
  const [panelTab, setPanelTab] = useState<PanelTab>('analysis');
  const [showAnalysisMobile, setShowAnalysisMobile] = useState(false);
  const [showSidebarMobile, setShowSidebarMobile] = useState(false);
  const [preview, setPreview] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [themeReady, setThemeReady] = useState(false);
  const [editorJson, setEditorJson] = useState<JSONContent>(emptyJson);
  const [selectedText, setSelectedText] = useState('');
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        if (localStorage.getItem(themeKey) === 'dark') setTheme('dark');
      } catch {
        /* Theme still works for this session. */
      }
      setThemeReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    if (!themeReady) return;
    try {
      localStorage.setItem(themeKey, theme);
    } catch {
      /* Theme still works for this session. */
    }
  }, [theme, themeReady]);

  useEffect(() => {
    function handleSearchShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleSearchShortcut);
    return () => window.removeEventListener('keydown', handleSearchShortcut);
  }, []);

  const editor = useTypseoEditor({
    value: activeDocument.html,
    extensions: editorExtensions,
    editable: !preview,
    onChange: (html, currentEditor) => {
      scheduleBodySave(activeId, html, () =>
        setEditorJson(currentEditor.getJSON()),
      );
    },
    editorProps,
  });

  useEffect(() => {
    if (!editor) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setEditorJson(editor.getJSON());
    });
    return () => {
      cancelled = true;
    };
  }, [editor, activeId]);

  const { snapshot, analysis } = useMemo(
    () =>
      analyzeEditorDocument(
        {
          title: activeDocument.title,
          metaDescription: activeDocument.metaDescription,
          focusKeyword: activeDocument.focusKeyword,
        },
        editorJson,
      ),
    [
      activeDocument.title,
      activeDocument.metaDescription,
      activeDocument.focusKeyword,
      editorJson,
    ],
  );

  function switchDocument(id: string) {
    if (id === activeId) {
      setShowSidebarMobile(false);
      return;
    }
    selectDocument(id);
    setPreview(false);
    setShowSidebarMobile(false);
    setShowAnalysisMobile(false);
  }

  function createDocument() {
    createWorkspaceDocument();
    setPreview(false);
    setShowSidebarMobile(false);
    setShowAnalysisMobile(false);
    window.setTimeout(() => titleRef.current?.focus(), 0);
  }

  function openPanel(tab: PanelTab) {
    setPanelTab(tab);
    setShowAnalysisMobile(true);
    setShowSidebarMobile(false);
  }

  function openAssistant() {
    if (editor) {
      const { from, to } = editor.state.selection;
      setSelectedText(editor.state.doc.textBetween(from, to, ' '));
    }
    openPanel('assistant');
  }

  function refreshAnalysis() {
    if (editor) setEditorJson(editor.getJSON());
  }

  function focusField(field: string) {
    if (field === 'title') {
      setShowAnalysisMobile(false);
      window.requestAnimationFrame(() => titleRef.current?.focus());
      return;
    }
    if (field === 'metaDescription') {
      openPanel('brief');
      window.setTimeout(
        () => document.getElementById('brief-description')?.focus(),
        0,
      );
      return;
    }
    if (field === 'bodyText' || field === 'headings' || field === 'images') {
      setShowAnalysisMobile(false);
      window.requestAnimationFrame(() => editor?.commands.focus());
      return;
    }
  }

  function jumpToHeading(index: number) {
    setShowAnalysisMobile(false);
    window.requestAnimationFrame(() => {
      if (index === 0) {
        titleRef.current?.focus();
        return;
      }
      const heading =
        editor?.view.dom.querySelectorAll('h1,h2,h3,h4,h5,h6')[index - 1];
      heading?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (heading instanceof HTMLElement) heading.click();
    });
  }

  function exportDocument(format: 'html' | 'json') {
    const current = {
      ...activeDocument,
      html: editor?.getHTML() ?? activeDocument.html,
    };
    const name = current.slug || 'untitled-document';
    if (format === 'json') {
      downloadFile(
        `${name}.json`,
        JSON.stringify(current, null, 2),
        'application/json',
      );
      return;
    }
    const html = `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(current.title)}</title><meta name="description" content="${escapeHtml(current.metaDescription)}"></head><body><article><h1>${escapeHtml(current.title)}</h1>${current.html}</article></body></html>`;
    downloadFile(`${name}.html`, html, 'text/html');
  }

  const filteredDocuments = documents.filter((item) =>
    (item.title || 'Untitled document')
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const wordCount = countWords(snapshot.bodyText);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="topbar-brand">
          <Button
            variant="ghost"
            size="icon-sm"
            className="mobile-menu-button"
            aria-label="Open navigation"
            onClick={() => setShowSidebarMobile(true)}
          >
            <Menu />
          </Button>
          <span className="brand-icon">
            <Feather className="size-5" />
          </span>
          <strong>Typseo</strong>
          <span className="brand-divider">/</span>
          <span className="brand-subtitle">Playground</span>
        </div>
        <div className="header-search">
          <Search className="size-4" />
          <Input
            ref={searchRef}
            aria-label="Search documents"
            placeholder="Search documents..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <kbd>Ctrl K</kbd>
        </div>
        <div className="topbar-actions">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={
              theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
            }
            title="Toggle theme"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            {theme === 'light' ? <Sun /> : <Moon />}
          </Button>
          <a
            className="github-link"
            href="https://github.com/typseo/typseo"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <span className="avatar" aria-hidden="true">
            T
          </span>
        </div>
      </header>

      <div className="app-grid">
        {showSidebarMobile && (
          <button
            className="sidebar-scrim"
            type="button"
            aria-label="Close navigation"
            onClick={() => setShowSidebarMobile(false)}
          />
        )}
        <aside
          className={`left-sidebar ${showSidebarMobile ? 'mobile-open' : ''}`}
          aria-label="Workspace navigation"
        >
          <div className="sidebar-top">
            <Button className="new-document" onClick={createDocument}>
              <Plus className="size-4" />
              New document
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="sidebar-close"
              aria-label="Close navigation"
              onClick={() => setShowSidebarMobile(false)}
            >
              <X />
            </Button>
          </div>
          <nav className="primary-nav" aria-label="Playground sections">
            <button
              type="button"
              className={!showAnalysisMobile ? 'nav-item active' : 'nav-item'}
              onClick={() => {
                setShowAnalysisMobile(false);
                setShowSidebarMobile(false);
              }}
            >
              <FileText /> <span>Editor</span>
            </button>
            <button
              type="button"
              className={
                showAnalysisMobile && panelTab === 'analysis'
                  ? 'nav-item active'
                  : 'nav-item'
              }
              onClick={() => openPanel('analysis')}
            >
              <ClipboardList />
              <span>SEO Analysis</span>
            </button>
            <button
              type="button"
              className={
                showAnalysisMobile && panelTab === 'brief'
                  ? 'nav-item active'
                  : 'nav-item'
              }
              onClick={() => openPanel('brief')}
            >
              <BookOpen />
              <span>Content Brief</span>
            </button>
            <button
              type="button"
              className={
                showAnalysisMobile && panelTab === 'assistant'
                  ? 'nav-item active'
                  : 'nav-item'
              }
              onClick={openAssistant}
            >
              <Sparkles />
              <span>AI Assistant</span>
            </button>
          </nav>
          <div className="sidebar-mobile-search">
            <Search className="size-4" />
            <Input
              aria-label="Search documents in navigation"
              placeholder="Search documents..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="sidebar-documents">
            <div className="sidebar-section-title">
              <span>Documents</span>
              <span>{documents.length}</span>
            </div>
            <div className="document-list">
              {filteredDocuments.length ? (
                filteredDocuments.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    className={
                      item.id === activeId
                        ? 'document-item active'
                        : 'document-item'
                    }
                    title={item.title || 'Untitled document'}
                    onClick={() => switchDocument(item.id)}
                  >
                    <FileText />
                    <span>{item.title || 'Untitled document'}</span>
                  </button>
                ))
              ) : (
                <p className="empty-search">No matching documents.</p>
              )}
            </div>
          </div>
          <div className="sidebar-bottom">
            <p>Open-source editor toolkit</p>
            <a
              href="https://github.com/typseo/typseo"
              target="_blank"
              rel="noreferrer"
            >
              View repository ↗
            </a>
            <small>Drafts stay in this browser.</small>
          </div>
        </aside>

        <section
          className={`editor-pane ${showAnalysisMobile ? 'mobile-hidden' : ''}`}
          aria-label="Document editor"
        >
          <div className="document-topline">
            <div className="breadcrumb">
              <span>Documents</span>
              <ChevronDown className="breadcrumb-arrow" />
              <strong>{activeDocument.title || 'Untitled document'}</strong>
            </div>
            <span className="save-indicator">
              <Check className="size-3.5" />
              {saveState === 'editing' ? 'Saving locally...' : 'Saved locally'}
            </span>
            <div className="document-actions">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreview(!preview)}
              >
                <Eye className="size-4" />
                {preview ? 'Edit' : 'Preview'}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm">
                    <Download className="size-4" />
                    Export
                    <ChevronDown className="size-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => exportDocument('html')}>
                    Download HTML
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => exportDocument('json')}>
                    Download JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <PlaygroundToolbar
            editor={editor}
            disabled={preview}
            onOpenAssistant={openAssistant}
          />
          <div className={`editor-scroll ${preview ? 'is-preview' : ''}`}>
            <article className="document-paper">
              <textarea
                ref={titleRef}
                className="document-title"
                aria-label="Page title"
                placeholder="Untitled document"
                value={activeDocument.title}
                onChange={(event) =>
                  updateDocument({ title: event.target.value })
                }
                readOnly={preview}
                rows={1}
              />
              <textarea
                className="document-description"
                aria-label="Meta description"
                placeholder="Add a short description for this page..."
                value={activeDocument.metaDescription}
                onChange={(event) =>
                  updateDocument({ metaDescription: event.target.value })
                }
                readOnly={preview}
                rows={2}
              />
              <EditorContent editor={editor} className="editor-content" />
            </article>
          </div>
          <div className="editor-status">
            <span>
              {wordCount} words <span aria-hidden="true">·</span>{' '}
              {Math.ceil(wordCount / 225)} min read
            </span>
            <span>
              <i className="status-dot" />
              {saveState === 'editing'
                ? 'Saving...'
                : 'All changes saved locally'}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="mobile-analysis-button"
              onClick={() => openPanel('analysis')}
            >
              <PanelRightOpen className="size-4" />
              Analysis
            </Button>
          </div>
        </section>

        <div
          className={
            showAnalysisMobile
              ? 'analysis-mobile-visible'
              : 'analysis-mobile-hidden'
          }
        >
          <SeoPanel
            activeTab={panelTab}
            onTabChange={setPanelTab}
            document={activeDocument}
            analysis={analysis}
            snapshot={snapshot}
            selectedText={selectedText}
            onUpdateDocument={updateDocument}
            onRefresh={refreshAnalysis}
            onFocusField={focusField}
            onJumpToHeading={jumpToHeading}
          />
        </div>
      </div>
      <nav className="mobile-bottom-nav" aria-label="Mobile views">
        <button
          type="button"
          aria-current={!showAnalysisMobile ? 'page' : undefined}
          onClick={() => setShowAnalysisMobile(false)}
        >
          <FileText />
          Editor
        </button>
        <button
          type="button"
          aria-current={showAnalysisMobile ? 'page' : undefined}
          onClick={() => openPanel('analysis')}
        >
          <ClipboardList />
          Analysis
        </button>
      </nav>
    </main>
  );
}
