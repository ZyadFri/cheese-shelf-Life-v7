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

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-[#0d0e10] px-5 py-14 text-white sm:px-7 sm:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-8%] size-[420px] rounded-full bg-primary/20 blur-[100px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 left-[10%] size-[360px] rounded-full bg-primary/10 blur-[120px]"
      />

      <div className="relative mx-auto grid w-full max-w-[1180px] gap-12 lg:grid-cols-[1.1fr_0.8fr_1fr] lg:items-start">
        <div className="max-w-[360px]">
          <div className="flex items-start gap-3">
            <span className="mt-1 h-9 w-[3px] rounded-full bg-[#d74b64]" />
            <div>
              <p className="text-[1.1rem] font-semibold tracking-[-0.025em] text-white">
                Shelf-Life Studio
              </p>
              <p className="mt-1 text-[0.6875rem] font-semibold tracking-[0.08em] text-white/45 uppercase">
                McGill University · Macdonald Campus
              </p>
            </div>
          </div>
          <p className="mt-5 max-w-[42ch] text-[0.8125rem] leading-6 text-white/56">
            Department of Food Science and Agricultural Chemistry. Predictions are research
            output, not a food-safety determination.
          </p>
        </div>

        <nav className="grid grid-cols-2 gap-x-8 gap-y-3 lg:grid-cols-1">
          {LINKS.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group w-fit text-[0.8125rem] font-medium text-white/55 transition-colors hover:text-white"
              >
                <span>{link.label}</span>
                <span className="mt-1 block h-px w-0 bg-[#d74b64] transition-all duration-300 group-hover:w-full" />
              </a>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="group w-fit text-[0.8125rem] font-medium text-white/55 transition-colors hover:text-white"
              >
                <span>{link.label}</span>
                <span className="mt-1 block h-px w-0 bg-[#d74b64] transition-all duration-300 group-hover:w-full" />
              </a>
            ),
          )}
        </nav>

        <div className="lg:justify-self-end">
          <p className="text-[0.6875rem] font-semibold tracking-[0.08em] text-white/42 uppercase">
            Follow Macdonald Campus
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {SOCIAL_LINKS.map(({ label, href, Icon }, index) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Macdonald Campus on ${label}`}
                title={label}
                className="group flex size-12 items-center justify-center rounded-full border border-white/14 bg-white/[0.035] text-white/68 shadow-[0_10px_30px_-22px_rgba(0,0,0,1)] transition-[transform,background-color,border-color,color,box-shadow] duration-300 hover:-translate-y-1 hover:scale-105 hover:border-[#d74b64]/70 hover:bg-[#d74b64] hover:text-white hover:shadow-[0_16px_38px_-20px_rgba(215,75,100,0.8)] active:translate-y-0 active:scale-95"
                style={{ transitionDelay: `${index * 18}ms` }}
              >
                <Icon className="size-[20px] transition-transform duration-300 group-hover:rotate-[-4deg] group-hover:scale-110" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="relative mx-auto mt-12 flex w-full max-w-[1180px] flex-col gap-3 border-t border-white/10 pt-6 text-[0.6875rem] text-white/35 sm:flex-row sm:items-center sm:justify-between">
        <p>McGill University · Macdonald Campus · Department of Food Science and Agricultural Chemistry</p>
        <p>Research software · Shelf-Life Studio</p>
      </div>
    </footer>
  );
}
