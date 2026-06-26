"use client";

import { useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Label,
  Modal,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Textarea,
  TextInput,
} from "flowbite-react";
import Link from "next/link";
import { HiArrowLeft } from "react-icons/hi";
import { PageHeader } from "@/components/layout/PageHeader";
import { useMonitoring } from "@/hooks/useMonitoring";
import { useTranslation } from "@/hooks/useTranslation";
import { monitoringService } from "@/lib/api/services/monitoring.service";
import { matchesMonitoringTab } from "@/lib/monitoring";
import type { MonitoringIssue } from "@/lib/monitoring";

const statusTabs = ["All", "Open", "In Progress", "Closed"];

export default function MonitoringPage() {
  const { t } = useTranslation();
  const { issues, loading, error, refresh, userData } = useMonitoring();
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<MonitoringIssue | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [actionError, setActionError] = useState("");
  const [remarks, setRemarks] = useState("");
  const [evidence, setEvidence] = useState<File | null>(null);

  const tabStatus = statusTabs[activeTab];
  const filtered = issues.filter((item) => {
    const matchTab = matchesMonitoringTab(item.status, tabStatus);
    const matchSearch =
      !search ||
      item.item_name.toLowerCase().includes(search.toLowerCase()) ||
      item.item_code.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const openDetail = (item: MonitoringIssue) => {
    setSelected(item);
    setRemarks(item.remarks ?? "");
    setEvidence(null);
    setActionError("");
    setDetailOpen(true);
  };

  const handleProcess = async (action: "process" | "complete") => {
    if (!selected || !userData?.userId) return;

    if (action === "complete" && !evidence) {
      setActionError("Evidence wajib diunggah untuk menutup tiket");
      return;
    }

    setProcessing(true);
    setActionError("");

    try {
      const payload = {
        checklist_item_id: selected.checklist_item_id,
        created_by: selected.created_by?.id ?? userData.userId,
        modify_by: userData.userId,
        finish_target:
          selected.finish_target ?? new Date().toISOString().split("T")[0],
        remarks,
        evidence,
        status: action === "complete" ? "closed" : "in_progress",
      };

      if (action === "complete") {
        await monitoringService.complete(payload);
      } else {
        await monitoringService.process(payload);
      }

      setDetailOpen(false);
      await refresh();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Gagal memproses tiket",
      );
    } finally {
      setProcessing(false);
    }
  };

  const statusColor = (status?: string) => {
    switch (status) {
      case "open":
        return "failure";
      case "in_progress":
        return "warning";
      case "closed":
        return "success";
      default:
        return "gray";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button as={Link} href="/checklist" color="light" size="sm">
          <HiArrowLeft className="mr-2 h-4 w-4" />
          {t("kembali")}
        </Button>
        <PageHeader title={t("Area Issues\nMonitoring")} showStation={false} />
      </div>

      {error && (
        <Alert color="failure">
          {error}
          <Button size="xs" color="light" className="ml-3" onClick={refresh}>
            Coba lagi
          </Button>
        </Alert>
      )}

      <Card>
        <div className="mb-4">
          <TextInput
            placeholder={t("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          {statusTabs.map((tab, index) => (
            <Button
              key={tab}
              size="xs"
              color={activeTab === index ? "primary" : "light"}
              onClick={() => setActiveTab(index)}
            >
              {t(tab)}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-6 text-center text-gray-500 dark:text-gray-400">Tidak ada data</p>
        ) : (
          <div className="overflow-x-auto">
            <Table hoverable>
              <TableHead>
                <TableHeadCell>{t("code")}</TableHeadCell>
                <TableHeadCell>Item</TableHeadCell>
                <TableHeadCell>{t("location")}</TableHeadCell>
                <TableHeadCell>{t("Status")}</TableHeadCell>
                <TableHeadCell>{t("detail")}</TableHeadCell>
              </TableHead>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.item_code}</TableCell>
                    <TableCell>{item.item_name}</TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>
                      <Badge color={statusColor(item.status)}>
                        {item.status === "in_progress"
                          ? t("In Progress")
                          : t(item.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="xs" onClick={() => openDetail(item)}>
                        {t("detail")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <Modal show={detailOpen} onClose={() => setDetailOpen(false)} size="lg">
        <div className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">{t("Ticket Issue")}</h3>
          {selected && (
            <div className="space-y-4">
              <p className="text-gray-800 dark:text-gray-200">
                <strong>{selected.item_name}</strong> — {selected.location}
              </p>
              {actionError && (
                <Alert color="failure" onDismiss={() => setActionError("")}>
                  {actionError}
                </Alert>
              )}
              <div>
                <Label htmlFor="remarks">{t("annotation")}</Label>
                <Textarea
                  id="remarks"
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="evidence">Evidence</Label>
                <input
                  id="evidence"
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm text-gray-500 dark:text-gray-400"
                  onChange={(e) => setEvidence(e.target.files?.[0] ?? null)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button color="gray" onClick={() => setDetailOpen(false)}>
                  {t("cancel")}
                </Button>
                {selected.status === "open" && (
                  <Button
                    color="warning"
                    onClick={() => handleProcess("process")}
                    disabled={processing}
                  >
                    {t("In Progress")}
                  </Button>
                )}
                {selected.status !== "closed" && (
                  <Button
                    onClick={() => handleProcess("complete")}
                    disabled={processing}
                  >
                    {t("Closed")}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
