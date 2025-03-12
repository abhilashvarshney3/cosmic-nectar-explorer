import { useState, useEffect } from 'react';
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
  const years = Array.from({ length: 150 }, (_, i) => currentYear - 100 + i);

  // Update month and year state when date changes externally
  useEffect(() => {
    if (date) {
      setMonth(date.getMonth());
      setYear(date.getFullYear());
    }
  }, [date]);

  const handleMonthChange = (value: string) => {
    const newMonth = parseInt(value);
    setMonth(newMonth);
    
    const newDate = date ? new Date(date) : new Date();
    newDate.setMonth(newMonth);
    
    if (!date) {
      // If no date was selected yet, set it to the 1st of the month
      newDate.setDate(1);
      newDate.setFullYear(year);
    } else {
      // Keep the current day, but adjust it if it would overflow the month
      const newMonthDays = new Date(newDate.getFullYear(), newMonth + 1, 0).getDate();
      if (newDate.getDate() > newMonthDays) {
        newDate.setDate(newMonthDays);
      }
    }
    
    setDate(newDate);
  };

  const handleYearChange = (value: string) => {
    const newYear = parseInt(value);
    setYear(newYear);
    
    const newDate = date ? new Date(date) : new Date();
    
    // Store the day before changing the year (to handle leap years)
    const currentDay = newDate.getDate();
    
    newDate.setFullYear(newYear);
    
    if (!date) {
      // If no date was selected yet, set it to the 1st of the month
      newDate.setDate(1);
      newDate.setMonth(month);
    } else {
      // Check if we need to adjust the day (e.g., February 29 -> February 28 in non-leap years)
      const maxDay = new Date(newYear, newDate.getMonth() + 1, 0).getDate();
      newDate.setDate(Math.min(currentDay, maxDay));
    }
    
    setDate(newDate);
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
        <PopoverContent className="w-auto p-0 bg-white" align="start">
          <div className="flex gap-2 p-3 border-b">
            <Select value={month.toString()} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent className="bg-white max-h-[300px]" position="popper">
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
              <SelectContent className="bg-white max-h-[300px] overflow-y-auto" position="popper">
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
            onSelect={(newDate) => {
              setDate(newDate);
              if (newDate) {
                setMonth(newDate.getMonth());
                setYear(newDate.getFullYear());
              }
              setOpen(false);
            }}
            month={new Date(year, month)}
            onMonthChange={(newDate) => {
              setMonth(newDate.getMonth());
              setYear(newDate.getFullYear());
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
