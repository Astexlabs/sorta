import { useAuth } from '@clerk/clerk-expo';
import { useQuery } from 'convex/react';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { api } from '@/convex/_generated/api';

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();
  const kyc = useQuery(api.kyc.getKycProfile);

  if (!isLoaded || (isSignedIn && kyc === undefined)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a' }}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  // Redirect to onboarding if KYC not yet submitted/approved
  if (!kyc || (kyc.verification_status !== 'submitted' && kyc.verification_status !== 'approved')) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}
