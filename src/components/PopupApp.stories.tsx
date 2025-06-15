import React from 'react';
import { Meta, Story } from '@storybook/react';
import PopupApp from './PopupApp';
import '../popup.css';

export default {
  title: 'Components/PopupApp',
  component: PopupApp,
  parameters: {
    layout: 'centered',
  },
} as Meta;

const Template: Story = (args) => (
  <div style={{ width: '350px' }}>
    <PopupApp {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {};

export const WithoutPatterns = Template.bind({});
WithoutPatterns.args = {};
WithoutPatterns.parameters = {
  docs: {
    description: {
      story: 'パターンが登録されていない初期状態',
    },
  },
};

// モック関数を使用したバージョン
export const WithMockData = Template.bind({});
WithMockData.args = {};
WithMockData.parameters = {
  docs: {
    description: {
      story: 'テストデータを使用したポップアップの表示状態',
    },
  },
};