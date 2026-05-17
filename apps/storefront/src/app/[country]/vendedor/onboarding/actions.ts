'use server';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function getOrCreateOnboardingSession() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Ensure SellerProfile exists
  let profile = await prisma.sellerProfile.findUnique({
    where: { userId: user.id }
  });

  if (!profile) {
    profile = await prisma.sellerProfile.create({
      data: {
        userId: user.id,
        status: 'DRAFT',
      }
    });

    // Audit Event
    await prisma.accountEvent.create({
      data: {
        userId: user.id,
        eventType: 'seller_profile_created',
        payload: { action: 'auto_create_on_onboarding_entry' }
      }
    });
  }

  // If profile is approved or under review, we might not want to create a new session
  if (profile.status === 'APPROVED' || profile.status === 'UNDER_REVIEW') {
    // Return what we have, without forcing a new session
    let session = await prisma.sellerOnboardingSession.findFirst({
      where: { sellerProfileId: profile.id, completedAt: null }
    });
    return { profile, session };
  }

  // Get or Create Session for DRAFT
  let session = await prisma.sellerOnboardingSession.findFirst({
    where: { sellerProfileId: profile.id, completedAt: null }
  });

  if (!session) {
    session = await prisma.sellerOnboardingSession.create({
      data: {
        sellerProfileId: profile.id,
        currentStep: 'INTENT',
        progressData: {}
      }
    });

    await prisma.accountEvent.create({
      data: {
        userId: user.id,
        eventType: 'seller_onboarding_started',
      }
    });
  }

  return { profile, session };
}

export async function saveOnboardingStepAction(step: string, data: any, nextStep: string, country: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const profile = await prisma.sellerProfile.findUnique({
    where: { userId: user.id },
    include: { OnboardingSessions: { where: { completedAt: null } } }
  });

  if (!profile || profile.OnboardingSessions.length === 0) {
    throw new Error("No active onboarding session");
  }

  const session = profile.OnboardingSessions[0];
  const progressData = session.progressData as Record<string, any> || {};

  await prisma.sellerOnboardingSession.update({
    where: { id: session.id },
    data: {
      currentStep: nextStep,
      progressData: { ...progressData, [step]: data }
    }
  });

  await prisma.accountEvent.create({
    data: {
      userId: user.id,
      eventType: 'seller_onboarding_step_completed',
      payload: { step, nextStep }
    }
  });

  revalidatePath(`/${country}/vendedor/onboarding`);
}

export async function submitOnboardingAction(country: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) throw new Error("User not found");

  const profile = await prisma.sellerProfile.findUnique({
    where: { userId: user.id },
    include: { OnboardingSessions: { where: { completedAt: null } } }
  });

  if (!profile || profile.OnboardingSessions.length === 0) {
    throw new Error("No active onboarding session");
  }

  const session = profile.OnboardingSessions[0];
  const progressData = session.progressData as Record<string, any> || {};

  // Extraer data acumulada
  const personalData = progressData['PERSONAL'] || {};
  const commercialData = progressData['COMMERCIAL'] || {};
  const businessTypeData = progressData['BUSINESS_TYPE'] || {};
  const residenceData = progressData['RESIDENCE'] || {};
  const addressData = progressData['ADDRESS'] || {};
  
  // Validación de edad en Backend
  if (!personalData.dateOfBirth) {
    throw new Error("Date of birth is required.");
  }
  const birthDate = new Date(personalData.dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
  }
  if (age < 18) {
    throw new Error("User must be 18 or older to become a seller.");
  }

  const storeName = commercialData.storeName || `Tienda de ${user.email}`;
  const category = commercialData.category ? [commercialData.category] : [];
  const targetCountry = residenceData.targetCountry ? [residenceData.targetCountry] : [];

  // Crear UserAddress
  if (addressData.addressLine1 && (addressData.cityCode || addressData.cityNameRaw)) {
    const geoCountry = residenceData.targetCountry || residenceData.residenceCountry || country.toUpperCase();
    await prisma.userAddress.create({
      data: {
        userId: user.id,
        countryCode: geoCountry,
        state: addressData.departmentName || '',
        city: addressData.cityNameRaw || '',
        addressLine1: addressData.addressLine1,
        isDefault: true,
        status: 'UNVERIFIED',
        cityCode: addressData.cityCode || null,
        departmentCode: addressData.departmentCode || null,
        citySource: addressData.citySource || 'manual_request',
        cityNameRaw: addressData.cityNameRaw || null,
        geoStatus: addressData.geoStatus || 'pending_review',
        coverageStatus: addressData.coverageStatus || 'pending_review',
        deliveryEligibility: addressData.deliveryEligibility || 'pending_review',
        addressSource: 'seller_onboarding',
        gpsRequiredLater: true
      }
    });
  }

  // 1. Cerrar Sesión de Onboarding
  await prisma.sellerOnboardingSession.update({
    where: { id: session.id },
    data: {
      currentStep: 'COMPLETED',
      completedAt: new Date()
    }
  });

  // 2. Actualizar Seller Profile con la data real
  await prisma.sellerProfile.update({
    where: { id: profile.id },
    data: { 
      status: 'UNDER_REVIEW', // Goes to Super Admin
      commercialName: storeName,
      businessType: businessTypeData.businessType || 'FORMAL',
      targetCategories: category,
      targetCountries: targetCountry
    } 
  });

  // 3. CREAR / ACTUALIZAR LA TIENDA (STORE)
  let store = await prisma.store.findFirst({
    where: { ownerId: user.id, tenantId: dbUser.tenantId }
  });

  if (!store) {
    store = await prisma.store.create({
      data: {
        tenantId: dbUser.tenantId,
        ownerId: user.id,
        name: storeName,
        planType: 'STANDARD', // Por defecto
        kycStatus: 'PENDING'  // Bloqueo operativo inicial
      }
    });
  } else {
    store = await prisma.store.update({
      where: { id: store.id },
      data: {
        name: storeName,
        kycStatus: 'PENDING'
      }
    });
  }

  // 4. Auditoría
  await prisma.accountEvent.create({
    data: {
      userId: user.id,
      eventType: 'seller_under_review',
      payload: { sessionId: session.id, storeId: store.id }
    }
  });

  // 5. Correo
  try {
    const { sendTransactionalEmail } = await import('@/lib/email');
    await sendTransactionalEmail({
      to: user.email || '',
      event: 'seller_under_review',
      locale: country === 'br' ? 'pt-BR' : (country === 'us' ? 'en' : 'es'),
    });
  } catch (e) {
    console.error("Failed to send seller_under_review email:", e);
  }

  redirect(`/${country}/vendedor`);
}
