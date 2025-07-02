import type React from "react";

function DescriptionList({
  children,
  title,
}: {
  children: React.ReactElement | React.ReactElement[];
  title: string;
}) {
  return (
    <>
      <h2 className="mb-3 font-bold text-lg">{title}</h2>
      <dl className="mb-3">{children}</dl>
    </>
  );
}

function DescriptionListItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex gap-1 border border-gray-500">
      <dt className="w-1/4 shrink-0 font-bold bg-gray-500 p-1">{label}</dt>
      <dd className="p-1">{value}</dd>
    </div>
  );
}

DescriptionList.Item = DescriptionListItem;

export default DescriptionList;
