import { useState } from 'react';
import { Menu, User, Settings, BarChart3, RotateCcw, HelpCircle, Moon, Sun } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useTheme } from 'next-themes';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const menuItems = [
  { icon: User, label: 'Account', path: '/account' },
  { icon: Settings, label: 'Settings', path: '/settings' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: RotateCcw, label: 'Workflows', path: '/workflows' },
  { icon: HelpCircle, label: 'Help', path: '/help' },
];

export function AppMenu() {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-xl">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle className="text-left">Menu</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl p-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            );
          })}
          
          <Separator className="my-4" />
          
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex w-full items-center gap-3 rounded-xl p-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}