export default function Wordmark({
  withMark = true,
  onDark = false,
}: {
  withMark?: boolean;
  /** Use on the green bands: the second word switches to marigold for contrast. */
  onDark?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2.5">
      {withMark && (
        <span
          aria-hidden="true"
          className="display flex h-8 w-8 items-center justify-center rounded-full bg-accent text-[15px] leading-none text-white max-[359px]:hidden"
        >
          P
        </span>
      )}
      <span className="display text-[19px] leading-none tracking-[-0.02em]">
        Prime
        <span className={onDark ? "text-marigold" : "text-accent-ink"}>
          Bookin
        </span>
      </span>
    </span>
  );
}
