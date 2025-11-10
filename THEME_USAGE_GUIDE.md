# Theme Context Usage Guide

## How to Use Theme Context in Your Components

### 1. Import the useTheme hook

```jsx
import { useTheme } from "../../context/ThemeContext";
```

### 2. Use the theme in your component

```jsx
const MyComponent = () => {
  const { isDarkMode, toggleTheme, theme } = useTheme();

  return (
    <div className={theme.background.primary}>
      <h1 className={theme.text.primary}>Hello World</h1>
      <button className={theme.button.primary}>Click Me</button>
    </div>
  );
};
```

## Available Theme Properties

### Background Colors

- `theme.background.primary` - Main background gradient
- `theme.background.secondary` - Secondary background
- `theme.background.card` - Card backgrounds
- `theme.background.input` - Input field backgrounds
- `theme.background.modal` - Modal backgrounds

### Text Colors

- `theme.text.primary` - Main text color
- `theme.text.secondary` - Secondary text
- `theme.text.tertiary` - Tertiary text (lighter)
- `theme.text.inverse` - Inverse text (white on dark, dark on light)
- `theme.text.error` - Error text
- `theme.text.success` - Success text
- `theme.text.link` - Link color
- `theme.text.linkHover` - Link hover color

### Brand Colors

- `theme.brand.primary` - Primary brand gradient
- `theme.brand.primarySolid` - Solid brand color
- `theme.brand.primaryHover` - Hover state
- `theme.brand.primaryText` - Brand text color
- `theme.brand.light` - Light brand background
- `theme.brand.lighter` - Lighter brand background

### Button Styles

- `theme.button.primary` - Primary button (green gradient)
- `theme.button.secondary` - Secondary button
- `theme.button.outline` - Outlined button
- `theme.button.disabled` - Disabled state
- `theme.button.success` - Success button
- `theme.button.danger` - Danger button

### Border Colors

- `theme.border.primary` - Primary borders
- `theme.border.secondary` - Secondary borders
- `theme.border.focus` - Focus state borders
- `theme.border.error` - Error borders

### Status Colors

- `theme.status.success` - Success status
- `theme.status.error` - Error status
- `theme.status.warning` - Warning status
- `theme.status.info` - Info status

### Shadow Colors

- `theme.shadow.small` - Small shadow
- `theme.shadow.medium` - Medium shadow
- `theme.shadow.large` - Large shadow
- `theme.shadow.xl` - Extra large shadow

## Example: Login Form with Theme

```jsx
import { useTheme } from "../../context/ThemeContext";

const LoginForm = () => {
  const { theme } = useTheme();

  return (
    <div
      className={`min-h-screen ${theme.background.primary} flex items-center justify-center`}
    >
      <div
        className={`${theme.background.card} rounded-2xl p-8 ${theme.shadow.xl}`}
      >
        <h2 className={`${theme.text.primary} text-2xl font-bold mb-6`}>
          Welcome Back
        </h2>

        <input
          type="email"
          className={`${theme.background.input} ${theme.text.primary} ${theme.border.primary} border rounded-lg px-4 py-3 w-full`}
          placeholder="Email"
        />

        <button
          className={`${theme.button.primary} w-full py-3 rounded-lg mt-4 font-bold`}
        >
          Sign In
        </button>

        <a
          href="/forgot"
          className={`${theme.text.link} hover:${theme.text.linkHover} text-sm mt-4 block`}
        >
          Forgot Password?
        </a>
      </div>
    </div>
  );
};
```

## Toggle Theme Button

```jsx
import { useTheme } from "../../context/ThemeContext";

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme}>
      {isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
    </button>
  );
};
```

## Changing Theme Colors

To change the theme colors, edit the `themes` object in `context/ThemeContext.jsx`:

```jsx
const themes = {
  light: {
    brand: {
      primary: "bg-gradient-to-r from-blue-600 to-blue-700", // Change to blue
      // ... other colors
    },
  },
  dark: {
    brand: {
      primary: "bg-gradient-to-r from-blue-500 to-blue-600", // Change to blue
      // ... other colors
    },
  },
};
```

All colors use Tailwind CSS classes, making it easy to update across your entire app!
