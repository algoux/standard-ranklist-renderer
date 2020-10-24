import React from 'react';
import './Ranklist.less';
import { secToTimeStr } from './utils/format';
import moment from 'moment';



interface State {
    width: number;
    elapsed: number;
    remaining: number;
    show: boolean;

}

let time_ = 0;

export default class Progress extends React.Component<any, State> {
    constructor(props: any) {
        super(props);
        this.state = {
            width: 0,
            elapsed: 0,
            remaining: 0,
            show: true

        };
    }

    componentDidMount(): void {
        const { _now, contest } = this.props;
        if (_now) {
            let elapsed_time = moment.duration(moment(_now).valueOf() - moment(contest.startAt).valueOf()).as('seconds');
            let remaining_time = moment.duration(moment(moment(contest.startAt).add(this.props.formatTimeDuration(contest.duration), 'ms').format('YYYY-MM-DD HH:mm:ss')).valueOf() - moment(_now).valueOf()).as('seconds');
            time_ = 100 / (contest.duration[0] * 3600);
            this.setState({
                width: elapsed_time * time_,
                elapsed: elapsed_time,
                remaining: remaining_time
            })
            var timer = setInterval(() => {
                let count = this.state.width;
                count += time_;
                elapsed_time++;
                remaining_time--;
                this.setState({
                    width: count,
                    elapsed: elapsed_time,
                    remaining: remaining_time
                })
                if (remaining_time == 0) {
                    clearInterval(timer)
                }
            }, 1000);
        }
    }

    render() {
        const { _now } = this.props;
        return <div>
            {_now ?
                <div><div id="progressbar" >
                    <div id="fill" style={{ width: this.state.width + '%' }}></div>

                </div >
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div>Elapsed: {secToTimeStr(this.state.elapsed)}</div>
                        <div>Remaining: {secToTimeStr(this.state.remaining)}</div>
                    </div></div> : ""}

        </div >
    }
}
