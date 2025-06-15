import React from 'react';
import { Meta, Story } from '@storybook/react';
import HoverWindow from './HoverWindow';
import '../content.css';

interface HoverWindowProps {
  matches: Array<{
    value: string;
    patternName: string;
  }>;
  onCopy: (value: string) => void;
}

export default {
  title: 'Components/HoverWindow',
  component: HoverWindow,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    onCopy: { action: 'copied' },
  },
} as Meta<HoverWindowProps>;

const Template: Story<HoverWindowProps> = (args) => (
  <div style={{ position: 'relative', padding: '20px' }}>
    <HoverWindow {...args} />
  </div>
);

export const SingleMatch = Template.bind({});
SingleMatch.args = {
  matches: [
    {
      value: '123',
      patternName: 'User ID',
    },
  ],
};

export const MultipleMatches = Template.bind({});
MultipleMatches.args = {
  matches: [
    {
      value: '123',
      patternName: 'User ID',
    },
    {
      value: '456',
      patternName: 'Post ID',
    },
    {
      value: 'abc-def-ghi',
      patternName: 'Session ID',
    },
  ],
};

export const LongValues = Template.bind({});
LongValues.args = {
  matches: [
    {
      value: 'very-long-user-id-that-might-overflow-the-container-1234567890',
      patternName: 'Long User ID',
    },
    {
      value: 'another-extremely-long-value-for-testing-purposes',
      patternName: 'Long Value',
    },
  ],
};

export const EmptyMatches = Template.bind({});
EmptyMatches.args = {
  matches: [],
};