import { Check, Flame, Moon, Palette, Sun, Briefcase } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/useTheme";
import { THEMES, type ThemeId } from "@/lib/theme";

const THEME_ICONS: Record<ThemeId, typeof Sun> = {
  dark: Moon,
  light: Sun,
  dragon: Flame,
  professional: Briefcase,
};

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const ActiveIcon = THEME_ICONS[theme];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="gap-2 px-3 text-muted-foreground hover:text-foreground"
          aria-label="Change theme"
        >
          <ActiveIcon className="h-4 w-4" />
          <span className="hidden sm:inline">
            {THEMES.find((t) => t.id === theme)?.label ?? "Theme"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <Palette className="h-3.5 w-3.5" /> Theme
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {THEMES.map((t) => {
          const Icon = THEME_ICONS[t.id];
          const active = theme === t.id;
          return (
            <DropdownMenuItem
              key={t.id}
              onSelect={() => setTheme(t.id)}
              className="flex items-start gap-3 py-2"
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span className="flex-1">
                <span className="text-sm font-medium">{t.label}</span>
                <span className="block text-xs text-muted-foreground">{t.description}</span>
              </span>
              {active ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
