export default function Wordmark({ withMark = true }: { withMark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      {withMark && (
        <span
          aria-hidden="true"
          className="display flex h-7 w-7 max-[359px]:hidden items-center justify-center rounded-[7px] bg-accent text-[15px] leading-none font-bold text-white"
        >
          P
        </span>
      )}
      <span className="display text-[19px] leading-none font-bold tracking-[-0.02em]">
        Prime<span className="text-accent-ink">Bookin</span>
      </span>
    </span>
  );
}
