"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Alert,
  Badge,
  Button,
  Card,
  Progress,
  Spinner,
} from "flowbite-react";
import { HiArrowLeft } from "react-icons/hi";
import { useCqiForm } from "@/hooks/useCqiForm";
import { useTranslation } from "@/hooks/useTranslation";
import {
  getAreaBobot,
  getGradeColor,
  getOptionLabel,
  parseNum,
  sortOptions,
} from "@/lib/cqi-form";

export default function CqiFormPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    authLoading,
    areas,
    masterLoading,
    masterError,
    accessLoading,
    isLocked,
    loadMasterForm,
    selections,
    selectOption,
    summary,
    total,
    allFilled,
    gradeInfo,
    submitCqi,
    isSubmitting,
  } = useCqiForm();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const loading = authLoading || masterLoading || accessLoading;

  const handleSubmit = async () => {
    setError("");
    const result = await submitCqi();
    if (!result.ok) {
      if (result.message === "incomplete") {
        setError(t("lengkapi_semua_penilaian"));
      } else if (result.message === "no_auth") {
        setError(t("error_loading_data"));
      } else {
        setError(result.message);
      }
      return;
    }
    setSuccess(true);
    setTimeout(() => router.push("/kebersihan"), 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button as={Link} href="/kebersihan" color="light" size="sm">
          <HiArrowLeft className="mr-2 h-4 w-4" />
          {t("kembali")}
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("form_cqi")}
        </h1>
      </div>

      {error && (
        <Alert color="failure" onDismiss={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert color="success">
          {t("cqi_submit_success_title")}: {t("cqi_submit_success_body")}
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="xl" />
        </div>
      ) : isLocked ? (
        <Card>
          <p className="text-center text-gray-600 dark:text-gray-300">
            Form CQI hari ini sudah lengkap 3 shift dan tidak dapat diisi lagi.
          </p>
          <div className="mt-4 flex justify-center">
            <Button as={Link} href="/kebersihan" color="primary">
              {t("kembali")}
            </Button>
          </div>
        </Card>
      ) : masterError || areas.length === 0 ? (
        <Card>
          <p className="text-center text-gray-600 dark:text-gray-300">
            Gagal memuat data form. Periksa koneksi lalu coba lagi.
          </p>
          <div className="mt-4 flex justify-center">
            <Button onClick={loadMasterForm} color="primary">
              Coba lagi
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <Card>
            <h3 className="mb-4 text-lg font-semibold uppercase text-gray-900 dark:text-white">
              {t("ringkasan_penilaian")}
            </h3>
            <div className="space-y-2">
              {summary.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b border-gray-100 py-2 dark:border-gray-700"
                >
                  <span className="flex-1 pr-2 text-sm text-gray-700 dark:text-gray-300">
                    {idx + 1}. {item.name}
                  </span>
                  {item.filled ? (
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge color="info">
                        {t("skala")}: {item.selectedScale}
                      </Badge>
                      <span className="text-sm font-semibold text-secondary-700 dark:text-secondary-300">
                        {item.bobot.toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400 dark:text-gray-500">
                      {t("belum_dinilai")}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="font-semibold text-gray-900 dark:text-white">
                {t("total_cleanliness_quality_index")}
              </span>
              {allFilled ? (
                <div className="flex items-center gap-2">
                  <Badge
                    style={{ backgroundColor: getGradeColor(gradeInfo.grade) }}
                    className="text-white"
                  >
                    {gradeInfo.grade} - {t(gradeInfo.labelKey)}
                  </Badge>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{Math.round(total)}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">/ 100</span>
                </div>
              ) : (
                <span className="text-sm text-gray-400 dark:text-gray-500">{t("belum_dinilai")}</span>
              )}
            </div>
            <Progress
              progress={Math.min(100, Math.max(0, total))}
              size="lg"
              className="mt-3"
            />
          </Card>

          <div className="space-y-4">
            {areas.map((cat, idx) => {
              const sortedOpts = sortOptions(cat.options || []);
              const selected = selections[cat.id];
              const maxCqi = parseNum(cat.max_cqi, 20);
              const maxScale = cat.max_scale > 0 ? cat.max_scale : 5;
              const currentBobot = selected
                ? getAreaBobot(selected.scale, maxScale, maxCqi)
                : 0;

              return (
                <Card key={cat.id}>
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-secondary-700 text-sm font-semibold text-white">
                        {idx + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {cat.name}
                        </h3>
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                          {t("skala")} 0–{maxScale} • {t("bobot_maks")}{" "}
                          {maxCqi.toFixed(0)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-secondary-700 dark:text-secondary-300">
                        {Math.round(currentBobot)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">/{maxCqi.toFixed(0)}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {sortedOpts.map((opt) => {
                      const isSelected =
                        selected?.master_uraian_id === opt.master_uraian_id &&
                        selected?.area_uraian_id === opt.area_uraian_id;
                      return (
                        <button
                          key={`${cat.id}-${opt.area_uraian_id}-${opt.master_uraian_id}`}
                          type="button"
                          onClick={() => selectOption(cat.id, opt)}
                          className={`flex w-full items-center gap-3 rounded-lg border-2 px-3 py-2.5 text-left transition ${
                            isSelected
                              ? "border-primary bg-primary text-white"
                              : "border-gray-200 bg-white text-gray-800 hover:border-primary-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                          }`}
                        >
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                              isSelected
                                ? "bg-white/30 text-white"
                                : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-200"
                            }`}
                          >
                            {opt.scale}
                          </span>
                          <span className="flex-1 text-sm">
                            {getOptionLabel(opt)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="sticky bottom-20 flex justify-end gap-2 xl:bottom-4">
            <Button color="gray" as={Link} href="/kebersihan">
              {t("cancel")}
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !allFilled}>
              {isSubmitting ? <Spinner size="sm" className="mr-2" /> : null}
              {t("save")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
