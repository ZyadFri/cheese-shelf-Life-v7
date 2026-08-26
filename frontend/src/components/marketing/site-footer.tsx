import {
  InstagramIcon,
  LinkedinIcon,
  XIcon,
  YoutubeIcon,
} from "./social-icons";

const SOCIAL_LINKS = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/school/mcgill-university---macdonald-campus/",
    Icon: LinkedinIcon,
  },
  { label: "X (Twitter)", href: "https://twitter.com/McGillMacCampus", Icon: XIcon },
  {
    label: "YouTube",
    href: "https://www.youtube.com/channel/UC4z80aBZ7j0JPRBSFfd0p8g",
    Icon: YoutubeIcon,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/McGillMacCampus/",
    Icon: InstagramIcon,
  },
];

const MCGILL_LOGO_REVERSED =
  "https://www.mcgill.ca/visual-identity/files/visual-identity/mcgill_sig_red_rev.png";

export function SiteFooter() {
  return (
    <footer className="bg-[#111318] px-5 py-4 text-white sm:px-7">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex shrink-0 items-center gap-3">
          <img
            src={MCGILL_LOGO_REVERSED}
            alt="McGill University"
            className="h-[27px] w-auto object-contain"
          />
          <span className="h-6 w-px bg-white/18" aria-hidden />
          <span className="text-[0.76rem] font-semibold tracking-[-0.02em] text-white">
            Shelf-Life Studio
          </span>
        </div>

        <p className="text-[0.56rem] leading-4 text-white/42 sm:mx-auto sm:text-center">
          Built at McGill University · Food Science & Agricultural Chemistry
          <span className="mx-2 hidden text-white/18 md:inline">·</span>
          <span className="hidden md:inline">Research software</span>
        </p>

        <div className="flex items-center gap-2.5 sm:ml-auto">
          {SOCIAL_LINKS.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Macdonald Campus on ${label}`}
              title={label}
              className="group flex size-9 items-center justify-center rounded-full border border-white/28 bg-white/[0.02] text-white/78 transition-[transform,background-color,border-color,color,box-shadow] duration-200 hover:-translate-y-1 hover:scale-105 hover:border-primary hover:bg-primary hover:text-white hover:shadow-[0_12px_26px_-16px_rgba(215,75,100,0.9)] active:translate-y-0 active:scale-95"
            >
              <Icon className="size-[16px] transition-transform duration-200 group-hover:scale-110" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
