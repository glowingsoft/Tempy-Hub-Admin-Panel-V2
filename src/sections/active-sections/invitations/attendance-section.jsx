import { useState } from 'react';
import { AttendanceCalendar } from './attendance-calendar';
import { fDate } from 'src/utils/format-time';

// ----------------------------------------------------------------------

const MARKED_DATES = ['2026-08-02', '2026-08-07', '2026-08-10'];

export function AttendanceSection() {
  const [selectedDate, setSelectedDate] = useState(fDate(new Date()));

  return (
    <AttendanceCalendar
      markedDates={MARKED_DATES}
      selectedDate={selectedDate}
      onSelectDate={setSelectedDate}
    />
  );
}