import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./Card";

export default function Panel({ title, right, children }) {
  return (
    <Card className="gap-0 py-0 overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader
        className="flex-row items-center justify-between gap-3 border-b px-4 py-3 rounded-t-xl"
        style={{ background: "linear-gradient(90deg, #f8fafc 0%, #ffffff 100%)" }}
      >
        <div className="flex items-center gap-2">
          <div className="h-4 w-1 rounded-full bg-wice-red" />
          <CardTitle className="text-sm font-bold text-slate-800">{title}</CardTitle>
        </div>
        {right}
      </CardHeader>
      <CardContent className="p-4">{children}</CardContent>
    </Card>
  );
}
