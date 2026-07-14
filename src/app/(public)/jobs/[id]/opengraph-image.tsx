import { ImageResponse } from "next/og";
import { getPublicJobById } from "@/actions/public/growth";

export const alt = "Replaceme job posting";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getPublicJobById(id);

  const title = job?.title ?? "Remote job on Replaceme";
  const company = job?.companyName ?? "Replaceme";
  const meta = job
    ? `${job.employmentType} · ${job.location}${
        job.monthlySalary > 0
          ? ` · ${job.salaryCurrency} ${job.monthlySalary.toLocaleString()}/mo`
          : ""
      }`
    : "Direct-hire Filipino remote talent marketplace";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a4a29",
          color: "#ffffff",
          padding: "64px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            opacity: 0.85,
          }}
        >
          Replaceme
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              fontSize: title.length > 60 ? 48 : 64,
              fontWeight: 800,
              lineHeight: 1.15,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
          <div style={{ display: "flex", fontSize: 32, fontWeight: 600, opacity: 0.95 }}>
            {company}
          </div>
          <div style={{ display: "flex", fontSize: 24, opacity: 0.8 }}>
            {meta}
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 22, opacity: 0.7 }}>
          Apply directly · No agency fees
        </div>
      </div>
    ),
    { ...size }
  );
}
