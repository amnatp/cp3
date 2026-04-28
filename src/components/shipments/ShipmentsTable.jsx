import React, { useState, useCallback, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getExpandedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { formatDate, serviceIcon } from "./shipmentsData";
import AirShipmentTimeline from "./AirShipmentTimeline";
import SeaShipmentTracking from "./SeaShipmentTracking";
import CrossBorderTracking from "./CrossBorderTracking";
import { useAuthFetch } from "@/lib/useAuthFetch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ChevronDown, ChevronRight, ChevronUp, ChevronsUpDown, ChevronLeft, Package, FileText, MapPin, Clock, Tag, Users, Building2, Boxes } from "lucide-react";

const STAGE_DONE = new Set(["Delivered", "POD", "Billed"]);

function StatusBadge({ status }) {
  const variant =
    status === "Delayed"           ? "danger"
    : status === "In Customs"      ? "warning"
    : STAGE_DONE.has(status)       ? "success"
    : "info";
  return <Badge variant={variant}>{status}</Badge>;
}

function SortIcon({ column }) {
  const sort = column.getIsSorted();
  if (sort === "asc") return <ChevronUp className="ml-1 inline h-4 w-4" />;
  if (sort === "desc") return <ChevronDown className="ml-1 inline h-4 w-4" />;
  if (column.getCanSort()) return <ChevronsUpDown className="ml-1 inline h-3.5 w-3.5 opacity-40" />;
  return null;
}

function DetailItem({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 rounded-md bg-muted p-1.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">{label}</div>
        <div className="mt-0.5 text-sm font-medium text-foreground">{children}</div>
      </div>
    </div>
  );
}

function ExpandedDetail({ row, onStageChange }) {
  const s = row.original;
  return (
    <div className="border-l-4 border-wice-red/60 bg-gradient-to-r from-orange-50/40 to-transparent px-6 py-5 text-sm">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
        <DetailItem icon={FileText} label="Job No">{s.id}</DetailItem>
        <DetailItem icon={Package} label="Job Type">{s.jobType}</DetailItem>
        <DetailItem icon={MapPin} label="Direction">{s.importOrExport}</DetailItem>
        <DetailItem icon={Tag} label="Customs Status">{s.customsStatus ?? "N/A"}</DetailItem>
        <DetailItem icon={Building2} label="Shipper">{s.shipperName || "-"}</DetailItem>
        <DetailItem icon={Users} label="Consignee">{s.consigneeName || "-"}</DetailItem>
        <DetailItem icon={Boxes} label="Commodity">{s.commodity || "-"}</DetailItem>
        <DetailItem icon={Clock} label="Created">{formatDate(s.createdDateTime)}</DetailItem>
      </div>
      {(s.refs || []).length > 0 && (
        <div className="mt-4 pt-3 border-t border-border/50">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70 mb-2">References</div>
          <div className="flex flex-wrap gap-1.5">
            {s.refs.map((r, i) => (
              <span key={i} className="inline-flex items-center rounded-full border border-border/80 bg-white px-2.5 py-0.5 text-xs font-medium text-foreground shadow-sm">
                {r}
              </span>
            ))}
          </div>
        </div>
      )}

      {s.service === "AIR" && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70 mb-3">Shipment Timeline</div>
          <AirShipmentTimeline
            pickupDate={s.pickupDate}
            customsClearDate={s.customsClearDate}
            etd={s.etd}
            atd={s.atd}
            eta={s.eta}
            ata={s.ata}
            releaseDoDate={s.releaseDoDate}
            importCustomsDate={s.importCustomsDate}
            deliveredDate={s.deliveredDate}
            importOrExport={s.importOrExport}
          />
        </div>
      )}

      {s.service === "SEA" && (s.awbBlNo || s.refs?.find(r => r.startsWith("BK"))) && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70 mb-3">Realtime Ocean Tracking</div>
          <SeaShipmentTracking
            blNo={s.oblNo || s.awbBlNo}
            bookingNo={s.refs?.find(r => r.startsWith("BK"))?.replace(/^BK:\s*/i, "")}
            sealine={s.sealine}
          />
        </div>
      )}

      {s.service === "CROSS_BORDER" && s.awbBlNo && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70 mb-3">Realtime Cross-border Tracking</div>
          <CrossBorderTracking bookingCode={s.awbBlNo} onStageChange={onStageChange} />
        </div>
      )}
    </div>
  );
}

const columns = [
  {
    id: "expander",
    size: 36,
    minSize: 36,
    maxSize: 36,
    enableSorting: false,
    enableResizing: false,
    header: () => null,
    cell: ({ row }) => (
      <button
        onClick={row.getToggleExpandedHandler()}
        className="p-1 rounded-md transition-all duration-200 hover:bg-wice-red/10 hover:text-wice-red"
      >
        <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${row.getIsExpanded() ? "rotate-90" : ""}`} />
      </button>
    ),
  },
  {
    accessorKey: "awbBlNo",
    header: "AWB / BL #",
    size: 180,
    minSize: 120,
    cell: ({ getValue }) => <div className="font-semibold text-wice-blue">{getValue() || "-"}</div>,
  },
  {
    accessorKey: "customerRef",
    header: "Customer Ref",
    size: 120,
    minSize: 80,
  },
  {
    accessorKey: "service",
    header: "Service",
    size: 130,
    minSize: 100,
    cell: ({ row }) => {
      const s = row.original;
      return (
        <div className="flex items-center gap-2">
          {serviceIcon(s.service)}
          <div>
            <div className="font-medium">
              {s.service === "CROSS_BORDER" ? "Cross-border" : s.service}
            </div>
            {s.importOrExport && (
              <div className="text-xs text-muted-foreground">{s.importOrExport}</div>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 130,
    minSize: 100,
    cell: ({ row, table }) => {
      const s = row.original;
      const liveStage = s.service === "CROSS_BORDER" && s.awbBlNo
        ? table.options.meta?.cbStages?.[s.awbBlNo]
        : null;
      const displayStatus = liveStage === "POD" ? "Delivered" : (liveStage ?? s.status);
      return (
        <div>
          <StatusBadge status={displayStatus} />
          {s.customsStatus && s.customsStatus !== "N/A" && (
            <div className="mt-1 text-xs text-muted-foreground">Customs: {s.customsStatus}</div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "origin",
    header: "Origin",
    size: 160,
    minSize: 100,
    cell: ({ getValue }) => <span className="text-muted-foreground whitespace-normal">{getValue()}</span>,
  },
  {
    accessorKey: "destination",
    header: "Destination",
    size: 160,
    minSize: 100,
    cell: ({ getValue }) => <span className="text-muted-foreground whitespace-normal">{getValue()}</span>,
  },
  {
    accessorKey: "eta",
    header: "ETA",
    size: 100,
    minSize: 80,
    cell: ({ getValue }) => <span className="text-muted-foreground">{formatDate(getValue())}</span>,
    sortingFn: "datetime",
  },
];

export default function ShipmentsTable({ rows }) {
  const authFetch = useAuthFetch();
  const [sorting, setSorting] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [columnSizing, setColumnSizing] = useState({});
  const [cbStages, setCbStages] = useState({}); // bookingCode → ETL stage

  const handleStageChange = useCallback((bookingCode, stage) => {
    setCbStages((prev) => prev[bookingCode] === stage ? prev : { ...prev, [bookingCode]: stage });
  }, []);

  // Prefetch ETL stage for all cross-border rows so the status badge is correct without expanding
  useEffect(() => {
    const crossBorderRows = (rows ?? []).filter(
      (r) => r.service === "CROSS_BORDER" && r.awbBlNo
    );
    if (crossBorderRows.length === 0) return;
    let cancelled = false;

    crossBorderRows.forEach((r) => {
      const params = new URLSearchParams({ bookingCode: r.awbBlNo });
      authFetch(`/api/shipments/cross-track?${params}`)
        .then((res) => res.ok ? res.json() : null)
        .then((d) => {
          if (!cancelled && d?.stage)
            setCbStages((prev) => ({ ...prev, [r.awbBlNo]: d.stage }));
        })
        .catch(() => {});
    });

    return () => { cancelled = true; };
  }, [rows, authFetch]);

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, columnVisibility, columnSizing },
    meta: { cbStages, handleStageChange },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    columnResizeMode: "onChange",
    initialState: {
      pagination: { pageSize: 50 },
    },
  });

  const colCount = table.getVisibleFlatColumns().length;

  return (
    <div className="hidden lg:block mt-4 overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="border-b bg-muted/40 px-4 py-3 flex items-center justify-between">
        <span className="text-sm font-semibold">Shipments</span>
        {/* Column visibility toggles */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground mr-1">Columns:</span>
          {table.getAllLeafColumns()
            .filter((c) => c.id !== "expander")
            .map((col) => (
              <label key={col.id} className="inline-flex items-center gap-1 text-xs cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={col.getIsVisible()}
                  onChange={col.getToggleVisibilityHandler()}
                  className="h-3 w-3 rounded border-gray-300"
                />
                {typeof col.columnDef.header === "string" ? col.columnDef.header : col.id}
              </label>
            ))}
        </div>
      </div>

      <Table className="w-full table-fixed">
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id} className="bg-wice-blue hover:bg-wice-blue">
              {hg.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="text-white relative"
                  style={{ width: `${(header.getSize() / table.getCenterTotalSize()) * 100}%` }}
                >
                  {header.isPlaceholder ? null : (
                    <div
                      className={header.column.getCanSort() ? "cursor-pointer select-none" : ""}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      <SortIcon column={header.column} />
                    </div>
                  )}
                  {/* Column resize handle */}
                  {header.column.getCanResize() && (
                    <div
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      className="absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none hover:bg-white/40"
                    />
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <React.Fragment key={row.id}>
              <TableRow className={`transition-colors ${row.getIsExpanded() ? "bg-orange-50/40" : "even:bg-muted/30 hover:bg-muted/50"}`}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} style={{ width: `${(cell.column.getSize() / table.getCenterTotalSize()) * 100}%` }} className="overflow-hidden text-ellipsis">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
              {row.getIsExpanded() && (
                <tr>
                  <td colSpan={colCount}>
                    <ExpandedDetail row={row} onStageChange={table.options.meta?.handleStageChange} />
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
          {table.getRowModel().rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={colCount} className="py-8 text-center text-muted-foreground">
                No shipments match your filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between border-t bg-muted/20 px-4 py-3 text-sm">
          <span className="text-muted-foreground">
            Page <span className="font-semibold text-foreground">{table.getState().pagination.pageIndex + 1}</span> of {table.getPageCount()}
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="gap-1">
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <Button size="sm" variant="outline" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="gap-1">
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
