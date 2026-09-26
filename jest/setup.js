// AsyncStorage has no native module under Jest; its package ships an in-memory mock.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// expo-audio reaches for its native module as soon as it is imported. Nothing
// under test plays a sound, so a silent player stands in for it.
jest.mock('expo-audio', () => ({
  createAudioPlayer: () => ({
    play: () => {},
    pause: () => {},
    seekTo: () => Promise.resolve(),
    remove: () => {},
    volume: 1,
  }),
  setAudioModeAsync: () => Promise.resolve(),
}));
