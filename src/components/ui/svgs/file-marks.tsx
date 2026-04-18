import type { SVGProps } from "react";

import { cn } from "@/lib/utils";

type FileMarkProps = SVGProps<SVGSVGElement> & {
  filename: string;
};

function PdfMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none">
      <path d="M6 2.75h8.5L19.25 7.5V20A1.25 1.25 0 0 1 18 21.25H6A1.25 1.25 0 0 1 4.75 20V4A1.25 1.25 0 0 1 6 2.75Z" fill="#FDECEC" stroke="#E11D48" strokeWidth="1.5" />
      <path d="M14.5 2.75V7.5H19.25" stroke="#E11D48" strokeWidth="1.5" />
      <path d="M7.75 16.75c1.2-.42 2.39-1.9 3.08-3.14.78-1.39 1.07-2.8 1.07-3.36 0-.49-.13-.75-.5-.75-.56 0-.85.88-.85 1.62 0 .93.51 2.27 1.16 3.6.71 1.45 1.61 2.78 2.41 3.59.37.37.82.69 1.21.69.31 0 .52-.16.52-.46 0-.82-1.41-1.1-2.42-1.1-1.54 0-3.44.45-5.68 1.6" stroke="#E11D48" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
    </svg>
  );
}

function SheetMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none">
      <path d="M6 2.75h8.5L19.25 7.5V20A1.25 1.25 0 0 1 18 21.25H6A1.25 1.25 0 0 1 4.75 20V4A1.25 1.25 0 0 1 6 2.75Z" fill="#ECFDF3" stroke="#15803D" strokeWidth="1.5" />
      <path d="M14.5 2.75V7.5H19.25" stroke="#15803D" strokeWidth="1.5" />
      <path d="M8 10.25h8M8 13h8M8 15.75h8M10.75 9.5v7M13.5 9.5v7" stroke="#15803D" strokeLinecap="round" strokeWidth="1.3" />
    </svg>
  );
}

function GenericMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none">
      <path d="M6 2.75h8.5L19.25 7.5V20A1.25 1.25 0 0 1 18 21.25H6A1.25 1.25 0 0 1 4.75 20V4A1.25 1.25 0 0 1 6 2.75Z" fill="#F8FAFC" stroke="#475569" strokeWidth="1.5" />
      <path d="M14.5 2.75V7.5H19.25" stroke="#475569" strokeWidth="1.5" />
      <path d="M8 11h8M8 14h8M8 17h5" stroke="#475569" strokeLinecap="round" strokeWidth="1.3" />
    </svg>
  );
}

function FileMark({ filename, className, ...props }: FileMarkProps) {
  const extension = filename.split(".").pop()?.toLowerCase();
  const sharedProps = { className: cn("size-4 shrink-0", className), ...props };

  if (extension === "pdf") return <PdfMark {...sharedProps} />;
  if (extension === "xlsx" || extension === "xls" || extension === "csv") return <SheetMark {...sharedProps} />;

  return <GenericMark {...sharedProps} />;
}

export { FileMark };
