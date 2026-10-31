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

// ─────────────────────────────────────────────────────────────────────────────
// Custom Brand SVG Icons (Tools missing in @dev.icons/react)
// ─────────────────────────────────────────────────────────────────────────────

const ZustandSvg = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="64" cy="64" r="56" fill="#443E38" />
    <circle cx="36" cy="36" r="16" fill="#5F574F" />
    <circle cx="36" cy="36" r="8" fill="#F4A261" />
    <circle cx="92" cy="36" r="16" fill="#5F574F" />
    <circle cx="92" cy="36" r="8" fill="#F4A261" />
    <circle cx="64" cy="68" r="44" fill="#5F574F" />
    <ellipse cx="64" cy="78" rx="22" ry="16" fill="#E9C46A" />
    <ellipse cx="64" cy="72" rx="8" ry="5" fill="#264653" />
    <circle cx="48" cy="62" r="5" fill="#264653" />
    <circle cx="80" cy="62" r="5" fill="#264653" />
    <circle cx="50" cy="60" r="1.5" fill="#FFFFFF" />
    <circle cx="82" cy="60" r="1.5" fill="#FFFFFF" />
  </svg>
);

const TanstackSvg = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="64" cy="64" r="56" fill="#18181B" stroke="#27272A" strokeWidth="2" />
    <circle cx="64" cy="40" r="16" fill="#FF4154" />
    <circle cx="84" cy="52" r="16" fill="#FF4154" fillOpacity="0.9" />
    <circle cx="84" cy="76" r="16" fill="#FF4154" fillOpacity="0.8" />
    <circle cx="64" cy="88" r="16" fill="#FF4154" fillOpacity="0.7" />
    <circle cx="44" cy="76" r="16" fill="#FF4154" fillOpacity="0.8" />
    <circle cx="44" cy="52" r="16" fill="#FF4154" fillOpacity="0.9" />
    <circle cx="64" cy="64" r="12" fill="#FFD234" />
  </svg>
);

const ResendSvg = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect width="128" height="128" rx="28" fill="#000000" stroke="#27272A" strokeWidth="2" />
    <path
      d="M38 38h28c13.255 0 24 10.745 24 24 0 8.877-4.819 16.63-12 20.785L92 90H74l-14-16H52v16H38V38zm14 24h14c5.523 0 10-4.477 10-10s-4.477-10-10-10H52v20z"
      fill="#FFFFFF"
    />
  </svg>
);

const VapiSvg = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect width="128" height="128" rx="28" fill="#0A0A0A" />
    <path
      d="M34 86L64 28l30 58"
      stroke="#62F6B5"
      strokeWidth="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M48 68h32" stroke="#62F6B5" strokeWidth="8" strokeLinecap="round" />
    <circle cx="64" cy="68" r="7" fill="#62F6B5" />
  </svg>
);

