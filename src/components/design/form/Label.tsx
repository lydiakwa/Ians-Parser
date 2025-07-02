import type React from "react";
import { useFieldName } from "./useFieldName";

function Label({
  children,
}: {
  children: React.ReactNode | React.ReactNode[];
}) {
  const fieldName = useFieldName();

  return (
    <label htmlFor={fieldName} className="label block">
      {children}
    </label>
  );
}

export default Label;
