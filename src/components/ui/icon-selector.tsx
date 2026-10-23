import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import * as devIcons from '@dev.icons/react';

// Extract all valid icon components
const iconNames = Object.keys(devIcons).filter(
  (name) =>
    name !== 'IconContext' &&
    name !== 'default' &&
    (typeof (devIcons as any)[name] === 'function' || typeof (devIcons as any)[name] === 'object')
);

export interface IconItem {
  value: string;
  label: string;
  cleanName: string;
  searchKey: string;
}

// Pre-process icon list with normalized search keys and friendly labels
export const iconsList: IconItem[] = iconNames.map((name) => {
  const cleanName = name.replace(/^[_]/, '');
  const displayName = cleanName
    .replace(/(OriginalWordmark|Original|PlainWordmark|LineWordmark|Line)$/, '')
    .trim();

  // Normalize searchKey: alphanumeric lowercase for fuzzy matching
  const searchKey = `${name} ${cleanName} ${displayName}`
    .toLowerCase()
    .replace(/[\s\-_./]/g, '');

  return {
    value: name,
    label: displayName || cleanName,
    cleanName,
    searchKey,
  };
});

// Universal helper to resolve any icon name (e.g. "shadcn-ui", "shadcn", "ShadcnUi", "react", "_React") to a React component
export function getDevIconComponent(name?: string | null): React.ComponentType<{ className?: string }> | null {
  if (!name) return null;
  const icons = devIcons as Record<string, any>;
  if (icons[name]) return icons[name];
  if (icons[`_${name}`]) return icons[`_${name}`];

  const normalized = name.toLowerCase().replace(/^[_]/, '').replace(/[\s\-_./]/g, '');
  if (!normalized) return null;

  // Direct alias shortcuts
  if (normalized === 'shadcn' || normalized === 'shadcnui') {
    if (icons['ShadcnUi']) return icons['ShadcnUi'];
  }
  if (normalized === 'react') {
    if (icons['_React']) return icons['_React'];
  }
  if (normalized === 'vue') {
    if (icons['_Vue']) return icons['_Vue'];
  }
  if (normalized === 'astro') {
    if (icons['_Astro']) return icons['_Astro'];
  }
  if (normalized === 'svelte') {
    if (icons['_Svelte']) return icons['_Svelte'];
  }

  const found = iconsList.find((i) => i.searchKey === normalized || i.cleanName.toLowerCase() === normalized);
  if (found && icons[found.value]) {
    return icons[found.value];
  }

  return null;
}

interface IconSelectorProps {
  value?: string;
  onChange: (value: string) => void;
}

function normalizeQuery(q: string): string {
  let cleaned = q.toLowerCase().replace(/[\s\-_./]/g, '');
  if (cleaned === 'c++' || cleaned === 'cpp') cleaned = 'cplusplus';
  if (cleaned === 'c#' || cleaned === 'csharp') cleaned = 'csharp';
  if (cleaned === 'dotnet' || cleaned === '.net') cleaned = 'dotnet';
  return cleaned;
}

export function IconSelector({ value, onChange }: IconSelectorProps) {
  const [search, setSearch] = React.useState('');

  const filteredIcons = React.useMemo(() => {
    if (!search.trim()) return iconsList.slice(0, 120);

    const q = normalizeQuery(search);
    const rawLower = search.toLowerCase().trim();

    return iconsList
      .filter((i) => {
        // Direct or normalized substring match
        if (i.searchKey.includes(q)) return true;
        if (i.label.toLowerCase().includes(rawLower)) return true;
        if (i.value.toLowerCase().includes(rawLower)) return true;
        // Aliases
        if ((q.includes('shadcn') || rawLower.includes('shadcn')) && i.value.toLowerCase().includes('shadcn')) {
          return true;
        }
        if (q.includes('tailwind') && i.value.toLowerCase().includes('tailwind')) {
          return true;
        }
        return false;
      })
      .slice(0, 120);
  }, [search]);

  const SelectedIconComp = getDevIconComponent(value);

  return (
    <div className="border rounded-md overflow-hidden bg-background">
      {value && SelectedIconComp && (
        <div className="flex items-center justify-between px-3 py-2 bg-muted/60 border-b text-xs">
          <div className="flex items-center gap-2">
            <SelectedIconComp className="h-5 w-5 shrink-0" />
            <span className="font-medium text-foreground">
              Selected: <code className="bg-background px-1 py-0.5 rounded border">{value}</code>
            </span>
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-muted-foreground hover:text-destructive text-xs underline cursor-pointer"
          >
            Clear
          </button>
        </div>
      )}
      <Command shouldFilter={false}>
        <CommandInput
          placeholder="Search dev icon (e.g. shadcn, react, nextjs, tailwind)..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList className="max-h-[220px] sm:max-h-[260px] overflow-y-auto">
          {filteredIcons.length === 0 && <CommandEmpty>No icon found.</CommandEmpty>}
          <CommandGroup>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 p-2">
              {filteredIcons.map((icon) => {
                const IconComponent = (devIcons as any)[icon.value];
                const isSelected = value === icon.value || (value && value.toLowerCase() === icon.value.toLowerCase());

                return (
                  <CommandItem
                    key={icon.value}
                    value={icon.value}
                    onSelect={() => {
                      onChange(isSelected ? '' : icon.value);
                    }}
                    className={cn(
                      'flex flex-col items-center justify-center p-2 py-3 cursor-pointer rounded-md h-auto w-full mx-auto transition-colors',
                      isSelected
                        ? 'bg-primary text-primary-foreground aria-selected:bg-primary aria-selected:text-primary-foreground'
                        : 'hover:bg-muted'
                    )}
                    title={icon.value}
                  >
                    {IconComponent && <IconComponent className="h-8 w-8 mb-2 shrink-0" />}
                    <span className="text-[11px] text-center w-full truncate leading-tight font-medium">
                      {icon.label}
                    </span>
                  </CommandItem>
                );
              })}
            </div>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}
