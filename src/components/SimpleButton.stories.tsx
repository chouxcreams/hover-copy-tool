import React from 'react';
import SimpleButton from './SimpleButton';
import '../popup.css';

export default {
  title: 'Components/SimpleButton',
  component: SimpleButton,
};

export const Primary = () => (
  <SimpleButton 
    label="Primary Button" 
    onClick={() => alert('Primary clicked!')}
    variant="primary"
  />
);

export const Secondary = () => (
  <SimpleButton 
    label="Secondary Button" 
    onClick={() => alert('Secondary clicked!')}
    variant="secondary"
  />
);

export const Small = () => (
  <SimpleButton 
    label="Small"
    onClick={() => alert('Small clicked!')}
    variant="primary"
  />
);