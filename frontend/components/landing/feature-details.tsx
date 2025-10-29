"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import SectionBadge from "@/components/ui/section-badge"
import { cn } from "@/lib/utils"
import { ArrowRight } from "lucide-react"


const featureDetails = [
  {
    title: "Admin Control Center",
    description:
      "The admin dashboard provides comprehensive control over the federated learning infrastructure. Start and stop SuperLink processes, initiate training runs, monitor active nodes, and view real-time metrics. The control panel gives administrators full visibility into project status, run history, and system health with intuitive interfaces for managing the entire federation.",
    imageSrc: "/landing/fedml-admin-control-panel.png", 
    imageAlt: "Admin control panel showing SuperLink management and federated run controls",
  },
  {
    title: "Project Dashboard & Metrics",
    description:
      "Track your federated learning projects with detailed dashboards showing training metrics, model performance, and run progress. Visualize training loss, accuracy trends, and convergence across multiple rounds. View aggregated metrics from all participating nodes, monitor resource utilization, and analyze training history with comprehensive charts and graphs.",
    imageSrc: "/landing/fedml-admin-run-details.png", 
    imageAlt: "Project dashboard displaying training metrics, loss curves, and performance charts",
  },
  {
    title: "Network Topology Visualization",
    description:
      "Understand your federated network with an interactive topology view showing all connected nodes, their status, and relationships. Monitor which healthcare institutions are actively participating, track node sessions, view connection health, and identify bottlenecks. The topology view provides real-time insights into the distributed architecture of your federated learning system.",
    imageSrc: "/landing/fedml-admin-project-details-topology.png", 
    imageAlt: "Network topology visualization showing connected nodes and their relationships",
  },
  {
    title: "Participant Node Dashboard",
    description:
      "Healthcare institutions have their own dedicated dashboard to monitor their participation in federated learning projects. View local training progress, session status, and contribution metrics without exposing sensitive data. Track when your SuperNode is active, review local model updates, and stay informed about federation-wide progress while maintaining complete data sovereignty.",
    imageSrc: "/landing/fedml-client-project-details.png", 
    imageAlt: "Client dashboard showing participant node status and local training information",
  },
]

export function FeatureDetails() {
  return (
    <section className="py-20 sm:py-24 lg:py-32">
      <div className="text-center">
        <SectionBadge title="Dashboard Features" />
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-8 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
        >
          Comprehensive Monitoring & Control
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
        >
          Powerful dashboards for administrators and participants, providing complete visibility into federated learning operations, metrics, and network health.
        </motion.p>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-16 sm:gap-24">
        {featureDetails.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`flex flex-col gap-8 lg:items-center ${
              index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
            }`}
          >
            {/* Text Content */}
            <div className="flex-1 space-y-4">
              <motion.div
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h3 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {feature.title}
                </h3>
                <p className="mt-4 text-lg leading-8 text-muted-foreground">
                  {feature.description}
                </p>
                <div className="mt-6">
                  <button className="group inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    Learn more
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Image */}
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="relative rounded-2xl bg-gradient-to-b from-muted/50 to-muted p-2 ring-1 ring-foreground/10 backdrop-blur-3xl dark:from-muted/30 dark:to-background/80"
              >
                <div className="">
                  <Image
                    src={feature.imageSrc}
                    alt={feature.imageAlt}
                    width={600}
                    height={400}
                    quality={100}
                    className="rounded-xl shadow-2xl ring-1 ring-foreground/10 transition-all duration-300"
                  />
                </div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 via-transparent to-purple-500/20 opacity-0 transition-opacity duration-300 hover:opacity-100" />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
} 