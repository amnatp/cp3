import * as React from "react";
import { cn } from "@/lib/utils";

function Table({ className, ...props }) {
  return (
    <div data-slot="table-wrapper" className="relative w-full overflow-x-auto">
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

function TableRow({ className, ...props }) {
  return (
    <tr
      data-slot="table-row"
      className={cn("border-b transition-colors hover:bg-muted/50", className)}
      {...props}
    />
  );
}

function TableHead({ className, ...props }) {
  return (
    <th
      data-slot="table-head"
      className={cn("h-10 px-4 text-left align-middle font-semibold whitespace-nowrap", className)}
      {...props}
    />
  );
}

function TableCell({ className, ...props }) {
  return (
    <td
      data-slot="table-cell"
      className={cn("px-4 py-3 align-middle whitespace-nowrap", className)}
      {...props}
    />
  );
}

function TableCaption({ className, ...props }) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  );
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption };
