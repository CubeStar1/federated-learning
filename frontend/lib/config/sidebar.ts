import Icons from "@/components/global/icons";
import { SidebarConfig } from "@/components/global/app-sidebar";

const sidebarConfig: SidebarConfig = {
  brand: {
    title: "FedML",
    icon: Icons.shield,
    href: "/"
  },
  sections: [
    {
      label: "Home",
      items: [
        {
          title: "Dashboard",
          href: "/",
          icon: Icons.home
        }
      ]
    },
    {
      label: "Admin",
      items: [
        {
          title: "Dashboard",
          href: "/admin",
          icon: Icons.network
        },
        {
          title: "Projects",
          href: "/admin/projects",
          icon: Icons.activity
        }
      ]
    },
    {
      label: "Client",
      items: [
        {
          title: "Dashboard",
          href: "/client",
          icon: Icons.layoutDashboard
        }
      ]
    },
    {
        label: "Profile",
        items: [
          {
            title: "Profile",
            href: "/profile",
            icon: Icons.user
          },
          {
            title: "Settings",
            href: "/settings",
            icon: Icons.settings
          }
        ]
      }
    
  ]
}

export default sidebarConfig