import { Download } from "lucide-react";
import { getDocuments, formatDocTitle } from "@/lib/api";

export default async function Footer() {
  let documents: Awaited<ReturnType<typeof getDocuments>> = [];
  try {
    documents = await getDocuments();
  } catch {
    documents = [];
  }

  return (
    <footer className="border-t border-border-subtle">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-6 py-8">
        {documents.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {documents.map((doc) => (
              <a
                key={doc.id}
                href={doc.file}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-secondary transition-colors hover:text-text-primary"
              >
                <Download size={13} />
                {formatDocTitle(doc.title)}
              </a>
            ))}
          </div>
        )}
        <div className="flex flex-col gap-2 text-sm text-text-secondary sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; {new Date().getFullYear()} Vaultor. All rights reserved.</span>
          <span>Built in the vault.</span>
        </div>
      </div>
    </footer>
  );
}
