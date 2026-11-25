import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, AppState, LayoutAnimation, Modal, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PermissionService as service, permissionStatus, reelApps, type AccessSnapshot, type PermissionKey } from '../../services/PermissionService';
import { Typography, type ThemeColors } from '../../theme/tokens';
import { permissions } from './content';
import { GuideVideo, type GuideHandle } from './GuideVideo';
import { useMotion } from '../hooks/useMotion';

type Props = { theme: ThemeColors };
const glyph = (name: string, color: string, size = 22) => <Ionicons name={name as React.ComponentProps<typeof Ionicons>['name']} color={color} size={size} accessible={false} />;

function Action({ theme, label, onPress, secondary = false, disabled = false, busy = false }: Props & { label: string; onPress: () => void; secondary?: boolean; disabled?: boolean; busy?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: disabled || busy }} disabled={disabled || busy} onPress={onPress}
    style={({ pressed }) => [s.button, { backgroundColor: secondary ? theme.surface2 : theme.accent, opacity: disabled || busy ? 0.5 : pressed ? 0.8 : 1 }]}>
    <Text style={[s.buttonText, { color: secondary ? theme.textPrimary : theme.bg }]}>{label}</Text>
  </Pressable>;
}

export function PermissionSetup({ theme }: Props) {
  const [snapshot, setSnapshot] = useState<AccessSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [guide, setGuide] = useState<PermissionKey | null>(null);
  const [why, setWhy] = useState<PermissionKey | null>(null);
  const [extras, setExtras] = useState(false);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [agreed, setAgreed] = useState(false);
  const [floating, setFloating] = useState(false);
  const motion = useMotion();
  const player = useRef<GuideHandle>(null);
  const pending = useRef<PermissionKey | null>(null);
  const left = useRef(false);
  const mounted = useRef(true);
  const refresh = useCallback(async () => {
    try {
      const next = await service.snapshot();
      if (mounted.current) { setSnapshot(next); setError((current) => current === 'Access couldn’t be checked. Tap Refresh to try again.' ? '' : current); }
      return next;
    } catch {
      if (mounted.current) { setSnapshot(null); setError('Access couldn’t be checked. Tap Refresh to try again.'); }
      return null;
    } finally { if (mounted.current) setLoading(false); }
  }, []);
  useEffect(() => {
    mounted.current = true;
    void Promise.resolve().then(refresh);
    const listener = AppState.addEventListener('change', (state) => {
      if (state !== 'active') { left.current = true; return; }
      const returned = left.current; left.current = false;
      void (async () => {
        const next = await refresh();
        if (!returned || !pending.current || !mounted.current) return;
        const key = pending.current; pending.current = null;
        await player.current?.stop().catch(() => undefined);
        if (!mounted.current) return;
        setGuide(null);
        if (key === 'popup' || key === 'autostart' || (key === 'battery' && next?.xiaomi)) {
          Alert.alert('Did you change this setting?', 'Xiaomi does not expose a reliable check. Your confirmation will be labelled “Confirmed by you”.', [
            { text: 'Not enabled', style: 'cancel', onPress: () => { void service.confirm(key, false).then(refresh).catch(() => setError('Your confirmation couldn’t be saved.')); } },
            { text: 'Yes, I enabled it', onPress: () => { void (async () => {
              try {
                if (!await service.confirm(key, true)) throw new Error();
                await refresh();
              } catch { setError('Your confirmation couldn’t be saved. Please try again.'); }
            })(); } },
          ]);
        } else if (next && permissionStatus(key, next) === 'off') {
          setError('Access is still off. You can try again or continue without it.');
        }
      })();
    });
    const poll = setInterval(() => { if (AppState.currentState === 'active') void refresh(); }, 4000);
    return () => { mounted.current = false; listener.remove(); clearInterval(poll); };
  }, [refresh]);

  const change = async (action: () => Promise<boolean>) => {
    setBusy(true); setError('');
    try { if (!await action()) throw new Error(); await refresh(); }
    catch { setError('Your choice couldn’t be saved. Please try again.'); }
    finally { setBusy(false); }
  };
  const showGuide = (key: PermissionKey) => {
    setSelected(snapshot?.apps ?? []); setAgreed(false); setFloating(false); setError(''); setGuide(key);
  };
  const open = async () => {
    if (!guide || busy) return;
    setBusy(true); setError('');
    try {
      if (guide === 'accessibility') {
        if (!agreed || selected.length === 0 || !await service.configure(selected, true)) throw new Error('Choose apps and accept the disclosure first.');
      }
      if (floating && guide !== 'accessibility') {
        try { await player.current?.float(); }
        catch { /* Written instructions remain available; unsupported PiP must not block settings. */ }
      }
      pending.current = guide;
      if (!await service.open(guide)) { pending.current = null; throw new Error('Settings couldn’t open. Try Settings → Apps → BrainSpace.'); }
    } catch (e) { setError(e instanceof Error ? e.message : 'Settings couldn’t open. Please try again.'); }
    finally { setBusy(false); }
  };
  const text = (value: string, secondary = false, style?: object) => <Text style={[s.body, { color: secondary ? theme.textSecondary : theme.textPrimary }, style]}>{value}</Text>;
  const row = (key: PermissionKey) => {
    const p = permissions[key], status = permissionStatus(key, snapshot), done = status !== 'off';
    return <View key={key} style={[s.row, { backgroundColor: theme.surface }]}>
      <View style={[s.rowIcon, { backgroundColor: theme.surface2 }]}>{glyph(done ? 'checkmark' : p.icon, done ? theme.accent : theme.textSecondary)}</View>
      <View style={{ flex: 1 }}>
        <Text style={[s.rowTitle, { color: theme.textPrimary }]}>{p.title}</Text>
        {text(done ? status === 'confirmed' ? 'Confirmed by you · tap to review' : 'Allowed by Android' : p.detail, true, { fontSize: 12, lineHeight: 18 })}
        <Pressable accessibilityRole="button" accessibilityLabel={`Why ${p.title.toLowerCase()}?`} onPress={() => setWhy(key)} style={{ paddingTop: 5, paddingBottom: 4 }}>
          <Text style={[s.whyLink, { color: theme.textSecondary }]}>Why this access?</Text>
        </Pressable>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={`${done ? 'Review' : 'Set up'} ${p.title.toLowerCase()}`} onPress={() => showGuide(key)}
        style={[s.allow, { backgroundColor: done ? theme.surface2 : theme.accent }]}>
        <Text style={[s.allowText, { color: done ? theme.textPrimary : theme.bg }]}>{done ? 'Review' : 'Set up'}</Text>
      </Pressable>
    </View>;
  };
  return <View>
    <Text accessibilityRole="header" style={[s.title, { color: theme.textPrimary }]}>Your phone time.{"\n"}A clearer picture.</Text>
    {text('Connect what helps. Every permission is optional, and you can change your mind anytime.', true, { textAlign: 'center', marginBottom: 24 })}
    {loading ? <ActivityIndicator color={theme.accent} /> : !snapshot ? text(Platform.OS === 'android' ? 'This build does not include Android tracking yet. Install the latest BrainSpace build to connect access.' : 'Phone and reel tracking is currently available on Android. Focus and habit tools are ready here.', true) : <>
      {row('usage')}
      {row('overlay')}
      {row('accessibility')}
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: extras }} onPress={() => { if (motion) LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setExtras(!extras); }} style={s.extras}>
        {glyph('options-outline', theme.textSecondary, 18)}
        <Text style={[s.rowTitle, { flex: 1, color: theme.textSecondary }]}>{snapshot.xiaomi ? 'Xiaomi / Redmi setup help' : 'If counting gets interrupted'}</Text>
        {glyph(extras ? 'chevron-up' : 'chevron-down', theme.textSecondary, 17)}
      </Pressable>
      {extras && <>
        {text('Try counting first. These settings are optional and may use more battery.', true, { marginBottom: 14, fontSize: 12 })}
        {snapshot.xiaomi && row('popup')}
        {row('battery')}
        {snapshot.xiaomi && row('autostart')}
      </>}
      {snapshot.overlay && <View style={s.switchRow}>
        <View style={{ flex: 1 }}>{text('Show the floating counter')}{text('Only over supported feeds. Tap it to hide.', true, { fontSize: 12 })}</View>
        <Switch accessibilityLabel="Show the floating reel counter" value={snapshot.showCounter} disabled={busy}
          onValueChange={(value) => { void change(() => service.counter(value)); }} trackColor={{ true: theme.accent, false: theme.surface2 }} />
      </View>}
      {(snapshot.consent || snapshot.updated > 0) && <View style={[s.controls, { backgroundColor: theme.surface }]}>
        {text(!snapshot.consent ? 'Reel estimates are off' : snapshot.paused ? 'Reel estimates paused' : snapshot.accessibility && snapshot.connected ? 'Reel estimator connected' : 'Waiting for Accessibility access', false, { fontFamily: Typography.semiBold })}
        {text(`Saved estimates today: ${snapshot.instagram + snapshot.youtube}. Only recognised feed visits and page changes while enabled count. May miss or misclassify some activity.`, true, { fontSize: 12, marginTop: 5 })}
        {snapshot.consent && <Action theme={theme} busy={busy} secondary label={snapshot.paused ? 'Resume counting' : 'Pause counting'} onPress={() => { void change(() => service.pause(!snapshot.paused)); }} />}
        <View style={s.links}>
          <Pressable accessibilityRole="button" disabled={busy} onPress={() => Alert.alert('Erase reel counts?', 'Deletes all locally saved reel counts. Your access choices are kept.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Erase counts', style: 'destructive', onPress: () => { void change(service.erase); } }])}>{text('Erase counts', true, s.link)}</Pressable>
          {snapshot.consent && <Pressable accessibilityRole="button" disabled={busy} onPress={() => { void change(() => service.configure([], false)); }}>{text('Withdraw consent', true, s.link)}</Pressable>}
        </View>
      </View>}
      {text('Your answers stay separate from device access. Focus and habit tools work without any of these permissions.', true, { fontSize: 12, marginTop: 16 })}
    </>}
    {!!error && <Text accessibilityRole="alert" style={[s.body, { color: theme.warning, marginTop: 12 }]}>{error}</Text>}
    <Pressable accessibilityRole="button" onPress={() => { void refresh(); }} style={{ alignSelf: 'center', padding: 14 }}>{text('Refresh access', true, s.link)}</Pressable>

    <Modal visible={!!guide || !!why} transparent animationType={motion ? 'slide' : 'none'} onRequestClose={() => { if (!busy) { setGuide(null); setWhy(null); } }}>
      <View style={s.scrim}>
        <SafeAreaView edges={['bottom', 'top']} style={[s.sheet, { backgroundColor: theme.bg }]}>
          <View style={s.sheetHeader}>
            <Text style={[s.rowTitle, { color: theme.accent }]}>{guide ? 'A little guidance' : 'You’re in control'}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Close permission guide" disabled={busy} onPress={() => { setGuide(null); setWhy(null); }} style={{ padding: 10 }}>{glyph('close', theme.textPrimary)}</Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
            {(guide || why) && <>
              <Text accessibilityRole="header" style={[s.sheetTitle, { color: theme.textPrimary }]}>{permissions[(guide || why)!].title}</Text>
              {guide && <GuideVideo key={guide} ref={player} permission={guide} />}
              {guide && permissions[guide].steps.map((step, index) => <View key={step} style={s.step}>
                <View style={[s.number, { backgroundColor: theme.surface2 }]}><Text style={[s.rowTitle, { color: theme.accent }]}>{index + 1}</Text></View>
                {text(step, false, { flex: 1 })}
              </View>)}
              {text(permissions[(guide || why)!].why, true, { marginVertical: 14 })}
              {guide === 'accessibility' && <>
                <Text style={[s.rowTitle, { color: theme.textPrimary, marginBottom: 8 }]}>Choose apps to estimate</Text>
                {reelApps.map((app) => <Pressable key={app.packageName} accessibilityRole="checkbox" accessibilityState={{ checked: selected.includes(app.packageName) }}
                  onPress={() => setSelected((current) => current.includes(app.packageName) ? current.filter((id) => id !== app.packageName) : [...current, app.packageName])} style={[s.choice, { backgroundColor: theme.surface }]}>
                  {glyph(selected.includes(app.packageName) ? 'checkbox' : 'square-outline', theme.accent)}{text(app.name)}
                </Pressable>)}
                <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: agreed }} onPress={() => setAgreed(!agreed)} style={s.choice}>
                  {glyph(agreed ? 'checkbox' : 'square-outline', theme.accent)}
                  {text('I understand and agree to this on-device Accessibility use for my selected apps.', false, { flex: 1 })}
                </Pressable>
              </>}
              {guide && guide !== 'accessibility' && <View style={s.switchRow}>
                {text('Keep the video guide in a floating window', true, { flex: 1, fontSize: 12 })}
                <Switch accessibilityLabel="Float video guide over settings" value={floating} onValueChange={setFloating} trackColor={{ true: theme.accent, false: theme.surface2 }} />
              </View>}
              {!!error && <Text accessibilityRole="alert" style={[s.body, { color: theme.warning }]}>{error}</Text>}
            </>}
          </ScrollView>
          {guide ? <Action theme={theme} busy={busy} label={busy ? 'Opening settings…' : guide === 'accessibility' ? 'Agree & open Android settings' : 'Got it. Open settings'} onPress={() => { void open(); }} disabled={guide === 'accessibility' && (!agreed || selected.length === 0)} /> : <Action theme={theme} label="Got it" onPress={() => setWhy(null)} />}
          <Text style={[s.fine, { color: theme.textSecondary }]}>You make every change in Android. Menus may vary.</Text>
        </SafeAreaView>
      </View>
    </Modal>
  </View>;
}

