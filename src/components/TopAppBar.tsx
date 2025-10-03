import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

interface TopAppBarProps {
  onLogoClick?: () => void;
}

export function TopAppBar({ onLogoClick }: TopAppBarProps) {
  const navigate = useNavigate();

  const menuItems = [
    { label: 'Home', path: '/' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Record', path: '/record' },
    { label: 'Workflows', path: '/workflows' },
    { label: 'Account', path: '/account' },
    { label: 'Settings', path: '/settings' },
    { label: 'Help', path: '/help' },
  ];

  return (
    <header className="h-14 border-b border-border/40 bg-background/80 backdrop-blur-sm">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left: Logo */}
        <button 
          onClick={onLogoClick}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <img 
            src="/lovable-uploads/0439ea59-9c9e-46ac-9527-cf18c3162602.png" 
            alt="Taskly Robot" 
            className="h-8 w-8 object-contain"
          />
          <span className="font-bold text-xl">Taskly</span>
        </button>

        {/* Center: Empty */}
        <div></div>

        {/* Right: Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
              <Menu className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {menuItems.map((item, index) => (
              <div key={item.path}>
                <DropdownMenuItem 
                  onClick={() => navigate(item.path)}
                  className="cursor-pointer"
                >
                 {item.label}
                </DropdownMenuItem>
                {index === 3 && <DropdownMenuSeparator />}
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}