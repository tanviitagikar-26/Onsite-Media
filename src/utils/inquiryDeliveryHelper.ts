import { PRIMARY_PHONE_NUMBER } from '../data/initialData';
import { formatWhatsAppUrl } from './whatsappHelper';

import { formatStructuredWhatsAppMessage } from './formValidation';

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  type?: 'text' | 'options' | 'review' | 'action';
  options?: string[];
  field?: 'name' | 'service' | 'message' | 'email' | 'phone';
}

export interface InquiryDeliveryPayload {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  service?: string;
  project_category?: string;
  message: string;
  conversationTranscript?: string;
  clientTargetPhone?: string;
  ownerName?: string;
  ownerPhone?: string;
  createdAt?: string;
}

/**
 * Format conversation messages into a clean, human-readable transcript.
 */
export function formatConversationTranscript(messages: ChatMessage[]): string {
  return messages
    .filter((m) => m.text && m.text.trim().length > 0)
    .map((m) => {
      const speaker = m.sender === 'bot' ? 'Onset Concierge' : 'Client';
      return `[${speaker}]: ${m.text.trim()}`;
    })
    .join('\n');
}

/**
 * Generate a conversational transcript from inquiry data matching the concierge dialogue flow.
 */
export function buildConversationalTranscript(data: {
  name: string;
  service: string;
  message: string;
  email: string;
  phone?: string;
  ownerName?: string;
}): string {
  const owner = data.ownerName || 'Onsetmedia';
  return [
    `[Onset Concierge]: Hey! 👋 Welcome to Onset Media. Who do I have the pleasure of speaking with today?`,
    `[Client]: ${data.name || 'Anonymous Client'}`,
    `[Onset Concierge]: Great to connect! 🎯 What creative direction or production category are you looking to collaborate on?`,
    `[Client]: ${data.service || 'General Studio Inquiry'}`,
    `[Onset Concierge]: Tell ${owner} about your project brief, timeline, deliverables, or creative vision.`,
    `[Client]: ${data.message || 'No project brief provided.'}`,
    `[Onset Concierge]: Where should our production team send the project proposal and quote?`,
    `[Client]: ${data.email || 'Not provided'}`,
    `[Onset Concierge]: (Optional) What phone or WhatsApp number can ${owner} reach you on?`,
    `[Client]: ${data.phone && data.phone.trim() ? data.phone.trim() : 'Not provided (Email preferred)'}`,
  ].join('\n');
}

/**
 * Format comprehensive inquiry details + conversation transcript as a readable, list-style message
 * for the owner's WhatsApp number, explicitly including the owner's name and all submitted details.
 */
