# 🚀 QUICK REFERENCE - Copy & Paste Examples

## 🎨 Gradient Buttons (Copy & Paste Ready)

### Primary Button (Purple-Blue)

```jsx
<button
  type="submit"
  disabled={!isValid}
  className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 hover:from-purple-700 hover:via-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
  aria-label="Submit form"
>
  Submit
</button>
```

### Success Button (Green)

```jsx
<button
  className="bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 hover:from-green-600 hover:via-emerald-600 hover:to-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-green-500/50"
  aria-label="Confirm action"
>
  Confirm
</button>
```

### Danger Button (Red)

```jsx
<button
  className="bg-gradient-to-r from-red-500 via-pink-500 to-red-500 hover:from-red-600 hover:via-pink-600 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-red-500/50"
  aria-label="Delete item"
>
  Delete
</button>
```

### Outline Button

```jsx
<button
  className="bg-transparent border-2 border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400 hover:bg-gradient-to-r hover:from-purple-600 hover:via-blue-600 hover:to-purple-600 hover:text-white hover:border-transparent font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-500/50"
  aria-label="Cancel action"
>
  Cancel
</button>
```

---

## 📝 Form Input with Real-Time Validation

```jsx
import { useState } from "react";
import { validateEmail } from "../../utils/formValidation";
import { Icon } from "@iconify/react";

function EmailInput() {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (touched) {
      const result = validateEmail(e.target.value);
      setError(result.message);
    }
  };

  const handleBlur = () => {
    setTouched(true);
    const result = validateEmail(email);
    setError(result.message);
  };

  return (
    <div>
      <label htmlFor="email" className="block text-sm font-semibold mb-2">
        Email Address *
      </label>
      <input
        type="email"
        id="email"
        value={email}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
          touched && error
            ? "border-red-500 focus:ring-2 focus:ring-red-500"
            : touched && !error
            ? "border-green-500 focus:ring-2 focus:ring-green-500"
            : "border-gray-300 focus:ring-2 focus:ring-purple-500"
        }`}
        placeholder="Enter your email"
        aria-label="Email address"
        aria-required="true"
        aria-invalid={touched && error ? "true" : "false"}
        aria-describedby={error ? "email-error" : undefined}
      />
      {error && (
        <p
          id="email-error"
          role="alert"
          className="text-red-500 text-sm mt-2 flex items-center gap-1"
        >
          <Icon icon="mdi:alert-circle" />
          {error}
        </p>
      )}
      {touched && !error && (
        <p className="text-green-500 text-sm mt-2 flex items-center gap-1">
          <Icon icon="mdi:check-circle" />
          Valid email address
        </p>
      )}
    </div>
  );
}
```

---

## 🔒 Password Input with Strength Indicator

```jsx
import { useState } from "react";
import {
  validatePassword,
  getPasswordStrengthColor,
  getPasswordStrengthText,
} from "../../utils/formValidation";
import { Icon } from "@iconify/react";

