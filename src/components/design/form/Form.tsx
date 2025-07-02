import type React from "react";
import Group from "./Group";
import FileInput from "./FileInput";
import Label from "./Label";
import Submit from "./Submit";

function Form({
  children,
  onSubmit,
}: {
  children: React.ReactElement | React.ReactElement[];
  onSubmit: React.FormEventHandler;
}) {
  return (
    <form className="mb-3" onSubmit={onSubmit}>
      {children}
    </form>
  );
}

Form.FileInput = FileInput;
Form.Group = Group;
Form.Label = Label;
Form.Submit = Submit;

export default Form;
