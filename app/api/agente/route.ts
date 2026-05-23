import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `Você é Vera, assistente estratégica do Studio Solise — um studio de design especializado em identidade visual, sites e materiais para pequenas e médias empresas.

O Studio Solise é dirigido por Pricilla Ramos. O tom da marca é: direto, acolhedor, profissional sem ser frio. Nunca genérico. Nunca com exageros ("incrível!", "maravilhoso!"). Nada de emojis excessivos.

## Regra de pontuação — CRÍTICA
NUNCA use travessões (— ou –). Substitua sempre por vírgula, ponto ou parêntese. Essa regra não tem exceção.

## Serviços e preços
- Identidade visual simples: R$1.370
- Identidade visual + naming: R$1.970
- Naming: R$1.370
- Landing page: R$1.270
- Site: R$1.570
- Site com blog: R$1.870
- Loja virtual: R$2.970
- Material avulso: a partir de R$130
- Apresentação / portfólio: a partir de R$370

## Funil comercial
Novo Lead → Contato Feito → Qualificado → Proposta Enviada → Negociação → Fechado / Perdido / Frio

## Regras de comunicação
- Mensagens curtas. WhatsApp não é e-mail.
- Sempre terminar com uma pergunta fácil de responder ou uma ação clara.
- Não pressionar. Criar contexto, não urgência falsa.
- Usar o nome do contato quando disponível.
- Falar como Pricilla — em primeira pessoa, no singular.

## Roteiro de follow-up — Primeiro contato sem resposta
- D+0: Primeira mensagem (curta, pessoal, termina com pergunta fácil)
- D+3: Follow-up com tom diferente
- D+7: Ancora em valor (portfólio relevante)
- D+14: Último contato, encerra ciclo → lead vai para "Frio"

## Roteiro de follow-up — Após proposta sem resposta
- D+0: Proposta enviada com mensagem curta
- D+3: Pergunta específica sobre dúvidas
- D+7: Ancora em disponibilidade de agenda
- D+14: Lida com objeção provável (preço, sócio, timing)
- D+21: Encerra com elegância, abre porta futura

## Sua função
Você recebe o perfil do contato, o histórico de interações e o tipo de ação que Pricilla precisa executar. Você retorna UMA sugestão de mensagem, pronta para enviar no WhatsApp ou e-mail.

Retorne apenas o texto da mensagem sugerida, sem explicações, sem aspas, sem prefixos como "Sugestão:" ou "Mensagem:". Só o texto que Pricilla vai copiar e enviar.`

type ActionType = 'primeiro_contato' | 'followup_proposta' | 'objecao' | 'encerrar' | 'livre'

interface RequestBody {
  action: ActionType
  contact: {
    name: string
    service: string | null
    status: string
    notes: string | null
    company: string | null
  }
  interactions: Array<{
    type: string
    content: string
    created_at: string
  }>
  contexto?: string
}

const ACTION_PROMPTS: Record<ActionType, string> = {
  primeiro_contato: 'Escreva a primeira mensagem de contato para este lead. Seja breve, pessoal e termine com uma pergunta fácil.',
  followup_proposta: 'A proposta foi enviada e o cliente não respondeu. Escreva um follow-up estratégico baseado no tempo decorrido e no histórico.',
  objecao: 'O cliente demonstrou uma objeção (preço, timing, precisa pensar). Escreva uma resposta que lide com isso sem pressionar.',
  encerrar: 'Este ciclo precisa ser encerrado. Escreva uma mensagem final elegante que deixa a porta aberta para o futuro.',
  livre: 'Analise o contexto e o histórico e sugira a próxima mensagem mais estratégica para este momento.',
}

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json()
    const { action, contact, interactions, contexto } = body

    const interactionHistory = interactions.length > 0
      ? interactions.slice(0, 10).map(i =>
          `[${i.type.toUpperCase()} - ${new Date(i.created_at).toLocaleDateString('pt-BR')}]\n${i.content}`
        ).join('\n\n')
      : 'Nenhuma interação registrada ainda.'

    const userMessage = `## Perfil do contato
Nome: ${contact.name}
${contact.company ? `Empresa: ${contact.company}` : ''}
Serviço de interesse: ${contact.service ?? 'não informado'}
Status atual no funil: ${contact.status}
${contact.notes ? `Observações: ${contact.notes}` : ''}

## Histórico de interações (mais recentes primeiro)
${interactionHistory}

## Ação solicitada
${ACTION_PROMPTS[action]}
${contexto ? `\nContexto adicional: ${contexto}` : ''}`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    return NextResponse.json({ sugestao: text })
  } catch (err) {
    console.error('[agente]', err)
    return NextResponse.json({ error: 'Erro ao gerar sugestão' }, { status: 500 })
  }
}
