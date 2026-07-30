import { useMemo } from 'react';
import { classNames } from '../../utils/helpers';
import './TimeSlotPicker.css';

const fmtTime = (time24) => {
  const [hStr, mStr] = time24.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return time24;
  const period = h >= 12 ? 'PM' : 'AM';
  const hh = ((h + 11) % 12) + 1;
  return `${hh}:${String(m).padStart(2, '0')} ${period}`;
};

const generateSlots = (startTime, endTime, slotMinutes, taken = new Set()) => {
  if (!startTime || !endTime || !slotMinutes) return [];
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const startTotal = sh * 60 + sm;
  const endTotal = eh * 60 + em;
  const slots = [];
  for (let minutes = startTotal; minutes < endTotal; minutes += slotMinutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    slots.push({
      value,
      label: fmtTime(value),
      disabled: taken.has(value),
    });
  }
  return slots;
};

const TimeSlotPicker = ({
  startTime,
  endTime,
  slotMinutes = 30,
  value,
  onChange,
  takenSlots = [],
  disabled = false,
}) => {
  const slots = useMemo(
    () => generateSlots(startTime, endTime, slotMinutes, new Set(takenSlots)),
    [startTime, endTime, slotMinutes, takenSlots],
  );

  if (slots.length === 0) {
    return (
      <p className="time-slot-picker__empty">
        Pick a doctor first - their schedule defines the available slots.
      </p>
    );
  }

  return (
    <div className="time-slot-picker">
      {slots.map((slot) => (
        <button
          key={slot.value}
          type="button"
          disabled={slot.disabled || disabled}
          className={classNames('time-slot-picker__slot', {
            'time-slot-picker__slot--active': value === slot.value,
            'time-slot-picker__slot--taken': slot.disabled,
          })}
          onClick={() => onChange?.(slot.value)}
        >
          {slot.label}
        </button>
      ))}
    </div>
  );
};

export default TimeSlotPicker;