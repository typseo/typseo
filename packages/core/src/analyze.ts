import { defaultSeoRules } from './rules.js';
import type { SeoAnalysis, SeoCheck, SeoDocument, SeoRule } from './types.js';

/** Evaluate rules synchronously against a plain document snapshot. */
export function analyzeSeoDocument(
  document: SeoDocument,
  rules: readonly SeoRule[] = defaultSeoRules,
): SeoAnalysis {
  const seen = new Set<string>();
  const checks: SeoCheck[] = [];
  let earnedWeight = 0;
  let applicableWeight = 0;

  for (const rule of rules) {
    if (!rule.id || seen.has(rule.id)) {
      throw new Error(`SEO rule id must be unique and nonempty: ${rule.id}`);
    }
    if (!Number.isFinite(rule.weight) || rule.weight <= 0) {
      throw new Error(
        `SEO rule weight must be positive and finite: ${rule.id}`,
      );
    }
    seen.add(rule.id);
    const result = rule.evaluate(document);
    if (
      result.status !== 'pass' &&
      result.status !== 'fail' &&
      result.status !== 'skip'
    ) {
      throw new Error(`SEO rule returned an invalid status: ${rule.id}`);
    }
    if (result.status === 'fail' && !result.issue) {
      throw new Error(`Failed SEO rule must provide an issue: ${rule.id}`);
    }
    const check: SeoCheck =
      result.status === 'fail'
        ? {
            id: rule.id,
            weight: rule.weight,
            status: 'fail',
            issue: result.issue,
          }
        : { id: rule.id, weight: rule.weight, status: result.status };
    checks.push(check);

    if (result.status !== 'skip') {
      applicableWeight += rule.weight;
      if (result.status === 'pass') earnedWeight += rule.weight;
    }
  }

  return {
    score:
      applicableWeight === 0
        ? 0
        : Math.round((earnedWeight / applicableWeight) * 100),
    earnedWeight,
    applicableWeight,
    checks,
    issues: checks.flatMap((check) => (check.issue ? [check.issue] : [])),
  };
}
