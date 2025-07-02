import {
  flexRender,
  type RowData,
  type Table as ReactTable,
} from '@tanstack/react-table';

function Table({
  caption,
  table,
}: {
  caption: string;
  table: ReactTable<RowData>;
}) {
  return (
    <>
      <h2 className="caption-top mb-3 font-bold text-lg">{caption}</h2>
      <Pagination table={table} />
      <div className="w-full overflow-x-auto mb-3">
        <table className="border table-fixed">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="sticky -top-1 border p-1 bg-gray-700"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="border p-1 max-w-[200px]">
                    <div className="overflow-x-hidden whitespace-nowrap">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination table={table} />
    </>
  );
}

function Pagination({ table }: { table: ReactTable<RowData> }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-3">
      <div className="join">
        <button
          className="join-item btn"
          onClick={() => table.firstPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {'<<'}
        </button>
        <button
          className="join-item btn"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {'<'}
        </button>
        <button
          className="join-item btn"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {'>'}
        </button>
        <button
          className="join-item btn"
          onClick={() => table.lastPage()}
          disabled={!table.getCanNextPage()}
        >
          {'>>'}
        </button>
      </div>
      <div>
        <span className="flex items-center justify-end gap-1">
          <div>Page</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount().toLocaleString()}
          </strong>
        </span>
        <div>
          Showing {table.getRowModel().rows.length.toLocaleString()} of{' '}
          {table.getRowCount().toLocaleString()} Rows
        </div>
      </div>
    </div>
  );
}

export default Table;
