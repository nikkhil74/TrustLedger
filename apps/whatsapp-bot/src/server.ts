import Fastify from 'fastify';
import { env } from './config/env.js';
import { handleMessage } from './bot/handler.js';

export async function createServer() {
  const app = Fastify({ logger: true });

  // Health check
  app.get('/health', async () => ({ status: 'healthy', service: 'whatsapp-bot' }));

  // Twilio webhook — incoming WhatsApp messages
  app.post<{
    Body: { From: string; Body: string; To?: string; MessageSid?: string };
  }>('/webhook/whatsapp', async (request, reply) => {
    const { From: from, Body: body } = request.body;

    // Extract phone number (Twilio format: whatsapp:+91XXXXXXXXXX)
    const phone = from.replace('whatsapp:', '');

    app.log.info({ phone, body }, 'Incoming WhatsApp message');

    const replyText = await handleMessage(phone, body);

    // Return TwiML response
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(replyText)}</Message>
</Response>`;

    reply.type('text/xml').send(twiml);
  });

  return app;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function startServer() {
  const app = await createServer();

  await app.listen({ host: '0.0.0.0', port: env.PORT });
  app.log.info(`WhatsApp bot listening on port ${env.PORT}`);

  return app;
}
