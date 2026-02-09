module.exports = {
  projects: [
    // Pure TypeScript unit tests (utils, services without native deps)
    {
      displayName: 'unit',
      testMatch: [
        '<rootDir>/__tests__/utils/**/*.test.ts',
        '<rootDir>/__tests__/services/**/*.test.ts',
      ],
      transform: {
        '^.+\\.tsx?$': [
          'babel-jest',
          {
            presets: [
              ['@babel/preset-env', { targets: { node: 'current' } }],
              '@babel/preset-typescript',
            ],
          },
        ],
      },
    },
    // React Native component/screen tests
    {
      displayName: 'integration',
      preset: 'jest-expo',
      testMatch: ['<rootDir>/__tests__/screens/**/*.test.tsx'],
      transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@shopify/react-native-skia|react-native-mmkv|react-native-reanimated|react-native-gesture-handler|react-native-screens|react-native-safe-area-context)',
      ],
    },
  ],
};
