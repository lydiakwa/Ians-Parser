import type { FieldValues, Path, UseFormRegister } from "react-hook-form";
import { useFieldName } from "./useFieldName";

function FileInput<T extends FieldValues>({
  register,
  multiple,
}: {
  register: UseFormRegister<T>;
  multiple?: boolean;
}) {
  const fieldName = useFieldName() as Path<T>;

  return (
    <input
      type="file"
      multiple={multiple}
      className="file-input w-full"
      {...register(fieldName)}
    />
  );
}

export default FileInput;
