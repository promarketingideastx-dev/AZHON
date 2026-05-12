import * as React from 'react';
import { Html, Head, Body, Container, Text, Preview, Section, Link } from '@react-email/components';

interface SellerUnderReviewProps {
  dict: any;
  payload?: any;
}

export default function SellerUnderReviewTemplate({ dict, payload }: SellerUnderReviewProps) {
  return (
    <Html>
      <Head />
      <Preview>{dict.email?.seller_review_preview || 'Tu solicitud de vendedor AZHON está en revisión'}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>AZHON <span style={badge}>PARTNERS</span></Text>
          </Section>
          <Section style={content}>
            <Text style={title}>
              {dict.email?.seller_review_title || 'Hemos recibido tu solicitud'}
            </Text>
            <Text style={paragraph}>
              {dict.email?.seller_review_body_1 || 'Gracias por completar tu perfil de vendedor. Nuestro equipo de compliance está revisando tu documentación comercial y validando tus datos.'}
            </Text>
            <Section style={statusBox}>
              <Text style={statusTitle}>{dict.email?.status_label || 'Estado Actual:'}</Text>
              <Text style={statusBadge}>{dict.email?.status_under_review || 'EN REVISIÓN'}</Text>
            </Section>
            <Text style={paragraph}>
              {dict.email?.seller_review_body_2 || 'Este proceso suele tomar entre 24 y 48 horas hábiles. Te notificaremos por este mismo medio tan pronto tengamos una respuesta o si necesitamos información adicional.'}
            </Text>
            <Link href="https://azhon.com/vendedor/onboarding" style={button}>
              {dict.email?.seller_review_cta || 'Ver estado de mi solicitud'}
            </Link>
          </Section>
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} AZHON Partners. {dict.email?.all_rights || 'Todos los derechos reservados.'}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  maxWidth: '580px',
};

const header = {
  padding: '32px 48px',
  borderBottom: '1px solid #eaeaea',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const logo = {
  fontSize: '24px',
  fontWeight: '900',
  letterSpacing: '-1px',
  color: '#000000',
  margin: '0',
};

const badge = {
  fontSize: '12px',
  backgroundColor: '#f0f0f0',
  color: '#666',
  padding: '4px 8px',
  borderRadius: '4px',
  marginLeft: '8px',
  fontWeight: '600',
};

const content = {
  padding: '32px 48px',
};

const title = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#1a1a1a',
  marginBottom: '24px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#4a4a4a',
  marginBottom: '24px',
};

const statusBox = {
  backgroundColor: '#f8f9fa',
  border: '1px solid #e9ecef',
  borderRadius: '6px',
  padding: '16px',
  marginBottom: '24px',
  textAlign: 'center' as const,
};

const statusTitle = {
  fontSize: '14px',
  color: '#6c757d',
  margin: '0 0 8px 0',
};

const statusBadge = {
  fontSize: '16px',
  fontWeight: '700',
  color: '#e67e22',
  margin: '0',
};

const button = {
  backgroundColor: '#FF4400',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '16px 0',
  fontWeight: 'bold',
};

const footer = {
  padding: '0 48px',
};

const footerText = {
  fontSize: '12px',
  color: '#999999',
  textAlign: 'center' as const,
};
