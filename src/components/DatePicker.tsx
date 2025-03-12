
import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  error?: string;
}

const DatePicker = ({ date, setDate, error }: DatePickerProps) => {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<number>(date ? date.getMonth() : new Date().getMonth());
  const [year, setYear] = useState<number>(date ? date.getFullYear() : new Date().getFullYear());

  // Generate arrays for months and years
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - 99 + i);

  const handleMonthChange = (value: string) => {
    setMonth(parseInt(value));
    if (date) {
      const newDate = new Date(date.setMonth(parseInt(value)));
      setDate(newDate);
    }
  };

  const handleYearChange = (value: string) => {
    setYear(parseInt(value));
    if (date) {
      const newDate = new Date(date.setFullYear(parseInt(value)));
      setDate(newDate);
    }
  };

  return (
    <div className="mb-4 relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Date of Birth
      </label>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "input-field flex items-center justify-start text-left font-normal",
              error ? "border-vedic-error focus:ring-vedic-error/30" : "",
              !date && "text-gray-400"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, 'PPP') : <span>Pick a date</span>}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex gap-2 p-3 border-b">
            <Select value={month.toString()} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent position="popper">
                {months.map((month, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={year.toString()} onValueChange={handleYearChange}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent position="popper">
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Calendar
            mode="single"
            selected={date}
            onSelect={(date) => {
              setDate(date);
              if (date) {
                setMonth(date.getMonth());
                setYear(date.getFullYear());
              }
              setOpen(false);
            }}
            month={new Date(year, month)}
            onMonthChange={(date) => {
              setMonth(date.getMonth());
              setYear(date.getFullYear());
            }}
            disabled={(date) => date > new Date()}
            initialFocus
            className="p-3 pointer-events-auto rounded-lg border shadow-lg bg-white"
          />
        </PopoverContent>
      </Popover>
      
      {error && (
        <p className="mt-1 text-sm text-vedic-error animate-slide-down">
          {error}
        </p>
      )}
    </div>
  );
};

export default DatePicker;
