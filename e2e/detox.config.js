/**
 * Detox configuration for Android emulator testing.
 * Run with: npx detox test --configuration android.emu.debug
 */
module.exports = {
  testRunner: 'jest',
  runnerConfig: 'e2e/jest.config.js',
  apps: {
    android: {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
    },
  },
  devices: {
    emulator: {
      type: 'android.emulator',
      avdName: 'Pixel_6_API_33',
    },
  },
  configurations: {
    'android.emu.debug': {
      device: 'emulator',
      app: 'android',
    },
  },
};
