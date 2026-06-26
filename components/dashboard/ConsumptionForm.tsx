"use client";

import { useState } from "react";
import {
  Alert,
  Button,
  Label,
  Select,
  Spinner,
  Textarea,
  TextInput,
  ToggleSwitch,
} from "flowbite-react";
import { dashboardService } from "@/lib/api/services/dashboard.service";
import { notificationService } from "@/lib/api/services/notification.service";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";

interface ConsumptionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const categories = [
  { value: "electricity", labelKey: "electricity", unit: "VA", statusKey: "power_on" },
  { value: "water", labelKey: "water", unit: "m³", statusKey: "pump_on" },
  { value: "genset", labelKey: "genset", unit: "Liter", statusKey: "standby" },
] as const;

export function ConsumptionForm({ onSuccess, onCancel }: ConsumptionFormProps) {
  const { t } = useTranslation();
  const { userData } = useAuth();
  const [category, setCategory] = useState<"electricity" | "water" | "genset">("electricity");
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [isEnabled, setIsEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selected = categories.find((c) => c.value === category);

  const handleSubmit = async () => {
    if (!userData || !description.trim() || !value) {
      setError("Lengkapi semua field");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await dashboardService.createConsumptionRecord({
        stasiun_id: userData.stasiun_id,
        category,
        value: Number(value),
        status: isEnabled,
        description: description.trim(),
        user_id: userData.userId,
      });
      await notificationService.create({
        title: `Berhasil Update Data ${category.charAt(0).toUpperCase() + category.slice(1)}`,
        description: `${userData.username} telah memperbarui ${category.toUpperCase()} dengan nilai ${value} ${selected?.unit ?? ""}`,
        type: "role",
        notification_type: "success",
        roleId: String(userData.roleId),
        userId: String(userData.userId),
      });
      onSuccess();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message ?? "Gagal menyimpan data");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && <Alert color="failure">{error}</Alert>}
      <div>
        <Label htmlFor="cat">{t("category")}</Label>
        <Select
          id="cat"
          value={category}
          onChange={(e) => setCategory(e.target.value as typeof category)}
        >
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {t(c.labelKey)}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="desc">{t("annotation")}</Label>
        <Textarea
          id="desc"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("enter_description")}
        />
      </div>
      <div>
        <Label htmlFor="val">
          {t("value")} ({selected?.unit})
        </Label>
        <TextInput
          id="val"
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t("note")}</p>
      </div>
      <div className="flex items-center gap-3">
        <ToggleSwitch
          checked={isEnabled}
          onChange={setIsEnabled}
          label={isEnabled ? t(selected?.statusKey ?? "power_on") : t("off")}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button color="gray" onClick={onCancel}>
          {t("cancel")}
        </Button>
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? <Spinner size="sm" className="mr-2" /> : null}
          {t("save")}
        </Button>
      </div>
    </div>
  );
}
