import type { ColumnDef, RowData } from "@tanstack/react-table";

export interface ExtendedTableOptions<TData extends RowData> {
  columns: {
    [K in keyof Required<TData>]: ColumnDef<TData, TData[K]>;
  }[keyof TData][];
  data: TData[];
}
