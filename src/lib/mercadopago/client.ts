import { MercadoPagoConfig, Payment } from 'mercadopago';

// Inicializar el cliente de Mercado Pago
// Configurado para SANDBOX/TEST - Credenciales de prueba
// TEST: TEST-xxxx (Access Token) y TEST-xxxx (Public Key)
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-7901482135324921-070113-9923e749494ade9406d4b81a6840f645-2522624585',
  options: {
    timeout: 5000,
    idempotencyKey: 'abc'
  }
});

// Crear instancia de Payment para Checkout API
export const payment = new Payment(client);

export { client }; 