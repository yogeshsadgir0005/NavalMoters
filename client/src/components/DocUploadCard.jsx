import { useEffect, useMemo, useState } from "react";
import API from "../api/axios";

const Icons = {
  File: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Eye: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  Upload: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
  ExternalLink: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>,
  X: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
};

const isImage = (name = "") => /\.(png|jpg|jpeg|webp|gif)$/i.test(name);
const isPdf = (name = "") => /\.pdf$/i.test(name);

export default function DocUploadCard({
  title,
  required,
  employeeId,
  fileKey,
  uploadedValue,
  multiple = false,
  onPickFiles,
}) {
  const [open, setOpen] = useState(false);

  const [loadingMap, setLoadingMap] = useState({});
  const [errorMap, setErrorMap] = useState({});
  const [blobUrlMap, setBlobUrlMap] = useState({});

  const files = useMemo(() => {
    if (!uploadedValue) return [];
    return Array.isArray(uploadedValue) ? uploadedValue : [uploadedValue];
  }, [uploadedValue]);

  const fileApiPath = (filename) =>
    `/files/employee/${employeeId}/${filename}`;

  useEffect(() => {
    if (!open) {
      Object.values(blobUrlMap || {}).forEach((u) => { try { URL.revokeObjectURL(u); } catch {} });
      setBlobUrlMap({}); setLoadingMap({}); setErrorMap({});
    }
  }, [open]);

  useEffect(() => {
    if (!open || !employeeId || !files.length) return;
    let cancelled = false;

    const fetchOne = async (filename) => {
      try {
        setLoadingMap((p) => ({ ...p, [filename]: true }));
        setErrorMap((p) => ({ ...p, [filename]: "" }));
        const res = await API.get(fileApiPath(filename), { responseType: "blob" });
        if (cancelled) return;
        const blobUrl = URL.createObjectURL(res.data);
        setBlobUrlMap((p) => ({ ...p, [filename]: blobUrl }));
      } catch (e) {
        if (cancelled) return;
        const msg = e?.response?.data?.message || e?.response?.statusText || e?.message || "Failed to load file";
        setErrorMap((p) => ({ ...p, [filename]: msg }));
      } finally {
        if (cancelled) return;
        setLoadingMap((p) => ({ ...p, [filename]: false }));
      }
    };

    files.forEach((f) => fetchOne(f));
    return () => { cancelled = true; };
  }, [open, employeeId, files.join("|")]);

  const openBlobInNewTab = (filename) => {
    const url = blobUrlMap[filename];
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <div className="p-4 md:p-5 rounded-xl border border-slate-200 bg-white shadow-sm hover:border-blue-300 transition-all group">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0 flex-1">
            <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Icons.File />
              <span className="truncate">{title}</span> 
              {required && <span className="text-rose-500 font-black shrink-0">*</span>}
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {files.length > 0 ? (
                files.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setOpen(true)}
                    className="px-2 py-0.5 rounded-md border border-slate-200 bg-slate-50 hover:bg-white text-[10px] font-bold text-slate-600 truncate max-w-full sm:max-w-[150px] transition-colors"
                    title="Click to preview"
                  >
                    {f}
                  </button>
                ))
              ) : (
                <div className="text-xs text-slate-400 italic font-medium">No files uploaded.</div>
              )}
            </div>
          </div>

          {files.length > 0 && (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="p-2 shrink-0 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
            >
              <Icons.Eye />
            </button>
          )}
        </div>

        <div className="relative">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
            {multiple ? "Update Files" : "Update File"}
          </label>
          <input
            className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer bg-slate-50 rounded-lg border border-slate-100"
            type="file"
            multiple={multiple}
            onChange={(e) => {
              const picked = multiple ? Array.from(e.target.files || []) : e.target.files?.[0] || null;
              onPickFiles(picked);
            }}
          />
        </div>
      </div>

      {open && files.length > 0 && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-4xl rounded-2xl overflow-hidden border border-slate-100 shadow-2xl flex flex-col h-[95vh] md:h-auto md:max-h-[90vh]">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-xs flex items-center gap-2 truncate pr-4">
                <Icons.Eye /> {title} Preview
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors shrink-0"
              >
                <Icons.X />
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-6 overflow-y-auto bg-slate-100 custom-scrollbar">
              {files.map((f) => {
                const loading = !!loadingMap[f];
                const err = errorMap[f];
                const blobUrl = blobUrlMap[f];

                return (
                  <div key={f} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between gap-4">
                      <div className="text-[10px] md:text-xs font-bold text-slate-600 break-all">{f}</div>
                      <button
                        type="button"
                        onClick={() => openBlobInNewTab(f)}
                        disabled={!blobUrl}
                        className={`text-[10px] md:text-xs shrink-0 font-bold flex items-center gap-1 ${
                          blobUrl ? "text-blue-600 hover:text-blue-800" : "text-slate-300 cursor-not-allowed"
                        }`}
                      >
                        <Icons.ExternalLink /> Open
                      </button>
                    </div>

                    <div className="p-3 md:p-4 bg-slate-50/50 min-h-[200px] flex items-center justify-center">
                      {loading && <div className="text-xs font-bold text-slate-400 animate-pulse">Decrypting file...</div>}
                      {!loading && err && <div className="text-xs font-bold text-rose-500">Error: {err}</div>}
                      {!loading && !err && blobUrl && (
                        <>
                          {isImage(f) && <img src={blobUrl} alt={f} className="max-h-[400px] md:max-h-[520px] w-full object-contain rounded shadow-sm" />}
                          {isPdf(f) && <iframe title={f} src={blobUrl} className="w-full h-[60vh] md:h-[520px] rounded border border-slate-200" />}
                          {!isImage(f) && !isPdf(f) && (
                            <div className="text-[10px] md:text-xs font-medium text-slate-500 bg-white px-4 py-2 rounded border border-slate-200 text-center">
                              Preview not available. Use "Open" button.
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}