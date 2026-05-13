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

  const profile = await prisma.sellerProfile.findUnique({
    where: { userId: user.id },
    include: { OnboardingSessions: { where: { completedAt: null } } }
  });

  if (!profile || profile.OnboardingSessions.length === 0) {
    throw new Error("No active onboarding session");
  }

  const session = profile.OnboardingSessions[0];

  await prisma.sellerOnboardingSession.update({
    where: { id: session.id },
    data: {
      currentStep: 'COMPLETED',
      completedAt: new Date()
    }
  });

  await prisma.sellerProfile.update({
    where: { id: profile.id },
    data: { status: 'UNDER_REVIEW' } // Goes to Super Admin
  });

  await prisma.accountEvent.create({
    data: {
      userId: user.id,
      eventType: 'seller_under_review',
      payload: { sessionId: session.id }
    }
  });

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
