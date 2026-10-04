import type { QuestionScreen, Screen } from '../types';
import type { AnswerValue } from './answers';
import { DECISION_LABEL } from './decisionReveal';

/**
 * What a question asked and what the learner answered, in a few words: the
 * mistakes deck's cards (docs/ui/05-chart-questions-and-mistakes-round.md §4.5) and the Practice tab's Mistakes list
 * (§7.3) show them. Where an answer has no short form -- a match, an order of
 * cards -- it says nothing rather than something long.
 */

/** The words a question opens with, cut to fit a card. */
export function questionLine(screen: Screen, max = 64): string {
  const s = screen as {
    prompt?: string;
    statement?: string;
    scenario?: string;
    sentence?: string;
  };
  const text = (s.prompt ?? s.statement ?? s.scenario ?? s.sentence ?? '')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const space = cut.lastIndexOf(' ');
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[,;:.\s]+$/, '')}…`;
}

/** The learner's answer in a few words, or '' when it has no short form. */
export function answerSummary(screen: QuestionScreen, value: AnswerValue | null): string {
  if (!value) return '';
  switch (value.kind) {
    case 'option': {
      if (value.index === null) return '';
      if (screen.type === 'mc' || screen.type === 'numeric-mc') {
        return screen.options[value.index]?.text ?? '';
      }
      if (screen.type === 'fill-choice') return screen.options[value.index] ?? '';
      return '';
    }
    case 'bool':
      return value.value === null ? '' : value.value ? 'True' : 'False';
    case 'numeric':
      return value.text.trim();
    case 'decision':
      return value.choice ? DECISION_LABEL[value.choice] : '';
    case 'target': {
      if (!value.id) return '';
      if (screen.type === 'depth-ladder') {
        const [side, n] = value.id.split('-');
        return `${side === 'ask' ? 'Ask' : 'Bid'} ${n}`;
      }
      if (screen.type === 'compare')
        return value.id === 'neither' ? 'Neither' : `Chart ${value.id}`;
      return value.id;
    }
    case 'index': {
      if (value.index === null) return '';
      if (screen.type === 'spot-mistake') return screen.segments[value.index]?.text ?? '';
      return `Bar ${value.index + 1}`;
    }
    case 'slider': {
      if (value.value === null) return '';
      const unit = screen.type === 'slider' ? (screen.unit ?? '') : '';
      return unit === '%' ? `${value.value} %` : `${value.value}${unit ? ` ${unit}` : ''}`;
    }
    default:
      return '';
  }
}
