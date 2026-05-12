import { Resend } from 'resend';
import { getDictionary } from '@/i18n';
import WelcomeBuyerTemplate from './templates/WelcomeBuyer';
import SellerUnderReviewTemplate from './templates/SellerUnderReview';
import { render } from '@react-email/components';
import React from 'react';

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');
const EMAIL_FROM = process.env.EMAIL_FROM || 'AZHON <no-reply@azhon.com>';

export type EmailEvent = 
  | 'welcome_buyer'
  | 'welcome_seller'
  | 'onboarding_submitted'
  | 'seller_under_review'
  | 'seller_approved'
  | 'seller_rejected'
  | 'admin_alert_new_seller';

interface SendEmailParams {
  to: string;
  event: EmailEvent;
  locale: string;
  payload?: any;
}

export async function sendTransactionalEmail({ to, event, locale, payload }: SendEmailParams) {
  if (!process.env.RESEND_API_KEY) {
    console.warn(`[EMAIL MOCK] Would send ${event} to ${to} (Locale: ${locale})`);
    return { success: true, mocked: true };
  }

  const dict = getDictionary(locale);
  let subject = '';
  let reactTemplate: React.ReactElement | null = null;

  switch (event) {
    case 'welcome_buyer':
      subject = dict.email?.welcome_buyer_subject || 'Bienvenido a AZHON';
      reactTemplate = React.createElement(WelcomeBuyerTemplate, { dict, payload });
      break;
    case 'seller_under_review':
      subject = dict.email?.seller_under_review_subject || 'Tu cuenta de vendedor está en revisión';
      reactTemplate = React.createElement(SellerUnderReviewTemplate, { dict, payload });
      break;
    // TODO: Implement other templates
    default:
      console.warn(`[EMAIL ERROR] Template for event ${event} not implemented yet`);
      return { success: false, error: 'Template missing' };
  }

  if (!reactTemplate) return { success: false, error: 'React Template generation failed' };

  try {
    const html = await render(reactTemplate);

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('[EMAIL SEND ERROR]', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('[EMAIL SEND CATCH ERROR]', error);
    return { success: false, error };
  }
}
