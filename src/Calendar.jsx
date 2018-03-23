/* @flow */
import * as React from 'react';
import * as R from 'ramda';
import cx from 'classnames';
import eachDayOfInterval from 'date-fns/eachDayOfInterval';
import isSameDay from 'date-fns/isSameDay';
import isBefore from 'date-fns/isBefore';

import CalendarMonth from './CalendarMonth';
import ArrowLeft from './ArrowLeft';
import ArrowRight from './ArrowRight';

import * as utils from './utils';

import styles from './styles.css';

const defaultColors = {
  selected: 'rgb(244, 114, 49)',
  selectedHover: 'rgb(255, 141, 74)',
  border: '#e4e7e7',
  background: 'white',
  hover: '#e4e7e7',
  disabled: 'gray'
};

export const getWidth = (number: number): number => {
  if (number === 1) {
    return 301;
  }
  return number * 301; // 311 - 10 = 301 : 10 = margin
};

type Props = {|
  selectDates: (Date[]) => any,
  selectedDates: Date[],
  disabledDates: Date[],
  allowedDates: Date[],
  visibleMonths: number,
  future: boolean,
  past: boolean,
  colors: {| [string]: string |},
  classes: {| [string]: string |},
  className: string,
  rangeSelect: boolean,
  firstMonth: Date,
  lastMonth: Date
|};

type State = {|
  hoveredDates: Date[],
  start: Date | null,
  end: Date | null,
  currentMonth: number,
  isFocused: boolean,
  selectedInternally: boolean
|};

