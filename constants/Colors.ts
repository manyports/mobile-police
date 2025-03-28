/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0066FF';
const tintColorDark = '#4D9AFF';

export const Colors = {
  light: {
    text: '#000000',
    background: '#FFFFFF',
    tint: tintColorLight,
    tabIconDefault: '#999999',
    tabIconSelected: tintColorLight,
    cardBg: '#FFFFFF',
    subtleBg: '#F5F5F5',
    border: '#EEEEEE',
    muted: '#757575',
    success: '#00A86B',
    warning: '#FF9900',
    danger: '#FF3B30',
  },
  dark: {
    text: '#F5F5F5',
    background: '#111111',
    tint: tintColorDark,
    tabIconDefault: '#777777',
    tabIconSelected: tintColorDark,
    cardBg: '#222222',
    subtleBg: '#1A1A1A',
    border: '#333333',
    muted: '#AAAAAA',
    success: '#00A86B',
    warning: '#FF9900',
    danger: '#FF3B30',
  },
};
