import { FlaskConical } from "lucide-react";

import { FacebookIcon, InstagramIcon, LinkedinIcon, XIcon, YoutubeIcon } from "./social-icons";

// Official Macdonald Campus / Faculty of Agricultural and Environmental
// Sciences accounts, verified against McGill's own social media directory
// (mcgill.ca/newsroom/faculty-and-staff/socialmedia/directory). No account
// is listed here that isn't confirmed from that official source.
const SOCIAL_LINKS = [
  { label: "Facebook", href: "https://www.facebook.com/McGillMacCampus/", Icon: FacebookIcon },
  { label: "X (Twitter)", href: "https://twitter.com/McGillMacCampus", Icon: XIcon },
  { label: "LinkedIn", href: "https://www.linkedin.com/school/mcgill-university---macdonald-campus/", Icon: LinkedinIcon },
  { label: "Instagram", href: "https://www.instagram.com/McGillMacCampus/", Icon: InstagramIcon },
  { label: "YouTube", href: "https://www.youtube.com/channel/UC4z80aBZ7j0JPRBSFfd0p8g", Icon: YoutubeIcon },
];

const LINKS = [
  { label: "About us", href: "#research" },
  { label: "McGill University", href: "https://www.mcgill.ca/", external: true },
  { label: "Macdonald Campus", href: "https://www.mcgill.ca/macdonald/", external: true },
  { label: "Food Science", href: "https://www.mcgill.ca/foodscience/", external: true },
];

export function SiteFooter() {
  return (
    <footer className="bg-canvas px-5 py-12 sm:px-7">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-[280px]">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary">
              <FlaskConical className="size-4 text-primary-foreground" strokeWidth={1.75} />
            </span>
            <span className="flex flex-col leading-none">
              <span className="type-label font-semibold text-foreground">Shelf-Life Studio</span>
              <span className="type-caption mt-0.5 text-subtle-foreground">McGill University</span>
            </span>
          </div>
          <p className="type-caption mt-4 leading-relaxed text-muted-foreground">
            Macdonald Campus · Department of Food Science and Agricultural Chemistry.
            Predictions are research output, not a food-safety determination.
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-8 gap-y-2.5">
          {LINKS.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="type-ui text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="type-ui text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2.5">
          {SOCIAL_LINKS.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Macdonald Campus on ${label}`}
              className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <Icon className="size-[17px]" />
            </a>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-10 w-full max-w-[1180px] border-t border-border pt-6">
        <p className="type-caption text-subtle-foreground">
          McGill University · Macdonald Campus · Department of Food Science and
          Agricultural Chemistry
        </p>
      </div>
    </footer>
  );
}
