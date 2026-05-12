import * as React from 'react';
import { Html, Head, Body, Container, Text, Link, Preview, Section, Img } from '@react-email/components';

interface WelcomeBuyerProps {
  dict: any;
  payload?: any;
}

export default function WelcomeBuyerTemplate({ dict, payload }: WelcomeBuyerProps) {
  return (
    <Html>
      <Head />
      <Preview>{dict.email?.welcome_buyer_preview || 'Bienvenido a AZHON Marketplace'}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>AZHON</Text>
          </Section>
          <Section style={content}>
            <Text style={title}>
              {dict.email?.welcome_buyer_title || '¡Hola! Bienvenido a AZHON'}
            </Text>
            <Text style={paragraph}>
              {dict.email?.welcome_buyer_body || 'Estamos muy felices de tenerte aquí. AZHON es el lugar donde puedes explorar, comprar y disfrutar de productos verificados de cientos de vendedores locales e internacionales.'}
            </Text>
            <Text style={paragraph}>
              {dict.email?.welcome_buyer_next_step || 'Tu cuenta ya está activa y verificada. Prepárate para descubrir algo increíble hoy.'}
            </Text>
            <Link href="https://azhon.com" style={button}>
              {dict.email?.welcome_buyer_cta || 'Ir a la Tienda'}
            </Link>
          </Section>
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} AZHON. {dict.email?.all_rights || 'Todos los derechos reservados.'}
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
};

const logo = {
  fontSize: '24px',
  fontWeight: '900',
  letterSpacing: '-1px',
  color: '#FF4400',
  margin: '0',
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

const button = {
  backgroundColor: '#000000',
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
