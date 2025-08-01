import { TextStyle } from 'react-native';

type FontWeight = '400' | '500' | '600' | '700'; // Adjust based on your font

interface TypographyStyle extends TextStyle {
  fontFamily: string;
  fontWeight?: FontWeight;
  fontSize: number;
  lineHeight: number;
  fontStyle?: 'normal' | 'italic';
}

const baseFont = 'SF Pro';

export const typography: Record<string, TypographyStyle> = {
  // === Large Title ===
  largeTitleRegular: {
    fontFamily: baseFont,
    fontWeight: '400',
    fontSize: 34,
    lineHeight: 41,
  },
  largeTitleEmphasized: {
    fontFamily: baseFont,
    fontWeight: '600',
    fontSize: 34,
    lineHeight: 41,
  },

  // === Title 1 ===
  title1Regular: {
    fontFamily: baseFont,
    fontWeight: '400',
    fontSize: 28,
    lineHeight: 34,
  },
  title1Medium: {
    fontFamily: baseFont,
    fontWeight: '500',
    fontSize: 28,
    lineHeight: 34,
  },
  title1Emphasized: {
    fontFamily: baseFont,
    fontWeight: '600',
    fontSize: 28,
    lineHeight: 34,
  },

  // === Continue similarly ===
  title2Regular: { fontFamily: baseFont, fontWeight: '400', fontSize: 26, lineHeight: 26 },
  title2Emphasized: { fontFamily: baseFont, fontWeight: '600', fontSize: 26, lineHeight: 26 },

  title3Regular: { fontFamily: baseFont, fontWeight: '400', fontSize: 20, lineHeight: 25 },
  title3Emphasized: { fontFamily: baseFont, fontWeight: '600', fontSize: 20, lineHeight: 25 },

  headlineSemibold: { fontFamily: baseFont, fontWeight: '600', fontSize: 17, lineHeight: 22 },
  headlineMedium: { fontFamily: baseFont, fontWeight: '500', fontSize: 17, lineHeight: 22 },
  headlineItalic: { fontFamily: baseFont, fontStyle: 'italic', fontSize: 17, lineHeight: 22 },

  bodyRegular: { fontFamily: baseFont, fontWeight: '400', fontSize: 15, lineHeight: 15 },
  bodyEmphasized: { fontFamily: baseFont, fontWeight: '600', fontSize: 15, lineHeight: 15 },
  bodyItalic: { fontFamily: baseFont, fontStyle: 'italic', fontSize: 13, lineHeight: 15 },
  bodyEmphasizedItalic: { fontFamily: baseFont, fontWeight: '600', fontStyle: 'italic', fontSize: 15, lineHeight: 15 },

  calloutRegular: { fontFamily: baseFont, fontWeight: '400', fontSize: 16, lineHeight: 21 },
  calloutEmphasized: { fontFamily: baseFont, fontWeight: '600', fontSize: 16, lineHeight: 21 },
  calloutItalic: { fontFamily: baseFont, fontStyle: 'italic', fontSize: 16, lineHeight: 21 },
  calloutEmphasizedItalic: { fontFamily: baseFont, fontWeight: '600', fontStyle: 'italic', fontSize: 16, lineHeight: 21 },

  subheadlineRegular: { fontFamily: baseFont, fontWeight: '400', fontSize: 15, lineHeight: 20 },
  subheadlineEmphasized: { fontFamily: baseFont, fontWeight: '600', fontSize: 15, lineHeight: 20 },
  subheadlineItalic: { fontFamily: baseFont, fontStyle: 'italic', fontSize: 15, lineHeight: 20 },
  subheadlineEmphasizedItalic: { fontFamily: baseFont, fontWeight: '600', fontStyle: 'italic', fontSize: 15, lineHeight: 20 },

  footnoteRegular: { fontFamily: baseFont, fontWeight: '400', fontSize: 13, lineHeight: 18 },
  footnoteEmphasized: { fontFamily: baseFont, fontWeight: '600', fontSize: 13, lineHeight: 18 },
  footnoteItalic: { fontFamily: baseFont, fontStyle: 'italic', fontSize: 13, lineHeight: 18 },
  footnoteEmphasizedItalic: { fontFamily: baseFont, fontWeight: '600', fontStyle: 'italic', fontSize: 13, lineHeight: 18 },

  caption1Regular: { fontFamily: baseFont, fontWeight: '400', fontSize: 12, lineHeight: 16 },
  caption1Emphasized: { fontFamily: baseFont, fontWeight: '600', fontSize: 12, lineHeight: 16 },
  caption1Italic: { fontFamily: baseFont, fontStyle: 'italic', fontSize: 12, lineHeight: 16 },
  caption1EmphasizedItalic: { fontFamily: baseFont, fontWeight: '600', fontStyle: 'italic', fontSize: 12, lineHeight: 16 },

  caption2Regular: { fontFamily: baseFont, fontWeight: '400', fontSize: 11, lineHeight: 13 },
  caption2Emphasized: { fontFamily: baseFont, fontWeight: '600', fontSize: 11, lineHeight: 13 },
  caption2Italic: { fontFamily: baseFont, fontStyle: 'italic', fontSize: 11, lineHeight: 13 },
  caption2EmphasizedItalic: { fontFamily: baseFont, fontWeight: '600', fontStyle: 'italic', fontSize: 11, lineHeight: 13 },

  // Add remaining styles similarly...
};
