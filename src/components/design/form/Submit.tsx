import type React from "react";

function Submit({
  children,
}: {
  children: React.ReactNode | React.ReactNode[];
}) {
  return (
    <div className="flex justify-end">
      <button type="submit" className="btn btn-primary">
        {children}
      </button>
    </div>
  );
}

export default Submit;
