"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  SearchIcon,
  Settings2,
  Download,
  RotateCcw,
  Eye,
  EyeOff,
  Filter,
  FilterX,
  MoreHorizontal,
} from "lucide-react";
import { useDataTable } from "@/hooks/ui/use-data-table";
import { type ColumnDef } from "@tanstack/react-table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  refetch?: () => void;
  searchPlaceholder?: string;
  searchColumn?: string;
  emptyState?: React.ReactNode;
  loadingState?: React.ReactNode;
  className?: string;
  enableRowSelection?: boolean;
  onSelectRows?: (rows: TData[]) => void;
  selectedRows?: TData[];
  enableColumnVisibility?: boolean;
  enableExport?: boolean;
  enableFilters?: boolean;
  onRowClick?: (row: TData) => void;
  initialPageSize?: number;
  initialSorting?: { id: string; desc: boolean }[];
  initialColumnVisibility?: Record<string, boolean>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  refetch,
  searchPlaceholder = "Filter...",
  searchColumn,
  emptyState,
  loadingState,
  className,
  enableRowSelection = false,
  onSelectRows,
  selectedRows = [],
  enableColumnVisibility = true,
  enableExport = true,
  enableFilters = true,
  onRowClick,
  initialPageSize = 10,
  initialSorting = [],
  initialColumnVisibility = {},
}: DataTableProps<TData, TValue>) {
  const {
    table,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    columnVisibility,
    setColumnVisibility,
    rowSelection,
    setRowSelection,
    globalFilter,
    setGlobalFilter,
    resetFilters,
    resetSorting,
    resetAll,
    exportToCSV,
    saveTableState,
    loadTableState,
  } = useDataTable({
    data,
    columns: columns as ColumnDef<TData>[],
    isLoading,
    refetch,
    initialPageSize,
    initialSorting,
    initialColumnVisibility,
    enableRowSelection,
    enableMultiSort: true,
    enableColumnResizing: true,
    enableColumnPinning: true,
    enableGlobalFilter: !!searchColumn,
    globalFilterValue: "",
    onRowClick,
    onSelectionChange: onSelectRows,
  });

  // Handle row selection changes
  React.useEffect(() => {
    if (enableRowSelection && onSelectRows) {
      const selectedRowsData = table
        .getSelectedRowModel()
        .rows.map((row: any) => row.original);
      onSelectRows(selectedRowsData);
    }
  }, [rowSelection, table, enableRowSelection, onSelectRows]);

  // Add checkbox column if row selection is enabled
  const columnsWithSelection = React.useMemo(() => {
    if (!enableRowSelection) return columns;

    return [
      {
        id: "select",
        header: ({ table }: any) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
            className="translate-y-[2px]"
          />
        ),
        cell: ({ row }: any) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-[2px]"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      } as ColumnDef<TData>,
      ...columns,
    ];
  }, [columns, enableRowSelection]);

  // Handle search/filter
  const handleFilterChange = (value: string) => {
    if (searchColumn) {
      setGlobalFilter(value);
    }
  };

  // Get pagination state
  const paginationState = table.getState().pagination;
  const pageCount = table.getPageCount();
  const currentPage = paginationState.pageIndex + 1;

  // Generate pagination items
  const getPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

    if (pageCount <= maxVisiblePages) {
      for (let i = 1; i <= pageCount; i++) {
        items.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          items.push(i);
        }
        items.push("ellipsis");
        items.push(pageCount);
      } else if (currentPage >= pageCount - 2) {
        items.push(1);
        items.push("ellipsis");
        for (let i = pageCount - 3; i <= pageCount; i++) {
          items.push(i);
        }
      } else {
        items.push(1);
        items.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          items.push(i);
        }
        items.push("ellipsis");
        items.push(pageCount);
      }
    }

    return items;
  };

  // Get visible columns for dropdown
  const visibleColumns = React.useMemo(() => {
    return columns.filter((col) => col.id !== "select" && col.id !== "actions");
  }, [columns]);

  // Calculate active filters count
  const activeFiltersCount = React.useMemo(() => {
    return columnFilters.length + (globalFilter ? 1 : 0);
  }, [columnFilters, globalFilter]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        {/* Search/Filter */}
        {enableFilters && (
          <div className="flex items-center gap-2 flex-1">
            {searchColumn && (
              <div className="relative max-w-sm flex-1">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={searchPlaceholder}
                  value={globalFilter ?? ""}
                  onChange={(event) => handleFilterChange(event.target.value)}
                  className="pl-10 w-full"
                  aria-label={`Search ${searchPlaceholder}`}
                />
              </div>
            )}

            {/* Active Filters Badge */}
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="gap-1">
                <Filter className="h-3 w-3" />
                {activeFiltersCount} active
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Reset Filters */}
          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="gap-2"
            >
              <FilterX className="h-4 w-4" />
              Reset Filters
            </Button>
          )}

          {/* Column Visibility */}
          {enableColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings2 className="h-4 w-4" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {visibleColumns.map((column: any) => (
                  <DropdownMenuCheckboxItem
                    key={column.id as string}
                    checked={columnVisibility[column.id as string] ?? false}
                    onCheckedChange={(value) =>
                      setColumnVisibility((prev) => ({
                        ...prev,
                        [column.id as string]: value,
                      }))
                    }
                  >
                    {typeof column.header === "string"
                      ? column.header
                      : (column.id as string)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Export */}
          {enableExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          )}

          {/* More Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={resetSorting}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset Sorting
              </DropdownMenuItem>
              <DropdownMenuItem onClick={resetAll}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={saveTableState}>
                <Eye className="mr-2 h-4 w-4" />
                Save View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={loadTableState}>
                <EyeOff className="mr-2 h-4 w-4" />
                Load View
              </DropdownMenuItem>
              {refetch && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={refetch}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Refresh Data
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Bulk Actions */}
      {enableRowSelection && table.getSelectedRowModel().rows.length > 0 && (
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center gap-2 py-2 px-4 bg-muted/50 rounded-md"
          role="region"
          aria-label="Bulk actions"
        >
          <span
            className="text-sm text-muted-foreground w-full sm:w-auto"
            aria-live="polite"
          >
            {table.getSelectedRowModel().rows.length} item
            {table.getSelectedRowModel().rows.length > 1 ? "s" : ""} selected
          </span>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.toggleAllPageRowsSelected(false)}
              className="flex-1 sm:flex-initial"
              aria-label="Clear all selections"
            >
              Clear selection
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup: any) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header: any) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="hover:bg-accent flex h-10 items-center space-x-2 px-2 text-left font-medium"
                        aria-label={`Sort by ${typeof header.column.columnDef.header === "string" ? header.column.columnDef.header : header.id}`}
                        aria-sort={
                          header.column.getIsSorted() === "asc"
                            ? "ascending"
                            : header.column.getIsSorted() === "desc"
                              ? "descending"
                              : "none"
                        }
                      >
                        <span className="flex items-center space-x-2">
                          {typeof header.column.columnDef.header === "function"
                            ? React.createElement(
                                header.column.columnDef
                                  .header as React.ComponentType<any>,
                                header.getContext(),
                              )
                            : (header.column.columnDef
                                .header as React.ReactNode)}
                          {{
                            asc: "↑",
                            desc: "↓",
                          }[header.column.getIsSorted() as string] ?? null}
                        </span>
                      </button>
                    ) : (
                      <div>
                        {typeof header.column.columnDef.header === "function"
                          ? React.createElement(
                              header.column.columnDef
                                .header as React.ComponentType<any>,
                              header.getContext(),
                            )
                          : (header.column.columnDef.header as React.ReactNode)}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  {(columnsWithSelection || columns).map((_, colIndex) => (
                    <TableCell key={`skeleton-${index}-${colIndex}`}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row: any) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={
                    onRowClick ? "cursor-pointer hover:bg-muted/50" : ""
                  }
                  onClick={() => onRowClick && onRowClick(row.original)}
                >
                  {row.getVisibleCells().map((cell: any) => (
                    <TableCell key={cell.id}>
                      {React.createElement(
                        cell.column.columnDef.cell as React.ComponentType<any>,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={(columnsWithSelection || columns).length}
                  className="h-24 text-center"
                >
                  {emptyState || "No results."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {pageCount} (
            {table.getFilteredRowModel().rows.length} total items)
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => table.previousPage()}
                  className={
                    !table.getCanPreviousPage()
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {getPaginationItems().map((item, index) => (
                <PaginationItem key={`page-${index}`}>
                  {item === "ellipsis" ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      isActive={currentPage === item}
                      onClick={() => table.setPageIndex((item as number) - 1)}
                      className="cursor-pointer"
                    >
                      {item}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => table.nextPage()}
                  className={
                    !table.getCanNextPage()
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
