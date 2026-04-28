import React from "react";
import { effectivePct, fmtPct, fmtNum, getPctColor, parsePct } from "./kpiUtils";

const cx = (...xs) => xs.filter(Boolean).join(" ");

function SectionHeaderRow({ label, colCount }) {
  return (
    <tr>
      <td
        colSpan={colCount}
        className="border-b border-t border-slate-200 bg-sky-50 px-3 py-1.5 text-xs font-bold italic underline text-sky-800"
      >
        {label}
      </td>
    </tr>
  );
}

function PctBadge({ n, target }) {
  const color = getPctColor(n, target);
  if (n === null || n === undefined) return <span className="text-slate-400 text-xs">—</span>;
  return (
    <span
      className="inline-block rounded-md px-1.5 py-0.5 text-[11px] font-black text-white tabular-nums"
      style={{ backgroundColor: color }}
    >
      {fmtPct(n)}
    </span>
  );
}

function DataCells({ d, isCategory, targetKpi }) {
  const n = effectivePct(d?.pct);
  return (
    <>
      <td className={cx("px-2 py-1.5 text-center tabular-nums text-xs border-r border-slate-100", isCategory && "font-semibold")}>
        {fmtNum(d?.total)}
      </td>
      <td className={cx("px-2 py-1.5 text-center tabular-nums text-xs border-r border-slate-100", (d?.missed ?? 0) > 0 ? "text-red-600 font-semibold" : "text-slate-400")}>
        {fmtNum(d?.missed)}
      </td>
      <td className="px-2 py-1.5 text-center border-r-2 border-slate-200">
        {d ? <PctBadge n={n} target={targetKpi} /> : <span className="text-slate-300 text-xs">—</span>}
      </td>
    </>
  );
}

function YtdCells({ total, missed, pct, isCategory, targetKpi }) {
  const n = effectivePct(pct);
  return (
    <>
      <td className={cx("px-2 py-1.5 text-center tabular-nums text-xs border-r border-slate-100 bg-amber-50/40", isCategory && "font-semibold")}>
        {fmtNum(total)}
      </td>
      <td className={cx("px-2 py-1.5 text-center tabular-nums text-xs border-r border-slate-100 bg-amber-50/40", (missed ?? 0) > 0 ? "text-red-600 font-semibold" : "text-slate-400")}>
        {fmtNum(missed)}
      </td>
      <td className="px-2 py-1.5 text-center bg-amber-50/40">
        {total !== null ? <PctBadge n={n} target={targetKpi} /> : <span className="text-slate-300 text-xs">—</span>}
      </td>
    </>
  );
}

