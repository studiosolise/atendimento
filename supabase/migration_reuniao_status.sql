-- Adiciona 'reuniao' como status válido em contacts
-- Executar no Supabase SQL Editor

ALTER TABLE public.contacts DROP CONSTRAINT IF EXISTS contacts_status_check;

ALTER TABLE public.contacts
ADD CONSTRAINT contacts_status_check
CHECK (status IN (
  'novo_lead','contato_feito','reuniao','qualificado',
  'proposta_enviada','negociacao','fechado','perdido','frio'
));
