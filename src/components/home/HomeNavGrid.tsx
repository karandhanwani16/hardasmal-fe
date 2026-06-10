import { NavLink } from 'react-router-dom';
import { buildHomeSections, type NavItem } from '../../config/navigation';
import { getHomeTileTheme, HOME_SECTION_LABELS } from '../../config/home-tile-theme';
import { useAuth } from '../../context/AuthContext';
import { NavIcon } from '../layout/NavIcons';

function NavTile({ item }: { item: NavItem }) {
  const theme = getHomeTileTheme(item.icon, item.to);
  const title = item.shortLabel ?? item.label;

  return (
    <NavLink
      to={item.to}
      end={item.end}
      aria-label={`${title}. ${theme.hint}`}
      className={({ isActive }) =>
        [
          'group relative flex min-h-[8.25rem] flex-col overflow-hidden rounded-xl border p-3.5 text-center transition-[transform,background-color,border-color] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta-500 active:scale-[0.98] motion-reduce:active:scale-100 sm:min-h-[8.75rem] sm:p-4',
          theme.surface,
          theme.surfaceHover,
          theme.border,
          isActive ? `${theme.surfaceActive} ${theme.borderActive} ring-2 ring-inset ring-black/5 dark:ring-white/10` : '',
        ].join(' ')
      }
    >
      <span
        aria-hidden
        className={`absolute inset-x-0 top-0 h-1.5 ${theme.stripe}`}
      />
      <div className="flex flex-1 flex-col items-center justify-center gap-2.5 pt-1 sm:gap-3">
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm ${theme.iconBg} ${theme.iconFg}`}
        >
          <NavIcon id={item.icon} className="h-6 w-6" />
        </span>
        <div className="min-w-0 space-y-0.5">
          <span className="block text-base font-bold leading-snug text-ledger-900 sm:text-lg">{title}</span>
          <span className="block line-clamp-2 text-xs leading-snug text-ledger-700">{theme.hint}</span>
        </div>
      </div>
    </NavLink>
  );
}

function NavSection({ title, items }: { title: string; items: NavItem[] }) {
  if (items.length === 0) return null;

  const sectionId = title.toLowerCase().replace(/\s+/g, '-');
  const sectionLabel = HOME_SECTION_LABELS[title] ?? title;

  return (
    <section aria-labelledby={`home-section-${sectionId}`}>
      <h2
        id={`home-section-${sectionId}`}
        className="mb-3 text-sm font-semibold text-ledger-900 sm:text-base"
      >
        {sectionLabel}
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-3.5 md:grid-cols-4 lg:grid-cols-5">
        {items.map((item) => (
          <NavTile key={item.to} item={item} />
        ))}
      </div>
    </section>
  );
}

export function HomeNavGrid() {
  const { user } = useAuth();
  const sections = buildHomeSections(user);

  return (
    <div className="min-w-0 space-y-7 sm:space-y-9">
      {sections.map((section) => (
        <NavSection key={section.title} title={section.title} items={section.items} />
      ))}
    </div>
  );
}
