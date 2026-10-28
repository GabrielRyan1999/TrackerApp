import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DateSelectorProps {
  value: string; // ISO format: "YYYY-MM-DD"
  onChange: (isoDate: string) => void;
  label?: string;
}

const MONTHS = [
  { value: 1, label: '01 - Jan', name: 'January' },
  { value: 2, label: '02 - Feb', name: 'February' },
  { value: 3, label: '03 - Mar', name: 'March' },
  { value: 4, label: '04 - Apr', name: 'April' },
  { value: 5, label: '05 - May', name: 'May' },
  { value: 6, label: '06 - Jun', name: 'June' },
  { value: 7, label: '07 - Jul', name: 'July' },
  { value: 8, label: '08 - Aug', name: 'August' },
  { value: 9, label: '09 - Sep', name: 'September' },
  { value: 10, label: '10 - Oct', name: 'October' },
  { value: 11, label: '11 - Nov', name: 'November' },
  { value: 12, label: '12 - Dec', name: 'December' },
];

export const DateSelector: React.FC<DateSelectorProps> = ({
  value,
  onChange,
  label = 'Date (DD/MM/YYYY)',
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse YYYY-MM-DD safely
  const today = new Date();
  const parts = (value || '').split('-');
  const selectedYear = parseInt(parts[0], 10) || today.getFullYear();
  const selectedMonth = parseInt(parts[1], 10) || today.getMonth() + 1;
  const selectedDay = parseInt(parts[2], 10) || today.getDate();

  // State for navigating calendar view (can differ from selected date before clicking)
  const [viewYear, setViewYear] = useState(selectedYear);
  const [viewMonth, setViewMonth] = useState(selectedMonth);

  useEffect(() => {
    setViewYear(selectedYear);
    setViewMonth(selectedMonth);
  }, [selectedYear, selectedMonth]);

  // Close calendar popup on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsCalendarOpen(false);
      }
    };
    if (isCalendarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCalendarOpen]);

  // Days in month calculation
  const daysInCurrentMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const days = Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1);

  // Years range
  const currentYear = today.getFullYear();
  const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2];

  const emitDate = (y: number, m: number, d: number) => {
    const maxD = new Date(y, m, 0).getDate();
    const validD = Math.min(d, maxD);
    const pad = (n: number) => String(n).padStart(2, '0');
    onChange(`${y}-${pad(m)}-${pad(validD)}`);
  };

  const handleDayChange = (d: number) => {
    emitDate(selectedYear, selectedMonth, d);
  };

  const handleMonthChange = (m: number) => {
    emitDate(selectedYear, m, selectedDay);
  };

  const handleYearChange = (y: number) => {
    emitDate(y, selectedMonth, selectedDay);
  };

  const setToday = () => {
    const now = new Date();
    emitDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
    setIsCalendarOpen(false);
  };

  const setYesterday = () => {
    const yest = new Date();
    yest.setDate(yest.getDate() - 1);
    emitDate(yest.getFullYear(), yest.getMonth() + 1, yest.getDate());
    setIsCalendarOpen(false);
  };

  // Calendar calculations for viewYear and viewMonth
  const daysInViewMonth = new Date(viewYear, viewMonth, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth - 1, 1).getDay(); // 0 is Sunday
  // Shift to Monday = 0
  const startOffset = (firstDayOfWeek + 6) % 7;

  const prevMonthView = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const nextMonthView = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  return (
    <div className="relative space-y-1.5" ref={containerRef}>
      {/* Label and Quick Buttons */}
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
          {label}
        </label>
        <div className="flex items-center gap-1.5 text-[11px]">
          <button
            type="button"
            onClick={setToday}
            className="px-2 py-0.5 bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-700 font-bold uppercase text-[11px] border border-stone-900 dark:border-stone-400 transition"
          >
            Today
          </button>
          <button
            type="button"
            onClick={setYesterday}
            className="px-2 py-0.5 bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-700 font-bold uppercase text-[11px] border border-stone-900 dark:border-stone-400 transition"
          >
            Yesterday
          </button>
        </div>
      </div>

      {/* Date Selectors: Tanggal (DD) -> Bulan (MM) -> Tahun (YYYY) */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* 1. Day / Tanggal (DD) */}
        <div className="w-[30%]">
          <select
            value={Math.min(selectedDay, daysInCurrentMonth)}
            onChange={(e) => handleDayChange(Number(e.target.value))}
            className="w-full px-2 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-900 dark:border-stone-400 text-xs sm:text-sm font-mono-num font-bold text-stone-900 dark:text-stone-100 cursor-pointer focus:outline-none"
            title="Day (Tanggal)"
          >
            {days.map((d) => (
              <option key={d} value={d}>
                {String(d).padStart(2, '0')}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Month / Bulan (MM) */}
        <div className="w-[42%]">
          <select
            value={selectedMonth}
            onChange={(e) => handleMonthChange(Number(e.target.value))}
            className="w-full px-2 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-900 dark:border-stone-400 text-xs sm:text-sm font-mono-num font-bold text-stone-900 dark:text-stone-100 cursor-pointer focus:outline-none"
            title="Month (Bulan)"
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Year / Tahun (YYYY) */}
        <div className="w-[28%]">
          <select
            value={selectedYear}
            onChange={(e) => handleYearChange(Number(e.target.value))}
            className="w-full px-2 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-900 dark:border-stone-400 text-xs sm:text-sm font-mono-num font-bold text-stone-900 dark:text-stone-100 cursor-pointer focus:outline-none"
            title="Year (Tahun)"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Calendar Picker Toggle Button */}
        <button
          type="button"
          onClick={() => setIsCalendarOpen((prev) => !prev)}
          className={`w-9 h-9 flex items-center justify-center border border-stone-900 dark:border-stone-400 transition shrink-0 ${
            isCalendarOpen
              ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 font-bold'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700'
          }`}
          title="Open Visual Calendar"
          aria-label="Open Visual Calendar"
        >
          <CalendarIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Visual Calendar Popup */}
      {isCalendarOpen && (
        <div className="absolute left-0 right-0 sm:left-auto sm:right-0 z-50 mt-1 w-full sm:w-72 bg-[#f4efe4] dark:bg-[#161513] border-2 border-stone-900 dark:border-stone-400 p-3 shadow-2xl space-y-2.5">
          {/* Calendar Header */}
          <div className="flex items-center justify-between pb-1.5 border-b border-stone-900 dark:border-stone-400">
            <span className="font-headline font-bold text-xs uppercase text-stone-950 dark:text-stone-50">
              {MONTHS[viewMonth - 1].name} {viewYear}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonthView}
                className="w-6 h-6 flex items-center justify-center border border-stone-900 dark:border-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-900 dark:text-stone-100 transition"
                aria-label="Previous Month"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={nextMonthView}
                className="w-6 h-6 flex items-center justify-center border border-stone-900 dark:border-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-900 dark:text-stone-100 transition"
                aria-label="Next Month"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsCalendarOpen(false)}
                className="w-6 h-6 flex items-center justify-center border border-stone-900 dark:border-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-900 dark:text-stone-100 transition ml-1"
                aria-label="Close Calendar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Days of week header (Mon - Sun) */}
          <div className="grid grid-cols-7 text-center text-[11px] font-bold uppercase text-stone-600 dark:text-stone-400">
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
            <span>Su</span>
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty slots before first day */}
            {Array.from({ length: startOffset }).map((_, idx) => (
              <div key={`empty-${idx}`} className="w-7 h-7" />
            ))}

            {/* Day buttons */}
            {Array.from({ length: daysInViewMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const isSelected =
                dayNum === selectedDay &&
                viewMonth === selectedMonth &&
                viewYear === selectedYear;

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => {
                    emitDate(viewYear, viewMonth, dayNum);
                    setIsCalendarOpen(false);
                  }}
                  className={`w-7 h-7 font-mono-num text-xs flex items-center justify-center border transition ${
                    isSelected
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 font-bold border-stone-900 dark:border-stone-400'
                      : 'border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-800'
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
