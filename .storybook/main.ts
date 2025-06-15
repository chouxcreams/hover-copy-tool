import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: async (config) => {
    // GitHub Pages対応のベースURL設定
    if (process.env.NODE_ENV === 'production') {
      config.base = '/hover-copy-tool/';
    }
    return config;
  },
};

export default config;