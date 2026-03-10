import { useSignUp, useUser } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getAuthErrorMessage } from '@/lib/auth-errors';
import { isPasskeySupported } from '@/lib/passkeys';

const BG = '#0a0a0a';
const SURFACE = '#111111';
const BORDER = '#1f1f1f';
const ACCENT = '#6366f1';
const TEXT = '#f5f5f5';
const MUTED = '#555558';
const ERROR_BG = '#1f0d0d';
const ERROR_TEXT = '#f87171';

type Phase = 'register' | 'custom-fields' | 'verify' | 'passkey-prompt';

function StyledInput({ value, onChange, placeholder, secureTextEntry, keyboardType, autoComplete, autoCapitalize, large }: {
  value: string; onChange: (v: string) => void; placeholder: string;
  secureTextEntry?: boolean; keyboardType?: any; autoComplete?: any; autoCapitalize?: any; large?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      value={value} onChangeText={onChange} placeholder={placeholder}
      placeholderTextColor="#2a2a2e" secureTextEntry={secureTextEntry}
      keyboardType={keyboardType} autoComplete={autoComplete}
      autoCapitalize={autoCapitalize ?? 'none'}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{
        backgroundColor: SURFACE, borderWidth: 1, borderColor: focused ? ACCENT : BORDER,
        borderRadius: 12, paddingHorizontal: 16,
        paddingVertical: large ? 18 : 14, color: TEXT,
        fontSize: large ? 28 : 15, textAlign: large ? 'center' : 'left',
        letterSpacing: large ? 10 : 0, marginBottom: 12,
      }}
    />
  );
}

