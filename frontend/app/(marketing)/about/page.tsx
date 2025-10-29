import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Network, Database, Activity, Lock, Zap } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-7xl">
      {/* Hero Section */}
      <section className="mb-20 text-center">
        <Badge className="mb-4" variant="outline">
          Privacy-Preserving Machine Learning
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          Federated Learning for Healthcare
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          A secure, decentralized approach to collaborative machine learning that enables healthcare institutions 
          to train powerful AI models without sharing sensitive patient data.
        </p>
      </section>

      {/* What is Federated Learning */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold mb-8 text-center">What is Federated Learning?</h2>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <p className="text-muted-foreground leading-relaxed">
              Traditional machine learning requires centralizing data in one location, which poses significant 
              privacy risks—especially in healthcare where patient data is highly sensitive and regulated.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">Federated Learning</span> revolutionizes this approach 
              by bringing the model to the data, not the data to the model. Healthcare institutions train AI models 
              locally on their own data, then share only the learned parameters—never the raw patient information.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              A central coordinator aggregates these updates to create a global model that benefits from diverse 
              datasets across multiple institutions, all while maintaining strict data privacy and compliance with 
              regulations like HIPAA and GDPR.
            </p>
          </div>
          <Card className="border-2">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Data Never Leaves</h3>
                    <p className="text-sm text-muted-foreground">
                      Patient data remains secure within each institution's infrastructure
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Network className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Collaborative Training</h3>
                    <p className="text-sm text-muted-foreground">
                      Models learn from distributed datasets across multiple sites
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Privacy Preserved</h3>
                    <p className="text-sm text-muted-foreground">
                      Only model updates are shared, maintaining patient confidentiality
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* System Architecture */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold mb-8 text-center">System Architecture</h2>
        <Card className="border-2 overflow-hidden">
          <CardContent className="p-0">
            <div className="relative w-full aspect-video bg-muted">
              <Image
                src="/landing/fedml-architecture.png"
                alt="Federated Learning System Architecture"
                fill
                className="object-contain p-4"
                priority
              />
            </div>
          </CardContent>
        </Card>
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Database className="h-5 w-5 text-blue-500" />
                </div>
                <h3 className="font-semibold">Coordinator Node</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Central orchestrator that manages training rounds, aggregates model updates, and coordinates 
                the federated learning process across all participant nodes.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Activity className="h-5 w-5 text-green-500" />
                </div>
                <h3 className="font-semibold">Participant Nodes</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Healthcare institutions that train models locally on their private datasets and send encrypted 
                model updates to the coordinator without exposing patient data.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Zap className="h-5 w-5 text-purple-500" />
                </div>
                <h3 className="font-semibold">Flower Framework</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Built on Flower (flwr), a modern federated learning framework that handles secure communication, 
                model aggregation, and distributed training orchestration.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Platform Features */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold mb-12 text-center">Platform Features</h2>
        
        {/* Admin Dashboard */}
        <div className="mb-16">
          <div className="mb-6">
            <Badge variant="secondary" className="mb-2">For Coordinators</Badge>
            <h3 className="text-2xl font-semibold mb-2">Admin Control Center</h3>
            <p className="text-muted-foreground">
              Comprehensive dashboard for orchestrating federated learning projects and monitoring training progress
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative w-full aspect-video bg-muted">
                  <Image
                    src="/landing/fedml-admin-dash.png"
                    alt="Admin Dashboard Overview"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h4 className="font-semibold mb-2">Project Overview</h4>
                  <p className="text-sm text-muted-foreground">
                    Monitor active projects, recent runs, and system health metrics at a glance
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative w-full aspect-video bg-muted">
                  <Image
                    src="/landing/fedml-admin-control-panel.png"
                    alt="Control Panel"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h4 className="font-semibold mb-2">Control Panel</h4>
                  <p className="text-sm text-muted-foreground">
                    Start/stop SuperLink processes and manage federated training runs
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative w-full aspect-video bg-muted">
                  <Image
                    src="/landing/fedml-admin-project-details.png"
                    alt="Project Details"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h4 className="font-semibold mb-2">Detailed Project View</h4>
                  <p className="text-sm text-muted-foreground">
                    Access configuration, node status, and complete run history
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative w-full aspect-video bg-muted">
                  <Image
                    src="/landing/fedml-admin-run-details.png"
                    alt="Training Metrics"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h4 className="font-semibold mb-2">Training Metrics</h4>
                  <p className="text-sm text-muted-foreground">
                    Real-time visualization of training performance and model convergence
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          <Card className="border-2 overflow-hidden mt-6">
            <CardContent className="p-0">
              <div className="relative w-full aspect-video bg-muted">
                <Image
                  src="/landing/fedml-admin-project-details-topology.png"
                  alt="Network Topology"
                  fill
                  className="object-contain p-4"
                />
              </div>
              <div className="p-4">
                <h4 className="font-semibold mb-2">Network Topology Visualization</h4>
                <p className="text-sm text-muted-foreground">
                  Interactive view of the federated network showing node connections and data flow
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Client Dashboard */}
        <div>
          <div className="mb-6">
            <Badge variant="secondary" className="mb-2">For Participants</Badge>
            <h3 className="text-2xl font-semibold mb-2">Participant Dashboard</h3>
            <p className="text-muted-foreground">
              Intuitive interface for healthcare institutions to monitor their local node and training participation
            </p>
          </div>
          <Card className="border-2 overflow-hidden max-w-3xl mx-auto">
            <CardContent className="p-0">
              <div className="relative w-full aspect-video bg-muted">
                <Image
                  src="/landing/fedml-client-project-details.png"
                  alt="Client Project View"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h4 className="font-semibold mb-2">Local Node Management</h4>
                <p className="text-sm text-muted-foreground">
                  Track node status, session information, and training progress from the participant perspective
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold mb-12 text-center">Why Federated Learning for Healthcare?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 p-3 bg-blue-500/10 rounded-lg w-fit">
                <Shield className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="font-semibold mb-2">HIPAA & GDPR Compliant</h3>
              <p className="text-sm text-muted-foreground">
                Patient data never leaves the institution, ensuring compliance with healthcare privacy regulations
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 p-3 bg-green-500/10 rounded-lg w-fit">
                <Database className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="font-semibold mb-2">Larger Training Datasets</h3>
              <p className="text-sm text-muted-foreground">
                Access to diverse patient populations across multiple institutions without centralizing data
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 p-3 bg-purple-500/10 rounded-lg w-fit">
                <Activity className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="font-semibold mb-2">Better Model Performance</h3>
              <p className="text-sm text-muted-foreground">
                Models trained on diverse datasets generalize better to new patients and populations
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 p-3 bg-orange-500/10 rounded-lg w-fit">
                <Lock className="h-6 w-6 text-orange-500" />
              </div>
              <h3 className="font-semibold mb-2">Data Sovereignty</h3>
              <p className="text-sm text-muted-foreground">
                Institutions maintain complete control over their data while contributing to collaborative research
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 p-3 bg-cyan-500/10 rounded-lg w-fit">
                <Network className="h-6 w-6 text-cyan-500" />
              </div>
              <h3 className="font-semibold mb-2">Scalable Infrastructure</h3>
              <p className="text-sm text-muted-foreground">
                Built on Flower and Supabase for reliable, production-ready federated learning deployments
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 p-3 bg-pink-500/10 rounded-lg w-fit">
                <Zap className="h-6 w-6 text-pink-500" />
              </div>
              <h3 className="font-semibold mb-2">Real-time Monitoring</h3>
              <p className="text-sm text-muted-foreground">
                Comprehensive dashboards for tracking training progress, metrics, and system health
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold mb-8 text-center">Built With Modern Technologies</h2>
        <Card className="border-2">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div>
                <h3 className="font-semibold mb-3">Federated Learning</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Flower (flwr)</li>
                  <li>• PyTorch/TensorFlow</li>
                  <li>• Custom aggregation strategies</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Backend Services</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• FastAPI</li>
                  <li>• Python 3.10+</li>
                  <li>• Async/await patterns</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Data & Persistence</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Supabase (PostgreSQL)</li>
                  <li>• Real-time subscriptions</li>
                  <li>• Structured logging</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Frontend Dashboard</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Next.js 14</li>
                  <li>• TypeScript</li>
                  <li>• Tailwind CSS</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Closing */}
      <section className="text-center">
        <Card className="border-2 bg-muted/50">
          <CardContent className="p-12">
            <h2 className="text-2xl font-bold mb-4">Advancing Healthcare AI, Securely</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our federated learning platform enables healthcare institutions to collaborate on AI development 
              while maintaining the highest standards of patient privacy and data security.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
