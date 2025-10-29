import { motion } from "framer-motion"
import { Server, PlayCircle, Activity, GitBranch, BarChart3, Database, Network, Shield } from "lucide-react"
import Image from "next/image"

const flowSteps = [
  {
    title: "Admin Server Initialization",
    description: "Start the Flower SuperLink process via the admin FastAPI server, which coordinates the global federated learning rounds across all participant nodes.",
    icon: Server,
    gradient: "from-sky-500 via-cyan-500 to-blue-500",
    shadowColor: "shadow-sky-500/25",
  },
  {
    title: "Participant Node Connection",
    description: "Healthcare institutions start their SuperNode processes through client servers, connecting securely to the SuperLink without sharing patient data.",
    icon: Network,
    gradient: "from-green-500 via-emerald-500 to-teal-500",
    shadowColor: "shadow-green-500/25",
  },
  {
    title: "Federated Training Round",
    description: "Initiate a training run where each participant trains the model locally on their private data, keeping sensitive information within their institution.",
    icon: PlayCircle,
    gradient: "from-purple-500 via-violet-500 to-indigo-500",
    shadowColor: "shadow-purple-500/25",
  },
  {
    title: "Model Update Aggregation",
    description: "SuperLink collects encrypted model updates (not raw data) from all participants and aggregates them into an improved global model using Flower's strategy.",
    icon: GitBranch,
    gradient: "from-orange-500 via-amber-500 to-yellow-500",
    shadowColor: "shadow-orange-500/25",
  },
  {
    title: "Telemetry & Persistence",
    description: "Run metadata, logs, and training metrics are automatically stored in Supabase, with the current run ID tracked in pyproject.toml for telemetry association.",
    icon: Database,
    gradient: "from-red-500 via-rose-500 to-pink-500",
    shadowColor: "shadow-red-500/25",
  },
  {
    title: "Real-Time Monitoring",
    description: "Track training progress, model performance, and node status through comprehensive admin and participant dashboards with live metrics visualization.",
    icon: BarChart3,
    gradient: "from-pink-500 via-fuchsia-500 to-purple-500",
    shadowColor: "shadow-pink-500/25",
  },
]

export function SystemFlow() {
  return (
    <section className="py-20 sm:py-24 lg:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          How Federated Learning Works
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          The complete workflow from initialization to model deployment, enabling privacy-preserving collaborative machine learning across healthcare institutions.
        </p>
      </motion.div>

      <div className="mt-16 grid gap-8 lg:grid-cols-3 xl:grid-cols-3">
        {flowSteps.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative group"
          >
            <div 
              className={`
                h-full rounded-2xl p-1 transition-all duration-300 
                bg-gradient-to-br ${step.gradient} opacity-75 hover:opacity-100
                hover:scale-[1.02] hover:-translate-y-1
              `}
            >
              <div className="h-full rounded-xl bg-background/90 p-6 backdrop-blur-xl">
                <div className={`
                  size-14 rounded-lg bg-gradient-to-br ${step.gradient}
                  flex items-center justify-center ${step.shadowColor}
                  shadow-lg transition-shadow duration-300 group-hover:shadow-xl
                `}>
                  <step.icon className="size-7 text-white" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-muted-foreground leading-relaxed text-sm">{step.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="relative mx-auto mt-16 sm:mt-20 lg:mt-24"
      >
        <div className="relative rounded-2xl bg-gradient-to-b from-muted/50 to-muted p-2 ring-1 ring-foreground/10 backdrop-blur-3xl dark:from-muted/30 dark:to-background/80">
          <Image
            src="/landing/fedml-architecture.png" 
            alt="Architectural Diagram of the Network Security Research Framework"
            width={1200}
            height={700} 
            quality={100}
            className="rounded-xl shadow-2xl ring-1 ring-foreground/10 transition-all duration-300"
          />
        </div>
      </motion.div>
    </section>
  )
}