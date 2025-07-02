import { createContext, useContext } from "react";

const FieldNameContext = createContext<string | null>(null);

function useFieldName(): string {
  const fieldName = useContext(FieldNameContext);

  if (fieldName === null) {
    throw new Error("Cannot use field name outside of a <Group> component");
  }

  return fieldName;
}

export { FieldNameContext, useFieldName };
