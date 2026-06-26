"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  TextInput,
} from "flowbite-react";
import Link from "next/link";
import { HiArrowLeft, HiDownload } from "react-icons/hi";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { reportService } from "@/lib/api/services/report.service";
import type { ReportItem } from "@/types";

const months = [
  { key: "jan", value: 1 }, { key: "feb", value: 2 }, { key: "mar", value: 3 },
  { key: "apr", value: 4 }, { key: "mei", value: 5 }, { key: "jun", value: 6 },
  { key: "jul", value: 7 }, { key: "agu", value: 8 }, { key: "sep", value: 9 },
  { key: "okt", value: 10 }, { key: "nov", value: 11 }, { key: "des", value: 12 },
];

export default function ReportPage() {
  const { t } = useTranslation();
  const { userData } = useAuth();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [downloading, setDownloading] = useState<number | null>(null);

  const loadReports = useCallback(async () => {
    if (!userData?.stasiun_id) return;
    setLoading(true);
    try {
      const res = await reportService.getList(userData.stasiun_id);
      const data = res as { data?: ReportItem[] } | ReportItem[];
      setReports(Array.isArray(data) ? data : (data.data ?? []));
    } finally {
      setLoading(false);
    }
  }, [userData?.stasiun_id]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      const date = new Date(r.date);
      const matchMonth = date.getMonth() + 1 === selectedMonth;
      const matchSearch =
        !search ||
        r.stasiun?.stasiun_name?.toLowerCase().includes(search.toLowerCase()) ||
        r.created_by?.username?.toLowerCase().includes(search.toLowerCase());
      return matchMonth && matchSearch;
    });
  }, [reports, selectedMonth, search]);

  const handleDownload = async (id: number) => {
    setDownloading(id);
    try {
      const blob = await reportService.downloadPdf(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button as={Link} href="/checklist" color="light" size="sm">
          <HiArrowLeft className="mr-2 h-4 w-4" />
          {t("kembali")}
        </Button>
        <PageHeader title={t("manage_report_title")} showStation={false} />
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row">
          <TextInput
            className="flex-1"
            placeholder={t("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {months.map((m) => (
            <Button
              key={m.value}
              size="xs"
              color={selectedMonth === m.value ? "primary" : "light"}
              onClick={() => setSelectedMonth(m.value)}
            >
              {t(m.key)}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : filtered.length === 0 ? (
          <p className="py-6 text-center text-gray-500 dark:text-gray-400">
            {t("Data laporan tidak ditemukan")}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table hoverable>
              <TableHead>
                <TableHeadCell>{t("date")}</TableHeadCell>
                <TableHeadCell>{t("location")}</TableHeadCell>
                <TableHeadCell>OK</TableHeadCell>
                <TableHeadCell>NOT OK</TableHeadCell>
                <TableHeadCell>{t("created")}</TableHeadCell>
                <TableHeadCell>PDF</TableHeadCell>
              </TableHead>
              <TableBody>
                {filtered.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{report.date}</TableCell>
                    <TableCell>{report.stasiun?.stasiun_name}</TableCell>
                    <TableCell><Badge color="success">{report.OK}</Badge></TableCell>
                    <TableCell><Badge color="failure">{report.NOT_OK}</Badge></TableCell>
                    <TableCell>{report.created_by?.username}</TableCell>
                    <TableCell>
                      <Button
                        size="xs"
                        onClick={() => handleDownload(report.id)}
                        disabled={downloading === report.id}
                      >
                        <HiDownload className="mr-1 h-4 w-4" />
                        PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
