"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { EXAMPLE_SUBMISSION_CONTENT } from "../_content/exampleSubmission";

const EDIT_KEY = "pixl-gabin-edit-2026";

export function ExampleSubmission() {
  const searchParams = useSearchParams();
  const canEdit = searchParams.get("edit") === EDIT_KEY;
  const [content, setContent] = useState(EXAMPLE_SUBMISSION_CONTENT);

  function handleExport() {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "example-submission.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="w-full flex flex-col items-center gap-6 text-black pt-4">
      <h3 className="font-pixel text-2xl md:text-3xl text-center">Example Submission</h3>

      {canEdit ? (
        <>
          <p className="text-black/60 text-sm font-sans">
            Edit mode. Nobody else sees this, and nothing is saved automatically, export when you're done and paste it into the code.
          </p>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full max-w-3xl h-[60vh] border-2 border-black bg-white p-4 font-sans text-base focus:outline-none"
          />
          <button
            onClick={handleExport}
            className="px-5 py-2 bg-[#ec3750] text-white border-black border-r-8 border-t-2 border-l-2 hover:border-b-12 border-b-8 transition-all cursor-pointer"
          >
            Export
          </button>
        </>
      ) : (
        <div className="w-full max-w-3xl border-2 border-black bg-white p-6 font-sans text-base leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
      )}
    </div>
  );
}
