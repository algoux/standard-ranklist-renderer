import React from 'react';
import { ToastContainer, toast, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ScrollSolution.less';
import * as srk from '../../../srk';
import request from '../../../utils/request';

export interface ScrollSolutionDataItem {
  problem: srk.Problem;
  score: {
    value: srk.RankScore['value'];
  };
  result: Exclude<srk.SolutionResultFull, null>;
  user: srk.User;
}

export interface ScrollSolutionData {
  rows: ScrollSolutionDataItem[];
  updatedAt: number; // timestamp (s)
}

export interface ScrollSolutionImplProps {
  dataUrl: string;
  interval: number;
}

interface State {

}

const RJ_DELAY = 10 * 1000;
const DELAY_MAP = {
  FB: 180 * 1000,
  AC: 20 * 1000,
  RJ: RJ_DELAY,
  '?': 10 * 1000,
  WA: RJ_DELAY,
  PE: RJ_DELAY,
  TLE: RJ_DELAY,
  MLE: RJ_DELAY,
  OLE: RJ_DELAY,
  RTE: RJ_DELAY,
  CE: RJ_DELAY,
  UKE: RJ_DELAY,
};
const POP_LIMIT = 20;
const POP_INTERVAL = 200; // ms
const MIN_DELAY = 1000; // ms

export default class ScrollSolutionImpl extends React.Component<ScrollSolutionImplProps, State> {
  _updatedAt: number = 0;
  _queue: ScrollSolutionDataItem[] = [];
  _popInterval: number = POP_INTERVAL;
  _timer: number = 0;

  constructor(props: ScrollSolutionImplProps) {
    super(props);
  }

  componentDidMount() {
    this.popFromQueue();
    this.requestData();
    // @ts-ignore
    this._timer = setInterval(() => this.requestData(), this.props.interval);
  }

  componentWillUnmount() {
    clearInterval(this._timer);
  }

  pop(data: ScrollSolutionDataItem, delay: number) {
    toast(<div className="container">
      <div className="score">{data.score.value}</div>
      <div className="user">
        <span className="user-name">{data.user.name}</span>
        {data.user.organization && <span className="user-second-name">{data.user.organization}</span>}
      </div>
      <div className="problem">{data.problem.alias}</div>
      {this.renderResultLabel(data.result)}
    </div>, {
      autoClose: delay,
    });
  }

  handleSolutions(rows: ScrollSolutionDataItem[]) {
    // console.log('handleSolutions', rows);
    const count = rows.length;
    if (!count) {
      return;
    }
    for (const d of rows) {
      if (d.result === 'FB') {
        this.pop(d, DELAY_MAP[d.result]);
      } else {
        this._queue.push(d);
      }
    }
  }

  popFromQueue() {
    if (this._queue.length > 0) {
      // console.warn('popFromQueue', this._queue.length, this._popInterval);
      const { interval } = this.props;
      const maxPopInterval = interval / POP_LIMIT;
      let delay: number = DELAY_MAP[this._queue[0].result];
      if (this._queue.length <= POP_LIMIT) {
        this._popInterval = maxPopInterval;
      } else {
        const scale = Math.max(1 / (this._queue.length / POP_LIMIT) - 0.5, 0.01);
        // console.log('scale', scale);
        delay = MIN_DELAY + DELAY_MAP[this._queue[0].result] * scale;
        this._popInterval = maxPopInterval * scale;
      }
      // console.log('popFromQueue pop:', delay);
      this.pop(this._queue[0], delay);
      this._queue.splice(0, 1);
    }
    setTimeout(() => this.popFromQueue(), this._popInterval);
  }

  requestData = async () => {
    try {
      const data = await request(this.props.dataUrl, {
        method: 'GET',
        timeout: 30 * 1000,
      });
      if (data && data.updatedAt && data.updatedAt !== this._updatedAt) {
        this._updatedAt = data.updatedAt;
        this.handleSolutions(data.rows);
      }
      // // test
      // const add = Math.floor(Math.random() * 10);
      // const rows = new Array(add).fill(undefined).map(x => {
      //   const res = Math.floor(Math.random() * 100);
      //   return {
      //     "problem": {
      //       "alias": "B"
      //     },
      //     "score": {
      //       "value": 10
      //     },
      //     "result": res === 0 ? "FB" : res < 10 ? "AC" : "RJ",
      //     "user": {
      //       "id": "T248",
      //       "name": "没有人比我更懂ACM",
      //       "organization": "哈尔滨工业大学（深圳）",
      //       "marker": "female"
      //     }
      //   }
      // });
      // // @ts-ignore
      // this.handleSolutions(rows);
    } catch (e) {
      console.error('requestData scroll solution err:', e);
    }
  }

  renderResultLabel(result: ScrollSolutionDataItem['result']) {
    switch (result) {
      case 'FB':
        return <div className="result result-fb">
          <span>{result}</span>
        </div>;
      case 'AC':
        return <div className="result result-ac">{result}</div>;
      case 'RJ':
      case 'WA':
      case 'PE':
      case 'TLE':
      case 'MLE':
      case 'OLE':
      case 'RTE':
      case 'CE':
      case 'UKE':
        return <div className="result result-rj">{result}</div>;
      case '?':
        return <div className="result">?</div>;
      default:
        return <div className="result">--</div>;
    }
  }

  render() {
    return (
      <ToastContainer
        className="plugin_scroll-solution-container"
        position="bottom-left"
        autoClose={10000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover={false}
        closeButton={false}
        transition={Zoom}
        limit={POP_LIMIT}
      />
    );
  }
}
