interface ToggleSwitchProps {
  label: string;
  /** Full name for screen readers when the visible label repeats, as in a list. */
  ariaLabel?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export default function ToggleSwitch({ label, ariaLabel, checked, onChange, disabled }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="inline-flex min-h-11 items-center gap-2 rounded-xl px-1 text-sm font-semibold text-heading disabled:opacity-50"
    >
      <span
        aria-hidden
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-success" : "bg-line"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-card transition-transform ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </span>
      {label}
    </button>
  );
}
