import { useMutation, useQuery } from 'convex/react';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api } from '@/convex/_generated/api';
import { useAppStore } from '@/store/useAppStore';

const BG = '#0a0a0a';
const SURFACE = '#111111';
const BORDER = '#1f1f1f';
const ACCENT = '#6366f1';
const ACCENT2 = '#a78bfa';
const TEXT = '#f5f5f5';
const MUTED = '#555558';

function StatCard({ label, value, color, icon }: { label: string; value: string | number; color: string; icon: string }) {
  return (
    <View style={{
      flex: 1, backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER,
      borderRadius: 16, padding: 16,
    }}>
      <Text style={{ fontSize: 20, marginBottom: 8 }}>{icon}</Text>
      <Text style={{ color: MUTED, fontSize: 10, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 }}>
        {label}
      </Text>
      <Text style={{ color, fontSize: 22, fontWeight: '700' }}>{value}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const getOrCreateUser = useMutation(api.users.getOrCreateUser);
  const leaderboard = useQuery(api.tasks.getLeaderboard);
  const tasks = useQuery(api.tasks.getPendingTasks);
  const { syncFromServer } = useAppStore();

  useEffect(() => { getOrCreateUser(); }, []);
  useEffect(() => {
    if (currentUser) syncFromServer(currentUser.total_xp, currentUser.current_streak);
  }, [currentUser]);

  const xp = currentUser?.total_xp ?? 0;
  const streak = currentUser?.current_streak ?? 0;
  const accuracy = currentUser?.accuracy_score ?? 100;
  const level = Math.floor(xp / 100) + 1;
  const xpIntoLevel = xp % 100;
  const availableTasks = tasks?.length ?? 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 12 }}>
          <Text style={{ color: MUTED, fontSize: 13, marginBottom: 2 }}>Good to see you</Text>
          <Text style={{ color: TEXT, fontSize: 26, fontWeight: '700' }}>
            {currentUser?.name ?? 'Annotator'}
          </Text>
        </View>

        {/* Level + XP bar */}
        <View style={{ marginHorizontal: 24, marginBottom: 20, backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER, borderRadius: 16, padding: 18 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <View>
              <Text style={{ color: MUTED, fontSize: 10, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 }}>
                Level
              </Text>
              <Text style={{ color: ACCENT2, fontSize: 32, fontWeight: '800' }}>{level}</Text>
            </View>
            <Text style={{ color: MUTED, fontSize: 12 }}>
              {xpIntoLevel} <Text style={{ color: TEXT }}>/ 100 XP</Text>
            </Text>
          </View>
          <View style={{ height: 4, backgroundColor: BORDER, borderRadius: 4 }}>
            <View style={{ height: 4, width: `${xpIntoLevel}%`, backgroundColor: ACCENT, borderRadius: 4 }} />
          </View>
          <Text style={{ color: MUTED, fontSize: 11, marginTop: 6 }}>
            {100 - xpIntoLevel} XP to level {level + 1}
          </Text>
        </View>

        {/* Stats row */}
        <View style={{ flexDirection: 'row', gap: 10, marginHorizontal: 24, marginBottom: 20 }}>
          <StatCard label="Total XP" value={xp} color={ACCENT2} icon="⚡" />
          <StatCard label="Streak" value={`${streak}d`} color="#f97316" icon="🔥" />
          <StatCard label="Accuracy" value={`${accuracy}%`} color="#34d399" icon="🎯" />
        </View>

        {/* CTA */}
        <View style={{ marginHorizontal: 24, marginBottom: 24 }}>
          <Pressable
            onPress={() => router.push('/(tabs)/arena')}
            disabled={availableTasks === 0}
            style={({ pressed }) => ({
              backgroundColor: availableTasks > 0 ? ACCENT : '#1a1a1a',
              borderRadius: 16, paddingVertical: 18, alignItems: 'center',
              opacity: pressed ? 0.88 : 1,
              borderWidth: availableTasks === 0 ? 1 : 0,
              borderColor: BORDER,
            })}
          >
            <Text style={{ color: availableTasks > 0 ? 'white' : MUTED, fontWeight: '700', fontSize: 16 }}>
              {availableTasks > 0 ? 'Start annotating' : 'No tasks right now'}
            </Text>
            {availableTasks > 0 && (
              <Text style={{ color: `${ACCENT2}cc`, fontSize: 12, marginTop: 3 }}>
                {availableTasks} task{availableTasks !== 1 ? 's' : ''} available
              </Text>
            )}
          </Pressable>
        </View>

        {/* Leaderboard */}
        <View style={{ marginHorizontal: 24 }}>
          <Text style={{ color: TEXT, fontSize: 16, fontWeight: '600', marginBottom: 12 }}>Leaderboard</Text>
          <View style={{ backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER, borderRadius: 16, overflow: 'hidden' }}>
            {leaderboard === undefined ? (
              <View style={{ padding: 20 }}>
                <Text style={{ color: MUTED, fontSize: 13 }}>Loading…</Text>
              </View>
            ) : leaderboard.length === 0 ? (
              <View style={{ padding: 20 }}>
                <Text style={{ color: MUTED, fontSize: 13 }}>No rankings yet. Be first!</Text>
              </View>
            ) : (
              leaderboard.slice(0, 5).map((entry, i) => (
                <View
                  key={entry.rank}
                  style={{
                    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14,
                    borderBottomWidth: i < 4 ? 1 : 0, borderColor: BORDER,
                  }}
                >
                  <Text style={{
                    color: entry.rank <= 3 ? ['#f59e0b', '#94a3b8', '#b45309'][entry.rank - 1] : MUTED,
                    fontWeight: '700', fontSize: 12, width: 28,
                  }}>
                    #{entry.rank}
                  </Text>
                  <Text style={{ color: TEXT, fontWeight: '500', fontSize: 14, flex: 1 }}>
                    {entry.name}
                  </Text>
                  <Text style={{ color: ACCENT2, fontWeight: '600', fontSize: 13 }}>
                    {entry.total_xp} XP
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
