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
}: DataTableProps<TData, TValue>) {
  const {
    table,
    columnFilters,
    setColumnFilters,
    rowSelection,
    setRowSelection,
  } = useDataTable({
    data,
    columns: columns as ColumnDef<TData>[],
    isLoading,
    refetch,
  });

  // Handle row selection changes
  React.useEffect(() => {
    if (enableRowSelection && onSelectRows) {
      const selectedRowsData = table
        .getSelectedRowModel()
        .rows.map(row => row.original);
      onSelectRows(selectedRowsData);
    }
  }, [rowSelection, table, enableRowSelection, onSelectRows]);

  // Add checkbox column if row selection is enabled
  const columnsWithSelection = React.useMemo(() => {
    if (!enableRowSelection) return columns;

    return [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className="translate-y-[2px]"
          />
        ),
        cell: ({ row }) => (
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
      setColumnFilters(
        value
          ? [{ id: searchColumn, value }]
          : []
      );
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

  return (
    <div className={className}>
      {/* Search/Filter */}
      {searchColumn && (
        <div className="flex items-center py-4">
          <input
            placeholder={searchPlaceholder}
            value={(columnFilters.find((filter) => filter.id === searchColumn)?.value as string) ?? ""}
            onChange={(event) => handleFilterChange(event.target.value)}
            className="max-w-sm flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={`Search ${searchPlaceholder}`}
          />
        </div>
      )}

      {/* Bulk Actions */}
      {enableRowSelection && table.getSelectedRowModel().rows.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 py-2 px-4 bg-muted/50 rounded-md mb-4" role="region" aria-label="Bulk actions">
          <span className="text-sm text-muted-foreground w-full sm:w-auto" aria-live="polite">
            {table.getSelectedRowModel().rows.length} item{table.getSelectedRowModel().rows.length > 1 ? 's' : ''} selected
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
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : header.column.getCanSort() ? (
                          <button
                            type="button"
                            onClick={header.column.getToggleSortingHandler()}
                            className="hover:bg-accent flex h-10 items-center space-x-2 px-2 text-left font-medium"
                            aria-label={`Sort by ${typeof header.column.columnDef.header === 'string' ? header.column.columnDef.header : header.id}`}
                            aria-sort={
                              header.column.getIsSorted() === 'asc' ? 'ascending' :
                              header.column.getIsSorted() === 'desc' ? 'descending' : 'none'
                            }
                          >
                            <span className="flex items-center space-x-2">
                              {typeof header.column.columnDef.header === 'function'
                                ? React.createElement(header.column.columnDef.header as React.ComponentType<any>, header.getContext())
                                : header.column.columnDef.header as React.ReactNode
                              }
                              {{
                                asc: "↑",
                                desc: "↓",
                              }[header.column.getIsSorted() as string] ?? null}
                            </span>
                          </button>
                        ) : (
                          <div>
                            {typeof header.column.columnDef.header === 'function'
                              ? React.createElement(header.column.columnDef.header as React.ComponentType<any>, header.getContext())
                              : header.column.columnDef.header as React.ReactNode
                            }
                          </div>
                        )
                    }
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
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {React.createElement(
                        cell.column.columnDef.cell as React.ComponentType<any>,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={(columnsWithSelection || columns).length} className="h-24 text-center">
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
            Page {currentPage} of {pageCount} ({table.getFilteredRowModel().rows.length} total
            items)
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