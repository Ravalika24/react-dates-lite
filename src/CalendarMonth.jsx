/* @flow */
import * as React from 'react';
import * as R from 'ramda';

import format from 'date-fns/format';
import getDate from 'date-fns/getDate';
import isSameMonth from 'date-fns/isSameMonth';

import CalendarDay from './CalendarDay';

import * as utils from './utils';
import * as dayHelpers from './utils/dayHelpers';

import styles from './styles.css';

type Props = {|
  selectDate: Date => void,
  onHover: Date => void,
  month: Date,
  selectedDates: Date[],
  disabledDates: Date[],
  allowedDates: Date[],
  hoveredDates: Date[],
  past: boolean,
  future: boolean,
  colors: {| [string]: string |},
  classes: {| [string]: string |},
  className: string,
  isFocused: boolean
|};

const CalendarMonth = ({
  month,
  selectedDates,
  disabledDates,
  allowedDates,
  selectDate,
  onHover,
  hoveredDates,
  past,
  future,
  colors,
  classes,
  isFocused,
  className = ''
}: Props) => {
  const toRender = utils.calendarDaysToRender(month);
  return (
    <div className={`${classes.month && classes.month} ${className}`}>
      <span className={styles.monthName}>{format(month, 'MMMM YYYY')}</span>

      <div className={styles.dayNameList}>
        {R.map(
          day => (
            <span key={day} className={styles.dayName}>
              {format(day, 'dd')}
            </span>
          ),
          utils.calendarDayNames(toRender)
        )}
      </div>

      <div className={styles.month}>
        {R.map(
          week => (
            <div key={week} className={styles.week}>
              {R.map(
                day => (
                  <CalendarDay
                    key={day}
                    isHidden={!isSameMonth(month, day)}
                    number={getDate(day)}
                    value={day}
                    selectDate={selectDate}
                    onHover={onHover}
                    isHovered={dayHelpers.isHovered(day, hoveredDates)}
                    isSelected={dayHelpers.isSelected(day, selectedDates)}
                    isDisabled={
                      dayHelpers.isDisabled(day, disabledDates) ||
                      (!R.isEmpty(allowedDates) &&
                        !dayHelpers.isDisabled(day, allowedDates))
                    }
                    isPast={dayHelpers.isPast(day, new Date()) && !past}
                    isFuture={dayHelpers.isFuture(day, new Date()) && !future}
                    colors={colors}
                    classes={classes}
                    isFocused={isFocused}
                  />
                ),
                week
              )}
            </div>
          ),
          R.splitEvery(7, toRender)
        )}
      </div>
    </div>
  );
};

export default CalendarMonth;
