import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, Zap, Database, Video, CreditCard, BarChart, BrainCircuit } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import AuthButtons from "@/components/auth/AuthButtons";
import OpenAITestButton from "@/components/dashboard/OpenAITestButton";
import SupabaseTestButtons from "@/components/dashboard/SupabaseTestButtons";
import PaymentTestCard from "@/components/payment/PaymentTestCard";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const setupProgress = [
    { name: "Next.js 15 + TypeScript", status: "completed", description: "Framework base configurado" },
    { name: "Tailwind CSS + shadcn/ui", status: "completed", description: "Sistema de diseño" },
    { name: "Estructura de carpetas", status: "completed", description: "Arquitectura escalable" },
    { name: "Gestión de dependencias", status: "completed", description: "Documentación completa" },
    { name: "Tipos TypeScript", status: "completed", description: "Definiciones de datos" },
    { name: "Configuración de servicios", status: "completed", description: "Setup centralizado" },
    { name: "Supabase", status: "completed", description: "Base de datos y auth - CONFIGURADO ✅" },
    { name: "Mercado Pago", status: "completed", description: "Sistema de pagos - CONFIGURADO ✅" },
    { name: "OpenAI GPT-4o", status: "pending", description: "Generación IA" },
    { name: "Remotion Lambda", status: "pending", description: "Renderizado videos" },
    { name: "TikTok API", status: "pending", description: "Publicación automática" },
  ];

  const techStack = [
    {
      category: "Frontend",
      icon: <Zap className="h-5 w-5" />,
      technologies: ["Next.js 15", "React 19", "TypeScript", "Tailwind CSS", "shadcn/ui"]
    },
    {
      category: "Backend & DB",
      icon: <Database className="h-5 w-5" />,
      technologies: ["Supabase", "PostgreSQL", "Upstash Redis", "QStash"]
    },
    {
      category: "Video & IA",
      icon: <Video className="h-5 w-5" />,
      technologies: ["OpenAI GPT-4o", "Remotion Lambda", "FFmpeg", "TikTok API"]
    },
    {
      category: "Pagos & Monitoring",
      icon: <CreditCard className="h-5 w-5" />,
      technologies: ["Mercado Pago", "Highlight.io", "Sentry", "Vercel"]
    }
  ];

  const completedCount = setupProgress.filter(item => item.status === "completed").length;
  const progressPercentage = (completedCount / setupProgress.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="text-center space-y-4 flex-grow">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🎬 Reelizalo
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Plataforma SaaS que transforma fotos de productos en videos virales de TikTok usando IA
            </p>
            <div className="flex items-center justify-center gap-2">
              <Badge variant="secondary" className="text-sm">
                MVP en desarrollo
              </Badge>
              <Badge variant="outline" className="text-sm">
                {Math.round(progressPercentage)}% completado
              </Badge>
            </div>
          </div>
          <div className="flex-shrink-0">
            <AuthButtons user={user} />
          </div>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Progreso del Setup
            </CardTitle>
            <CardDescription>
              Estado actual de la configuración del proyecto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {setupProgress.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  {item.status === "completed" ? (
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-600">{item.description}</div>
                  </div>
                  <Badge variant={item.status === "completed" ? "default" : "secondary"}>
                    {item.status === "completed" ? "✅ Listo" : "⏳ Pendiente"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tech Stack */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {techStack.map((stack, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  {stack.icon}
                  {stack.category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stack.technologies.map((tech, techIndex) => (
                    <Badge key={techIndex} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment Test Section */}
        {user && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <CreditCard className="h-5 w-5" />
                💳 Prueba de Pagos con Mercado Pago
              </CardTitle>
              <CardDescription className="text-blue-600">
                Prueba el sistema de pagos integrado con Mercado Pago Checkout Pro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentTestCard />
            </CardContent>
          </Card>
        )}

        {/* Architecture Diagram */}
        <Card>
          <CardHeader>
            <CardTitle>🏗️ Arquitectura del Sistema</CardTitle>
            <CardDescription>
              Flujo de datos desde la carga del producto hasta la publicación en TikTok
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="grid gap-4 md:grid-cols-4 text-center">
                <div className="space-y-2">
                  <div className="bg-blue-100 p-4 rounded-lg">
                    <div className="text-2xl mb-2">📤</div>
                    <div className="font-medium">Upload</div>
                    <div className="text-sm text-gray-600">Cloudflare R2</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="bg-green-100 p-4 rounded-lg">
                    <div className="text-2xl mb-2">🧠</div>
                    <div className="font-medium">IA</div>
                    <div className="text-sm text-gray-600">GPT-4o</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="bg-purple-100 p-4 rounded-lg">
                    <div className="text-2xl mb-2">🎬</div>
                    <div className="font-medium">Render</div>
                    <div className="text-sm text-gray-600">Remotion</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="bg-pink-100 p-4 rounded-lg">
                    <div className="text-2xl mb-2">📱</div>
                    <div className="font-medium">Publish</div>
                    <div className="text-sm text-gray-600">TikTok API</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* OpenAI Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5" />
              🤖 Prueba de Conexión OpenAI
            </CardTitle>
            <CardDescription>
              Verifica que la API de OpenAI esté accesible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OpenAITestButton />
          </CardContent>
        </Card>

        {/* Supabase Test */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Database className="h-5 w-5" />
              🗄️ Prueba de Conexión Supabase
            </CardTitle>
            <CardDescription className="text-green-600">
              Verifica que la configuración de Supabase esté funcionando correctamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <SupabaseTestButtons />
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800 mb-2">🔧 Setup Completado:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>✅ Supabase proyecto creado desde Vercel</li>
                  <li>✅ Variables de entorno configuradas</li>
                  <li>✅ Cliente Supabase configurado</li>
                  <li>✅ Middleware de autenticación</li>
                  <li>⚠️ Falta ejecutar schema SQL en Supabase</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>📚 Documentación y Recursos</CardTitle>
            <CardDescription>
              Enlaces útiles para el desarrollo del proyecto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Link href="/docs/DEPENDENCY_MANAGEMENT.md" target="_blank">
                <Button variant="outline" className="w-full justify-start">
                  📦 Gestión de Dependencias
                </Button>
              </Link>
              <Link href="https://github.com/stefanoucc/reelizalo" target="_blank">
                <Button variant="outline" className="w-full justify-start">
                  🐙 Repositorio GitHub
                </Button>
              </Link>
              <Link href="https://ui.shadcn.com/docs" target="_blank">
                <Button variant="outline" className="w-full justify-start">
                  🎨 shadcn/ui Docs
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">🚀 Próximos Pasos</CardTitle>
            <CardDescription className="text-blue-600">
              Tareas prioritarias para completar el MVP
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge variant="secondary">Semana 1</Badge>
                <span>Configurar Supabase y sistema de autenticación</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">Semana 2</Badge>
                <span>Integrar OpenAI GPT-4o y sistema de colas</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">Semana 3</Badge>
                <span>Implementar Remotion y TikTok API</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">Semana 4</Badge>
                <span>Integrar pagos y monitoring</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>
            ✨ Desarrollado con ❤️ para revolucionar el marketing de productos en TikTok
          </p>
          <p className="mt-2">
            Next.js 15 • TypeScript • shadcn/ui • Tailwind CSS
          </p>
        </div>
      </div>
    </div>
  );
}
