import Link from "next/link";
import { FlaskConical } from "lucide-react";

import { FacebookIcon, InstagramIcon, LinkedinIcon, XIcon, YoutubeIcon } from "./social-icons";

// Official Macdonald Campus / Faculty of Agricultural and Environmental
// Sciences accounts, verified against McGill's own social media directory
// (mcgill.ca/newsroom/faculty-and-staff/socialmedia/directory). No account
// is listed here that isn't confirmed from that official source.
const SOCIAL_LINKS = [
  { label: "Facebook", href: "https://www.facebook.com/McGillMacCampus/", Icon: FacebookIcon },
  { label: "X (Twitter)", href: "https://twitter.com/McGillMacCampus", Icon: XIcon },
  { label: "Instagram", href: "https://www.instagram.com/McGillMacCampus/", Icon: InstagramIcon },
  { label: "LinkedIn", href: "https://www.linkedin.com/school/mcgill-university---macdonald-campus/", Icon: LinkedinIcon },
  { label: "YouTube", href: "https://www.youtube.com/channel/UC4z80aBZ7j0JPRBSFfd0p8g", Icon: YoutubeIcon },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-canvas px-5 py-12 sm:px-7">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-[300px]">
          <div className="flex items-center gap-2">
            <span className="flex size-5 items-center justify-center rounded-sm bg-primary">
              <FlaskConical className="size-3 text-primary-foreground" />
            </span>
            <span className="type-title text-foreground">Shelf-Life Studio</span>
          </div>
          <p className="type-caption mt-3 leading-relaxed text-muted-foreground">
            A shelf-life modelling platform for food-science research. Predictions are
            research output, not a food-safety determination.
          </p>
        </div>

        <nav className="flex gap-12">
          <div className="flex flex-col gap-2">
            <p className="type-eyebrow text-subtle-foreground">Product</p>
            <a href="#platform" className="type-ui text-muted-foreground transition-colors hover:text-foreground">
              Platform
            </a>
            <a href="#pipeline" className="type-ui text-muted-foreground transition-colors hover:text-foreground">
              Pipeline
            </a>
            <a href="#research" className="type-ui text-muted-foreground transition-colors hover:text-foreground">
              Research
            </a>
            <a href="#validation" className="type-ui text-muted-foreground transition-colors hover:text-foreground">
              Validation
            </a>
          </div>
          <div className="flex flex-col gap-2">
            <p className="type-eyebrow text-subtle-foreground">Account</p>
            <Link href="/login" className="type-ui text-muted-foreground transition-colors hover:text-foreground">
              Log in
            </Link>
            <Link href="/signup" className="type-ui text-muted-foreground transition-colors hover:text-foreground">
              Sign up
            </Link>
          </div>
        </nav>
      </div>

      <div className="mx-auto mt-10 flex w-full max-w-[1180px] flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
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
