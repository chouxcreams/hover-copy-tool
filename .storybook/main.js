module.exports = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [],
  framework: '@storybook/react',
  webpackFinal: async (config) => {
    // TypeScript support
    config.module.rules.push({
      test: /\.tsx?$/,
      use: [
        {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.json',
          },
        },
      ],
      exclude: /node_modules/,
    });

    // Remove existing CSS rules and add a simple one
    config.module.rules = config.module.rules.filter(
      rule => !(rule.test && rule.test.toString().includes('css'))
    );
    
    config.module.rules.push({
      test: /\.css$/,
      use: ['style-loader', 'css-loader'],
    });

    config.resolve.extensions.push('.ts', '.tsx');

    return config;
  },
};