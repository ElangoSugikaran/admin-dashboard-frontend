import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  LayoutDashboard,
  FolderKanban,
  GraduationCap,
  BriefcaseBusiness,
  Lightbulb,
  Award,
  MessageSquare,
  Settings,
  LogOut,
  User,
  UserRound,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'About Me', url: '/about', icon: UserRound },
  { title: 'Projects', url: '/projects', icon: FolderKanban },
  { title: 'Education', url: '/education', icon: GraduationCap },
  { title: 'Experience', url: '/experience', icon: BriefcaseBusiness },
  { title: 'Skills', url: '/skills', icon: Lightbulb },
  { title: 'Certifications', url: '/certifications', icon: Award },
  { title: 'Messages', url: '/messages', icon: MessageSquare },
  { title: 'Settings', url: '/settings', icon: Settings },
];

const routeTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard Overview', subtitle: 'Portfolio performance & summary' },
  '/about': { title: 'About Me', subtitle: 'Personal profile, bio, CV & contact links' },
  '/projects': { title: 'Projects Management', subtitle: 'Showcase your portfolio work' },
  '/education': { title: 'Education', subtitle: 'Academic background & degrees' },
  '/experience': { title: 'Work Experience', subtitle: 'Career journey & roles' },
  '/skills': { title: 'Skills & Tech Stack', subtitle: 'Technical competencies' },
  '/certifications': { title: 'Certifications', subtitle: 'Credentials & achievements' },
  '/messages': { title: 'Inquiries & Messages', subtitle: 'Contact submissions' },
  '/profile': { title: 'Admin Profile', subtitle: 'Account details & security' },
  '/settings': { title: 'Site Settings', subtitle: 'Portfolio branding & dashboard theme' },
};


function AppSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { setOpenMobile, isMobile } = useSidebar();

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border/80">
      <SidebarHeader className="border-b border-border/60">
        <div className="flex h-12 items-center gap-2.5 px-3 font-semibold">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold tracking-tight truncate">Portfolio CMS</span>
            <span className="text-[10px] text-muted-foreground font-mono truncate">v1.0 • Admin</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-medium tracking-wider uppercase text-muted-foreground/80">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname === item.url || (item.url !== '/' && location.pathname.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={
                        <Link to={item.url} onClick={handleNavClick} />
                      }
                      isActive={isActive}
                      tooltip={item.title}
                      className="transition-colors hover:bg-accent/60"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/60 p-3 sm:p-4">
        <div className="flex flex-col gap-3 group-data-[collapsible=icon]:items-center">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 shrink-0 ring-1 ring-border">
              <AvatarImage src={user?.profileImage?.url || user?.avatar || undefined} alt={user?.name || 'Admin'} />
              <AvatarFallback className="font-semibold text-xs bg-primary/10 text-primary">
                {user?.name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'A'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-medium truncate">{user?.name || 'Admin'}</span>
              <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive border-border/80 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:w-9" 
            onClick={logout}
            title="Log out"
          >
            <LogOut className="h-4 w-4 group-data-[collapsible=icon]:mr-0 mr-2 shrink-0" />
            <span className="group-data-[collapsible=icon]:hidden">Log out</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

function Topbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const routeInfo = routeTitles[location.pathname] || { title: 'Dashboard', subtitle: 'Overview' };
  
  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b border-border/80 bg-background/80 backdrop-blur-md px-3 sm:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="hover:bg-muted" />
        <div className="hidden sm:flex items-center text-xs text-muted-foreground gap-1.5 ml-1">
          <span className="font-medium">Admin</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-semibold truncate max-w-[150px] md:max-w-xs">{routeInfo.title}</span>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
        {/* Mobile route title */}
        <div className="flex sm:hidden flex-1 justify-start ml-1 overflow-hidden">
          <h1 className="text-sm font-bold truncate">{routeInfo.title}</h1>
        </div>

        {/* Theme Mode Toggle (Dropdown with Light/Dark/System) */}
        <ThemeToggle variant="dropdown" />
        
        {/* User Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-1 ring-border/80 hover:ring-primary/50 transition-all p-0" />
          }>
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.profileImage?.url || user?.avatar || undefined} alt={user?.name || 'Admin'} />
              <AvatarFallback className="font-semibold text-xs bg-primary/10 text-primary">
                {user?.name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'A'}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-1">
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-0.5 leading-none">
                {user?.name && <p className="font-semibold text-sm">{user.name}</p>}
                {user?.email && (
                  <p className="w-48 truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                )}
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link to="/profile" className="w-full cursor-pointer flex items-center" />}>
              <User className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Profile Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link to="/settings" className="w-full cursor-pointer flex items-center" />}>
              <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Site Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default function AdminLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/20">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1 min-w-0">
          <Topbar />
          <main className="flex-1 p-3.5 sm:p-5 md:p-6 lg:p-8 overflow-x-hidden">
            <div className="mx-auto max-w-7xl">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
