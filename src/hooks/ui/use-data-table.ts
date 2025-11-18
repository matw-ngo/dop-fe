import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  ColumnDef,
  RowData,
} from "@tanstack/react-table";

// This type is needed to make the generic work with the table
declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    refetch?: () => void;
    isLoading?: boolean;
  }
}

interface UseDataTableOptions<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  isLoading?: boolean;
  refetch?: () => void;
  initialPageSize?: number;
}

export function useDataTable<TData>({
  data,
  columns,
  isLoading = false,
  refetch,
  initialPageSize = 10,
}: UseDataTableOptions<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: initialPageSize,
      },
    },
    meta: {
      refetch,
      isLoading,
    },
  });

  return {
    table,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    columnVisibility,
    setColumnVisibility,
    rowSelection,
    setRowSelection,
  };
}