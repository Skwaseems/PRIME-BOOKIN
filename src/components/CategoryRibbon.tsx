import { categories } from "@/data/categories";

/** Decorative scrolling ribbon of service names (the real links are elsewhere). */
export default function CategoryRibbon() {
  const items = [...categories, ...categories];
  return (
    <div
      aria-hidden="true"
      className="group overflow-hidden border-y border-[#13201a]/10 bg-marigold py-4 text-[#13201a]"
    >
      <div className="animate-marquee flex w-max items-center">
        {items.map((category, index) => (
          <span
            key={`${category.slug}-${index}`}
            className="display flex items-center gap-6 px-6 text-xl whitespace-nowrap sm:text-2xl"
          >
            <category.icon size={22} strokeWidth={2} />
            {category.title}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              className="ml-6 opacity-60"
            >
              <path
                d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z"
                fill="currentColor"
              />
            </svg>
          </span>
        ))}
      </div>
    </div>
  );
}
