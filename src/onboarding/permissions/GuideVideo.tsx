import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { requireOptionalNativeModule } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import type { VideoView } from 'expo-video';
import type { PermissionKey } from '../../services/PermissionService';
import { useMotion } from '../hooks/useMotion';

// An older native build still shows the written guide instead of crashing on import.
// Optional native loading is required for existing installed builds.
/* eslint-disable @typescript-eslint/no-require-imports */
const video = requireOptionalNativeModule('ExpoVideo')
  ? require('expo-video') as typeof import('expo-video') : null;
/* eslint-enable @typescript-eslint/no-require-imports */
const sources = {
  usage: require('../../../assets/permissions/usage.mp4'),
  overlay: require('../../../assets/permissions/overlay.mp4'),
  popup: require('../../../assets/permissions/popup.mp4'),
  battery: require('../../../assets/permissions/battery.mp4'),
  autostart: require('../../../assets/permissions/autostart.mp4'),
  accessibility: require('../../../assets/permissions/accessibility.mp4'),
};
export type GuideHandle = { float: () => Promise<void>; stop: () => Promise<void> };
export const GuideVideo = forwardRef<GuideHandle, { permission: PermissionKey }>(function GuideVideo(props, ref) {
  if (!video) return <Text style={s.caption}>Follow the steps below. Video guides need the latest app build.</Text>;
  return <Player {...props} ref={ref} />;
});
const Player = forwardRef<GuideHandle, { permission: PermissionKey }>(function Player({ permission }, ref) {
  const { useVideoPlayer, VideoView: Surface, isPictureInPictureSupported } = video!;
  const motion = useMotion();
  const player = useVideoPlayer(sources[permission], (p) => {
    p.loop = true; p.muted = true; p.audioMixingMode = 'mixWithOthers';
    if (motion) p.play();
  });
  const view = useRef<VideoView>(null);
  const [playing, setPlaying] = useState(motion);
  const [failed, setFailed] = useState(false);
  React.useEffect(() => {
    const status = player.addListener('statusChange', ({ status }) => setFailed(status === 'error'));
    const activity = player.addListener('playingChange', ({ isPlaying }) => setPlaying(isPlaying));
    return () => { status.remove(); activity.remove(); };
  }, [player]);
  useImperativeHandle(ref, () => ({
    float: async () => {
      if (!isPictureInPictureSupported()) throw new Error('Floating video is unavailable on this device.');
      player.play(); await view.current?.startPictureInPicture();
    },
    stop: async () => { await view.current?.stopPictureInPicture(); },
  }), [player, isPictureInPictureSupported]);
  return <View>
    <View style={s.frame}>
      <Surface ref={view} player={player} style={s.video} contentFit="contain" nativeControls={false}
        allowsPictureInPicture={permission !== 'accessibility'} startsPictureInPictureAutomatically={false} />
      {failed && <Text accessibilityRole="alert" style={s.caption}>Video couldn’t play. Follow the steps below.</Text>}
    </View>
    <Pressable accessibilityRole="button" onPress={() => playing ? player.pause() : player.play()} style={s.control}>
      <Ionicons name={playing ? 'pause' : 'play'} size={14} color="#1DB954" />
      <Text style={s.caption}>{playing ? 'Pause guide' : 'Play guide'} · 9 seconds · no sound</Text>
    </Pressable>
  </View>;
});
const s = StyleSheet.create({
  frame: { borderRadius: 10, overflow: 'hidden', backgroundColor: '#121212' },
  video: { width: '100%', aspectRatio: 16 / 9 },
  control: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, padding: 10 },
  caption: { fontSize: 12, color: '#B3B3B3', textAlign: 'center' },
});
