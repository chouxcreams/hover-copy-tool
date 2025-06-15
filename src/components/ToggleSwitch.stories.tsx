import type { Meta, StoryObj } from "@storybook/react";
import ToggleSwitch from "./ToggleSwitch";

const meta: Meta<typeof ToggleSwitch> = {
  title: "Components/ToggleSwitch",
  component: ToggleSwitch,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    checked: {
      control: "boolean",
      description: "Whether the toggle switch is checked",
    },
    disabled: {
      control: "boolean",
      description: "Whether the toggle switch is disabled",
    },
    className: {
      control: "text",
      description: "Additional CSS classes to apply",
    },
    onChange: {
      action: "changed",
      description: "Callback function called when the toggle state changes",
    },
  },
  args: {
    onChange: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    checked: false,
  },
};

export const Checked: Story = {
  args: {
    checked: true,
  },
};

export const Disabled: Story = {
  args: {
    checked: false,
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    checked: true,
    disabled: true,
  },
};

export const WithCustomClass: Story = {
  args: {
    checked: false,
    className: "toggle-switch-header",
  },
  parameters: {
    docs: {
      description: {
        story: "Toggle switch with custom CSS class applied (e.g., for positioning)",
      },
    },
  },
};

export const Interactive: Story = {
  args: {
    checked: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Click to toggle the switch state",
      },
    },
  },
};