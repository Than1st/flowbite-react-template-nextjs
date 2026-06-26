"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Alert,
  Badge,
  Button,
  Card,
  Label,
  Select,
  Spinner,
  Textarea,
  TextInput,
  ToggleSwitch,
} from "flowbite-react";
import { HiArrowLeft, HiCheck, HiX } from "react-icons/hi";
import Link from "next/link";
import { checklistService } from "@/lib/api/services/checklist.service";
import { notificationService } from "@/lib/api/services/notification.service";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";

interface ChecklistFormItem {
  id: number;
  item_name: string;
  location?: string;
  pic?: string;
  condition?: boolean | null;
  comments?: string;
}

export default function ChecklistFormPage() {
  const { t } = useTranslation();
  const { userData } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const historyId = searchParams.get("id");

  const [items, setItems] = useState<ChecklistFormItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [filterPic, setFilterPic] = useState("");
  const [search, setSearch] = useState("");
  const [pics, setPics] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!userData?.stasiun_id) return;
      setLoading(true);
      try {
        if (historyId) {
          const history = await checklistService.getHistory(Number(historyId));
          const histData = history as { data?: { timeline?: Array<{ items?: ChecklistFormItem[] }> } };
          const timelineItems = histData.data?.timeline?.flatMap((tl) => tl.items ?? []) ?? [];
          setItems(timelineItems);
        } else {
          const [itemsRes, picRes] = await Promise.all([
            checklistService.getItems(userData.stasiun_id),
            checklistService.getPic(),
          ]);
          const itemsData = itemsRes as { data?: ChecklistFormItem[] } | ChecklistFormItem[];
          const list = Array.isArray(itemsData) ? itemsData : (itemsData.data ?? []);
          setItems(list.map((item) => ({ ...item, condition: null, comments: "" })));

          const picData = picRes as { data?: Array<{ name?: string }> } | Array<{ name?: string }>;
          const picList = Array.isArray(picData) ? picData : (picData.data ?? []);
          setPics(picList.map((p) => p.name ?? "").filter(Boolean));
        }
      } catch {
        setError("Gagal memuat data checklist");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userData?.stasiun_id, historyId]);

  const updateItem = (id: number, patch: Partial<ChecklistFormItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  };

  const filteredItems = items.filter((item) => {
    const matchPic = !filterPic || item.pic === filterPic;
    const matchSearch =
      !search ||
      item.item_name?.toLowerCase().includes(search.toLowerCase()) ||
      item.location?.toLowerCase().includes(search.toLowerCase());
    return matchPic && matchSearch;
  });

  const incomplete = items.filter((i) => i.condition === null || i.condition === undefined);

  const handleSubmit = async () => {
    if (!userData || historyId) return;
    if (incomplete.length > 0) {
      setError(`${t("Incomplete Checklist")}: ${incomplete.length} item belum diisi`);
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        stasiun_id: userData.stasiun_id,
        user_id: userData.userId,
        remarks: "",
        items: items.map((item) => ({
          stasiun_item_id: item.id,
          condition: item.condition === true,
          comments: item.comments ?? "",
          photo_url: "",
          sub_items: [],
        })),
      };
      await checklistService.create(payload);
      await notificationService.create({
        title: "Checklist Submitted",
        description: `${userData.username} telah mengisi checklist`,
        type: "role",
        notification_type: "success",
        roleId: String(userData.roleId),
        userId: String(userData.userId),
      });
      router.push("/checklist");
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message ?? "Gagal menyimpan checklist");
    } finally {
      setSaving(false);
    }
  };

  const isReadOnly = !!historyId;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button as={Link} href="/checklist" color="light" size="sm">
          <HiArrowLeft className="mr-2 h-4 w-4" />
          {t("kembali")}
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isReadOnly ? t("checklist_record") : t("Create")} Checklist
        </h1>
      </div>

      {error && (
        <Alert color="failure" onDismiss={() => setError("")}>{error}</Alert>
      )}

      {!isReadOnly && (
        <Card>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="search">{t("search")}</Label>
              <TextInput
                id="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("search_sub_item")}
              />
            </div>
            <div>
              <Label htmlFor="pic">PIC</Label>
              <Select id="pic" value={filterPic} onChange={(e) => setFilterPic(e.target.value)}>
                <option value="">{t("all")}</option>
                {pics.map((pic) => (
                  <option key={pic} value={pic}>{pic}</option>
                ))}
              </Select>
            </div>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="xl" /></div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <Card key={item.id}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {item.item_name}
                  </h3>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {item.location && <Badge color="gray">{item.location}</Badge>}
                    {item.pic && <Badge color="info">{item.pic}</Badge>}
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-2">
                    <ToggleSwitch
                      checked={item.condition === true}
                      disabled={isReadOnly}
                      label={item.condition === true ? t("status_good") : t("status_not_good")}
                      onChange={(checked) => updateItem(item.id, { condition: checked })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="xs"
                      color={item.condition === true ? "success" : "light"}
                      disabled={isReadOnly}
                      onClick={() => updateItem(item.id, { condition: true })}
                    >
                      <HiCheck className="h-4 w-4" />
                    </Button>
                    <Button
                      size="xs"
                      color={item.condition === false ? "failure" : "light"}
                      disabled={isReadOnly}
                      onClick={() => updateItem(item.id, { condition: false })}
                    >
                      <HiX className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <Textarea
                className="mt-3"
                rows={2}
                placeholder={t("annotation")}
                value={item.comments ?? ""}
                disabled={isReadOnly}
                onChange={(e) => updateItem(item.id, { comments: e.target.value })}
              />
            </Card>
          ))}
        </div>
      )}

      {!isReadOnly && !loading && (
        <div className="sticky bottom-20 flex justify-end gap-2 lg:bottom-4">
          <Button color="gray" as={Link} href="/checklist">{t("cancel")}</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? <Spinner size="sm" className="mr-2" /> : null}
            {t("Yes, Complete")}
          </Button>
        </div>
      )}
    </div>
  );
}
