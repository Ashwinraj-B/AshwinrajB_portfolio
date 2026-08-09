import { useRef, useState } from "react";
import { FileText, Image as ImageIcon, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    DOCUMENT_MIME_TYPES,
    IMAGE_MIME_TYPES,
    getPublicUrl,
    removeFile,
    uploadFile,
    validateFile,
} from "@/lib/storage";

type UploadKind = "image" | "document";

interface UploadFieldProps {
    bucket: string;
    /** Path prefix files are stored under, e.g. a row id. */
    folder: string;
    /** Currently stored object path (empty string when nothing is uploaded). */
    value: string;
    onChange: (path: string, meta?: { type: string; size: number }) => void;
    kind?: UploadKind;
    maxSizeMB?: number;
}

export function UploadField({
    bucket,
    folder,
    value,
    onChange,
    kind = "image",
    maxSizeMB,
}: UploadFieldProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const allowedTypes = kind === "document" ? DOCUMENT_MIME_TYPES : IMAGE_MIME_TYPES;
    const sizeLimit = maxSizeMB ?? (kind === "document" ? 10 : 5);
    const publicUrl = value ? getPublicUrl(bucket, value) : "";
    const isPdf = value.toLowerCase().endsWith(".pdf");
    const isImageFile = kind === "image" || (!!value && !isPdf);

    async function handleFile(file: File | null | undefined) {
        if (!file) return;
        try {
            validateFile(file, { maxSizeMB: sizeLimit, allowedTypes });
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Invalid file");
            return;
        }

        setBusy(true);
        const prevPath = value;
        try {
            const path = await uploadFile(bucket, folder, file);
            onChange(path, { type: file.type, size: file.size });
            if (prevPath && prevPath !== path) void removeFile(bucket, prevPath);
            toast.success("Uploaded — click Save to apply");
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Upload failed");
        } finally {
            setBusy(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    }

    function handleRemove() {
        const prevPath = value;
        onChange("", undefined);
        if (prevPath) void removeFile(bucket, prevPath);
        toast.message("Removed — click Save to apply");
    }

    return (
        <div
            onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFile(e.dataTransfer.files?.[0]);
            }}
            className={cn(
                "flex flex-wrap items-center gap-3 rounded-lg border border-dashed p-3 transition-colors",
                dragOver ? "border-primary bg-primary/5" : "border-border",
            )}
        >
            {value && isImageFile ? (
                <img src={publicUrl} alt="" className="h-16 w-16 shrink-0 rounded-md object-cover" />
            ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                    {kind === "document" ? (
                        <FileText className="h-6 w-6" />
                    ) : (
                        <ImageIcon className="h-6 w-6" />
                    )}
                </div>
            )}

            <div className="flex flex-1 flex-wrap items-center gap-2">
                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={busy}
                    onClick={() => inputRef.current?.click()}
                >
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {value ? "Replace" : "Upload"}
                </Button>

                {value ? (
                    <>
                        <a
                            href={publicUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-primary hover:underline"
                        >
                            View
                        </a>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRemove}
                            aria-label="Remove file"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </>
                ) : (
                    <span className="text-xs text-muted-foreground">
                        or drag {kind === "document" ? "a PDF/image" : "an image"} here — max {sizeLimit}MB
                    </span>
                )}
            </div>

            <input
                ref={inputRef}
                type="file"
                accept={allowedTypes.join(",")}
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
            />
        </div>
    );
}