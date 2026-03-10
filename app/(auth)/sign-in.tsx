import { useSignIn } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
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

type Phase = 'credentials' | 'first-factor' | 'second-factor' | 'forgot-password' | 'reset-code';

function StyledInput({
  value, onChange, placeholder, secureTextEntry, keyboardType, autoComplete, autoCapitalize,
}: {
  value: string; onChange: (v: string) => void; placeholder: string;
  secureTextEntry?: boolean; keyboardType?: any; autoComplete?: any; autoCapitalize?: any;
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
        backgroundColor: SURFACE, borderWidth: 1,
        borderColor: focused ? ACCENT : BORDER,
        borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
        color: TEXT, fontSize: 15, marginBottom: 12,
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
      {loading
        ? <ActivityIndicator color="white" />
        : <Text style={{ color: disabled ? MUTED : 'white', fontWeight: '600', fontSize: 15 }}>{label}</Text>}
    </Pressable>
  );
}

function GhostBtn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ marginTop: 18, alignItems: 'center' }}>
      <Text style={{ color: MUTED, fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

function ErrorBanner({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <View style={{ backgroundColor: ERROR_BG, borderWidth: 1, borderColor: '#3f1515', borderRadius: 10, padding: 12, marginBottom: 16 }}>
      <Text style={{ color: ERROR_TEXT, fontSize: 13 }}>{msg}</Text>
    </View>
  );
}

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<Phase>('credentials');
  const [error, setError] = useState('');

  const handleResult = async (attempt: any) => {
    switch (attempt.status) {
      case 'complete':
        await setActive({ session: attempt.createdSessionId });
        router.replace('/');
        break;
      case 'needs_first_factor': setMfaCode(''); setPhase('first-factor'); break;
      case 'needs_second_factor': setMfaCode(''); setPhase('second-factor'); break;
      default: setError(`Sign in incomplete: ${attempt.status}`);
    }
  };

  const wrap = async (fn: () => Promise<void>) => {
    if (!isLoaded || loading) return;
    setLoading(true); setError('');
    try { await fn(); } catch (e: unknown) { setError(getAuthErrorMessage(e)); } finally { setLoading(false); }
  };

  const onSignIn = () => wrap(async () => handleResult(await signIn!.create({ identifier: email, password })));
  const onFirstFactor = () => wrap(async () => handleResult(await signIn!.attemptFirstFactor({ strategy: 'email_code', code: mfaCode })));
  const onSecondFactor = () => wrap(async () => handleResult(await signIn!.attemptSecondFactor({ strategy: 'totp', code: mfaCode })));
  const onForgotPassword = () => wrap(async () => {
    if (!email) { setError('Enter your email above first.'); return; }
    await signIn!.create({ strategy: 'reset_password_email_code', identifier: email });
    setPhase('reset-code');
  });
  const onResetPassword = () => wrap(async () => handleResult(
    await signIn!.attemptFirstFactor({ strategy: 'reset_password_email_code', code: mfaCode, password: newPassword })
  ));
  const onPasskey = () => wrap(async () => handleResult(await signIn!.authenticateWithPasskey()));

  const back = (to: Phase) => () => { setPhase(to); setError(''); setMfaCode(''); setNewPassword(''); };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 28 }}>

          {phase === 'credentials' && (
            <>
              <View style={{ marginBottom: 36 }}>
                <Text style={{ color: TEXT, fontSize: 30, fontWeight: '700', marginBottom: 6 }}>Welcome back.</Text>
                <Text style={{ color: MUTED, fontSize: 14 }}>Sign in to continue.</Text>
              </View>
              <ErrorBanner msg={error} />
              <StyledInput value={email} onChange={setEmail} placeholder="Email address" keyboardType="email-address" autoComplete="email" />
              <StyledInput value={password} onChange={setPassword} placeholder="Password" secureTextEntry autoComplete="current-password" />
              <Pressable onPress={onForgotPassword} style={{ marginBottom: 20 }}>
                <Text style={{ color: ACCENT, fontSize: 13 }}>Forgot password?</Text>
              </Pressable>
              <PrimaryBtn label="Sign in" onPress={onSignIn} disabled={!email || !password || !isLoaded} loading={loading} />
              {isPasskeySupported() && (
                <Pressable onPress={onPasskey} disabled={loading} style={{
                  borderWidth: 1, borderColor: BORDER, borderRadius: 12, paddingVertical: 14,
                  alignItems: 'center', marginTop: 10,
                }}>
                  <Text style={{ color: TEXT, fontWeight: '500', fontSize: 14 }}>Sign in with passkey</Text>
                </Pressable>
              )}
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 32, gap: 4 }}>
                <Text style={{ color: MUTED, fontSize: 13 }}>No account?</Text>
                <Link href="/(auth)/sign-up" asChild>
                  <Pressable><Text style={{ color: ACCENT, fontSize: 13, fontWeight: '600' }}>Sign up</Text></Pressable>
                </Link>
              </View>
            </>
          )}

          {(phase === 'first-factor' || phase === 'second-factor') && (
            <>
              <Text style={{ color: TEXT, fontSize: 26, fontWeight: '700', marginBottom: 8 }}>
                {phase === 'second-factor' ? 'Two-factor auth' : 'Verify your email'}
              </Text>
              <Text style={{ color: MUTED, fontSize: 14, marginBottom: 28 }}>
                {phase === 'second-factor' ? 'Enter the code from your authenticator app.' : 'Enter the code we sent to your email.'}
              </Text>
              <ErrorBanner msg={error} />
              <TextInput value={mfaCode} onChangeText={setMfaCode}
                placeholder="000000" placeholderTextColor="#2a2a2e"
                keyboardType="number-pad" autoComplete="one-time-code"
                style={{ backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 18, color: TEXT, fontSize: 28, textAlign: 'center', letterSpacing: 10, marginBottom: 20 }} />
              <PrimaryBtn label="Verify" onPress={phase === 'second-factor' ? onSecondFactor : onFirstFactor}
                disabled={mfaCode.length < 6} loading={loading} />
              <GhostBtn label="← Back to sign in" onPress={back('credentials')} />
            </>
          )}

          {phase === 'forgot-password' && (
            <>
              <Text style={{ color: TEXT, fontSize: 26, fontWeight: '700', marginBottom: 8 }}>Reset password</Text>
              <Text style={{ color: MUTED, fontSize: 14, marginBottom: 28 }}>Enter your email to receive a reset code.</Text>
              <ErrorBanner msg={error} />
              <StyledInput value={email} onChange={setEmail} placeholder="Email address" keyboardType="email-address" autoComplete="email" />
              <PrimaryBtn label="Send reset code" onPress={onForgotPassword} disabled={!email} loading={loading} />
              <GhostBtn label="← Back to sign in" onPress={back('credentials')} />
            </>
          )}

          {phase === 'reset-code' && (
            <>
              <Text style={{ color: TEXT, fontSize: 26, fontWeight: '700', marginBottom: 8 }}>New password</Text>
              <Text style={{ color: MUTED, fontSize: 14, marginBottom: 28 }}>Enter the code sent to {email} and choose a new password.</Text>
              <ErrorBanner msg={error} />
              <TextInput value={mfaCode} onChangeText={setMfaCode}
                placeholder="Reset code" placeholderTextColor="#2a2a2e"
                keyboardType="number-pad" autoComplete="one-time-code"
                style={{ backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: TEXT, fontSize: 22, textAlign: 'center', letterSpacing: 8, marginBottom: 12 }} />
              <StyledInput value={newPassword} onChange={setNewPassword} placeholder="New password" secureTextEntry autoComplete="new-password" />
              <PrimaryBtn label="Reset password" onPress={onResetPassword} disabled={!mfaCode || !newPassword} loading={loading} />
              <GhostBtn label="← Back to sign in" onPress={back('credentials')} />
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
