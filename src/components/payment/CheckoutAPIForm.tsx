'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Payment, initMercadoPago } from '@mercadopago/sdk-react';

// Inicializar MercadoPago con la public key
if (typeof window !== 'undefined') {
  // Force use the working TEST credentials
  const publicKey = 'TEST-93035092-73a0-4b47-a9c5-f8d13f1cac7f';
  console.log('🔑 Inicializando MercadoPago con public key:', publicKey);
  initMercadoPago(publicKey);
}

interface CheckoutAPIFormProps {
  title: string;
  price: number;
  description?: string;
  className?: string;
}

export default function CheckoutAPIForm({
  title,
  price,
  description,
  className
}: CheckoutAPIFormProps) {
  const [loading, setLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);

  const onSubmit = async (formData: any) => {
    setLoading(true);
    
    try {
      console.log('📝 Datos del formulario completos:', formData);

      // Extraer datos del formulario con valores por defecto
      const paymentData = {
        token: formData.token || `TEST_TOKEN_${Math.random().toString(36).substr(2, 9)}`,
        payment_method_id: formData.payment_method_id || formData.paymentMethodId || 'visa',
        transaction_amount: price,
        installments: formData.installments || formData.installment || 1,
        description: description || title,
        payer: {
          email: formData.payer?.email || 'test@mercadopago.com',
          identification: formData.payer?.identification || {
            type: 'DNI',
            number: '12345678'
          }
        }
      };

      console.log('📋 Datos a enviar:', paymentData);

      const response = await fetch('/api/mercadopago/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
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

  const onError = (error: any) => {
    console.error('❌ Error en Payment Brick:', error);
    setPaymentResult({
      status: 'error',
      error: 'Error en el formulario de pago'
    });
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

  // Debug info
  const publicKey = process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY || 'TEST-93035092-73a0-4b47-a9c5-f8d13f1cac7f';
  
  return (
    <div className={className}>
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2 text-sm">Procesando pago...</span>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Debug info */}
          <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
            <p>🔑 Public Key: {publicKey.substring(0, 20)}...</p>
            <p>💰 Amount: S/. {price}</p>
          </div>
          
          <div id={`mercadopago-form-${title.replace(/\s+/g, '-').toLowerCase()}`}>
            <Payment
              initialization={{
                amount: price,
                payer: {
                  email: 'test@mercadopago.com'
                }
              }}
              customization={{
                paymentMethods: {
                  creditCard: 'all',
                  debitCard: 'all',
                  mercadoPago: 'all'
                },
                visual: {
                  style: {
                    theme: 'default'
                  }
                }
              }}
              onSubmit={onSubmit}
              onError={onError}
              onReady={() => {
                console.log('🎯 Payment Brick cargado correctamente');
              }}
            />
          </div>
          
          {/* Fallback button if Payment component doesn't load */}
          <Button
            onClick={() => {
              console.log('🔍 Payment component not loading, showing fallback');
              alert(`Formulario de pago para ${title} - S/. ${price}\n\nEste es un fallback mientras configuramos el Payment Brick`);
            }}
            className="w-full"
            variant="outline"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Pagar S/. {price.toFixed(2)} (Fallback)
          </Button>
        </div>
      )}
    </div>
  );
} 