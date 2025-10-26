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
      label: "Admin",
      items: [
        {
          title: "Home",
          href: "/",
          icon: Icons.home
        },
        {
          title: "Dashboard",
          href: "/admin",
          icon: Icons.layoutDashboard
        },
        {
          title: "Projects",
          href: "/admin/projects",
          icon: Icons.activity
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