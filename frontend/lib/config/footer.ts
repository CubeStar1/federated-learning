export interface FooterLink {
  href: string
  label: string
}

export interface FooterSection {
  title: string
  links: FooterLink[]
}

export interface FooterConfig {
  brand: {
    title: string
    description: string
  }
  sections: FooterSection[]
  copyright: string
}

export const footerConfig: FooterConfig = {
  brand: {
    title: "FedML",
    description: "Privacy-Preserving Healthcare AI through Federated Learning"
  },
  sections: [
    {
      title: "Platform",
      links: [
        { href: "/admin", label: "Admin Dashboard" },
        { href: "/client", label: "Participant Dashboard" },
        { href: "/about", label: "How It Works" },
        { href: "/contact", label: "Get Started" }
      ]
    },
    {
      title: "Solutions",
      links: [
        { href: "#", label: "Hospitals" },
        { href: "#", label: "Research Institutions" },
        { href: "#", label: "Medical Centers" },
        { href: "#", label: "Healthcare Networks" }
      ]
    },
    {
      title: "Resources",
      links: [
        { href: "#", label: "Documentation" },
        { href: "#", label: "API Reference" },
        { href: "#", label: "Security & Compliance" },
        { href: "#", label: "Support" }
      ]
    },
    {
      title: "Legal",
      links: [
        { href: "#", label: "Privacy Policy" },
        { href: "#", label: "Terms of Service" },
        { href: "#", label: "HIPAA Compliance" },
        { href: "#", label: "Data Protection" }
      ]
    }
  ],
  copyright: `© ${new Date().getFullYear()} FedML Healthcare. All rights reserved.`
}
