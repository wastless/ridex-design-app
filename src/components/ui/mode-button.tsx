export default function ModeButton({
  onSelect,
  active,
  text,
  variant = "neutral",
}: {
  onSelect: () => void;
  active: boolean;
  text: string;
  variant?: "neutral" | "primary";
}) {
  return (
    <button
      onClick={onSelect}
      className={`h-8 select-none gap-2.5 rounded-lg rounded-md px-2.5 text-label-sm ${
        active
          ? variant === "neutral"
            ? "bg-bg-weak-50 text-text-strong-950 ring-transparent"
            : "bg-primary-alpha-10 text-primary-base ring-transparent"
          : "bg-transparent text-text-sub-600 ring-transparent hover:text-text-strong-950"
      }`}
    >
      {text}
    </button>
  );
}
