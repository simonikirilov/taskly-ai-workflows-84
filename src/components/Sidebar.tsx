import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { 
  Home, 
  User, 
  Settings, 
  BarChart3, 
  Bell, 
  Activity,
  Bot,
  LogOut
} from "lucide-react"
import { NavLink } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"

const menuItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Account", url: "/account", icon: User },
  { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Activity Log", url: "/activity", icon: Activity },
]

export function AppSidebar() {
  const { signOut } = useAuth()

  const handleSignOut = () => {
    signOut()
  }

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">Taskly</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className={({ isActive }) =>
                        isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Button 
          variant="ghost" 
          onClick={handleSignOut}
          className="w-full justify-start"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}