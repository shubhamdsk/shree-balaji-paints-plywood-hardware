import type { RefinementCtx } from "zod";

// Zero-width joiner (U+200D) is left out: it joins multi-part emojis that long text still allows.
const HIDDEN_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u200B\u200C\u200E\u200F\u202A-\u202E\u2060-\u2064\uFEFF]/;
const LINE_BREAKS = /[\r\n\t]/;
// ©, ® and ™ count as pictographs in Unicode but belong in brand names.
const EMOJI = /(?![\u00A9\u00AE\u2122])[\p{Extended_Pictographic}\p{Regional_Indicator}\u20E3\uFE0F]/u;
const LETTER = /\p{L}/u;
const PERSON_NAME = /^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u;
const PHONE_CHARS = /^[\d\s+()-]*$/;

export const TEXT_ERRORS = {
  hidden: "Remove hidden characters or line breaks",
  emoji: "Emojis aren't allowed here",
  letter: "Use at least one letter",
  personName: "Use letters only",
} as const;

/** Single-line names and titles: letters required, no emojis, no hidden characters. */
export function labelProblem(value: string): string | undefined {
  return plainTextProblem(value) ?? (value.trim() && !LETTER.test(value) ? TEXT_ERRORS.letter : undefined);
}

/** Single-line text that may be all digits, like a quantity: no emojis, no hidden characters. */
export function plainTextProblem(value: string): string | undefined {
  if (HIDDEN_CHARS.test(value) || LINE_BREAKS.test(value)) return TEXT_ERRORS.hidden;
  if (EMOJI.test(value)) return TEXT_ERRORS.emoji;
  return undefined;
}

/** A person's name in any script, with spaces, dots, apostrophes and hyphens. */
export function personNameProblem(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return labelProblem(trimmed) ?? (PERSON_NAME.test(trimmed) ? undefined : TEXT_ERRORS.personName);
}

/** Descriptions, messages and notes: line breaks and emojis allowed, hidden characters not. */
export function longTextProblem(value: string): string | undefined {
  return HIDDEN_CHARS.test(value) ? TEXT_ERRORS.hidden : undefined;
}

export function isPhoneText(value: string) {
  return PHONE_CHARS.test(value);
}

export function keepDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function keepPhoneChars(value: string) {
  return value.replace(/[^\d\s+()-]/g, "");
}

export function textRule(problem: (value: string) => string | undefined) {
  return (value: string, ctx: RefinementCtx) => {
    const message = problem(value);
    if (message) ctx.addIssue({ code: "custom", message });
  };
}