const RenderSvg = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect width="128" height="128" rx="28" fill="#8A05FF" />
    <svg x="14" y="14" width="100" height="100" viewBox="206 194 400 400" overflow="visible">
      <path
        fill="#FFFFFF"
        d="M605.28 288.733c-.059-1.365-.178-2.7-.296-4.065-.03-.326-.03-.682-.09-1.009-.089-.83-.207-1.632-.326-2.462-.119-.861-.208-1.691-.327-2.522a30 30 0 0 0-.326-1.751c-.178-1.038-.356-2.106-.564-3.144-.178-.831-.386-1.632-.564-2.463-.178-.801-.356-1.572-.534-2.373-.208-.831-.475-1.632-.713-2.463a63 63 0 0 0-.653-2.284c-.267-.831-.564-1.662-.86-2.493l-.713-2.136c-.386-1.038-.801-2.047-1.187-3.056-.208-.504-.386-.979-.594-1.483a106 106 0 0 0-1.454-3.234c-.178-.386-.356-.801-.534-1.187-.475-1.009-1.01-1.988-1.514-2.967-.238-.445-.445-.89-.683-1.335-.593-1.098-1.246-2.195-1.87-3.263-.178-.297-.326-.594-.504-.89a78 78 0 0 0-2.137-3.323l-.446-.712a114 114 0 0 0-2.76-3.887 103 103 0 0 0-2.76-3.531c-.06-.089-.119-.178-.208-.267-18.344-22.222-46.037-36.344-77.054-36.374V194l-.089.059h.029c-8.607 0-16.978 1.098-24.962 3.145-4.779 1.217-9.439 2.819-13.921 4.688a118 118 0 0 0-4.423 1.988c-29.474 14.181-50.845 42.426-55.564 76.011h-.059c-2.078 14.39-6.501 28.008-12.793 40.528h.208c-21.906 43.435-66.903 73.252-118.906 73.252-23.211 0-44.998-5.933-63.994-16.347-2.226-1.217-4.927.386-4.927 2.907v13.44H206v199.583h199.7v-99.806h.207v-49.903c0-27.563 22.351-49.903 49.925-49.903h49.925c8.548 0 16.83-1.098 24.755-3.145a105 105 0 0 0 13.921-4.688 117 117 0 0 0 4.422-1.988c30.543-14.715 52.448-44.533 56.039-79.75.327-3.352.505-6.764.505-10.206 0-1.72-.03-3.441-.119-5.132"
      />
    </svg>
  </svg>
);

const SwaggerSvg = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="64" cy="64" r="56" fill="#85EA2D" />
    <circle cx="64" cy="64" r="50" fill="#173647" />
    <path
      d="M48 44c-6 0-10 4-10 10v4c0 4-3 7-7 7 4 0 7 3 7 7v4c0 6 4 10 10 10m32-42c6 0 10 4 10 10v4c0 4 3 7 7 7-4 0-7 3-7 7v4c0 6-4 10-10 10"
      stroke="#85EA2D"
      strokeWidth="6"
      strokeLinecap="round"
    />
    <circle cx="58" cy="64" r="4" fill="#85EA2D" />
    <circle cx="70" cy="64" r="4" fill="#85EA2D" />
  </svg>
);

const ClerkSvg = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="64" cy="64" r="20" fill="#6C47FF" />
    <path
      fill="#BAB1FF"
      d="M99.572 10.788c1.999 1.34 2.17 4.156.468 5.858L85.424 31.262c-1.32 1.32-3.37 1.53-5.033.678A35.846 35.846 0 0 0 64 28c-19.882 0-36 16.118-36 36a35.846 35.846 0 0 0 3.94 16.391c.851 1.663.643 3.712-.678 5.033L16.646 100.04c-1.702 1.702-4.519 1.531-5.858-.468C3.974 89.399 0 77.163 0 64 0 28.654 28.654 0 64 0c13.163 0 25.399 3.974 35.572 10.788Z"
    />
    <path
      fill="#6C47FF"
      d="M100.04 111.354c1.702 1.702 1.531 4.519-.468 5.858C89.399 124.026 77.164 128 64 128c-13.164 0-25.399-3.974-35.572-10.788-2-1.339-2.17-4.156-.468-5.858l14.615-14.616c1.322-1.32 3.37-1.53 5.033-.678A35.847 35.847 0 0 0 64 100a35.846 35.846 0 0 0 16.392-3.94c1.662-.852 3.712-.643 5.032.678l14.616 14.616Z"
    />
  </svg>
);

