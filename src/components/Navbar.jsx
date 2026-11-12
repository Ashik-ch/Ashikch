import { useEffect, useState } from 'react';
import { House, UserRound, Code2, PanelsTopLeft, BriefcaseBusiness, Mail } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';

const navLinks = [
  { name: 'Home', href: '#home', icon: House },
  { name: 'About', href: '#about', icon: UserRound },
  { name: 'Skills', href: '#skills', icon: Code2 },
  { name: 'Projects', href: '#projects', icon: PanelsTopLeft },
  { name: 'Experience', href: '#experience', icon: BriefcaseBusiness },
  { name: 'Contact', href: '#contact', icon: Mail },
];

function GitHubIcon() {
  return <svg width="20" height="20" aria-hidden="true"><use href="/icons.svg#github-icon" /></svg>;
}

function LinkedInIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="2" />
      <path d="M6.5 10v8m0-11v0.1M11 18v-8m0 3a3 3 0 0 1 6 0v5" fill="none" stroke="white" strokeWidth="2.4" />
    </svg>
  );
}

const socialLinks = [
  { name: 'GitHub', href: portfolioData.personal_info.github, icon: GitHubIcon },
  { name: 'LinkedIn', href: portfolioData.personal_info.linkedin, icon: LinkedInIcon },
];

export default function Navbar() {
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const intersecting = new Set();
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) intersecting.add(entry.target.id);
        else intersecting.delete(entry.target.id);
      }
      const current = navLinks.filter(link => intersecting.has(link.href.slice(1))).at(-1);
      if (current) setActiveSection(current.href.slice(1));
    }, { rootMargin: '-20% 0px -55% 0px' });

    for (const link of navLinks) {
      const section = document.getElementById(link.href.slice(1));
      if (section) observer.observe(section);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <header className="dock-shell">
      <nav className="portfolio-dock" aria-label="Main navigation">
        {navLinks.map(({ name, href, icon: Icon }) => (
          <a
            key={href}
            href={href}
            aria-label={name}
            aria-current={activeSection === href.slice(1) ? 'location' : undefined}
            onClick={() => setActiveSection(href.slice(1))}
            className="dock-item"
          >
            <Icon size={20} strokeWidth={1.7} aria-hidden="true" />
            <span className="dock-tooltip" aria-hidden="true">{name}</span>
            <span className="dock-active-dot" aria-hidden="true" />
          </a>
        ))}
        <span className="dock-divider" aria-hidden="true" />
        {socialLinks.map(({ name, href, icon: Icon }) => (
          <a
            key={name}
            href={href}
            aria-label={name}
            target="_blank"
            rel="noopener noreferrer"
            className="dock-item dock-social"
          >
            <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
            <span className="dock-tooltip" aria-hidden="true">{name}</span>
          </a>
        ))}
      </nav>
    </header>
  );
}
