"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavSection } from "@/components/navigation/nav-section"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { NavProfile } from "@/components/navigation/nav-profile"
import useUser from "@/hooks/use-user"
import { LucideProps, LucideIcon } from "lucide-react"
import Icons from "@/components/global/icons"
import defaultConfig from "@/lib/config/sidebar"
import Image from "next/image"

type NavItem = {
  title: string
  href: string
  icon: LucideIcon
  description?: string
  disabled?: boolean
}

type NavSection = {
  label: string
  items: NavItem[]
}

export type SidebarConfig = {
  brand?: {
    title: string
    icon?: LucideIcon
    href?: string
  }
  sections: NavSection[]
}

// Default configuration - can be overridden via props


interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  config?: SidebarConfig
}

export function AppSidebar({ config = defaultConfig, ...props }: AppSidebarProps) {
  const { data: user } = useUser()

  if (!user) return null

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <div className="relative border-b border-border/10 px-6 py-5 backdrop-blur-xl">
          <Link href={config.brand?.href || "/"} className="relative flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-200 dark:bg-white">
              <Image
                src="/logo/fed-ml-logo.png"
                alt="Logo"
                width={24}
                height={24}
                className="h-6 w-6"
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                {config.brand?.title}
              </h1>
            </div>
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="space-y-4 py-4">
          {config.sections.map((section, index) => (
            <NavSection 
              key={section.label + index}
              label={section.label}
              items={section.items}
            />
          ))}
        </div>
      </SidebarContent>
      <SidebarRail />
      <SidebarFooter>
        <NavProfile user={user} />
      </SidebarFooter>
    </Sidebar>
  )
} 