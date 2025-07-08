import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowLeft, Video } from 'lucide-react';

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-green-200">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-800">
              ¡Pago Exitoso!
            </CardTitle>
            <CardDescription className="text-green-600">
              Tu pago ha sido procesado correctamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-700 text-center">
                Tu video será generado en los próximos minutos. 
                Te notificaremos por email cuando esté listo.
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              <Link href="/dashboard">
                <Button className="w-full" variant="default">
                  <Video className="mr-2 h-4 w-4" />
                  Ver mis videos
                </Button>
              </Link>
              
              <Link href="/">
                <Button className="w-full" variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al inicio
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 