function PrimaryBtn({ label, onPress, disabled, loading }: { label: string; onPress: () => void; disabled?: boolean; loading?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled || loading}
      style={({ pressed }) => ({
        backgroundColor: disabled ? '#1a1a1a' : ACCENT,
        borderRadius: 12, paddingVertical: 15, alignItems: 'center',
        marginTop: 4, opacity: pressed ? 0.85 : 1,
      })}>
      {loading ? <ActivityIndicator color="white" /> : <Text style={{ color: disabled ? MUTED : 'white', fontWeight: '600', fontSize: 15 }}>{label}</Text>}
    </Pressable>
  );
}

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const { user } = useUser();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');
  const [phase, setPhase] = useState<Phase>('register');
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((p) => (p <= 1 ? (clearInterval(timer), 0) : p - 1)), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const wrap = async (fn: () => Promise<void>) => {
    if (!isLoaded || loading) return;
    setLoading(true); setError('');
    try { await fn(); } catch (e: unknown) { setError(getAuthErrorMessage(e)); } finally { setLoading(false); }
  };

  const onSignUp = () => wrap(async () => {
    const result = await signUp!.create({ emailAddress: email, password });
    if (result.status === 'missing_requirements') {
      const missing = signUp!.missingFields ?? [];
      const nonVerif = missing.filter((f) => f !== 'email_address' && !f.includes('verification'));
      if (nonVerif.length > 0) { setMissingFields(nonVerif); setPhase('custom-fields'); }
      else { await signUp!.prepareEmailAddressVerification({ strategy: 'email_code' }); setPhase('verify'); }
    } else if (result.status === 'complete') {
      await setActive({ session: result.createdSessionId }); router.replace('/');
    } else {
      await signUp!.prepareEmailAddressVerification({ strategy: 'email_code' }); setPhase('verify');
    }
  });

  const onCustomFields = () => wrap(async () => {
    await signUp!.update({ username: username || undefined });
    await signUp!.prepareEmailAddressVerification({ strategy: 'email_code' });
    setPhase('verify');
  });

  const onVerify = () => wrap(async () => {
    const attempt = await signUp!.attemptEmailAddressVerification({ code });
    if (attempt.status === 'complete') {
      await setActive({ session: attempt.createdSessionId });
      isPasskeySupported() ? setPhase('passkey-prompt') : router.replace('/');
    } else { setError(`Verification incomplete: ${attempt.status}`); }
  });

  const onResend = async () => {
    if (!isLoaded || resendCooldown > 0) return;
    try { await signUp!.prepareEmailAddressVerification({ strategy: 'email_code' }); setResendCooldown(60); }
    catch (e: unknown) { setError(getAuthErrorMessage(e)); }
  };

  const onPasskey = async () => {
    try { await user?.createPasskey(); } catch { /* optional */ }
    router.replace('/');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 28 }}>

          {phase === 'register' && (
            <>
              <View style={{ marginBottom: 36 }}>
                <Text style={{ color: TEXT, fontSize: 30, fontWeight: '700', marginBottom: 6 }}>Create account.</Text>
                <Text style={{ color: MUTED, fontSize: 14 }}>Start earning by annotating AI data.</Text>
              </View>
              {error ? <View style={{ backgroundColor: ERROR_BG, borderWidth: 1, borderColor: '#3f1515', borderRadius: 10, padding: 12, marginBottom: 16 }}>
                <Text style={{ color: ERROR_TEXT, fontSize: 13 }}>{error}</Text></View> : null}
              <StyledInput value={email} onChange={setEmail} placeholder="Email address" keyboardType="email-address" autoComplete="email" />
              <StyledInput value={password} onChange={setPassword} placeholder="Password" secureTextEntry autoComplete="new-password" />
              <PrimaryBtn label="Create account" onPress={onSignUp} disabled={!email || !password || !isLoaded} loading={loading} />
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 32, gap: 4 }}>
                <Text style={{ color: MUTED, fontSize: 13 }}>Already have an account?</Text>
                <Link href="/(auth)/sign-in" asChild>
                  <Pressable><Text style={{ color: ACCENT, fontSize: 13, fontWeight: '600' }}>Sign in</Text></Pressable>
                </Link>
              </View>
            </>
          )}

          {phase === 'custom-fields' && (
            <>
              <Text style={{ color: TEXT, fontSize: 26, fontWeight: '700', marginBottom: 8 }}>One more thing</Text>
              <Text style={{ color: MUTED, fontSize: 14, marginBottom: 28 }}>Fill in the required fields to continue.</Text>
              {error ? <View style={{ backgroundColor: ERROR_BG, borderWidth: 1, borderColor: '#3f1515', borderRadius: 10, padding: 12, marginBottom: 16 }}>
                <Text style={{ color: ERROR_TEXT, fontSize: 13 }}>{error}</Text></View> : null}
              {missingFields.includes('username') && (
                <StyledInput value={username} onChange={setUsername} placeholder="Username" autoCapitalize="none" />
              )}
              <PrimaryBtn label="Continue" onPress={onCustomFields} disabled={!isLoaded} loading={loading} />
            </>
          )}

          {phase === 'verify' && (
            <>
              <Text style={{ color: TEXT, fontSize: 26, fontWeight: '700', marginBottom: 8 }}>Check your email</Text>
              <Text style={{ color: MUTED, fontSize: 14, marginBottom: 28 }}>
                We sent a 6-digit code to{' '}
                <Text style={{ color: TEXT }}>{email}</Text>
              </Text>
              {error ? <View style={{ backgroundColor: ERROR_BG, borderWidth: 1, borderColor: '#3f1515', borderRadius: 10, padding: 12, marginBottom: 16 }}>
                <Text style={{ color: ERROR_TEXT, fontSize: 13 }}>{error}</Text></View> : null}
              <StyledInput value={code} onChange={setCode} placeholder="000000" keyboardType="number-pad" autoComplete="one-time-code" large />
              <PrimaryBtn label="Verify" onPress={onVerify} disabled={code.length < 6} loading={loading} />
              <Pressable onPress={onResend} disabled={resendCooldown > 0} style={{ marginTop: 18, alignItems: 'center' }}>
                <Text style={{ color: resendCooldown > 0 ? MUTED : ACCENT, fontSize: 13 }}>
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                </Text>
              </Pressable>
            </>
          )}

          {phase === 'passkey-prompt' && (
            <>
              <View style={{ alignItems: 'center', marginBottom: 36 }}>
                <Text style={{ fontSize: 48, marginBottom: 20 }}>🔑</Text>
                <Text style={{ color: TEXT, fontSize: 26, fontWeight: '700', marginBottom: 10, textAlign: 'center' }}>Enable passkey</Text>
                <Text style={{ color: MUTED, fontSize: 14, textAlign: 'center', lineHeight: 22 }}>
                  Sign in faster next time using your fingerprint or Face ID — no password needed.
                </Text>
              </View>
              <PrimaryBtn label="Enable passkey" onPress={onPasskey} />
              <Pressable onPress={() => router.replace('/')} style={{ marginTop: 18, alignItems: 'center' }}>
                <Text style={{ color: MUTED, fontSize: 13 }}>Skip for now</Text>
              </Pressable>
            </>
          )}

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
