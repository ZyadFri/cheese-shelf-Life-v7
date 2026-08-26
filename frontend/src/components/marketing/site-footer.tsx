import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  XIcon,
  YoutubeIcon,
} from "./social-icons";

const SOCIAL_LINKS = [
  { label: "Facebook", href: "https://www.facebook.com/McGillMacCampus/", Icon: FacebookIcon },
  { label: "X (Twitter)", href: "https://twitter.com/McGillMacCampus", Icon: XIcon },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/school/mcgill-university---macdonald-campus/",
    Icon: LinkedinIcon,
  },
  { label: "Instagram", href: "https://www.instagram.com/McGillMacCampus/", Icon: InstagramIcon },
  {
    label: "YouTube",
    href: "https://www.youtube.com/channel/UC4z80aBZ7j0JPRBSFfd0p8g",
    Icon: YoutubeIcon,
  },
];

const LINKS = [
  { label: "Research", href: "#research" },
  { label: "McGill University", href: "https://www.mcgill.ca/", external: true },
  { label: "Macdonald Campus", href: "https://www.mcgill.ca/macdonald/", external: true },
  { label: "Food Science", href: "https://www.mcgill.ca/foodscience/", external: true },
];

const MCGILL_LOGO_REVERSED =
  "https://www.mcgill.ca/visual-identity/files/visual-identity/mcgill_sig_red_rev.png";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-[#111216] px-5 py-12 text-white sm:px-7 sm:py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-28 -top-44 size-[390px] rounded-full bg-primary/20 blur-[110px]"
      />
      <div className="relative mx-auto grid w-full max-w-[1180px] gap-10 lg:grid-cols-[1.15fr_0.72fr_1fr] lg:items-start">
        <div className="max-w-[360px]">
          <div className="flex items-center gap-3">
            <img
              src={MCGILL_LOGO_REVERSED}
              alt="McGill University"
              className="h-[31px] w-auto object-contain"
            />
            <span className="h-7 w-px bg-white/14" aria-hidden />
            <span className="text-[0.875rem] font-semibold tracking-[-0.025em] text-white">
              Shelf-Life Studio
            </span>
          </div>
          <p className="mt-5 max-w-[43ch] text-[0.72rem] leading-5.5 text-white/48">
            Macdonald Campus · Department of Food Science and Agricultural Chemistry.
            Predictions are research output, not a food-safety determination.
          </p>
        </div>

        <nav className="grid grid-cols-2 gap-x-7 gap-y-3 lg:grid-cols-1">
          {LINKS.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group w-fit text-[0.72rem] font-medium text-white/48 transition-colors hover:text-white"
              >
                {link.label}
                <span className="mt-1 block h-px w-0 bg-[#d74b64] transition-all duration-300 group-hover:w-full" />
              </a>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="group w-fit text-[0.72rem] font-medium text-white/48 transition-colors hover:text-white"
              >
                {link.label}
                <span className="mt-1 block h-px w-0 bg-[#d74b64] transition-all duration-300 group-hover:w-full" />
              </a>
            ),
          )}
        </nav>

        <div className="lg:justify-self-end">
          <p className="text-[0.62rem] font-semibold tracking-[0.1em] text-white/36 uppercase">
            Follow Macdonald Campus
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            {SOCIAL_LINKS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Macdonald Campus on ${label}`}
                title={label}
                className="group flex size-[50px] items-center justify-center rounded-full border border-white/13 bg-white/[0.025] text-white/64 transition-[transform,background-color,border-color,color,box-shadow] duration-250 hover:-translate-y-1.5 hover:scale-105 hover:border-[#d74b64]/75 hover:bg-[#9b1c3c] hover:text-white hover:shadow-[0_16px_36px_-20px_rgba(215,75,100,0.9)] active:translate-y-0 active:scale-95"
              >
                <Icon className="size-[20px] transition-transform duration-250 group-hover:rotate-[-5deg] group-hover:scale-110" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="relative mx-auto mt-10 flex w-full max-w-[1180px] flex-col gap-2 border-t border-white/9 pt-5 text-[0.62rem] text-white/28 sm:flex-row sm:items-center sm:justify-between">
        <p>McGill University · Macdonald Campus · Food Science and Agricultural Chemistry</p>
        <p>Shelf-Life Studio · research software</p>
      </div>
    </footer>
  );
}
