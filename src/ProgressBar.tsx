import React from 'react';
import { secToTimeStr } from './utils/format';
import moment from 'moment';
import * as srk from './srk';
import './ProgressBar.less';

export interface ProgressBarProps {
  _now: srk.Ranklist['_now'];
  startAt: srk.Contest['startAt'];
  duration: srk.Contest['duration'];
  frozenDuration: srk.Contest['frozenDuration'];
  getTimeDurationMs: (time: srk.TimeDuration) => number;
}

interface State {
  width: number;
  elapsed: number;
  remaining: number;
  show: boolean;
}

export default class ProgressBar extends React.Component<ProgressBarProps, State> {
  private _time: number = 0;

  constructor(props: any) {
    super(props);
    this.state = {
      width: 0,
      elapsed: 0,
      remaining: 0,
      show: true,
    };
  }

  componentDidMount(): void {
    const { _now, startAt, duration } = this.props;
    if (_now) {
      let elapsedTime = moment
        .duration(moment(_now).valueOf() - moment(startAt).valueOf())
        .as('seconds');
      let remainingTime = moment
        .duration(
          moment(
            moment(startAt)
              .add(this.props.getTimeDurationMs(duration), 'ms')
              .format('YYYY-MM-DD HH:mm:ss'),
          ).valueOf() - moment(_now).valueOf(),
        )
        .as('seconds');

      this._time = 100 / (duration[0] * 3600);
      this.setState({
        width: elapsedTime * this._time,
        elapsed: remainingTime <= 0 ? 0 : elapsedTime,
        remaining: remainingTime,
      });
      var timer = setInterval(() => {
        if (remainingTime <= 0) {
          clearInterval(timer);
        } else {
          let count = this.state.width;
          count += this._time;
          elapsedTime++;
          remainingTime--;
          this.setState({
            width: count,
            elapsed: elapsedTime,
            remaining: remainingTime,
          });
        }
      }, 1000);
    }
  }

  render() {
    const { _now } = this.props;
    return (
      <div className="progress-bar">
        {_now ? (
          <div>
            <div className="progress-bar-container">
              <div className="progess-bar-fill" style={{ width: this.state.width + '%' }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>Elapsed: {secToTimeStr(this.state.elapsed)}</div>
              <div>Remaining: {secToTimeStr(this.state.remaining)}</div>
            </div>
          </div>
        ) : (
          ''
        )}
      </div>
    );
  }
}
