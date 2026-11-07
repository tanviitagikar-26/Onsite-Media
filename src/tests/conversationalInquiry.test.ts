import {
  ChatMessage,
  formatConversationTranscript,
  formatClientPhoneNotification,
  formatOwnerWhatsAppDeliveryUrl,
  formatSmsUrl,
  formatClientWhatsAppDeliveryUrl,
  formatVisitorWhatsAppConfirmationUrl,
} from '../utils/inquiryDeliveryHelper';
import { PRIMARY_PHONE_NUMBER } from '../data/initialData';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`✗ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✓ PASS: ${message}`);
}

console.log('--- RUNNING INQUIRY FLOW, CLASSIC FORM & OWNER WHATSAPP DELIVERY TESTS ---');

// 1. Verify Classic Form list-style message formatting for Owner's WhatsApp
const classicFormPayload = {
  id: 'inq-test-999',
  name: 'Marcus Vance',
  email: 'marcus@hyperion.studio',
  phone: '+1 (555) 789-0123',
  service: '3D Modeling & CGI Visualization',
  message: 'Need full 3D product visualization, 4K renders, and 20s teaser animation for spring launch.',
  ownerName: 'Ronny',
  ownerPhone: PRIMARY_PHONE_NUMBER,
  createdAt: '2026-10-14T10:30:00.000Z',
};

const formattedClassicMessage = formatClientPhoneNotification(classicFormPayload, 'Ronny');
assert(formattedClassicMessage.includes('NEW ONSET MEDIA PROJECT INQUIRY'), 'Message includes studio inquiry headline');
assert(formattedClassicMessage.includes('Studio Owner:* Ronny'), 'Message explicitly maps owner name Ronny');
assert(formattedClassicMessage.includes('Marcus Vance'), 'Message captures client name');
assert(formattedClassicMessage.includes('marcus@hyperion.studio'), 'Message captures client email');
assert(formattedClassicMessage.includes('+1 (555) 789-0123'), 'Message captures client phone/WhatsApp');
assert(formattedClassicMessage.includes('3D Modeling & CGI Visualization'), 'Message captures project category');
assert(formattedClassicMessage.includes('Need full 3D product visualization'), 'Message captures full project brief');
assert(formattedClassicMessage.includes('Dispatched to Owner Ronny\'s WhatsApp'), 'Message notes owner WhatsApp destination');

// 2. Verify Owner WhatsApp URL generation with clean list-style encoding
const ownerWhatsAppDelivery = formatOwnerWhatsAppDeliveryUrl(
  PRIMARY_PHONE_NUMBER,
  classicFormPayload,
  'Ronny'
);

assert(ownerWhatsAppDelivery.isConfigured === true, 'Owner WhatsApp delivery recognizes configured owner phone');
assert(ownerWhatsAppDelivery.url.startsWith('https://wa.me/919035582905'), 'WhatsApp URL correctly targets owner phone 9035582905');
assert(ownerWhatsAppDelivery.url.includes(encodeURIComponent('Marcus Vance')), 'WhatsApp URL encodes client name');
assert(ownerWhatsAppDelivery.url.includes(encodeURIComponent('3D Modeling & CGI Visualization')), 'WhatsApp URL encodes project category');
assert(ownerWhatsAppDelivery.url.includes(encodeURIComponent('marcus@hyperion.studio')), 'WhatsApp URL encodes client email');

// 3. Verify unconfigured owner phone handling with explicit warning
const unconfiguredDelivery = formatOwnerWhatsAppDeliveryUrl('', classicFormPayload, 'Ronny');
assert(unconfiguredDelivery.isConfigured === false, 'Detects unconfigured owner phone number');
assert(unconfiguredDelivery.url === '', 'Returns empty URL when owner phone is not configured');
assert(Boolean(unconfiguredDelivery.warning && unconfiguredDelivery.warning.includes('Owner WhatsApp number is not configured')), 'Provides clear setup instructions in warning');

// 4. Verify Optional Phone Handling (when visitor omits phone)
const optionalPhonePayload = {
  name: 'Devon Miles',
  email: 'devon@agency.com',
  phone: undefined,
  service: 'Commercial Video & Editing',
  message: 'Commercial edit for automotive brand with tight 3-week turnaround.',
  ownerName: 'Ronny',
};

const optionalPhoneMessage = formatClientPhoneNotification(optionalPhonePayload, 'Ronny');
assert(optionalPhoneMessage.includes('Not provided (Email preferred)'), 'Handles skipped phone gracefully with clean fallback');

const noVisitorUrl = formatVisitorWhatsAppConfirmationUrl('', optionalPhonePayload);
assert(noVisitorUrl === null, 'No client copy URL generated if phone was not provided');

const withVisitorUrl = formatVisitorWhatsAppConfirmationUrl('9876543210', optionalPhonePayload);
assert(withVisitorUrl !== null && withVisitorUrl.includes('wa.me/919876543210'), 'Client copy URL generated if client provided phone');

// 5. Verify SMS fallback generation
const smsUrl = formatSmsUrl(PRIMARY_PHONE_NUMBER, formattedClassicMessage);
assert(smsUrl.startsWith('sms:9035582905?body='), 'SMS URL formats native schema with encoded body');

// 6. Verify conversational transcript builder compatibility
const mockMessages: ChatMessage[] = [
  { id: '1', sender: 'bot', text: 'Welcome to Onset Media.', timestamp: '10:00' },
  { id: '2', sender: 'user', text: 'Maya Lin', timestamp: '10:01' },
];
const transcript = formatConversationTranscript(mockMessages);
assert(transcript.includes('[Onset Concierge]:'), 'Transcript includes bot speech tags');
assert(transcript.includes('[Client]: Maya Lin'), 'Transcript captures user text');

const messageWithTranscript = formatClientPhoneNotification({
  ...classicFormPayload,
  conversationTranscript: transcript,
});
assert(messageWithTranscript.includes('CONVERSATION CHAT TRANSCRIPT:'), 'Appends conversation transcript section if provided');

console.log('--- ALL INQUIRY FLOW, CLASSIC FORM & OWNER WHATSAPP DELIVERY TESTS PASSED ---');
