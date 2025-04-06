export default function ModeButton({
  onSelect,
  active,
  text,
}: {
  onSelect: () => void;
  active: boolean;
  text: string;
}) {
  return (
    <button
      onClick={onSelect}
      className={`h-8 select-none gap-2.5 rounded-lg rounded-md px-2.5 text-label-sm ${
        active
          ? "bg-bg-weak-50 text-text-strong-950 ring-transparent"
          : "bg-transparent text-text-sub-600 ring-transparent hover:text-text-strong-950"
      }`}
    >
      {text}
    </button>
  );
}
