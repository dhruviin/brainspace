import React from 'react';
import { Playground } from './Playground';
import { useStory } from '../store/story';
export default function Onboarding() {
  return <Playground jump={useStory((s) => s.go)} />;
}