export default function KpiTable({
  rows,
  monthCols,
  year,
  avgRow,
  avgYtd,
  loading,
  error,
  totalColCount,
  ytdLabel,
}) {
  return (
    <div className={cx("mt-5 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm", loading && "opacity-50 pointer-events-none")}>
      {error && (
        <div className="px-4 py-3 text-xs text-red-600 bg-red-50 border-b border-red-100">
          Failed to load data: {error}
        </div>
      )}
      <table
        className="w-full border-collapse text-sm"
        style={{ minWidth: 380 + monthCols.length * 180 + 180 }}
      >
        <thead>
          <tr className="bg-slate-700 text-white text-xs">
            <th
              rowSpan={2}
              className="border-r border-slate-600 px-3 py-2 text-left font-semibold align-bottom"
              style={{ minWidth: 280 }}
            >
              KPI Criterion
            </th>
            <th
              rowSpan={2}
              className="border-r border-slate-600 px-2 py-2 text-center font-semibold align-bottom whitespace-nowrap"
              style={{ minWidth: 80 }}
            >
              KPI (Days)
            </th>
            <th
              rowSpan={2}
              className="border-r-2 border-slate-500 px-2 py-2 text-center font-semibold align-bottom whitespace-nowrap"
              style={{ minWidth: 80 }}
            >
              Target KPI
            </th>
            {monthCols.map((col) => (
              <th
                key={col.key}
                colSpan={3}
                className="border-r-2 border-slate-500 px-2 py-2 text-center font-bold tracking-wide"
              >
                {col.label} &apos;{String(year).slice(2)}
              </th>
            ))}
            <th colSpan={3} className="bg-amber-700/80 px-2 py-2 text-center font-bold tracking-wide">
              {ytdLabel ?? `YTD ${year}`}
            </th>
          </tr>
          <tr className="bg-slate-600 text-white text-[10px] uppercase tracking-wide">
            {monthCols.map((col) => (
              <React.Fragment key={col.key}>
                <th className="border-r border-slate-500 px-2 py-1.5 text-center w-14">Total</th>
                <th className="border-r border-slate-500 px-2 py-1.5 text-center w-14">Missed</th>
                <th className="border-r-2 border-slate-400 px-2 py-1.5 text-center w-14">%</th>
              </React.Fragment>
            ))}
            <th className="border-r border-slate-500 bg-amber-800/60 px-2 py-1.5 text-center w-14">Total</th>
            <th className="border-r border-slate-500 bg-amber-800/60 px-2 py-1.5 text-center w-14">Missed</th>
            <th className="bg-amber-800/60 px-2 py-1.5 text-center w-14">%</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {rows.map((row, ri) => {
            if (row.type === "section") {
              return <SectionHeaderRow key={ri} label={row.label} colCount={totalColCount} />;
            }

            const isCategory = row.type === "category";

            return (
              <tr
                key={ri}
                className={cx(
                  "transition-colors",
                  isCategory ? "bg-amber-50/70 hover:bg-amber-50" : "hover:bg-slate-50/60"
                )}
              >
                <td
                  className={cx(
                    "border-r border-slate-200 py-1.5 leading-snug",
                    isCategory
                      ? "px-3 text-xs font-bold text-amber-900"
                      : "pl-8 pr-3 text-xs italic text-slate-500"
                  )}
                >
                  {row.label}
                </td>

                <td className={cx(
                  "border-r border-slate-200 px-2 py-1.5 text-center text-xs tabular-nums",
                  isCategory ? "font-semibold text-slate-700" : "text-slate-400"
                )}>
                  {row.kpiDays}
                </td>

                <td className={cx(
                  "border-r-2 border-slate-300 px-2 py-1.5 text-center text-xs tabular-nums font-semibold",
                  isCategory ? "text-sky-700" : "text-slate-300"
                )}>
                  {row.targetKpi}
                </td>

                {row.monthData.map((d, ci) => (
                  <DataCells key={monthCols[ci].key} d={d} isCategory={isCategory} targetKpi={row.targetKpi} />
                ))}

                <YtdCells
                  total={row.ytdTotal}
                  missed={row.ytdMissed}
                  pct={row.ytdPct}
                  isCategory={isCategory}
                  targetKpi={row.targetKpi}
                />
              </tr>
            );
          })}
        </tbody>

        <tfoot>
          <tr className="border-t-2 border-slate-300 bg-slate-700 text-white">
            <td className="px-3 py-2 text-xs font-bold border-r border-slate-600">Average KPI</td>
            <td className="border-r border-slate-600" />
            <td className="border-r-2 border-slate-500" />
            {avgRow.map((avg, ci) => (
              <React.Fragment key={monthCols[ci].key}>
                <td className="border-r border-slate-600" />
                <td className="border-r border-slate-600" />
                <td className="px-2 py-2 text-center border-r-2 border-slate-500">
                  <PctBadge n={avg} target="98%" />
                </td>
              </React.Fragment>
            ))}
            <td className="border-r border-slate-600 bg-amber-900/40" />
            <td className="border-r border-slate-600 bg-amber-900/40" />
            <td className="px-2 py-2 text-center bg-amber-900/40">
              <PctBadge n={avgYtd} target="98%" />
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
