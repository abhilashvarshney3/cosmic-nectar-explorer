
import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  error?: string;
}

const DatePicker = ({ date, setDate, error }: DatePickerProps) => {
  const [open, setOpen] = useState(false);

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
          <Calendar
            mode="single"
            selected={date}
            onSelect={(date) => {
              setDate(date);
              setOpen(false);
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
