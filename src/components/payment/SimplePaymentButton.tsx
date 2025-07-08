'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SimplePaymentButtonProps {
  title: string;
  price: number;
  description?: string;
  className?: string;
}

export default function SimplePaymentButton({
  title,
  price,
  description,
  className
}: SimplePaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      // Simular llamada a la API
      const response = await fetch('/api/mercadopago/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: 'TEST_TOKEN_' + Math.random().toString(36).substr(2, 9),
          payment_method_id: 'visa',
          transaction_amount: price,
          installments: 1,
          description: description || title,
          payer: {
            email: 'test@mercadopago.com',
            identification: {
              type: 'DNI',
              number: '12345678'
            }
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Error al procesar el pago');
      }

      const result = await response.json();
      console.log('✅ Resultado del pago:', result);
      
      setPaymentResult(result);

    } catch (error) {
      console.error('❌ Error:', error);
      setPaymentResult({
        status: 'error',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setLoading(false);
    }
  };

  // Si ya hay un resultado, mostrar el estado
  if (paymentResult) {
    return (
      <div className={`${className} text-center p-4 rounded-lg border ${
        paymentResult.status === 'approved' ? 'bg-green-50 border-green-200' :
        paymentResult.status === 'pending' ? 'bg-yellow-50 border-yellow-200' :
        'bg-red-50 border-red-200'
      }`}>
        <div className="mx-auto mb-3 w-12 h-12 rounded-full flex items-center justify-center">
          {paymentResult.status === 'approved' ? (
            <CheckCircle className="w-8 h-8 text-green-600" />
          ) : paymentResult.status === 'pending' ? (
            <Loader2 className="w-8 h-8 text-yellow-600 animate-spin" />
          ) : (
            <XCircle className="w-8 h-8 text-red-600" />
          )}
        </div>
        
        <h4 className="font-semibold mb-2">
          {paymentResult.status === 'approved' && '¡Pago Exitoso!'}
          {paymentResult.status === 'pending' && 'Pago Pendiente'}
          {paymentResult.status === 'rejected' && 'Pago Rechazado'}
          {paymentResult.status === 'error' && 'Error en el Pago'}
        </h4>
        
        <p className="text-sm text-gray-600 mb-3">
          {paymentResult.status === 'approved' && 'Tu pago ha sido aprobado'}
          {paymentResult.status === 'pending' && 'Tu pago está siendo procesado'}
          {paymentResult.status === 'rejected' && 'Tu pago fue rechazado'}
          {paymentResult.status === 'error' && paymentResult.error}
        </p>

        {paymentResult.id && (
          <Badge variant="outline" className="font-mono text-xs mb-3">
            ID: {paymentResult.id}
          </Badge>
        )}
        
        <Button
          onClick={() => {
            setPaymentResult(null);
            setLoading(false);
          }}
          className="w-full"
          variant="outline"
          size="sm"
        >
          Intentar de nuevo
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      <Button
        onClick={handlePayment}
        disabled={loading}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Procesando...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pagar S/. {price.toFixed(2)}
          </>
        )}
      </Button>
    </div>
  );
} 