import Link from "next/link";
import { Button } from "./ui/button";

export const Header = () => {
  return (
    <header className="mb-4">
      <div className="mx-auto flex justify-between items-center">
        <div className="flex flex-row items-center gap-3">
          <GeminiIcon size={22} />
          <div className="text-zinc-800 dark:text-zinc-100 text-xl font-semibold">
            Image Generator
          </div>
        </div>
        <Link href="https://aistudio.google.com/apikey" target="_blank">
          <Button variant="outline" className="hidden sm:inline-flex">
            Get Gemini key
          </Button>
          <Button size="iconSm" className="block sm:hidden">
            ✦
          </Button>
        </Link>
      </div>
    </header>
  );
};

export const GeminiIcon = ({ size = 16 }: { size: number }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M12 1.2c.25 3.55 1.55 6.2 4.05 8.7 2.5 2.5 5.15 3.8 8.7 4.05-3.55.25-6.2 1.55-8.7 4.05-2.5 2.5-3.8 5.15-4.05 8.7-.25-3.55-1.55-6.2-4.05-8.7C5.75 13.7 3.1 12.4-.45 12.15c3.55-.25 6.2-1.55 8.7-4.05C10.75 5.6 12.05 2.95 12 1.2Z" />
    </svg>
  );
};