export default class Calendar extends React.PureComponent<Props, State> {
  static defaultProps = {
    disabledDates: [],
    allowedDates: [],
    visibleMonths: 1,
    numberOfPastMonths: 0,
    colors: defaultColors,
    className: '',
    classes: {},
    future: true,
    past: true,
    rangeSelect: false
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      end: null,
      hoveredDates: [],
      currentMonth: utils.getCurrentMonthIndex(
        props.firstMonth,
        props.lastMonth,
        props.selectedDates,
        props.future,
        props.visibleMonths
      ),
      isFocused: false,
      start: null,
      // eslint-disable-next-line react/no-unused-state
      selectedInternally: false
    };
  }

  componentWillUpdate(nextProps: Props, nextState: State) {
    // when selectedDates came as a props, we need to know if they were changed
    // if they were, then we have to determine if they were changed internally
    // or externaly (from parent component)
    if (nextProps.selectedDates !== this.props.selectedDates) {
      this.handleSetCurrentMonth(nextProps, nextState);
    }
  }

  handleNext = () => {
    this.setState(state => ({
      currentMonth: state.currentMonth + 1
    }));
  };

  handlePrev = () => {
    this.setState(state => ({
      currentMonth: state.currentMonth - 1
    }));
  };

  /**
   * Method that will set current month
   * atm it's called only when dates are selected externally,
   * it means that dates were selected from parent component and pass as a
   * @argument {Props} nextProps
   * @argument {State} nextState
   */
  handleSetCurrentMonth = (nextProps: Props, nextState: State) => {
    const { firstMonth, lastMonth, future, visibleMonths } = this.props;
    // if date wasn't selected internally (it means that selectedDates
    // was changed from parent component ) then calculate current month and set it
    // also set selectedInternally to false
    if (!nextState.selectedInternally) {
      const currentMonth = utils.getCurrentMonthIndex(
        firstMonth,
        lastMonth,
        nextProps.selectedDates,
        future,
        visibleMonths
      );
      // eslint-disable-next-line react/no-unused-state
      this.setState({ selectedInternally: false, currentMonth });
      // }
      // otherwise just set selectedInternally to false, so we can determine if next
      // date select will be done in this component or in parent component
    } else {
      // eslint-disable-next-line react/no-unused-state
      this.setState({ selectedInternally: false });
    }
  };

  /**
   * Method for selecting date range
   * @argument {Date} date
   */
  handleSetRange = (date: Date) => {
    const { start } = this.state;
    const { disabledDates } = this.props;
    // when someting is already selected (start)
    // and we clicked on some date (date)
    // then we will set array of dates between
    // date and start - it depends which one is first
    // selected array of dates is sorted ascending
    if (date && start) {
      // eslint-disable-next-line react/no-unused-state
      this.setState({ selectedInternally: true });
      if (isBefore(date, start)) {
        const range = eachDayOfInterval({ start: date, end: start });
        this.props.selectDates(R.without(disabledDates, range));
      } else {
        const range = eachDayOfInterval({ start, end: date });
        this.props.selectDates(R.without(disabledDates, range));
      }
    }
  };

  /**
   * Method for handling date select
   * @argument {Date} date
   */
  handleSelect = (date: Date) => {
    const { disabledDates, rangeSelect } = this.props;
    const { isFocused, end, start } = this.state;
    // when something is already selected
    if (isFocused && rangeSelect) {
      this.setState({
        end: date,
        isFocused: false,
        hoveredDates: [],
        // eslint-disable-next-line react/no-unused-state
        selectedInternally: true
      });
      this.handleSetRange(date);
      // when unselecting date
    } else if (
      // $FlowExpected
      isSameDay(date, end) &&
      // $FlowExpected
      isSameDay(end, start)
    ) {
      this.setState({
        start: null,
        end: null,
        isFocused: false,
        // eslint-disable-next-line react/no-unused-state
        selectedInternally: true
      });
      this.props.selectDates([]);
      // initial select case
    } else {
      this.setState({
        start: date,
        isFocused: true,
        // eslint-disable-next-line react/no-unused-state
        selectedInternally: true
      });
      this.props.selectDates(R.without(disabledDates, [date]));
    }
  };

  /**
   * Method for handling date hover
   * @argument {Date} date
   */
  handleHover = (date: Date) => {
    const { rangeSelect } = this.props;
    const { isFocused, start } = this.state;
    if (start && date && isFocused && rangeSelect) {
      if (isBefore(date, start)) {
        this.setState({
          hoveredDates: eachDayOfInterval({ start: date, end: start })
        });
      } else {
        this.setState({
          hoveredDates: eachDayOfInterval({
            start,
            end: date
          })
        });
      }
    }
  };

  render() {
    const {
      visibleMonths,
      selectedDates,
      disabledDates,
      allowedDates,
      colors,
      className,
      classes,
      past,
      future,
      firstMonth,
      lastMonth
    } = this.props;

    const { currentMonth, hoveredDates, isFocused } = this.state;

    const mergedColors = R.merge(defaultColors, colors);
    const months = utils.getMonths(firstMonth, lastMonth);

    return (
      <div
        className={cx(styles.calendarWrapper, className)}
        style={{ maxWidth: getWidth(visibleMonths) }}>
        <button
          data-test="rdl-prev-button"
          className={cx(styles.navBtn, styles.navBtnLeft, classes.button)}
          onClick={this.handlePrev}
          disabled={currentMonth === 0 || months.length <= visibleMonths}
          colors={mergedColors}>
          <ArrowLeft className={cx(styles.arrow, styles.arrowLeft)} />
        </button>

        <button
          data-test="rdl-next-button"
          className={cx(styles.navBtn, styles.navBtnRight, classes.button)}
          onClick={this.handleNext}
          disabled={
            currentMonth === R.subtract(R.length(months), visibleMonths) ||
            months.length <= visibleMonths
          }
          colors={mergedColors}>
          <ArrowRight className={cx(styles.arrow, styles.arrowRight)} />
        </button>
        <div
          className={cx(styles.calendarMonthWrapper, classes.calendarWrapper)}>
          {R.map(
            month => (
              <CalendarMonth
                className={styles.calendarMonth}
                key={month}
                month={month}
                selectedDates={selectedDates}
                disabledDates={disabledDates}
                allowedDates={allowedDates}
                selectDate={this.handleSelect}
                onHover={this.handleHover}
                hoveredDates={hoveredDates}
                past={past}
                isFocused={isFocused}
                future={future}
                colors={mergedColors}
                classes={classes}
              />
            ),
            utils.calendarMonthsToRender(visibleMonths, currentMonth, months)
          )}
        </div>
      </div>
    );
  }
}
