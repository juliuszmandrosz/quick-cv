import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmailFieldProps {
  /** `htmlFor` of the label. Usually equal to `inputId`. */
  labelFor: string;
  inputId: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

/** Labelled, required email input shared by every auth tab. */
export function EmailField({
  labelFor,
  inputId,
  label,
  value,
  onChange,
}: EmailFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={labelFor} className="text-sm font-medium">
        {label}
      </Label>
      <Input
        id={inputId}
        placeholder="name@example.com"
        type="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus-visible:ring-primary"
        required
      />
    </div>
  );
}
