import { NextRequest, NextResponse } from 'next/server';
import { payment } from '@/lib/mercadopago/client';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    console.log('=== INICIO PROCESAMIENTO DE PAGO CHECKOUT API ===');
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.log('❌ Usuario no autenticado');
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
    }

    console.log('✅ Usuario autenticado:', user.email);

    const body = await request.json();
    const { 
      token, 
      payment_method_id, 
      transaction_amount, 
      installments, 
      description,
      payer 
    } = body;

    console.log('📝 Datos de pago recibidos:', { 
      payment_method_id, 
      transaction_amount, 
      installments, 
      description 
    });

    // Validar datos mínimos requeridos
    if (!transaction_amount) {
      console.log('❌ Monto requerido');
      return NextResponse.json({ 
        error: 'Monto de transacción requerido' 
      }, { status: 400 });
    }

    // Asignar valores por defecto si faltan datos
    const finalToken = token || `TEST_TOKEN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const finalPaymentMethodId = payment_method_id || 'visa';
    const finalInstallments = installments || 1;

    console.log('🔧 Datos finales después de validación:', {
      token: finalToken,
      payment_method_id: finalPaymentMethodId,
      installments: finalInstallments
    });

    // Crear el pago con Checkout API
    const paymentData = {
      transaction_amount: parseFloat(transaction_amount),
      token: finalToken,
      description: description || 'Generación de video con IA - Reelizalo',
      installments: parseInt(finalInstallments),
      payment_method_id: finalPaymentMethodId,
      payer: {
        email: payer?.email || user.email!,
        ...(payer?.identification && {
          identification: {
            type: payer.identification.type,
            number: payer.identification.number
          }
        })
      },
      external_reference: user.id,
      metadata: {
        user_id: user.id,
        user_email: user.email,
        environment: 'test'
      },
      statement_descriptor: 'REELIZALO'
    };

    console.log('📋 Datos de pago preparados:', JSON.stringify(paymentData, null, 2));
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN;
    console.log('🔑 Access Token configurado:', accessToken ? 'SÍ' : 'NO');
    console.log('🔑 Access Token tipo:', accessToken?.substring(0, 10) + '...');

    console.log('🚀 Enviando pago a Mercado Pago...');

    const paymentResponse = await payment.create({ body: paymentData });

    console.log('✅ Respuesta de Mercado Pago:', {
      id: paymentResponse.id,
      status: paymentResponse.status,
      status_detail: paymentResponse.status_detail
    });

    // Determinar el resultado basado en el status
    let result = {
      id: paymentResponse.id,
      status: paymentResponse.status,
      status_detail: paymentResponse.status_detail,
      transaction_amount: paymentResponse.transaction_amount,
      payment_method_id: paymentResponse.payment_method_id
    };

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('❌ ERROR COMPLETO:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack available');
    console.error('❌ Error message:', error instanceof Error ? error.message : error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor', 
        details: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 