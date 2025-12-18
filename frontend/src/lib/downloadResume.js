const normalizeDriveUrl = (url = "") => {
  if (!url) return "";
  if (url.includes("drive.google.com")) {
    const idMatch = url.match(/[-\w]{25,}/);
    if (idMatch?.[0]) {
      return `https://drive.google.com/uc?export=download&id=${idMatch[0]}`;
    }
  }
  return url;
};

const normalizeCloudinaryUrl = (url = "") => {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);
    const uploadIdx = parts.indexOf("upload");
    // Inject attachment transformation so Cloudinary serves a download
    if (uploadIdx !== -1 && parts[uploadIdx + 1] !== "fl_attachment") {
      parts.splice(uploadIdx + 1, 0, "fl_attachment");
      parsed.pathname = `/${parts.join("/")}`;
    }
    return parsed.toString();
  } catch (_err) {
    return url;
  }
};

const inferExtension = (mime = "", url = "") => {
  if (mime.includes("pdf")) return "pdf";
  if (mime.includes("wordprocessingml")) return "docx";
  if (mime.includes("msword")) return "doc";
  const urlExt = (() => {
    try {
      const pathname = new URL(url).pathname;
      const last = pathname.split("/").filter(Boolean).pop() || "";
      const parts = last.split(".");
      if (parts.length > 1) return parts.pop();
    } catch (_err) {
      // ignore parse issues
    }
    return null;
  })();
  return urlExt || "pdf";
};

const resolveFileLabel = ({ applicantName = "", fileLabel = "", url = "" }) => {
  // Prefer explicit label, then applicant name, else last segment of URL, else "resume"
  if (fileLabel?.trim()) return fileLabel;
  if (applicantName?.trim()) return applicantName;
  const fromUrl = (() => {
    try {
      const pathname = new URL(url).pathname;
      const last = pathname.split("/").filter(Boolean).pop() || "";
      return last.split(".")[0] || "";
    } catch (_err) {
      return "";
    }
  })();
  return fromUrl || "resume";
};

const buildDownloadName = ({ applicantName = "", fileLabel = "", url = "", mime = "" }) => {
  const label = resolveFileLabel({ applicantName, fileLabel, url });
  const sanitizedName = (label || "resume")
    .replace(/[^a-z0-9-_]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const ext = inferExtension(mime, url);
  return `${sanitizedName || "resume"}.${ext}`;
};

/**
 * Fetches the resume URL as a blob and forces a download in the browser.
 * Falls back to opening the URL if the fetch is blocked (e.g., CORS).
 */
export const downloadResumeFile = async ({
  url,
  applicantName = "",
  fileLabel = "",
  toast,
}) => {
  const normalizedUrl = normalizeCloudinaryUrl(normalizeDriveUrl(url));
  if (!normalizedUrl) {
    throw new Error("Resume URL is missing");
  }

  try {
    const response = await fetch(normalizedUrl);
    if (!response.ok) {
      throw new Error("Unable to fetch resume");
    }

    const blob = await response.blob();
    const fileName = buildDownloadName({
      applicantName,
      fileLabel,
      url: normalizedUrl,
      mime: blob.type,
    });
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
    return true;
  } catch (err) {
    // If fetch fails due to CORS, at least open the link in a new tab.
    window.open(normalizedUrl, "_blank", "noopener,noreferrer");
    if (toast) {
      toast({
        title: "Download issue",
        description:
          "Tried to fetch the resume for download but fell back to opening it in a new tab.",
      });
    }
    throw err;
  }
};
