import type { FastifyInstance } from 'fastify';
import { readFile } from 'fs/promises';

const defaultQA = [
  {
    question: "What is DentClinicAI?",
    answer: "DentClinicAI is a cutting-edge platform designed to revolutionize dental clinic management. It leverages artificial intelligence to streamline operations, enhance patient care, and boost overall efficiency. Our service offers a suite of tools, including automated scheduling, patient communication, and data analytics, all tailored to meet the unique needs of dental practices worldwide."
  },
  {
    question: "How does DentClinicAI work?",
    answer: "Our platform integrates seamlessly with your existing systems. The AI analyzes your clinic's data to automate appointment scheduling based on practitioner availability and treatment duration. It also handles patient reminders and follow-ups via personalized messages, reducing no-shows and improving patient engagement."
  },
  {
    question: "What are the benefits?",
    answer: "Key benefits include significant time savings for your staff, reduced administrative errors, increased patient satisfaction, and data-driven insights to optimize your clinic's performance and profitability."
  },
  {
    question: "How do I get started?",
    answer: "Getting started is easy! You can sign up for a free trial directly from our website or schedule a demo with one of our specialists who will walk you through the platform and answer all your questions."
  }
];

export async function qaRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/api/qa', {
    schema: {
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              question: { type: 'string' },
              answer: { type: 'string' },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    await reply.header('Cache-Control', 'public, max-age=3600');
    await reply.header('X-Robots-Tag', 'all');

    try {
      const fileContent = await readFile('./public/qa.json', 'utf-8');
      return JSON.parse(fileContent);
    } catch {
      return defaultQA;
    }
  });
}