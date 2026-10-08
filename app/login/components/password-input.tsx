import type React from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isVisible: boolean;
  toggleVisibility: () => void;
  placeholder?: string;
  error?: boolean;
  errorMessage?: string;
}

/** Password field with a show/hide toggle and an optional inline error. */
export function PasswordInput({
  id,
  name,
  value,
  onChange,
  isVisible,
  toggleVisibility,
  placeholder = "••••••••",
  error = false,
  errorMessage = "",
}: PasswordInputProps) {
  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={isVisible ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm ${
          error ? "border-red-500 dark:border-red-500" : ""
        }`}
        autoComplete="off"
      />
      <button
        type="button"
        onClick={toggleVisibility}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        tabIndex={-1}
      >
        {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
      {error && errorMessage && (
        <p className="text-xs text-red-500 mt-1">{errorMessage}</p>
      )}
    </div>
  );
}
