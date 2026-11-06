export const sections = {
  intro: { label: "Introduction", file: "home.md" },
  contact: { label: "Contact bullets", file: "contact.md" },
  "contact-heading": { label: "Contact heading", file: "contact-heading.txt", plain: true },
  socials: { label: "Social profiles", file: "socials.md" },
  name: { label: "Your name", file: "name.txt", plain: true },
  location: { label: "Location label", file: "location.txt", plain: true },
  navigation: { label: "Navigation", file: "navigation.md", prose: true, shared: true },
  "soloware-intro": { label: "SoloWare introduction", file: "soloware-intro.md", prose: true, page: "/soloware/" },
  "soloware-about": { label: "SoloWare notes", file: "soloware-about.md", page: "/soloware/" },
  ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [
    `project-${i + 1}`, { label: `SoloWare project ${i + 1}`, file: `project-${i + 1}.md`, prose: true, page: "/soloware/" },
  ])),
};
