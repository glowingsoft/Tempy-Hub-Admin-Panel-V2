

import { useMemo, useRef, useState } from 'react';

import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';

import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { calendarStyles } from './calendar-style';

export function AttendanceCalendar({ markedDates = [], selectedDate, onSelectDate, sx, ...other }) {

  const calendarRef = useRef(null);

  const [title, setTitle] = useState('');

  const markedSet = useMemo(() => new Set(markedDates), [markedDates]);

  const handlePrev = () => calendarRef.current?.getApi().prev();
  const handleNext = () => calendarRef.current?.getApi().next();

  const handleDatesSet = (arg) => {
    // arg.view.currentStart is the 1st of the visible month
    setTitle(
      arg.view.currentStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    );
  };

  const handleDateClick = (arg) => {
    onSelectDate?.(arg.dateStr);
  };

  const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const renderDayCell = (arg) => {
    const dateStr = formatLocalDate(arg.date);
    const isSelected = dateStr === selectedDate;
    const isMarked = markedSet.has(dateStr);
    const isOutside = arg.isOther;

    const classNames = ['day-pill'];
    if (isOutside) classNames.push('day-pill--outside');
    if (isMarked && !isOutside) classNames.push('day-pill--marked');
    if (isSelected) classNames.push('day-pill--selected');

    return (
      <div className={classNames.join(' ')}>
        <span>{arg.dayNumberText.replace(/\D/g, '')}</span>
        {isMarked && !isOutside && <span className="day-pill__dot" />}
      </div>
    );
  };

  return (
    <>
      {calendarStyles}

      <Card sx={{ p: 3, ...sx }} {...other}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6">{title}</Typography>

          <Stack direction="row" spacing={0.5}>
            <IconButton size="small" onClick={handlePrev}>
              <Iconify icon="eva:arrow-ios-back-fill" />
            </IconButton>
            <IconButton size="small" onClick={handleNext}>
              <Iconify icon="eva:arrow-ios-forward-fill" />
            </IconButton>
          </Stack>
        </Stack>

        <div className="attendance-calendar">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={false}
            firstDay={1}
            fixedWeekCount={false}
            dayCellContent={renderDayCell}
            dateClick={handleDateClick}
            datesSet={handleDatesSet}
            height="auto"
          />
        </div>
      </Card>
    </>
  );
}