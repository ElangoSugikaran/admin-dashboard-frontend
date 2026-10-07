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
import * as lucideIcons from 'lucide-react';

// Extract all valid icon components
const iconNames = Object.keys(lucideIcons).filter(
  (name) => typeof (lucideIcons as any)[name] === 'object' || typeof (lucideIcons as any)[name] === 'function'
).filter(name => name !== 'createLucideIcon' && name !== 'default' && name !== 'LucideProps' && name !== 'IconNode' && name !== 'icons');

// We'll take a subset or just render them carefully. Rendering 1000 items in cmdk might be slightly slow but usually okay.
// To optimize, we can use a virtualizer, but for now we'll just render them since cmdk can handle ~1k items well.
const iconsList = iconNames.map(name => ({
  value: name,
  label: name,
}));

interface IconSelectorProps {
  value?: string;
  onChange: (value: string) => void;
}

export function GeneralIconSelector({ value, onChange }: IconSelectorProps) {
  const [search, setSearch] = React.useState('');

  const filteredIcons = React.useMemo(() => {
    if (!search) return iconsList.slice(0, 100);
    return iconsList.filter(i => i.label.toLowerCase().includes(search.toLowerCase())).slice(0, 100);
  }, [search]);

  return (
    <div className="border rounded-md overflow-hidden bg-background">
      <Command shouldFilter={false}>
        <CommandInput 
          placeholder="Search dev icon..." 
          value={search}
          onValueChange={setSearch}
        />
        <CommandList className="max-h-[200px] sm:max-h-[250px] overflow-y-auto">
          {filteredIcons.length === 0 && <CommandEmpty>No icon found.</CommandEmpty>}
          <CommandGroup>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 p-2">
              {filteredIcons.map((icon) => {
                const IconComponent = (lucideIcons as any)[icon.value];
                return (
                  <CommandItem
                    key={icon.value}
                    value={icon.value}
                    onSelect={(currentValue) => {
                      const originalValue = iconsList.find(i => i.value.toLowerCase() === currentValue.toLowerCase())?.value || currentValue;
                      onChange(originalValue === value ? "" : originalValue);
                    }}
                    className={cn(
                      "flex flex-col items-center justify-center p-2 py-3 cursor-pointer rounded-md h-auto w-full mx-auto transition-colors",
                      value === icon.value ? "bg-primary text-primary-foreground aria-selected:bg-primary aria-selected:text-primary-foreground" : "hover:bg-muted"
                    )}
                    title={icon.label}
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
