import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { classNames } from '../../utils/helpers';
import './Calendar.css';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
const endOfMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);
const formatMonth = (date) =>
  new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
const toIso = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const Calendar = ({
  value,
  onChange,
  markers = {}, // { 'YYYY-MM-DD': count }
  minDate,
  maxDate,
}) => {
  const today = useMemo(() => new Date(), []);
  const initial = value ? new Date(value) : today;
  const [viewDate, setViewDate] = useState(() => startOfMonth(initial));

  const grid = useMemo(() => {
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(viewDate);
    const startDay = monthStart.getDay();
    const totalDays = monthEnd.getDate();
    const cells = [];
    // leading days from previous month
    for (let i = startDay; i > 0; i -= 1) {
      const d = new Date(monthStart);
      d.setDate(monthStart.getDate() - i);
      cells.push({ date: d, currentMonth: false });
    }
    for (let day = 1; day <= totalDays; day += 1) {
      const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
      cells.push({ date: d, currentMonth: true });
    }
    // trailing days to complete 6-week grid (42 cells)
    while (cells.length < 42) {
      const last = cells[cells.length - 1].date;
      const d = new Date(last);
      d.setDate(last.getDate() + 1);
      cells.push({ date: d, currentMonth: false });
    }
    return cells;
  }, [viewDate]);

  const selectedIso = value ? toIso(new Date(value)) : null;

  const handlePrev = () => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };
  const handleNext = () => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  };

  const isDisabled = (date) => {
    if (minDate && date < new Date(minDate)) return true;
    if (maxDate && date > new Date(maxDate)) return true;
    return false;
  };

  return (
    <div className="ui-calendar">
      <header className="ui-calendar__header">
        <button type="button" onClick={handlePrev} className="ui-calendar__nav" aria-label="Previous month">
          <ChevronLeft size={16} />
        </button>
        <p className="ui-calendar__title">{formatMonth(viewDate)}</p>
        <button type="button" onClick={handleNext} className="ui-calendar__nav" aria-label="Next month">
          <ChevronRight size={16} />
        </button>
      </header>
      <div className="ui-calendar__weekdays">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className="ui-calendar__weekday">{label}</span>
        ))}
      </div>
      <div className="ui-calendar__grid">
        {grid.map((cell) => {
          const iso = toIso(cell.date);
          const isSelected = iso === selectedIso;
          const isToday = isSameDay(cell.date, today);
          const markerCount = markers[iso] || 0;
          const disabled = !cell.currentMonth || isDisabled(cell.date);
          return (
            <button
              key={iso}
              type="button"
              className={classNames('ui-calendar__cell', {
                'ui-calendar__cell--out': !cell.currentMonth,
                'ui-calendar__cell--today': isToday,
                'ui-calendar__cell--selected': isSelected,
                'ui-calendar__cell--disabled': disabled,
                'ui-calendar__cell--has-marker': markerCount > 0,
              })}
              disabled={disabled}
              onClick={() => onChange?.(iso)}
            >
              <span className="ui-calendar__cell-num">{cell.date.getDate()}</span>
              {markerCount > 0 && (
                <span className="ui-calendar__cell-marker">{markerCount}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;