function PasswordInput() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validation, setValidation] = useState(null);
  const [touched, setTouched] = useState(false);

  const handleChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    const result = validatePassword(value);
    setValidation(result);
  };

  return (
    <div>
      <label className="block text-sm font-semibold mb-2">Password *</label>

      {/* Password Input */}
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={handleChange}
          onBlur={() => setTouched(true)}
          className={`w-full px-4 py-3 pr-12 border-2 rounded-lg focus:outline-none transition-all ${
            touched && !validation?.isValid
              ? "border-red-500 focus:ring-2 focus:ring-red-500"
              : touched && validation?.isValid
              ? "border-green-500 focus:ring-2 focus:ring-green-500"
              : "border-gray-300 focus:ring-2 focus:ring-purple-500"
          }`}
          placeholder="Enter your password"
          aria-label="Password"
          aria-required="true"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          <Icon
            icon={showPassword ? "mdi:eye" : "mdi:eye-off"}
            className="text-xl text-gray-500"
          />
        </button>
      </div>

      {/* Strength Indicator */}
      {password && (
        <div className="mt-3">
          <div className="flex gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`h-2 flex-1 rounded transition-all ${
                  Object.values(validation?.requirements || {}).filter(Boolean)
                    .length >= level
                    ? getPasswordStrengthColor(validation?.strength)
                    : "bg-gray-300"
                }`}
              />
            ))}
          </div>
          <p className="text-sm font-medium">
            Strength: {getPasswordStrengthText(validation?.strength)}
          </p>
        </div>
      )}

      {/* Requirements Checklist */}
      {password && (
        <ul className="text-xs mt-3 space-y-1">
          <li
            className={
              validation?.requirements?.minLength
                ? "text-green-600 font-medium"
                : "text-gray-500"
            }
          >
            <Icon
              icon={
                validation?.requirements?.minLength ? "mdi:check" : "mdi:close"
              }
              className="inline mr-1"
            />
            At least 8 characters
          </li>
          <li
            className={
              validation?.requirements?.hasUpperCase
                ? "text-green-600 font-medium"
                : "text-gray-500"
            }
          >
            <Icon
              icon={
                validation?.requirements?.hasUpperCase
                  ? "mdi:check"
                  : "mdi:close"
              }
              className="inline mr-1"
            />
            One uppercase letter
          </li>
          <li
            className={
              validation?.requirements?.hasLowerCase
                ? "text-green-600 font-medium"
                : "text-gray-500"
            }
          >
            <Icon
              icon={
                validation?.requirements?.hasLowerCase
                  ? "mdi:check"
                  : "mdi:close"
              }
              className="inline mr-1"
            />
            One lowercase letter
          </li>
          <li
            className={
              validation?.requirements?.hasNumber
                ? "text-green-600 font-medium"
                : "text-gray-500"
            }
          >
            <Icon
              icon={
                validation?.requirements?.hasNumber ? "mdi:check" : "mdi:close"
              }
              className="inline mr-1"
            />
            One number
          </li>
          <li
            className={
              validation?.requirements?.hasSpecialChar
                ? "text-green-600 font-medium"
                : "text-gray-500"
            }
          >
            <Icon
              icon={
                validation?.requirements?.hasSpecialChar
                  ? "mdi:check"
                  : "mdi:close"
              }
              className="inline mr-1"
            />
            One special character
          </li>
        </ul>
      )}
    </div>
  );
}
```

---

## 💀 Skeleton Loaders

### Dashboard Loading State

```jsx
import {
  SkeletonDashboardCard,
  SkeletonList,
} from "../components/GeneralComponents/SkeletonLoader";

function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <SkeletonDashboardCard />
          <SkeletonDashboardCard />
          <SkeletonDashboardCard />
        </div>
        <SkeletonList items={5} showAvatar={true} />
      </div>
    );
  }

  return <ActualDashboard data={data} />;
}
```

### Table Loading State

```jsx
import { SkeletonTable } from "../components/GeneralComponents/SkeletonLoader";

function DataTable() {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <SkeletonTable rows={10} columns={4} />;
  }

  return <ActualTable />;
}
```

### List Loading State

```jsx
import { SkeletonList } from "../components/GeneralComponents/SkeletonLoader";

function UserList() {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <SkeletonList items={8} showAvatar={true} />;
  }

  return <ActualUserList />;
}
```

---

## ♿ Accessibility Checklist

```jsx
// ✅ Form Input Checklist
<input
  type="text"
  id="field-id"                           // ✅ Always have ID
  aria-label="Field description"          // ✅ Describe the field
  aria-required="true"                    // ✅ Mark required fields
  aria-invalid={hasError ? "true" : "false"}  // ✅ Indicate errors
  aria-describedby="field-error"          // ✅ Link to error message
/>

// ✅ Button Checklist
<button
  type="button"                           // ✅ Specify type
  aria-label="Descriptive action"         // ✅ Describe what it does
  aria-busy={isLoading}                   // ✅ Indicate loading state
  disabled={!isValid}                     // ✅ Disable when needed
  className="focus:outline-none focus:ring-4"  // ✅ Visible focus indicator
/>

// ✅ Error Message Checklist
{error && (
  <p
    id="field-error"                      // ✅ Match aria-describedby
    role="alert"                          // ✅ Announce to screen readers
    className="text-red-500"              // ✅ Visual indicator
  >
    {error}
  </p>
)}

// ✅ Loading State Checklist
<div
  role="status"                           // ✅ Indicate status region
  aria-label="Loading content"            // ✅ Describe what's loading
  aria-live="polite"                      // ✅ Announce when ready
>
  <SkeletonLoader />
</div>
```

---

## 🎯 Complete Form Example

```jsx
import { useState } from "react";
import {
  validateEmail,
  validatePassword,
  validateMatch,
} from "../utils/formValidation";
import { Icon } from "@iconify/react";

function RegistrationForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [touched, setTouched] = useState({
    email: false,
    password: false,
    confirmPassword: false,
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Real-time validation if field is touched
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const validateField = (field, value) => {
    let result;

    switch (field) {
      case "email":
        result = validateEmail(value);
        break;
      case "password":
        result = validatePassword(value);
        break;
      case "confirmPassword":
        result = validateMatch(formData.password, value);
        break;
      default:
        return;
    }

    setErrors((prev) => ({ ...prev, [field]: result.message }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate all fields
    const emailResult = validateEmail(formData.email);
    const passwordResult = validatePassword(formData.password);
    const confirmResult = validateMatch(
      formData.password,
      formData.confirmPassword
    );

    if (
      !emailResult.isValid ||
      !passwordResult.isValid ||
      !confirmResult.isValid
    ) {
      setErrors({
        email: emailResult.message,
        password: passwordResult.message,
        confirmPassword: confirmResult.message,
      });
      setIsLoading(false);
      return;
    }

    // Submit form...
  };

  const isFormValid =
    formData.email &&
    formData.password &&
    formData.confirmPassword &&
    !errors.email &&
    !errors.password &&
    !errors.confirmPassword;

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6">
      {/* Email Field */}
      <div className="mb-6">
        <label htmlFor="email" className="block text-sm font-semibold mb-2">
          Email *
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={handleChange("email")}
          onBlur={handleBlur("email")}
          className={`w-full px-4 py-3 border-2 rounded-lg ${
            touched.email && errors.email
              ? "border-red-500"
              : touched.email && !errors.email
              ? "border-green-500"
              : "border-gray-300"
          } focus:outline-none focus:ring-2`}
          aria-label="Email address"
          aria-required="true"
          aria-invalid={touched.email && errors.email ? "true" : "false"}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && (
          <p
            id="email-error"
            role="alert"
            className="text-red-500 text-sm mt-1"
          >
            <Icon icon="mdi:alert-circle" className="inline mr-1" />
            {errors.email}
          </p>
        )}
      </div>

      {/* Password Field - Use PasswordInput component from above */}

      {/* Confirm Password Field */}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isFormValid || isLoading}
        className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 hover:from-purple-700 hover:via-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        aria-label={isLoading ? "Submitting form" : "Submit registration"}
        aria-busy={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Icon icon="mdi:loading" className="animate-spin" />
            Submitting...
          </span>
        ) : (
          "Register"
        )}
      </button>
    </form>
  );
}
```

---

## 📋 Search & Replace Guide

### Replace Blue Buttons with Gradient

**Find**: `bg-blue-600 hover:bg-blue-700`  
**Replace**: `bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 hover:from-purple-700 hover:via-blue-700 hover:to-purple-700 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-500/50`

### Replace Green Buttons with Gradient

**Find**: `bg-green-600 hover:bg-green-700`  
**Replace**: `bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 hover:from-green-600 hover:via-emerald-600 hover:to-green-600 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-green-500/50`

### Replace Red Buttons with Gradient

**Find**: `bg-red-600 hover:bg-red-700`  
**Replace**: `bg-gradient-to-r from-red-500 via-pink-500 to-red-500 hover:from-red-600 hover:via-pink-600 hover:to-red-600 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-red-500/50`

---

**Ready to copy and paste!** 🚀
