export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="[hyphens:auto] [&_p]:text-justify">{children}</div>;
}
