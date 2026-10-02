export const siteConfig = {
  name: "Prime Bookin",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.primebookin.in",
  description:
    "Book cabs, hotels, food, medicines and groceries from every local store near you — all in one premium cart and checkout.",
  email: "primebookin.com@gmail.com",
};

export function absoluteUrl(path: string) {
  return new URL(path, siteConfig.url).toString();
}
