"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Alert,
  Button,
  Card,
  Label,
  Spinner,
  TextInput,
} from "flowbite-react";
import {
  HiArrowLeft,
  HiChevronRight,
  HiEye,
  HiEyeOff,
  HiKey,
  HiLockClosed,
  HiUser,
} from "react-icons/hi";
import { authService } from "@/lib/api/services/auth.service";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { getLoginData, isAuthenticated } from "@/lib/auth";
import type { StationData } from "@/types";

type LoginStep = "credentials" | "otp" | "station";

function MobileAuthInput({
  icon: Icon,
  type = "text",
  value,
  onChange,
  placeholder,
  maxLength,
  rightElement,
}: {
  icon: React.ComponentType<{ className?: string }>;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength?: number;
  rightElement?: React.ReactNode;
}) {
  return (
    <div className="flex h-16 w-full items-center gap-3 overflow-hidden rounded-[10px] border border-white/30 bg-white/20 px-5 backdrop-blur-md">
      <Icon className="h-6 w-6 shrink-0 text-white" />
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="min-w-0 flex-1 bg-transparent font-paragraph text-base text-white outline-none placeholder:text-white"
      />
      {rightElement}
    </div>
  );
}

function MobileLoginBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 lg:hidden">
      <div className="absolute inset-x-0 top-0 h-1/2">
        <Image
          src="/assets/image/station.png"
          alt=""
          fill
          className="object-cover"
          priority
        />
      </div>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, transparent 18%, #3d3d3d 42%, #000000 58%, #000000 100%)",
        }}
      />
      <Image
        src="/assets/image/purple-gradient.png"
        alt=""
        width={400}
        height={400}
        className="pointer-events-none absolute bottom-[18%] -left-24 h-72 w-72 object-contain opacity-45"
        aria-hidden
      />
      <Image
        src="/assets/image/orange-gradient.png"
        alt=""
        width={450}
        height={450}
        className="pointer-events-none absolute -right-20 bottom-[12%] h-80 w-80 object-contain opacity-55"
        aria-hidden
      />
    </div>
  );
}

function StationTrainIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-6 w-6 text-white"
      aria-hidden
    >
      <path d="M12 2c-4 0-8 .5-8 4v9.5c0 .95.38 1.81 1 2.44V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-2.06c.62-.63 1-1.49 1-2.44V6c0-3.5-4-4-8-4zm-5 14c-.83 0-1.5-.67-1.5-1.5S6.17 13 7 13s1.5.67 1.5 1.5S7.83 16 7 16zm10 0c-.83 0-1.5-.67-1.5-1.5S16.17 13 17 13s1.5.67 1.5 1.5S17.83 16 17 16zM18 10H6V6h12v4z" />
    </svg>
  );
}

