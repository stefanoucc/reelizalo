import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function PaymentFailurePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-red-200">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-800">
              Pago Fallido 🚨
            </CardTitle>
            <CardDescription className="text-red-600">
              No se pudo procesar tu pago
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-sm text-red-700 text-center">
                Hubo un problema al procesar tu pago. 
                Verifica tus datos e inténtalo nuevamente.
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              <Link href="/dashboard">
                <Button className="w-full" variant="default">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Intentar nuevamente
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