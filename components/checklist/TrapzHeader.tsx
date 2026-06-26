import Image from "next/image";

interface TrapzHeaderProps {
  title: string;
  /** Trapz lebar mengikuti teks (untuk judul multiline) */
  fit?: boolean;
}

export function TrapzHeader({ title, fit }: TrapzHeaderProps) {
  const multiline = title.includes("\n");
  const shrinkToText = fit ?? multiline;

  if (shrinkToText) {
    return (
      <div className="relative z-20 flex w-full shrink-0 justify-center">
        <div className="dashboard-trapz-shadow relative w-max max-w-[92%] px-6 pb-4 pt-2 sm:px-8 sm:pb-4.5 sm:pt-2.5 xl:px-9 xl:pb-5">
          <div className="absolute inset-0 scale-y-[-1]">
            <Image
              src="/assets/image/trapz.png"
              alt=""
              fill
              className="object-fill"
              aria-hidden
            />
          </div>
          <span className="relative z-10 block text-center font-heading text-sm font-semibold leading-[1.2] whitespace-pre-line text-gray-900 sm:text-base xl:text-lg">
            {title}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-20 w-full shrink-0">
      <div className="dashboard-trapz-shadow relative h-14 w-full sm:h-[3.75rem] xl:h-[4rem]">
        <div className="absolute inset-0 scale-y-[-1]">
          <Image
            src="/assets/image/trapz.png"
            alt=""
            fill
            className="object-fill"
            aria-hidden
          />
        </div>
        <div className="absolute inset-0 z-10 flex items-start justify-center px-2 pt-1 sm:pt-1.5 xl:pt-2">
          <span className="text-center font-heading text-lg font-semibold text-gray-900 sm:text-xl xl:text-2xl">
            {title}
          </span>
        </div>
      </div>
    </div>
  );
}
