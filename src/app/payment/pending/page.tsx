import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, ArrowLeft, RefreshCw } from 'lucide-react';

export default function PaymentPendingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-yellow-200">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-yellow-800">
              Pago Pendiente
            </CardTitle>
            <CardDescription className="text-yellow-600">
              Tu pago está siendo procesado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-700 text-center">
                Tu pago está siendo verificado. Esto puede tomar unos minutos.
                Te notificaremos por email cuando se confirme.
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              <Link href="/dashboard">
                <Button className="w-full" variant="default">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Ver estado del pago
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