const ZodSvg = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      fill="#408AFF"
      d="M2.584 3.582a2.247 2.247 0 0 1 2.112-1.479h14.617c.948 0 1.794.595 2.115 1.487l2.44 6.777a2.248 2.248 0 0 1-.624 2.443l-9.61 8.52a2.247 2.247 0 0 1-2.963.018L.776 12.773a2.248 2.248 0 0 1-.64-2.467Zm12.038 4.887-9.11 5.537 5.74 5.007c.456.399 1.139.396 1.593-.006l5.643-5.001H14.4l6.239-3.957c.488-.328.69-.947.491-1.5l-1.24-3.446a1.535 1.535 0 0 0-1.456-1.015H5.545a1.535 1.535 0 0 0-1.431 1.01l-1.228 3.37z"
    />
  </svg>
);

export const CUSTOM_DASHBOARD_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'zustand': ZustandSvg,
  'tanstack': TanstackSvg,
  'tanstackquery': TanstackSvg,
  'tanstackicon': TanstackSvg,
  'resend': ResendSvg,
  'vapi': VapiSvg,
  'vapi.ai': VapiSvg,
  'vapiai': VapiSvg,
  'render': RenderSvg,
  'swagger': SwaggerSvg,
  'openapi': SwaggerSvg,
  'clerk': ClerkSvg,
  'zod': ZodSvg,
};

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
const devIconsList: IconItem[] = iconNames.map((name) => {
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

// Custom additions to the selector list
const customItems: IconItem[] = [
  { value: 'zustand', label: 'Zustand', cleanName: 'Zustand', searchKey: 'zustandstate' },
  { value: 'TanstackIcon', label: 'TanStack Query', cleanName: 'TanStack Query', searchKey: 'tanstackqueryreactquery' },
  { value: 'resend', label: 'Resend', cleanName: 'Resend', searchKey: 'resendemail' },
  { value: 'vapi', label: 'Vapi.ai', cleanName: 'Vapi.ai', searchKey: 'vapiaivoice' },
  { value: 'render', label: 'Render', cleanName: 'Render', searchKey: 'rendercloudhosting' },
  { value: 'swagger', label: 'Swagger', cleanName: 'Swagger', searchKey: 'swaggeropenapi' },
  { value: 'Clerk', label: 'Clerk', cleanName: 'Clerk', searchKey: 'clerkauth' },
  { value: 'Zod', label: 'Zod', cleanName: 'Zod', searchKey: 'zodschema' },
];

export const iconsList: IconItem[] = [...customItems, ...devIconsList];

// Universal helper to resolve any icon name (e.g. "shadcn-ui", "shadcn", "ShadcnUi", "react", "_React", "zustand", "render") to a React component
export function getDevIconComponent(name?: string | null): React.ComponentType<{ className?: string }> | null {
  if (!name) return null;

  const normalized = name.toLowerCase().replace(/^[_]/, '').replace(/[\s\-_./]/g, '');
  if (!normalized) return null;

  // Check custom icons first (Zustand, Resend, Vapi, Render, Swagger, etc.)
  if (CUSTOM_DASHBOARD_ICONS[name]) return CUSTOM_DASHBOARD_ICONS[name];
  if (CUSTOM_DASHBOARD_ICONS[name.toLowerCase()]) return CUSTOM_DASHBOARD_ICONS[name.toLowerCase()];
  if (CUSTOM_DASHBOARD_ICONS[normalized]) return CUSTOM_DASHBOARD_ICONS[normalized];

  const icons = devIcons as Record<string, any>;
  if (icons[name]) return icons[name];
  if (icons[`_${name}`]) return icons[`_${name}`];

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
        if (i.searchKey.includes(q)) return true;
        if (i.label.toLowerCase().includes(rawLower)) return true;
        if (i.value.toLowerCase().includes(rawLower)) return true;
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
          placeholder="Search dev icon (e.g. render, swagger, react, nextjs, tailwind)..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList className="max-h-[220px] sm:max-h-[260px] overflow-y-auto">
          {filteredIcons.length === 0 && <CommandEmpty>No icon found.</CommandEmpty>}
          <CommandGroup>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 p-2">
              {filteredIcons.map((icon) => {
                const IconComponent = getDevIconComponent(icon.value);
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
