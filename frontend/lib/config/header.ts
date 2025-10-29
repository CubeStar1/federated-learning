import { LucideIcon } from "lucide-react"

export interface HeaderLink {
  href: string
  label: string
  icon?: LucideIcon
  description?: string
}

export interface HeaderConfig {
  brand: {
    title: string
    icon: string
  }
  navigationLinks: HeaderLink[]
}

export const headerConfig: HeaderConfig = {
  brand: {
    title: "FedML",
    icon: "/logo/fed-ml-logo.png"
  },
  navigationLinks: [
    { 
    href: "/", 
    label: "Home" 
  },
  { 
    href: "/about", 
    label: "About" 
  },
  { 
    href: "/admin", 
    label: "Admin" 
  },
  { 
    href: "/client", 
    label: "Participant" 
  },
  ]
}