export function formatClientPhoneNotification(
  payload: InquiryDeliveryPayload,
  fallbackOwnerName: string = 'Onsetmedia'
): string {
  const owner = payload.ownerName || fallbackOwnerName || 'Onsetmedia';

  const dateStr = payload.createdAt
    ? new Date(payload.createdAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

  const lines: string[] = [
    '🎬 *NEW ONSET MEDIA PROJECT INQUIRY*',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    `👤 *Studio Owner:* ${owner}`,
    `📅 *Received:* ${dateStr}`,
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '📋 *SUBMITTED INQUIRY DETAILS:*',
    `• *Client Name:* ${payload.name || 'Anonymous Client'}`,
    `• *Client Email:* ${payload.email || 'Not provided'}`,
    `• *Client Phone / WhatsApp:* ${payload.phone && payload.phone.trim() ? payload.phone.trim() : 'Not provided (Email preferred)'}`,
    `• *Project Category:* ${payload.service || 'General Studio Inquiry'}`,
    `• *Project Brief:* ${payload.message || 'No project brief provided.'}`,
  ];

  if (payload.conversationTranscript && payload.conversationTranscript.trim()) {
    lines.push(
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '💬 *CONVERSATION CHAT TRANSCRIPT:*',
      payload.conversationTranscript.trim()
    );
  }

  lines.push(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    `⚡ *Dispatched to Owner ${owner}'s WhatsApp*`
  );

  return lines.join('\n');
}

/**
 * Generate native SMS URI for mobile dispatch
 */
export function formatSmsUrl(phone: string, text: string): string {
  const digits = (phone || PRIMARY_PHONE_NUMBER).replace(/[^0-9+]/g, '');
  return `sms:${digits}?body=${encodeURIComponent(text)}`;
}

/**
 * Generate WhatsApp URL for delivering inquiry to owner's WhatsApp number.
 * Explicitly includes the owner's name and all submitted details in a readable list format.
 */
export function formatOwnerWhatsAppDeliveryUrl(
  ownerTargetPhone: string,
  payload: InquiryDeliveryPayload,
  ownerName: string = 'Onsetmedia'
): { url: string; isConfigured: boolean; messageText: string; warning?: string } {
  const messageText = formatClientPhoneNotification(payload, ownerName);

  if (!ownerTargetPhone || !ownerTargetPhone.trim()) {
    return {
      url: '',
      isConfigured: false,
      messageText,
      warning:
        'Owner WhatsApp number is not configured in site settings. Please configure the studio owner WhatsApp number in the admin panel (Admin > General Settings) to enable automated dispatch.',
    };
  }

  const url = formatWhatsAppUrl(ownerTargetPhone, messageText);
  return {
    url,
    isConfigured: true,
    messageText,
  };
}

/**
 * Generate WhatsApp URL with exactly 4 structured fields:
 * 1. Name: {name}
 * 2. Phone Number: {phone}
 * 3. Project Category: {service}
 * 4. Location: {location}
 */
export function formatStructuredWhatsAppUrl(
  ownerTargetPhone: string,
  payload: {
    name?: string;
    clientName?: string;
    userName?: string;
    fullName?: string;
    phone?: string;
    service?: string;
    project_category?: string;
    location?: string;
  }
): { url: string; isConfigured: boolean; messageText: string; warning?: string } {
  const messageText = formatStructuredWhatsAppMessage(payload);

  if (!ownerTargetPhone || !ownerTargetPhone.trim()) {
    return {
      url: '',
      isConfigured: false,
      messageText,
      warning:
        'Owner WhatsApp number is not configured in site settings. Please configure the studio owner WhatsApp number in the admin panel to enable automated dispatch.',
    };
  }

  const url = formatWhatsAppUrl(ownerTargetPhone, messageText);
  return {
    url,
    isConfigured: true,
    messageText,
  };
}

/**
 * Backward compatibility helper for client / studio phone URL
 */
export function formatClientWhatsAppDeliveryUrl(
  clientTargetPhone: string,
  payload: InquiryDeliveryPayload,
  ownerName: string = 'Onsetmedia'
): string {
  const messageText = formatClientPhoneNotification(payload, ownerName);
  return formatWhatsAppUrl(clientTargetPhone || PRIMARY_PHONE_NUMBER, messageText);
}

/**
 * Generate WhatsApp confirmation URL for visitor's own phone (if provided)
 */
export function formatVisitorWhatsAppConfirmationUrl(
  visitorPhone: string,
  payload: InquiryDeliveryPayload,
  ownerName: string = 'Onsetmedia'
): string | null {
  if (!visitorPhone || !visitorPhone.trim()) return null;
  const owner = payload.ownerName || ownerName || 'Onsetmedia';
  const messageText = [
    `👋 Hello ${payload.name || 'there'},`,
    '',
    'Thank you for contacting *Onset Media*! We have received your project inquiry:',
    `• *Category:* ${payload.service || 'General Inquiry'}`,
    `• *Email:* ${payload.email}`,
    `• *Status:* Under production review by ${owner} & team`,
    '',
    `Our studio will review your creative brief and respond within 24 hours. Feel free to reply directly to this chat if you have any questions!`,
    '',
    '— Onset Media Production Team',
  ].join('\n');

  return formatWhatsAppUrl(visitorPhone, messageText);
}

/**
 * Optional webhook dispatch to automated SMS / WhatsApp gateway (Twilio, Zapier, Make, etc.)
 */
export async function dispatchInquiryWebhook(
  webhookUrl: string,
  payload: InquiryDeliveryPayload
): Promise<boolean> {
  if (!webhookUrl || !webhookUrl.trim() || !webhookUrl.startsWith('http')) {
    return false;
  }

  const safeName = (payload.name && payload.name.trim()) ? payload.name.trim() : 'N/A';
  const safePhone = (payload.phone && payload.phone.trim()) ? payload.phone.trim() : 'N/A';
  const safeCategory = (payload.project_category || payload.service || '').trim() || 'N/A';
  const safeLocation = (payload.location && payload.location.trim()) ? payload.location.trim() : 'N/A';
  const effectiveId = payload.id || `inq-${Date.now()}`;

  const formattedWhatsApp = [
    `1. Name: ${safeName}`,
    `2. Phone Number: ${safePhone}`,
    `3. Project Category: ${safeCategory}`,
    `4. Location: ${safeLocation}`,
  ].join('\n');

  try {
    const response = await fetch(webhookUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: 'inquiry.submitted',
        idempotency_key: effectiveId,
        id: effectiveId,
        timestamp: new Date().toISOString(),
        // Direct top-level mapping for Make, Zapier, n8n, Power Automate
        name: safeName,
        phone: safePhone,
        project_category: safeCategory,
        location: safeLocation,
        formatted_whatsapp_message: formattedWhatsApp,
        payload: {
          ...payload,
          id: effectiveId,
          name: safeName,
          phone: safePhone,
          project_category: safeCategory,
          location: safeLocation,
        },
      }),
    });
    return response.ok;
  } catch (error) {
    console.warn('Webhook dispatch skipped or failed:', error);
    return false;
  }
}
