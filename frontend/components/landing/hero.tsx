"use client"

import { useEffect, useState } from "react"
import { ArrowRight, ArrowRightIcon, Shield, Hospital, Lock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { BorderBeam } from "@/components/ui/border-beam"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text"
import { LaserFlow } from "@/components/LaserFlow"

export function Hero() {
  return (
    <section className="py-20 sm:py-24 lg:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="group relative mx-auto flex justify-center"
      >
        <Link
          href="#features" 
          className="group rounded-full border border-black/5 bg-neutral-100 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800"
        >
        <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
          <span>🏥 Privacy-Preserving Healthcare AI</span>
          <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
        </AnimatedShinyText>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-10 text-center"
      >
        <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          <span className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 bg-clip-text text-transparent">Federated Learning</span> for Healthcare: Train AI Models <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">Without Sharing Data</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:mt-8">
          Collaborate across healthcare institutions to train powerful AI models while keeping sensitive patient data secure and local.
        </p>
        
        <div className="mt-8 flex items-center justify-center gap-4 sm:mt-10 flex-wrap">
          <Link href="/admin"> 
            <ShimmerButton 
              className="flex items-center gap-2 px-6 py-3 text-base sm:text-lg"
              background="linear-gradient(to right, #10b981, #14b8a6)"
            >
              <span className="whitespace-pre-wrap text-center font-medium leading-none tracking-tight text-white">
                Admin Dashboard
              </span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 sm:w-5 sm:h-5" />
            </ShimmerButton>
          </Link>
          <Link href="/client"> 
            <ShimmerButton 
              className="flex items-center gap-2 px-6 py-3 text-base sm:text-lg border border-foreground/10"
              background="rgba(255,255,255,0.05)"
            >
              <span className="whitespace-pre-wrap text-center font-medium leading-none tracking-tight text-foreground">
                Participant Dashboard
              </span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 sm:w-5 sm:h-5" />
            </ShimmerButton>
          </Link>
        </div>

      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="relative mx-auto mt-16 sm:mt-20 lg:mt-24"
      >
        <div className="relative rounded-2xl bg-gradient-to-b from-emerald-500/5 to-green-500/5 p-2 ring-1 ring-emerald-500/20 backdrop-blur-3xl dark:from-emerald-500/10 dark:to-green-500/10">
          <Image
            src="/landing/fedml-admin-run-details.png" 
            alt="Federated Learning Admin Dashboard showing project overview and metrics"
            width={1200}
            height={800}
            quality={100}
            className="rounded-xl shadow-2xl ring-1 ring-foreground/10 transition-all duration-300"
          />
          <BorderBeam size={250} duration={12} delay={9} colorFrom="#10b981" colorTo="#14b8a6" />
        </div>
      </motion.div>
    </section>
  )
} 