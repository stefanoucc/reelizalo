'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2 } from 'lucide-react';

interface CheckoutButtonProps {
  title: string;
  price: number;
  description?: string;
  quantity?: number;
  className?: string;
}

export default function CheckoutButton({
  title,
  price,
  description,
  quantity = 1,
  className
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          price,
          description,
          quantity
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear la preferencia de pago');
      }

      const data = await response.json();
      
      // Usar siempre init_point (producción) - el usuario usará credenciales de prueba
      const paymentUrl = data.init_point;
        
      if (!paymentUrl) {
        throw new Error('No se pudo obtener la URL de pago');
      }
      
      window.location.href = paymentUrl;
      
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar el pago. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={loading}
      className={className}
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
  );
} 