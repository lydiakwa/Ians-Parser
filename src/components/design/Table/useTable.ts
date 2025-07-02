import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type RowData,
  type Table,
} from "@tanstack/react-table";
import { useState } from "react";

interface DataTableProps<TData> {
  columns: {
    [K in keyof TData]: ColumnDef<TData, TData[K]>;
  }[keyof TData][];
  data: TData[];
}

function useTable<TData extends RowData>({
  data,
  columns,
}: DataTableProps<TData>): Table<TData> {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
  });

  return table;
}

export default useTable;
