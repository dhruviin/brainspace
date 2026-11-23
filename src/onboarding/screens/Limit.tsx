import React, { useState } from 'react';
import { Text, ScrollView, View, useWindowDimensions } from 'react-native';
import { MascotBubble } from '../components/Controls';
import { WheelPicker } from '../components/WheelPicker';
import { ParticleField } from '../components/ParticleField';
import { Footer, styles } from '../components/Stage';
import { useStory } from '../store/story';
import { projection } from '../store/model';
import { shape } from '../shapes';
import { copy } from '../strings';
import { face, ink } from '../theme';
export function Limit() {
  const { answers, limit, setLimit, next } = useStory(),
    baseline = projection(answers, limit),
    width = Math.min(useWindowDimensions().width - 48, 326);
  const [value, setValue] = useState(baseline.limit),
    p = projection(answers, value);
  const change = (n: number) => {
    setValue(n);
    setLimit(n);
  };
  return (
    <>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 23,
          paddingTop: 17,
          paddingBottom: 8,
          flexGrow: 1,
        }}
      >
        <MascotBubble text={copy.target} expression="tired" />
        <View
          accessible
          accessibilityLabel={copy.chartLabel}
          style={{
            width,
            alignSelf: 'center',
            backgroundColor: ink.surface,
            borderRadius: 21,
            padding: 13,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
            <Text style={[styles.note, { color: ink.dangerText }]}>
              {copy.today(p.daily)}
            </Text>
            <Text style={[styles.note, { color: ink.accent }]}>
              {copy.goal(p.limit)}
            </Text>
          </View>
          <View
            style={{
              height: width * 0.42,
              overflow: 'hidden',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ParticleField
              size={width - 32}
              particleCount={600}
              targetShape={shape('chart', p.limit / p.daily)}
              mode="morph"
            />
          </View>
        </View>
        <View style={{ flex: 1, minHeight: 152, justifyContent: 'center' }}>
          <WheelPicker
            value={value}
            max={p.daily}
            onChange={change}
            label={copy.limitLabel}
          />
        </View>
        <Text
          style={{
            color: ink.accent,
            textAlign: 'center',
            fontFamily: face.semiBold,
            fontSize: 15,
            marginVertical: 10,
          }}
        >
          {copy.saving(p.saved)}
        </Text>
      </ScrollView>
      <Footer
        onPress={() => {
          if (limit === null) setLimit(value);
          next();
        }}
      />
    </>
  );
}
