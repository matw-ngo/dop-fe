import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  ExpandedState,
  RowSelectionState,
  ColumnDef,
  RowData,
  Column,
  Table,
} from "@tanstack/react-table";

// This type is needed to make generic work with table
declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    refetch?: () => void;
    isLoading?: boolean;
    onRowClick?: (row: TData) => void;
  }
}

interface UseDataTableOptions<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  isLoading?: boolean;
  refetch?: () => void;
  initialPageSize?: number;
  initialSorting?: SortingState;
  initialColumnVisibility?: VisibilityState;
  initialColumnFilters?: ColumnFiltersState;
  enableRowSelection?: boolean;
  enableMultiSort?: boolean;
  enableColumnResizing?: boolean;
  enableColumnPinning?: boolean;
  enableGlobalFilter?: boolean;
  globalFilterValue?: string;
  onRowClick?: (row: TData) => void;
  onSelectionChange?: (selectedRows: TData[]) => void;
}

export function useDataTable<TData>({
  data,
  columns,
  isLoading = false,
  refetch,
  initialPageSize = 10,
  initialSorting = [],
  initialColumnVisibility = {},
  initialColumnFilters = [],
  enableRowSelection = true,
  enableMultiSort = false,
  enableColumnResizing = false,
  enableColumnPinning = false,
  enableGlobalFilter = true,
  globalFilterValue = "",
  onRowClick,
  onSelectionChange,
}: UseDataTableOptions<TData>) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [columnFilters, setColumnFilters] =
    useState<ColumnFiltersState>(initialColumnFilters);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    initialColumnVisibility,
  );
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [globalFilter, setGlobalFilter] = useState(globalFilterValue);

  // Refs to track previous values and prevent unnecessary updates
  const prevDataRef = useRef(data);
  const isLoadingRef = useRef(false);
  const loadedStateRef = useRef(false);

  // Memoize columns to prevent unnecessary re-renders
  const memoizedColumns = useMemo(() => columns, [columns]);

  // Memoize data to prevent unnecessary re-renders
  const memoizedData = useMemo(() => data, [data]);

  // Handle row selection changes
  const handleRowSelectionChange = useCallback(
    (
      updater:
        | RowSelectionState
        | ((old: RowSelectionState) => RowSelectionState),
    ) => {
      const newSelection =
        typeof updater === "function" ? updater(rowSelection) : updater;
      setRowSelection(newSelection);

      if (onSelectionChange) {
        // We'll handle this in a useEffect to avoid circular dependency
        setTimeout(() => {
          const currentTable = table as any; // Type assertion to avoid circular dependency
          if (currentTable && currentTable.getFilteredRowModel) {
            const selectedRows = currentTable
              .getFilteredRowModel()
              .rows.filter((row: any) => newSelection[row.id]);
            onSelectionChange(selectedRows.map((row: any) => row.original));
          }
        }, 0);
      }
    },
    [rowSelection, onSelectionChange],
  );

  // Handle row clicks
  const handleRowClick = useCallback(
    (row: TData) => {
      if (onRowClick) {
        onRowClick(row);
      }
    },
    [onRowClick],
  );

  // Create table instance with all features
  const table: Table<TData> = useReactTable({
    data: memoizedData,
    columns: memoizedColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: handleRowSelectionChange as any,
    onExpandedChange: setExpanded,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      expanded,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: initialPageSize,
      },
      sorting: initialSorting,
      columnVisibility: initialColumnVisibility,
      columnFilters: initialColumnFilters,
    },
    meta: {
      refetch,
      isLoading,
      onRowClick: handleRowClick,
    },
    enableMultiSort,
    enableColumnResizing,
    enableColumnPinning,
    enableRowSelection,
    enableGlobalFilter,
    // Performance optimizations
    autoResetPageIndex: false,
    // Debug options (remove in production)
    debugTable: process.env.NODE_ENV === "development",
  });

  // Reset pagination when data changes
  useEffect(() => {
    // Only reset if data actually changed (not just reference)
    if (prevDataRef.current !== data) {
      table.setPageIndex(0);
      prevDataRef.current = data;
    }
  }, [data, table]);

  // Utility functions
  const resetFilters = useCallback(() => {
    setColumnFilters(initialColumnFilters);
    setGlobalFilter("");
    table.resetColumnFilters();
    table.resetGlobalFilter();
  }, [initialColumnFilters, table]);

  const resetSorting = useCallback(() => {
    setSorting(initialSorting);
    table.resetSorting();
  }, [initialSorting, table]);

  const resetAll = useCallback(() => {
    resetFilters();
    resetSorting();
    setRowSelection({});
    setExpanded({});
    table.reset();
  }, [resetFilters, resetSorting, table]);

  const exportToCSV = useCallback(() => {
    const headers = memoizedColumns
      .filter((col) => col.id !== "select" && col.id !== "actions")
      .map((col) =>
        typeof col.header === "string" ? col.header : col.id || "",
      );

    const rows = table.getFilteredRowModel().rows.map((row) => {
      const rowData: any = {};
      memoizedColumns.forEach((col) => {
        if (col.id !== "select" && col.id !== "actions") {
          const value = row.getValue(col.id || "");
          rowData[col.id || ""] = value;
        }
      });
      return rowData;
    });

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            // Handle values that might contain commas or quotes
            if (
              typeof value === "string" &&
              (value.includes(",") || value.includes('"'))
            ) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(","),
      ),
    ].join("\n");

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `table-export-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [memoizedColumns, table]);

  // Save and load table state
  const saveTableState = useCallback(() => {
    // Prevent saving during initial load
    if (isLoadingRef.current) return;

    const state = {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
      pageSize: table.getState().pagination.pageSize,
    };
    localStorage.setItem("dataTableState", JSON.stringify(state));
  }, [sorting, columnFilters, columnVisibility, globalFilter, table]);

  const loadTableState = useCallback(() => {
    // Prevent multiple loads
    if (loadedStateRef.current) return;

    const savedState = localStorage.getItem("dataTableState");
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        setSorting(state.sorting || initialSorting);
        setColumnFilters(state.columnFilters || initialColumnFilters);
        setColumnVisibility(state.columnVisibility || initialColumnVisibility);
        setGlobalFilter(state.globalFilter || "");

        // Mark as loaded to prevent infinite loops
        loadedStateRef.current = true;

        // Note: pageSize should be set after table is initialized
        // Use requestAnimationFrame instead of setTimeout for better performance
        requestAnimationFrame(() => {
          if (
            state.pageSize &&
            table.getState().pagination.pageSize !== state.pageSize
          ) {
            table.setPageSize(state.pageSize);
          }
        });
      } catch (error) {
        console.warn("Failed to load table state:", error);
        loadedStateRef.current = true; // Mark as loaded even on error
      }
    } else {
      loadedStateRef.current = true; // Mark as loaded if no saved state
    }
  }, [initialSorting, initialColumnFilters, initialColumnVisibility, table]);

  // Load saved state on mount
  useEffect(() => {
    isLoadingRef.current = true;
    loadTableState();
    // Set a small delay to mark loading as complete
    setTimeout(() => {
      isLoadingRef.current = false;
    }, 100);
  }, [loadTableState]);

  // Save state when it changes (with proper dependencies)
  useEffect(() => {
    saveTableState();
  }, [sorting, columnFilters, columnVisibility, globalFilter, saveTableState]);

  // Handle row selection changes properly
  useEffect(() => {
    if (onSelectionChange && Object.keys(rowSelection).length > 0) {
      const selectedRows = table
        .getFilteredRowModel()
        .rows.filter((row: any) => rowSelection[row.id]);
      onSelectionChange(selectedRows.map((row: any) => row.original));
    }
  }, [rowSelection, onSelectionChange, table]);

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
    expanded,
    setExpanded,
    globalFilter,
    setGlobalFilter,
    resetFilters,
    resetSorting,
    resetAll,
    exportToCSV,
    saveTableState,
    loadTableState,
  };
}
