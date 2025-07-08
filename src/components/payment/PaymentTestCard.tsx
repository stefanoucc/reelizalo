'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Crown, Rocket } from 'lucide-react';
import CheckoutAPIForm from './CheckoutAPIForm';
import SimplePaymentButton from './SimplePaymentButton';
import TestInfo from './TestInfo';

const plans = [
  {
    id: 'basic',
    name: 'Plan Básico',
    price: 9.99,
    description: 'Genera 5 videos con IA',
    features: [
      '5 videos por mes',
      'Templates básicos',
      'Resolución HD',
      'Soporte por email'
    ],
    icon: <Sparkles className="h-6 w-6" />,
    popular: false
  },
  {
    id: 'pro',
    name: 'Plan Pro',
    price: 19.99,
    description: 'Perfecto para creadores de contenido',
    features: [
      '50 videos por mes',
      'Templates premium',
      'Resolución 4K',
      'IA avanzada',
      'Soporte prioritario'
    ],
    icon: <Crown className="h-6 w-6" />,
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Plan Empresa',
    price: 49.99,
    description: 'Para equipos y agencias',
    features: [
      '500 videos por mes',
      'Templates personalizados',
      'API access',
      'White-label',
      'Soporte 24/7'
    ],
    icon: <Rocket className="h-6 w-6" />,
    popular: false
  }
];

export default function PaymentTestCard() {
  return (
    <div className="space-y-6">
      <TestInfo />
      
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.id} className="relative">
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                <Badge className="bg-blue-600 text-white px-3 py-1">
                  Más Popular
                </Badge>
              </div>
            )}
            
            <Card className={`h-full ${
              plan.popular 
                ? 'border-blue-500 shadow-lg scale-105' 
                : 'border-gray-200'
            }`}>
              <CardHeader className="text-center">
                <div className="mx-auto mb-2 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  {plan.icon}
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="text-3xl font-bold text-blue-600">
                  S/. {plan.price}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                {/* Primary Payment Form */}
                {/* Primary Payment Form */}
                <CheckoutAPIForm
                  title={plan.name}
                  price={plan.price}
                  description={plan.description}
                  className="w-full"
                />
                
                {/* Fallback Simple Button */}
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Alternativa simple:</p>
                  <SimplePaymentButton
                    title={plan.name}
                    price={plan.price}
                    description={plan.description}
                    className="w-full"
                  />
                </div>
                
                {/* Fallback Simple Button */}
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Alternativa simple:</p>
                  <SimplePaymentButton
                    title={plan.name}
                    price={plan.price}
                    description={plan.description}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-amber-800">
            🧪 Entorno de Pruebas
          </CardTitle>
          <CardDescription className="text-amber-600">
            Usando credenciales TEST de Mercado Pago - Los pagos no son reales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-amber-700">
            <p>✅ <strong>Nuevo:</strong> Checkout API implementado</p>
            <p>✅ <strong>Credenciales:</strong> TEST-93035092-73a0...</p>
            <p>✅ <strong>Frontend:</strong> Completamente personalizado</p>
            <p>✅ <strong>Payment Bricks:</strong> Activos</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 