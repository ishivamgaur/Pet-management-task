const controlClass =
  "min-h-[50px] w-full rounded-[14px] border-[1.5px] border-line bg-paper px-4 py-3 " +
  "font-sans text-[0.95rem] text-ink outline-none transition-colors focus:border-moss " +
  "disabled:opacity-50";

const labelClass = "grid gap-2 text-[0.88rem] font-semibold";

function Label({ htmlFor, children }) {
  return (
    <span id={htmlFor} className="text-muted">
      {children}
    </span>
  );
}

// Label + control in one place so every form in the app matches.
export function TextField({ label, id, as = "input", className = "", ...props }) {
  const Control = as;
  return (
    <label htmlFor={id} className={`${labelClass} ${className}`}>
      <Label htmlFor={id}>{label}</Label>
      <Control id={id} className={controlClass} {...props} />
    </label>
  );
}

export function TextArea({ label, id, className = "", ...props }) {
  return (
    <TextField as="textarea" label={label} id={id} className={`${className} resize-y`} {...props} />
  );
}
