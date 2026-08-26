import { FlaskConical } from "lucide-react";

import { FacebookIcon, LinkedinIcon, XIcon, YoutubeIcon } from "./social-icons";

// Official Macdonald Campus / Faculty of Agricultural and Environmental
// Sciences accounts, verified against McGill's own social media directory
// (mcgill.ca/newsroom/faculty-and-staff/socialmedia/directory). No account
// is listed here that isn't confirmed from that official source.
const SOCIAL_LINKS = [
  { label: "Facebook", href: "https://www.facebook.com/McGillMacCampus/", Icon: FacebookIcon },
  { label: "X (Twitter)", href: "https://twitter.com/McGillMacCampus", Icon: XIcon },
  { label: "LinkedIn", href: "https://www.linkedin.com/school/mcgill-university---macdonald-campus/", Icon: LinkedinIcon },
  { label: "YouTube", href: "https://www.youtube.com/channel/UC4z80aBZ7j0JPRBSFfd0p8g", Icon: YoutubeIcon },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-canvas px-5 py-10 sm:px-7">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-5 items-center justify-center rounded-sm bg-primary">
            <FlaskConical className="size-3 text-primary-foreground" />
          </span>
          <span className="type-title text-foreground">Shelf-Life Studio</span>
        </div>

        <nav className="flex items-center gap-6">
          <a href="#research" className="type-ui text-muted-foreground transition-colors hover:text-foreground">
            About us
          </a>
          <a
            href="https://www.mcgill.ca/"
            target="_blank"
            rel="noopener noreferrer"
            className="type-ui text-muted-foreground transition-colors hover:text-foreground"
          >
            McGill University
          </a>
        </nav>
      </div>

      <div className="mx-auto mt-8 flex w-full max-w-[1180px] flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="type-caption text-subtle-foreground">
          McGill University · Macdonald Campus · Department of Food Science
        </p>
        <div className="flex items-center gap-3.5">
          {SOCIAL_LINKS.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Macdonald Campus on ${label}`}
              className="text-subtle-foreground transition-colors hover:text-foreground"
            >
              <Icon className="size-4" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