export function PermissionSettingsButton({ theme }: Props) {
  const [open, setOpen] = useState(false);
  return <>
    <Pressable accessibilityRole="button" onPress={() => setOpen(true)} style={[s.settingsEntry, { backgroundColor: theme.surface }]}>
      {glyph('shield-checkmark-outline', theme.accent)}
      <View style={{ flex: 1 }}><Text style={[s.rowTitle, { color: theme.textPrimary }]}>Device access & reel estimates</Text><Text style={[s.body, { color: theme.textSecondary, fontSize: 12 }]}>Guides, selected apps, pause and privacy.</Text></View>
      {glyph('chevron-forward', theme.textSecondary, 18)}
    </Pressable>
    <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
        <Pressable accessibilityLabel="Close device access" accessibilityRole="button" onPress={() => setOpen(false)} style={{ alignSelf: 'flex-end', padding: 20 }}>{glyph('close', theme.textPrimary)}</Pressable>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 30 }}><PermissionSetup theme={theme} /></ScrollView>
      </SafeAreaView>
    </Modal>
  </>;
}

const s = StyleSheet.create({
  title: { fontFamily: Typography.bold, fontSize: 28, lineHeight: 35, textAlign: 'center', marginBottom: 12 },
  body: { fontFamily: Typography.regular, fontSize: 13, lineHeight: 21 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 13, borderRadius: 8, gap: 11, marginBottom: 10 },
  rowIcon: { width: 36, height: 36, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontFamily: Typography.semiBold, fontSize: 13, lineHeight: 20 },
  allow: { borderRadius: 30, paddingHorizontal: 13, paddingVertical: 9 },
  allowText: { fontFamily: Typography.bold, fontSize: 11 },
  whyLink: { fontFamily: Typography.regular, fontSize: 11, textDecorationLine: 'underline' },
  extras: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 17 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 14 },
  controls: { padding: 16, borderRadius: 8, marginTop: 12 },
  links: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  link: { textDecorationLine: 'underline', paddingVertical: 12, fontSize: 12 },
  button: { minHeight: 50, borderRadius: 40, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, marginTop: 12 },
  buttonText: { fontFamily: Typography.bold, fontSize: 14, textAlign: 'center' },
  scrim: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.65)' },
  sheet: { maxHeight: '94%', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 22, paddingBottom: 8 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6 },
  sheetTitle: { fontFamily: Typography.bold, fontSize: 24, lineHeight: 31, marginTop: 5, marginBottom: 18 },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginTop: 14 },
  number: { width: 27, height: 27, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  choice: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 6, marginBottom: 8 },
  fine: { textAlign: 'center', fontFamily: Typography.regular, fontSize: 10, paddingTop: 10, paddingBottom: 6 },
  settingsEntry: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 18, borderRadius: 8, marginBottom: 18 },
});
