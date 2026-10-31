import { Sun, Moon, Laptop, Check } from 'lucide-react';
import { useTheme } from '@/store/themeStore';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ThemeToggleProps {
  variant?: 'button' | 'dropdown' | 'icon';
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ variant = 'dropdown', className = '', showLabel = false }: ThemeToggleProps) {
  const { theme, resolvedTheme, isDark, setTheme, toggleTheme } = useTheme();

  // Simple direct toggle button
  if (variant === 'button') {
    return (
      <Tooltip>
        <TooltipTrigger render={
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className={`relative rounded-full transition-transform active:scale-95 ${className}`}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          />
        }>
          {isDark ? (
            <Sun className="h-4 w-4 transition-transform duration-300 rotate-0 scale-100 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 transition-transform duration-300 rotate-0 scale-100 text-slate-700" />
          )}
          <span className="sr-only">Toggle theme</span>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Switch to {isDark ? 'light' : 'dark'} mode</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  // Dropdown menu supporting Light, Dark, and System options
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger render={
          <DropdownMenuTrigger render={
            <Button
              variant="outline"
              size={showLabel ? 'sm' : 'icon'}
              className={`relative h-9 px-2.5 rounded-lg border-border/80 bg-background/80 backdrop-blur-xs transition-colors hover:bg-muted ${className}`}
              aria-label="Select theme"
            />
          }>
            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center w-4 h-4">
                <Sun className={`h-4 w-4 transition-all duration-300 absolute ${
                  resolvedTheme === 'dark' ? 'scale-0 opacity-0 -rotate-90' : 'scale-100 opacity-100 rotate-0 text-amber-500'
                }`} />
                <Moon className={`h-4 w-4 transition-all duration-300 absolute ${
                  resolvedTheme === 'dark' ? 'scale-100 opacity-100 rotate-0 text-sky-400' : 'scale-0 opacity-0 rotate-90'
                }`} />
              </div>
              {showLabel && (
                <span className="text-xs font-medium capitalize">
                  {theme}
                </span>
              )}
            </div>
          </DropdownMenuTrigger>
        }>
          <TooltipContent side="bottom">
            <p>Theme: {theme} ({resolvedTheme})</p>
          </TooltipContent>
        </TooltipTrigger>
      </Tooltip>

      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className="flex items-center justify-between cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-amber-500" />
            <span>Light</span>
          </span>
          {theme === 'light' && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className="flex items-center justify-between cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Moon className="h-4 w-4 text-sky-400" />
            <span>Dark</span>
          </span>
          {theme === 'dark' && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className="flex items-center justify-between cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Laptop className="h-4 w-4 text-muted-foreground" />
            <span>System</span>
          </span>
          {theme === 'system' && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
