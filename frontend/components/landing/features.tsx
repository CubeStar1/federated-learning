"use client"

import { motion } from "framer-motion"
import { Shield, Network, BarChart3, Lock, Server, GitBranch, Hospital, Activity } from "lucide-react"
import SectionBadge from "@/components/ui/section-badge"
import { cn } from "@/lib/utils"

const features = [
  {
    title: "Privacy-Preserving Training",
    info: "Train machine learning models collaboratively across multiple healthcare institutions without ever sharing sensitive patient data, ensuring HIPAA compliance.",
    icon: Shield,
    gradient: "from-red-500 to-orange-500",
  },
  {
    title: "Flower-Based Orchestration",
    info: "Built on the Flower framework with SuperLink and SuperNode architecture for efficient federated learning coordination and local model updates.",
    icon: Network,
    gradient: "from-blue-500 to-sky-500",
  },
  {
    title: "Real-Time Monitoring Dashboard",
    info: "Track training progress, metrics, and node health with comprehensive admin and participant dashboards powered by Next.js and Supabase.",
    icon: BarChart3,
    gradient: "from-green-500 to-teal-500",
  },
  {
    title: "Secure Data Architecture",
    info: "All patient data stays local at each institution. Only encrypted model updates are shared during the federated learning process.",
    icon: Lock, 
    gradient: "from-purple-500 to-violet-500",
  },
  {
    title: "Scalable Infrastructure",
    info: "FastAPI-based admin and client servers manage SuperLink and SuperNode lifecycle with automatic logging and telemetry tracking.",
    icon: Server,
    gradient: "from-yellow-500 to-amber-500",
  },
  {
    title: "Multi-Institution Collaboration",
    info: "Enable seamless collaboration between hospitals, research centers, and healthcare providers to build better AI models together.",
    icon: Hospital, 
    gradient: "from-pink-500 to-rose-500",
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export function Features() {
  return (
    <section id="features" className="py-20 sm:py-24 lg:py-32"> 
      <div className="text-center">
        <SectionBadge title="Platform Features" />
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-8 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
        >
          Powerful Federated Learning Capabilities
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
        >
          Built for healthcare institutions to collaborate on AI model training while maintaining data sovereignty and patient privacy.
        </motion.p>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="mt-16 grid grid-cols-1 gap-6 sm:mt-20 sm:grid-cols-2 lg:mt-24 lg:grid-cols-3"
      >
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              variants={item}
              className={cn(
                "group relative overflow-hidden rounded-2xl bg-gradient-to-b from-muted/50 to-muted p-8",
                "ring-1 ring-foreground/10 backdrop-blur-xl transition-all duration-300 hover:ring-foreground/20",
                "dark:from-muted/30 dark:to-background/80"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br",
                  feature.gradient,
                  "ring-1 ring-foreground/10"
                )}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {feature.title}
                </h3>
              </div>
              <p className="mt-4 text-muted-foreground">
                {feature.info}
              </p>
              <div className={cn(
                "absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r",
                feature.gradient,
                "opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              )} />
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  )
} 