function MobileStationItem({
  station,
  onSelect,
}: {
  station: StationData;
  onSelect: (station: StationData) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(station)}
      className="mb-3 flex w-full items-center justify-between rounded-2xl border border-white/30 bg-white/20 p-4 backdrop-blur-md transition active:bg-white/25"
    >
      <span className="flex items-center gap-3">
        <span className="rounded-full bg-primary/30 p-2">
          <StationTrainIcon />
        </span>
        <span className="font-paragraph text-lg font-semibold text-white">
          {station.stasiun_name}
        </span>
      </span>
      <HiChevronRight className="h-5 w-5 text-white" />
    </button>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { saveLogin, selectStation, decodeTokenUser, getStations } = useAuth();

  const [step, setStep] = useState<LoginStep>("credentials");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpMessage, setOtpMessage] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [stations, setStations] = useState<StationData[]>([]);

  useEffect(() => {
    if (isAuthenticated()) router.replace("/dashboard");
  }, [router]);

  useEffect(() => {
    if (step !== "otp" || countdown <= 0) {
      if (countdown <= 0) setCanResend(true);
      return;
    }
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          setCanResend(true);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Harap lengkapi form login");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await authService.login(username, password) as {
        status?: string;
        message?: string;
        bypass?: boolean;
        baypass?: boolean;
        token?: string;
      };

      const hasBypass = res.bypass === true || res.baypass === true;
      if (hasBypass && res.token) {
        const userData = decodeTokenUser(res.token);
        saveLogin(res.token, userData);
        await processStations(res.token, userData);
        return;
      }

      if (res.status === "success" || res.message) {
        setOtpMessage(res.message ?? "");
        setStep("otp");
        setCountdown(60);
        setCanResend(false);
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; code?: string };
      setError(
        err.code === "ERR_NETWORK"
          ? t("loginError")
          : err.response?.data?.message ?? "Login gagal",
      );
    } finally {
      setLoading(false);
    }
  };

  const processStations = async (token: string, userData: ReturnType<typeof decodeTokenUser>) => {
    const stationList = getStations(userData);
    if (stationList.length > 1) {
      setStations(stationList);
      setStep("station");
    } else if (stationList.length === 1) {
      saveLogin(token, {
        ...userData,
        stasiun_id: stationList[0].stasiun_id,
        stasiun_name: stationList[0].stasiun_name,
      });
      router.replace("/dashboard");
    } else if (userData.stasiun_id) {
      saveLogin(token, userData);
      router.replace("/dashboard");
    } else {
      setError("Data stasiun tidak ditemukan");
    }
  };

  const handleValidateOtp = async () => {
    if (otp.length !== 6) {
      setError("Masukkan 6 digit kode OTP");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await authService.validateOtp(username, password, otp);
      if (res.success && res.token) {
        const token = String(res.token);
        const userData = decodeTokenUser(token);
        saveLogin(token, userData, res.ssoToken);
        await processStations(token, userData);
      } else {
        setError("Validasi OTP gagal");
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message ?? "OTP tidak valid");
    } finally {
      setLoading(false);
    }
  };

  const handleStationSelect = (station: StationData) => {
    const current = getLoginData();
    if (current?.token) {
      saveLogin(current.token, {
        ...current.userData,
        stasiun_id: station.stasiun_id,
        stasiun_name: station.stasiun_name,
      });
    } else {
      selectStation(station);
    }
    router.replace("/dashboard");
  };

  const handleBack = () => {
    if (step === "station") {
      setStep("otp");
      setStations([]);
    } else {
      setStep("credentials");
      setOtp("");
      setCountdown(60);
      setCanResend(false);
    }
    setError("");
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setCountdown(60);
    setCanResend(false);
    await handleLogin();
  };

  const mobileError = error ? (
    <div className="mb-4 rounded-xl border border-error/40 bg-error/15 px-4 py-3 text-sm text-white">
      {error}
    </div>
  ) : null;

  const mobileStepTitle =
    step === "station"
      ? "Pilih Stasiun"
      : step === "otp"
        ? "Masukkan Kode OTP"
        : t("signIn");

  const mobilePrimaryButton = (label: string, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="flex w-full items-center justify-center rounded-full bg-primary py-5 font-heading text-xl text-white transition hover:bg-primary-600 disabled:opacity-60"
    >
      {loading ? <Spinner size="sm" color="gray" className="mr-2 fill-white" /> : null}
      {label}
    </button>
  );

  const mobileBackButton = (
    <button
      type="button"
      onClick={handleBack}
      className="mb-2 flex items-center gap-2 self-start"
    >
      <HiArrowLeft className="h-5 w-5 text-white" />
      <span className="font-paragraph text-lg font-semibold text-white">{t("kembali")}</span>
    </button>
  );

  const handleMobileKeyDown = (
    e: React.KeyboardEvent,
    action: () => void,
  ) => {
    if (e.key === "Enter") action();
  };

  return (
    <>
      {/* Mobile & tablet — struktur mengikuti immax-app */}
      <div className="relative min-h-[100dvh] overflow-x-hidden text-white lg:hidden">
        <MobileLoginBackground />

        <div className="relative z-10 flex min-h-[100dvh] flex-col justify-between overflow-y-auto p-8 sm:p-10">
          {/* Logo */}
          <div className="flex shrink-0 items-end justify-end gap-2">
            <Image
              src="/assets/image/KAI.png"
              alt="KAI"
              width={128}
              height={112}
              className="h-20 w-28 object-contain sm:h-28 sm:w-32"
            />
            <Image
              src="/assets/image/LRT.png"
              alt="LRT Jabodebek"
              width={160}
              height={128}
              className="h-24 w-32 object-contain sm:h-32 sm:w-40"
            />
          </div>

          {/* Judul */}
          <div className="shrink-0">
            <h1 className="font-heading py-2 text-3xl leading-tight whitespace-pre-line sm:text-5xl">
              {t("welcome")}
            </h1>
            <p className="font-paragraph text-lg sm:text-2xl">{t("tagline")}</p>
          </div>

          {/* Form */}
          <div
            className="mx-auto flex w-full max-w-md shrink-0 flex-col items-center gap-8 py-4 sm:gap-10"
            onKeyDown={(e) => {
              if (step === "credentials") handleMobileKeyDown(e, handleLogin);
              if (step === "otp") handleMobileKeyDown(e, handleValidateOtp);
            }}
          >
            {(step === "otp" || step === "station") && mobileBackButton}

            <h2 className="text-center font-paragraph text-xl text-white sm:text-2xl">
              {mobileStepTitle}
            </h2>

            {mobileError}

            {step === "credentials" && (
              <>
                <MobileAuthInput
                  icon={HiUser}
                  value={username}
                  onChange={setUsername}
                  placeholder="Username"
                />
                <MobileAuthInput
                  icon={HiLockClosed}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={setPassword}
                  placeholder="Password"
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="shrink-0 text-white"
                      aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    >
                      {showPassword ? (
                        <HiEyeOff className="h-6 w-6" />
                      ) : (
                        <HiEye className="h-6 w-6" />
                      )}
                    </button>
                  }
                />
                {mobilePrimaryButton(t("login"), handleLogin)}
              </>
            )}

            {step === "otp" && (
              <>
                <p className="text-center font-paragraph font-medium text-white">
                  {otpMessage ||
                    "Masukkan 6 digit kode OTP yang telah dikirim ke nomor Anda dan hanya berlaku selama 1 menit"}
                </p>
                <MobileAuthInput
                  icon={HiKey}
                  value={otp}
                  onChange={(v) => setOtp(v.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Masukkan 6 digit kode OTP"
                  maxLength={6}
                />
                {mobilePrimaryButton("Verifikasi OTP", handleValidateOtp)}
                <div className="mt-4 text-center">
                  <p className="mb-2 font-paragraph text-base text-white">
                    {countdown > 0
                      ? `Tunggu ${countdown} detik untuk kirim ulang OTP`
                      : "Tidak menerima kode OTP?"}
                  </p>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={!canResend || loading}
                    className="font-semibold text-primary disabled:opacity-50"
                  >
                    Kirim Ulang OTP
                  </button>
                </div>
              </>
            )}

            {step === "station" && (
              <>
                <p className="text-center font-paragraph font-medium text-white">
                  Silakan pilih stasiun untuk melanjutkan
                </p>
                <div className="max-h-80 w-full overflow-y-auto">
                  {stations.map((station) => (
                    <MobileStationItem
                      key={station.stasiun_id}
                      station={station}
                      onSelect={handleStationSelect}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="mb-4 flex shrink-0 flex-col items-center justify-center pb-[max(1rem,env(safe-area-inset-bottom))] sm:mb-10">
            <Image
              src="/assets/image/immax.png"
              alt="IMMAX"
              width={256}
              height={160}
              className="h-24 w-48 object-contain sm:h-36 sm:w-64"
            />
            <p className="mt-2 text-center font-paragraph text-sm whitespace-pre-line text-white sm:text-xl">
              {`Development by\nSO & IT LRT Jabodebek`}
            </p>
          </div>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden min-h-screen lg:flex">
        <div className="relative w-1/2">
          <Image
            src="/assets/image/station.png"
            alt="Stasiun LRT"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary-900/70 to-black/90" />
          <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
            <div className="flex items-end justify-end gap-2">
              <Image
                src="/assets/image/KAI.png"
                alt="KAI"
                width={120}
                height={100}
                className="h-20 w-auto object-contain"
              />
              <Image
                src="/assets/image/LRT.png"
                alt="LRT Jabodebek"
                width={150}
                height={110}
                className="h-24 w-auto object-contain"
              />
            </div>
            <div>
              <h1 className="font-heading text-4xl whitespace-pre-line">
                {t("welcome")}
              </h1>
              <p className="mt-4 text-lg text-white/90">{t("tagline")}</p>
            </div>
            <p className="text-sm text-white/70">
              Development by SO & IT LRT Jabodebek
            </p>
          </div>
        </div>

        <div className="flex w-1/2 flex-col items-center justify-center bg-background p-6 text-gray-900 dark:bg-dark-background dark:text-gray-100">
          <Card className="w-full max-w-md">
            {(step === "otp" || step === "station") && (
              <button
                type="button"
                onClick={handleBack}
                className="mb-4 flex items-center gap-2 text-sm text-gray-600 hover:text-secondary-700 dark:text-gray-400 dark:hover:text-secondary-300"
              >
                <HiArrowLeft className="h-4 w-4" />
                {t("kembali")}
              </button>
            )}

            <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
              {step === "station"
                ? "Pilih Stasiun"
                : step === "otp"
                  ? "Masukkan Kode OTP"
                  : t("signIn")}
            </h2>

            {error && (
              <Alert color="failure" className="mb-4" onDismiss={() => setError("")}>
                {error}
              </Alert>
            )}

            {step === "credentials" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <TextInput
                    id="username"
                    icon={HiUser}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <TextInput
                    id="password"
                    type="password"
                    icon={HiLockClosed}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                  />
                </div>
                <Button className="w-full" onClick={handleLogin} disabled={loading}>
                  {loading ? <Spinner size="sm" className="mr-2" /> : null}
                  {t("login")}
                </Button>
              </div>
            )}

            {step === "otp" && (
              <div className="space-y-4">
                {otpMessage && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{otpMessage}</p>
                )}
                <div>
                  <Label htmlFor="otp">OTP</Label>
                  <TextInput
                    id="otp"
                    icon={HiKey}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="6 digit OTP"
                    maxLength={6}
                  />
                </div>
                <Button className="w-full" onClick={handleValidateOtp} disabled={loading}>
                  {loading ? <Spinner size="sm" className="mr-2" /> : null}
                  Verifikasi OTP
                </Button>
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  {countdown > 0
                    ? `Tunggu ${countdown} detik untuk kirim ulang OTP`
                    : "Tidak menerima kode OTP?"}
                </p>
                <Button
                  color="light"
                  className="w-full"
                  onClick={handleResendOtp}
                  disabled={!canResend || loading}
                >
                  Kirim Ulang OTP
                </Button>
              </div>
            )}

            {step === "station" && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Silakan pilih stasiun untuk melanjutkan
                </p>
                {stations.map((station) => (
                  <button
                    key={station.stasiun_id}
                    type="button"
                    onClick={() => handleStationSelect(station)}
                    className="flex w-full items-center justify-between rounded-lg border border-gray-200 p-4 text-left transition hover:border-primary hover:bg-primary-50 dark:border-gray-700 dark:hover:bg-gray-800"
                  >
                    <span className="font-medium text-gray-900 dark:text-white">
                      {station.stasiun_name}
                    </span>
                    <span className="text-primary dark:text-primary-400">→</span>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
