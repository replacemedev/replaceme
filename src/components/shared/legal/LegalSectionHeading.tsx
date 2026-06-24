interface LegalSectionHeadingProps {
  id: string;
  number: number;
  title: string;
}

export function LegalSectionHeading({ id, number, title }: LegalSectionHeadingProps) {
  return (
    <h2
      id={id}
      className="flex items-start gap-3 text-lg sm:text-xl font-bold text-slate-900 mt-10 first:mt-0 mb-4 scroll-mt-28"
    >
      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold shrink-0">
        {number}
      </span>
      <span className="pt-0.5">{title}</span>
    </h2>
  );
}
