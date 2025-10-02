'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { ChangeEvent, useTransition } from 'react';

export default function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const localActive = useLocale();
  const pathname = usePathname();

  const onSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = e.target.value;
    startTransition(() => {
      // This logic assumes the path always starts with the locale.
      // For the root path, you might need special handling, but for most
      // pages this will work.
      const newPath = pathname.replace(new RegExp(`^/${localActive}`), `/${nextLocale}`);
      router.replace(newPath);
    });
  };

  return (
    <div className="fixed bottom-5 right-5">
      <label className="relative text-gray-400">
        <p className="sr-only">Change language</p>
        <select
          defaultValue={localActive}
          className="inline-flex appearance-none rounded-md bg-gray-800 p-2"
          onChange={onSelectChange}
          disabled={isPending}
        >
          <option value="en">English</option>
          <option value="vi">Tiếng Việt</option>
        </select>
      </label>
    </div>
  );
}
