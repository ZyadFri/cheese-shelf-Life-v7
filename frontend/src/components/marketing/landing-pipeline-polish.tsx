export function LandingPipelinePolish() {
  return (
    <style>{`
      /* Landing pipeline — staggered photographic story, matching the approved reference. */
      main #pipeline {
        overflow: hidden !important;
        background:
          radial-gradient(circle at 93% 17%, rgba(155, 28, 60, .07), transparent 25rem),
          radial-gradient(circle at 4% 82%, rgba(239, 205, 215, .24), transparent 22rem),
          linear-gradient(180deg, #fffdfd 0%, #fff9fb 54%, #fffefe 100%) !important;
      }

      main #pipeline [class*="pipelineStory"] {
        position: relative !important;
        display: block !important;
        width: min(calc(100vw - 72px), 1580px) !important;
        max-width: none !important;
        margin-left: auto !important;
        margin-right: auto !important;
        padding: 0 0 3rem !important;
      }

      main #pipeline [class*="pipelineIntro"] {
        position: relative !important;
        display: grid !important;
        grid-template-columns: minmax(0, 1.18fr) minmax(20rem, .82fr) !important;
        gap: .6rem clamp(2rem, 6vw, 7rem) !important;
        min-height: 0 !important;
        padding: 0 !important;
        margin-bottom: 2rem !important;
        align-items: end !important;
      }

      main #pipeline [class*="pipelineIntro"] > div:first-of-type {
        grid-column: 1 !important;
        grid-row: 1 !important;
      }

      main #pipeline [class*="pipelineIntro"] > h2 {
        grid-column: 1 !important;
        grid-row: 2 !important;
        max-width: 15ch !important;
        margin: .8rem 0 0 !important;
        font-size: clamp(3rem, 5.15vw, 5.15rem) !important;
        line-height: .94 !important;
      }

      main #pipeline [class*="pipelineIntro"] > div:nth-of-type(2) {
        grid-column: 2 !important;
        grid-row: 2 !important;
        align-self: end !important;
        padding-bottom: .75rem !important;
      }

      main #pipeline [class*="pipelineIntro"] [class*="pipelineCopy"] {
        max-width: 35rem !important;
        margin: 0 !important;
        font-size: clamp(.9rem, 1.2vw, 1.08rem) !important;
        line-height: 1.62 !important;
      }

      main #pipeline [class*="pipelineIntro"] > div:nth-of-type(3) {
        position: absolute !important;
        left: 0 !important;
        bottom: -3.1rem !important;
        z-index: 5 !important;
      }

      main #pipeline [class*="pipelineBenchPhoto"],
      main #pipeline [class*="pipelineTexture"],
      main #pipeline [class*="pipelineCurve"],
      main #pipeline [class*="pipelineAxis"] {
        display: none !important;
      }

      /* Important: transforms do not participate in normal document flow.
         This explicit stage height reserves space for the lower staggered cards
         so the following Explainability section can never overlap them. */
      main #pipeline [class*="pipelineCanvas"] {
        position: relative !important;
        width: 100% !important;
        min-height: 61rem !important;
        padding: 0 !important;
        margin-top: 2.5rem !important;
        isolation: isolate !important;
        overflow: visible !important;
      }

      /* Decorative connector only; cards are the semantic structure. */
      main #pipeline [class*="pipelineCanvas"]::before {
        content: "";
        position: absolute;
        z-index: 0;
        inset: 2rem 2.25% 10rem;
        pointer-events: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1500 620' preserveAspectRatio='none'%3E%3Cpath d='M230 250 C300 250 300 410 390 410 S530 205 610 205 S760 400 845 400 S965 140 1060 140 S1190 305 1270 155' fill='none' stroke='%23a51f42' stroke-width='2.2' stroke-linecap='round' stroke-dasharray='7 6' opacity='.88'/%3E%3Ccircle cx='230' cy='250' r='7' fill='%23fff9fb' stroke='%23a51f42' stroke-width='3'/%3E%3Ccircle cx='390' cy='410' r='7' fill='%23fff9fb' stroke='%23a51f42' stroke-width='3'/%3E%3Ccircle cx='610' cy='205' r='7' fill='%23fff9fb' stroke='%23a51f42' stroke-width='3'/%3E%3Ccircle cx='845' cy='400' r='7' fill='%23fff9fb' stroke='%23a51f42' stroke-width='3'/%3E%3Ccircle cx='1060' cy='140' r='7' fill='%23fff9fb' stroke='%23a51f42' stroke-width='3'/%3E%3C/svg%3E") !important;
        background-repeat: no-repeat !important;
        background-position: center top !important;
        background-size: 100% 34rem !important;
        opacity: .82;
      }

      main #pipeline [class*="pipelineCanvas"] > div:nth-of-type(2) {
        position: relative !important;
        z-index: 2 !important;
        display: grid !important;
        grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
        gap: clamp(1rem, 1.65vw, 1.8rem) !important;
        align-items: start !important;
        width: 100% !important;
        padding: 0 !important;
        overflow: visible !important;
      }

      main #pipeline [class*="pipelineCanvas"] > div:nth-of-type(2) > div {
        position: relative !important;
        min-width: 0 !important;
        transition: transform .34s cubic-bezier(.2,.8,.2,1) !important;
      }

      main #pipeline [class*="pipelineCanvas"] > div:nth-of-type(2) > div:nth-child(1) { transform: translateY(8.5rem) !important; }
      main #pipeline [class*="pipelineCanvas"] > div:nth-of-type(2) > div:nth-child(2) { transform: translateY(19rem) !important; }
      main #pipeline [class*="pipelineCanvas"] > div:nth-of-type(2) > div:nth-child(3) { transform: translateY(4.5rem) !important; }
      main #pipeline [class*="pipelineCanvas"] > div:nth-of-type(2) > div:nth-child(4) { transform: translateY(18rem) !important; }
      main #pipeline [class*="pipelineCanvas"] > div:nth-of-type(2) > div:nth-child(5) { transform: translateY(0) !important; }

      main #pipeline [class*="pipelineCanvas"] > div:nth-of-type(2) > div:not(:last-child)::after {
        display: none !important;
      }

      main #pipeline [class*="pipelineCanvas"] article {
        position: relative !important;
        display: flex !important;
        min-height: 0 !important;
        height: auto !important;
        flex-direction: column !important;
        padding: 0 !important;
        overflow: hidden !important;
        border: 1px solid rgba(213, 180, 190, .78) !important;
        border-radius: 27px !important;
        background: linear-gradient(180deg, rgba(255,255,255,.98), rgba(255,248,250,.97)) !important;
        box-shadow: 0 28px 70px -50px rgba(77, 25, 42, .44) !important;
        transition: transform .35s cubic-bezier(.2,.8,.2,1), box-shadow .35s ease, border-color .35s ease !important;
      }

      main #pipeline [class*="pipelineCanvas"] article:hover {
        transform: translateY(-9px) !important;
        border-color: rgba(169, 44, 75, .72) !important;
        box-shadow: 0 36px 82px -46px rgba(91, 26, 47, .54) !important;
      }

      main #pipeline [class*="pipelineStepBadge"] {
        position: absolute !important;
        z-index: 6 !important;
        top: 1rem !important;
        left: 1rem !important;
        display: grid !important;
        place-items: center !important;
        width: 3.15rem !important;
        height: 3.15rem !important;
        margin: 0 !important;
        border: 2px solid rgba(255,255,255,.76) !important;
        border-radius: 50% !important;
        background: linear-gradient(145deg, #ae274c, #7b1731) !important;
        color: #fff !important;
        box-shadow: 0 14px 28px -15px rgba(89, 18, 38, .66), 0 0 0 1px rgba(126,19,47,.20) !important;
        font-size: 1.25rem !important;
        font-weight: 650 !important;
        line-height: 1 !important;
      }

      main #pipeline [class*="pipelineCanvas"] article > div {
        order: 0 !important;
        width: 100% !important;
        height: clamp(12.5rem, 15vw, 16rem) !important;
        min-height: clamp(12.5rem, 15vw, 16rem) !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
        border: 0 !important;
        border-radius: 0 !important;
        background-position: center !important;
        background-size: cover !important;
        background-repeat: no-repeat !important;
        box-shadow: none !important;
        filter: saturate(.82) contrast(.98) brightness(1.04) !important;
        transition: transform .55s cubic-bezier(.2,.8,.2,1), filter .4s ease !important;
      }

      main #pipeline [class*="pipelineCanvas"] article:hover > div {
        transform: scale(1.035) !important;
        filter: saturate(.94) contrast(1.01) brightness(1.03) !important;
      }

      main #pipeline [class*="pipelineCanvas"] article > div > * {
        display: none !important;
      }

      /* Five NEW real photographs, selected to literally match each pipeline stage. */
      main #pipeline [class*="pipelineCanvas"] > div:nth-of-type(2) > div:nth-child(1) article > div {
        background-image: linear-gradient(rgba(255,255,255,.05), rgba(255,255,255,.05)), url('https://commons.wikimedia.org/wiki/Special:Redirect/file/Food%20safety%20research119.jpg?width=1200') !important;
        background-position: center 42% !important;
      }
      main #pipeline [class*="pipelineCanvas"] > div:nth-of-type(2) > div:nth-child(2) article > div {
        background-image: url('https://commons.wikimedia.org/wiki/Special:Redirect/file/YPD%20petri%20dishes.jpg?width=1200') !important;
        background-position: center 48% !important;
      }
      main #pipeline [class*="pipelineCanvas"] > div:nth-of-type(2) > div:nth-child(3) article > div {
        background-image: url('https://commons.wikimedia.org/wiki/Special:Redirect/file/Macro%20laptop%20coding%20%28Unsplash%29.jpg?width=1200') !important;
        background-position: center 52% !important;
      }
      main #pipeline [class*="pipelineCanvas"] > div:nth-of-type(2) > div:nth-child(4) article > div {
        background-image: url('https://commons.wikimedia.org/wiki/Special:Redirect/file/Datacenter%20Server%20Racks%20%2822370909788%29.jpg?width=1200') !important;
        background-position: center 48% !important;
      }
      main #pipeline [class*="pipelineCanvas"] > div:nth-of-type(2) > div:nth-child(5) article > div {
        background-image: url('https://commons.wikimedia.org/wiki/Special:Redirect/file/Statistics%20on%20a%20laptop%20%28Unsplash%29.jpg?width=1200') !important;
        background-position: center 52% !important;
      }

      main #pipeline [class*="pipelineCanvas"] article h3 {
        order: 1 !important;
        margin: 0 !important;
        padding: 1.35rem 1.3rem 0 !important;
        font-family: var(--font-display) !important;
        color: #262226 !important;
        font-size: clamp(1.22rem, 1.48vw, 1.58rem) !important;
        font-weight: 540 !important;
        line-height: 1.05 !important;
        letter-spacing: -.035em !important;
      }

      main #pipeline [class*="pipelineCanvas"] article h3::after {
        content: "";
        display: block;
        width: 2.2rem;
        margin-top: .72rem;
        border-top: 2px solid #a61f43;
      }

      main #pipeline [class*="pipelineCanvas"] article p {
        order: 2 !important;
        min-height: 7.2rem !important;
        margin: 0 !important;
        padding: .85rem 1.3rem 1.45rem !important;
        color: #6b6870 !important;
        font-size: clamp(.7rem, .78vw, .83rem) !important;
        line-height: 1.55 !important;
      }

      /* Hard separation: Explainability belongs to the next visual chapter. */
      main #pipeline [class*="explainability"] {
        position: relative !important;
        clear: both !important;
        margin-top: 0 !important;
        padding-top: 5.5rem !important;
        border-top: 1px solid rgba(228, 213, 218, .72) !important;
      }

      @media (max-width: 1360px) {
        main #pipeline [class*="pipelineStory"] {
          width: min(calc(100vw - 48px), 1280px) !important;
        }
        main #pipeline [class*="pipelineCanvas"] {
          min-height: 54rem !important;
        }
        main #pipeline [class*="pipelineCanvas"] > div:nth-of-type(2) > div:nth-child(1) { transform: translateY(6.5rem) !important; }
        main #pipeline [class*="pipelineCanvas"] > div:nth-of-type(2) > div:nth-child(2) { transform: translateY(14rem) !important; }
        main #pipeline [class*="pipelineCanvas"] > div:nth-of-type(2) > div:nth-child(3) { transform: translateY(3.25rem) !important; }
        main #pipeline [class*="pipelineCanvas"] > div:nth-of-type(2) > div:nth-child(4) { transform: translateY(13.2rem) !important; }
        main #pipeline [class*="pipelineCanvas"] > div:nth-of-type(2) > div:nth-child(5) { transform: translateY(0) !important; }
      }

      @media (max-width: 1120px) {
        main #pipeline [class*="pipelineCanvas"] {
          min-height: 32rem !important;
          overflow-x: auto !important;
          overflow-y: hidden !important;
          padding: 1rem 0 2rem !important;
        }
        main #pipeline [class*="pipelineCanvas"]::before { display: none !important; }
        main #pipeline [class*="pipelineCanvas"] > div:nth-of-type(2) {
          grid-template-columns: repeat(5, minmax(15rem, 1fr)) !important;
          width: max-content !important;
          min-width: 100% !important;
          gap: 1rem !important;
          padding: 0 0 1rem !important;
        }
        main #pipeline [class*="pipelineCanvas"] > div:nth-of-type(2) > div:nth-child(n) {
          transform: translateY(0) !important;
        }
        main #pipeline [class*="explainability"] {
          padding-top: 4rem !important;
        }
      }

      @media (max-width: 760px) {
        main #pipeline [class*="pipelineStory"] {
          width: calc(100vw - 28px) !important;
        }
        main #pipeline [class*="pipelineIntro"] {
          grid-template-columns: 1fr !important;
          margin-bottom: 3rem !important;
        }
        main #pipeline [class*="pipelineIntro"] > div:first-of-type,
        main #pipeline [class*="pipelineIntro"] > h2,
        main #pipeline [class*="pipelineIntro"] > div:nth-of-type(2) {
          grid-column: 1 !important;
          grid-row: auto !important;
        }
        main #pipeline [class*="pipelineIntro"] > div:nth-of-type(3) {
          bottom: -2.6rem !important;
        }
        main #pipeline [class*="pipelineCanvas"] article > div {
          height: 11rem !important;
          min-height: 11rem !important;
        }
      }
    `}</style>
  );
}
