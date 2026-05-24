/* eslint-disable react/prop-types */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthFetch } from "@/lib/useAuthFetch";
import { apiErrorMessage, cn } from "@/lib/utils";
import { formatDate } from "./shipmentsData";

const DOCUMENT_TYPES = [
  { key: "invoice", label: "Invoice" },
  { key: "packing-list", label: "Packing List" },
];

export default function ShipmentDocumentsPanel({ shipmentId, compact = false }) {
  const authFetch = useAuthFetch();
  const inputRefs = useRef({});
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingType, setUploadingType] = useState("");
  const [downloadingId, setDownloadingId] = useState("");
  const [error, setError] = useState("");

  const loadDocuments = useCallback(async () => {
    if (!shipmentId) return;
    setLoading(true);
    setError("");
    try {
      const encodedShipmentId = encodeURIComponent(shipmentId);
      const res = await authFetch(`/api/shipments/${encodedShipmentId}/documents`);
      if (!res.ok) throw Object.assign(new Error("fetch"), { status: res.status });
      const data = await res.json();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [authFetch, shipmentId]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const uploadDocument = useCallback(async (documentType, file) => {
    if (!file || !shipmentId) return;

    setUploadingType(documentType);
    setError("");
    try {
      const encodedShipmentId = encodeURIComponent(shipmentId);
      const encodedType = encodeURIComponent(documentType);
      const formData = new FormData();
      formData.append("file", file);

      const res = await authFetch(`/api/shipments/${encodedShipmentId}/documents/${encodedType}`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const message = await res.text();
        throw Object.assign(new Error(message || "upload"), { status: res.status });
      }

      await loadDocuments();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setUploadingType("");
    }
  }, [authFetch, shipmentId, loadDocuments]);

  const downloadDocument = useCallback(async (doc) => {
    if (!doc?.id || !shipmentId) return;
    setDownloadingId(doc.id);
    setError("");
    try {
      const encodedShipmentId = encodeURIComponent(shipmentId);
      const encodedDocumentId = encodeURIComponent(doc.id);
      const res = await authFetch(`/api/shipments/${encodedShipmentId}/documents/${encodedDocumentId}/download`);
      if (!res.ok) throw Object.assign(new Error("download"), { status: res.status });

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = doc.fileName || "document";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setDownloadingId("");
    }
  }, [authFetch, shipmentId]);

  let documentContent = <div className="px-3 py-3 text-xs text-slate-500">Loading documents...</div>;
  if (!loading && documents.length === 0) {
    documentContent = <div className="px-3 py-3 text-xs text-slate-500">No documents uploaded yet.</div>;
  }
  if (!loading && documents.length > 0) {
    documentContent = (
      <div className="divide-y divide-slate-100">
        {documents.map((doc) => (
          <div key={doc.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-xs">
            <div className="min-w-0">
              <div className="break-all font-medium text-slate-900">{doc.fileName}</div>
              <div className="mt-0.5 text-slate-500">
                {doc.type === "packing-list" ? "Packing List" : "Invoice"}
                {doc.uploadedAt ? ` • ${formatDate(doc.uploadedAt)}` : ""}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={downloadingId === doc.id}
              onClick={() => downloadDocument(doc)}
            >
              <Download className="h-3.5 w-3.5" />
              {downloadingId === doc.id ? "Downloading..." : "Download"}
            </Button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn(
      "mt-4 border border-slate-200 bg-slate-50/80 shadow-sm",
      compact ? "rounded-xl p-3" : "rounded-2xl p-4"
    )}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Shipment Documents</div>
          <div className="mt-1 text-xs text-slate-600">Upload invoice and packing list files for this shipment.</div>
        </div>
        <div className="flex flex-wrap gap-2">
          {DOCUMENT_TYPES.map((docType) => (
            <div key={docType.key}>
              <input
                ref={(el) => { inputRefs.current[docType.key] = el; }}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) uploadDocument(docType.key, file);
                }}
              />
              <Button
                variant="navy"
                size="sm"
                disabled={uploadingType === docType.key}
                onClick={() => inputRefs.current[docType.key]?.click()}
                className="gap-1.5"
              >
                <Upload className="h-3.5 w-3.5" />
                {uploadingType === docType.key ? `Uploading ${docType.label}...` : `Upload ${docType.label}`}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {error && <div className="mt-3 text-xs text-red-600">{error}</div>}

      <div className="mt-3 rounded-xl border border-slate-200 bg-white">
        {documentContent}
      </div>
    </div>
  );
}