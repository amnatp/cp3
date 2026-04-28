import React from "react";
import { MONTH_KEYS, money } from "./spendingData";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

function AmountCell({ value, strong = false }) {
  const amount = Number(value || 0);
  return (
    <TableCell className={`text-right tabular-nums ${strong ? "font-bold text-slate-900" : "text-muted-foreground"}`}>
      {amount ? money(amount) : "-"}
    </TableCell>
  );
}

export default function SpendingTable({
  rows,
  totalRow,
  title = "Detail table",
  firstColumnLabel = "Categories",
}) {
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border bg-card">
      <div className="border-b bg-muted/40 px-4 py-3 text-sm font-semibold">
        {title}
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-900 hover:bg-slate-900">
              <TableHead className="min-w-72 text-white">{firstColumnLabel}</TableHead>
              {MONTH_KEYS.map((m) => (
                <TableHead key={m.key} className="min-w-24 text-right text-white">{m.label}</TableHead>
              ))}
              <TableHead className="min-w-32 border-l border-slate-600 text-right text-white">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.CATEGORIES} className="hover:bg-muted/50">
                <TableCell className="font-semibold text-slate-800">{row.CATEGORIES}</TableCell>
                {MONTH_KEYS.map((m) => (
                  <AmountCell key={m.key} value={row[m.key]} />
                ))}
                <AmountCell value={row.AMOUNT} strong />
              </TableRow>
            ))}
            {totalRow && (
              <TableRow className="bg-slate-100 font-bold hover:bg-slate-100">
                <TableCell>TOTAL</TableCell>
                {MONTH_KEYS.map((m) => (
                  <AmountCell key={m.key} value={totalRow[m.key]} strong />
                ))}
                <AmountCell value={totalRow.AMOUNT} strong />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
