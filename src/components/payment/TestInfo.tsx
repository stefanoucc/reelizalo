'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, AlertTriangle, Info, Sparkles } from 'lucide-react';

export default function TestInfo() {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Sparkles className="h-5 w-5" />
          Checkout API Implementado
        </CardTitle>
        <CardDescription className="text-blue-600">
          Nueva integración con formulario de pago personalizado y Payment Bricks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Tarjetas de Prueba (Perú)
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-mono">4013 5406 8274 6260</span>
              <Badge variant="outline">Visa - Aprobada</Badge>
            </div>
            <div className="flex justify-between">
              <span className="font-mono">5031 7557 3453 0604</span>
              <Badge variant="outline">Mastercard - Aprobada</Badge>
            </div>
            <div className="flex justify-between">
              <span className="font-mono">4000 0000 0000 0002</span>
              <Badge variant="destructive">Visa - Rechazada</Badge>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">Datos adicionales:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>CVV:</strong> Cualquier 3 dígitos (ej: 123)</li>
            <li>• <strong>Vencimiento:</strong> Cualquier fecha futura</li>
            <li>• <strong>Nombre:</strong> APRO (para aprobado)</li>
            <li>• <strong>DNI:</strong> 12345678</li>
          </ul>
        </div>

        <div className="bg-green-50 p-3 rounded-lg border border-green-200 flex items-start gap-2">
          <Info className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-green-700">
            <strong>✅ Ventajas del Checkout API:</strong>
            <ul className="mt-1 space-y-1">
              <li>• Formulario de pago integrado en tu sitio</li>
              <li>• Experiencia de usuario completamente personalizada</li>
              <li>• No hay redirecciones externas</li>
              <li>• Control total del diseño y flujo</li>
              <li>• Payment Bricks con validación automática</li>
            </ul>
          </div>
        </div>

        <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-700">
            <strong>Credenciales TEST activas:</strong>
            <div className="mt-1 font-mono text-xs break-all">
              <div>Public Key: TEST-93035092-73a0-4b47...</div>
              <div>Access Token: TEST-7901482135324921-070113...</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 