import { requireUser, getActiveMediaId } from "@/lib/auth/guards";
import { readWorkspaceCookie } from "@/lib/auth/workspace";
import { isSuperAdmin } from "@/lib/authorization/roles";
import { getAllMedia } from "@/features/media/queries/get-media";
import { getReport, type ReportFilter, type ReportPeriod } from "@/features/dashboard/queries/get-report";
import { ReportFilters } from "@/features/dashboard/components/ReportFilters";
import { ReportTable } from "@/features/dashboard/components/ReportTable";
import { StatsGrid } from "@/features/dashboard/components/StatsGrid";

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

type SearchParams = Promise<{
  mediaId?: string;
  period?: string;
  day?: string;
  month?: string;
  year?: string;
}>;

function parsePeriod(value: string | undefined): ReportPeriod {
  return value === "day" || value === "month" || value === "year" ? value : "month";
}

export default async function ReportsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireUser();
  const superAdmin = isSuperAdmin(user.role);
  const sp = await searchParams;

  const now = new Date();
  const period = parsePeriod(sp.period);
  const year = Number(sp.year) || now.getFullYear();
  const month = Number(sp.month) || now.getMonth() + 1;
  const day = sp.day || now.toISOString().slice(0, 10);

  // Media scope: Super Admin boleh pilih media tertentu atau semua media;
  // selain itu terkunci pada workspace aktif.
  const allMedia = superAdmin ? await getAllMedia() : [];
  let mediaId: number | null;
  if (superAdmin) {
    mediaId = sp.mediaId && sp.mediaId !== "all" ? Number(sp.mediaId) : null;
  } else {
    mediaId = await getActiveMediaId(user, await readWorkspaceCookie());
  }

  const filter: ReportFilter = { mediaId, period, day, month, year };
  const report = await getReport(filter);

  const mediaLabel = superAdmin
    ? mediaId
      ? allMedia.find((m) => m.id === mediaId)?.name ?? "Media"
      : "Semua Media"
    : "Workspace Aktif";

  const periodLabel =
    period === "day" ? day : period === "month" ? `${MONTHS[month - 1]} ${year}` : `Tahun ${year}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Laporan konten per media dan periode.
        </p>
      </div>

      <ReportFilters
        media={allMedia}
        canChooseMedia={superAdmin}
        current={{
          mediaId: mediaId ? String(mediaId) : "all",
          period,
          day,
          month: String(month),
          year: String(year),
        }}
      />

      <StatsGrid stats={{ total: report.total, byStatus: report.byStatus }} />

      <ReportTable report={report} mediaLabel={mediaLabel} periodLabel={periodLabel} />
    </div>
  );
}
