import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  // mode: 'adaptive',
  colors: {
    ...DefaultTheme.colors,
    elevation: {
      level0: 'transparent',
      level1: 'transparent',
      level2: 'transparent',
      level3: 'transparent',
      level4: 'transparent',
      level5: 'transparent',
    },
    primary: '#5d16ceff',
    primaryGlass: '#5d16ce6c',
    secondary: '#1c7ea5ff',
    background: '#9d7ecfff',
    lightGray: "#6a6472ff",
    darkGray: "#2a282eff",
    surface: '#f6f6f6',
    error: '#B00020',
    text: '#f1e5e5ff',
    onSurface: '#000000',
    disabled: '#f0f0f0',
    placeholder: '#a0a0a0',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    transparent: "#ffffff02",
    translucent: "#af16ce25",
    darkGlass: "#20202091",
    success: "#10a81dff"
  },
};