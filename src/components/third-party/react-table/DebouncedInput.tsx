'use client';

import { useEffect, useState, useRef, ChangeEvent } from 'react';
import OutlinedInput, { OutlinedInputProps } from '@mui/material/OutlinedInput';
import { SearchNormal } from 'iconsax-react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { Updater } from '@tanstack/react-table';

interface Props extends OutlinedInputProps {
  value: string | number;
  onFilterChange: (value: string | number) => void;
  debounce?: number;
  setPageIndex?: (updater: Updater<number>) => void;
  syncWithUrl?: boolean;
  queryKey?: string;
}

export default function DebouncedInput({
  value: initialValue,
  onFilterChange,
  debounce = 500,
  size,
  startAdornment = <SearchNormal size="18" />,
  setPageIndex,
  syncWithUrl = false,
  queryKey = 'query',
  ...props
}: Props) {
  const searchParams = syncWithUrl ? useSearchParams() : null;
  const router = syncWithUrl ? useRouter() : null;
  const pathname = syncWithUrl ? usePathname() : '';

  const query = syncWithUrl && searchParams ? searchParams.get(queryKey) : null;

  const [value, setValue] = useState<string | number>((syncWithUrl && query) || initialValue);

  const isUpdatingUrl = useRef(false);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    isUpdatingUrl.current = false;
  };

  useEffect(() => {
    if (syncWithUrl && query !== String(value) && !isUpdatingUrl.current) {
      setValue(query || '');
    } else if (!syncWithUrl) {
      setValue(initialValue);
    }
  }, [query]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (syncWithUrl && searchParams && router) {
        const params = new URLSearchParams(searchParams);
        if (value) {
          params.set(queryKey, String(value));
          params.set('page', '1');
        } else {
          params.delete(queryKey);
        }
        isUpdatingUrl.current = true;
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }

      onFilterChange(value);
      if (setPageIndex) setPageIndex(0);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value, debounce]);

  return (
    <OutlinedInput
      {...props}
      value={value}
      onChange={handleInputChange}
      sx={{ minWidth: 100 }}
      {...(startAdornment && { startAdornment })}
      {...(size && { size })}
    />
  );
}
