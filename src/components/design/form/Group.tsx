import type React from "react";
import { FieldNameContext } from "./useFieldName";

function Group({
  children,
  name,
}: {
  children: React.ReactElement | React.ReactElement[];
  name: string;
}) {
  return (
    <FieldNameContext.Provider value={name}>
      <div className="mb-3">{children}</div>
    </FieldNameContext.Provider>
  );
}

export default Group;
