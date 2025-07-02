import { createColumnHelper } from "@tanstack/react-table";
import { mkConfig, generateCsv, asBlob } from "export-to-csv";
import { useMemo } from "react";
import { type RecordType, type DBFFile } from "./dbf-file-reader/types";
import Table from "./components/design/Table";
import DescriptionList from "./components/design/DescriptionList";
import useTable from "./components/design/Table/useTable";

const columnHelper = createColumnHelper<RecordType>();

const csvConfig = mkConfig({ useKeysAsHeaders: true });

function FileViewer({ dbf, name }: { dbf: DBFFile; name: string }) {
  const columns = useMemo(() => {
    if (!dbf) return [];

    return dbf.fields.map((field) =>
      columnHelper.accessor(field.name, {
        cell: (info) => info.getValue()?.toString(),
        header: `${field.name} (${field.type})`,
      })
    );
  }, [dbf]);

  const data = dbf?.records || [];

  const table = useTable({ data, columns });

  const csvData = data.map((record) => {
    const csvRecord: Record<string, string | number> = {};

    for (const [k, v] of Object.entries(record)) {
      if (typeof v !== "string" && typeof v !== "number") {
        csvRecord[k] = v?.toString() || "";
      } else {
        csvRecord[k] = v;
      }
    }
    return csvRecord;
  });

  const csv = generateCsv(csvConfig)(csvData);
  const blob = asBlob(csvConfig)(csv);
  const url = URL.createObjectURL(blob);

  return (
    <>
      <DescriptionList title="File Metadata">
        <DescriptionList.Item
          label="File Version"
          value={dbf.fileVersion.name}
        />
        <DescriptionList.Item
          label="Last Update Date"
          value={dbf.lastUpdateDate.toString()}
        />
        <DescriptionList.Item label="Record Count" value={dbf.recordCount} />
        <DescriptionList.Item label="Header Length" value={dbf.headerLength} />
        <DescriptionList.Item label="Record Length" value={dbf.recordLength} />
        <DescriptionList.Item
          label="File has a structural .cdx"
          value={dbf.hasStructuralCDXFile ? "Yes" : "No"}
        />
        <DescriptionList.Item
          label="File has a Memo field"
          value={dbf.hasMemoField ? "Yes" : "No"}
        />
        <DescriptionList.Item
          label="File is a database (.dbc)"
          value={dbf.isDBCDatabase ? "Yes" : "No"}
        />
      </DescriptionList>
      <div className="mb-3">
        <a className="btn btn-primary" href={url} download={name}>
          Export to CSV
        </a>
      </div>
      {/* TODO: appease typescript :sob: */}
      <Table table={table} caption="Records" />
    </>
  );
}

export default FileViewer;
