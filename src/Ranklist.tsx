import React from 'react';
import './Ranklist.less';
import * as srk from './srk';
import srkChecker from "./srk-checker/index.d.ti";
import { createCheckers } from "ts-interface-checker";
import _ from 'lodash';
import moment from 'moment';
import { numberToAlphabet } from './utils/format';
import classnames from 'classnames';

const { Ranklist: ranklistChecker } = createCheckers(srkChecker);

enum EnumTheme {
  light = 'light',
  dark = 'dark',
}

interface ThemeColor {
  [EnumTheme.light]: string | undefined;
  [EnumTheme.dark]: string | undefined;
}

export interface RanklistProps {
  data: srk.Ranklist;
}

interface State {
  theme: keyof typeof EnumTheme;
}

export default class Ranklist extends React.Component<RanklistProps, State> {
  constructor(props: RanklistProps) {
    super(props);
    this.state = {
      theme: EnumTheme.light,
    };
  }

  componentDidMount(): void {
    this.preCheckData(this.props.data);
  }

  UNSAFE_componentWillReceiveProps(p: RanklistProps, np: RanklistProps): void {
    if (!_.isEqual(p.data, np.data)) {
      this.preCheckData(np.data);
    }
  }

  preCheckData(data: any): void {
    try {
      ranklistChecker.check(data);
    } catch (e) {
      throw new Error('Ranklist Data Check ' + e.toString());
    }
  }

  resolveColor(color: srk.Color) {
    if (Array.isArray(color)) {
      return `rgba(${color[0]},${color[1]},${color[2]},${color[3]})`;
    } else if(color) {
      return color;
    }
    return undefined;
  }

  resolveThemeColor(themeColor: srk.ThemeColor): ThemeColor {
    let light = this.resolveColor(themeColor[0]);
    let dark = this.resolveColor(themeColor[1] || themeColor[0]);
    return {
      [EnumTheme.light]: light,
      [EnumTheme.dark]: dark,
    };
  }

  resolveStyle(style: srk.Style) {
    const { textColor, backgroundColor } = style;
    const textThemeColor = this.resolveThemeColor(textColor || ['']);
    const backgroundThemeColor = this.resolveThemeColor(backgroundColor || ['']);
    return {
      textColor: textThemeColor,
      backgroundColor: backgroundThemeColor,
    };
  }

  genExternalLink(link: string, children: React.ReactNode) {
    return <a href={link} target="_blank" rel="noopener noreferrer">{children}</a>;
  }

  renderContestBanner = () => {
    const banner = this.props.data.contest.banner;
    if (!banner) {
      return null;
    }
    let imgSrc = '';
    let link = '';
    if (Array.isArray(banner)) {
      [imgSrc, link] = banner;
    } else {
      imgSrc = banner;
    }
    const imgComp = <img src={imgSrc} alt="Contest Banner" className="-full-width" />;
    if (link) {
      return this.genExternalLink(link, imgComp);
    } else {
      return imgComp;
    }
  }

  renderSingleProblemHeader = (p: srk.Problem, index: number) => {
    const { theme } = this.state;
    const alias = p.alias ? p.alias : numberToAlphabet(index);
    const stat = p.statistics;
    const { textColor, backgroundColor } = this.resolveStyle(p.style || {});
    const innerComp = <>
      <span className="-display-block" style={{ color: textColor[theme] }}>{alias}</span>
      {stat ? <span className="-display-block">{stat.accepted} / {stat.submitted}</span> : null}
    </>;
    const cellComp = p.link ? this.genExternalLink(p.link, innerComp) : innerComp;
    return <th key={p.title} style={{ backgroundColor: backgroundColor[theme] }}>{cellComp}</th>;
  }

  renderSingleSeriesBody = (rk: srk.RankValue, series: srk.RankSeries, row: srk.RanklistRow) => {
    const { theme } = this.state;
    const innerComp: React.ReactNode = rk.rank ? rk.rank : (row.user.official === false ? '*' : '');
    const segment = (series.segments || [])[(rk.segmentIndex || rk.segmentIndex === 0) ? rk.segmentIndex : -1] || {};
    const segmentStyle = segment.style;
    let className = '';
    let textColor: ThemeColor = {
      [EnumTheme.light]: undefined,
      [EnumTheme.dark]: undefined,
    };
    let backgroundColor: ThemeColor = {
      [EnumTheme.light]: undefined,
      [EnumTheme.dark]: undefined,
    };
    if (typeof segmentStyle === 'string') {
      className = segmentStyle;
    } else if (segmentStyle) {
      const style = this.resolveStyle(segmentStyle);
      textColor = style.textColor;
      backgroundColor = style.backgroundColor;
    }
    return <td
      key={series.title}
      className={classnames('-text-right', className)}
      style={{ color: textColor[theme], backgroundColor: backgroundColor[theme] }}
    >
      {innerComp}
    </td>;
  }

  renderSingleStatusBody = (st: srk.RankProblemStatus, problemIndex: number) => {
    const result = st.result;
    const commonClassName = '-text-center';
    switch (result) {
      case 'FB':
        return <td className={classnames(commonClassName, 'fb')}>{st.tries}/{st.time ? st.time[0] : '-'}</td>;
      case 'AC':
        return <td className={classnames(commonClassName, 'accepted')}>{st.tries}/{st.time ? st.time[0] : '-'}</td>;
      case '?':
        return <td className={classnames(commonClassName, 'frozen')}>{st.tries}</td>;
      case 'RJ':
        return <td className={classnames(commonClassName, 'failed')}>{st.tries}</td>;
      default:
        return null;
    }
  }

  render() {
    const { data } = this.props;
    console.log('ranklist data', this.props.data);
    const { type, version, contest, problems, series, rows, sorter, _now } = data;
    if (type !== 'standard') {
      return <div>Ranklist type "{type}" is not supported</div>
    }
    return <div className="ranklist">
      <div className="contest -text-center">
        {this.renderContestBanner()}
        <h2>{contest.title}</h2>
        <p>
          {moment(contest.startAt).format('YYYY-MM-DD HH:mm:ss Z')} {contest.duration[0]}{contest.duration[1]}
          {contest.frozenDuration ? <span> (Frozen {contest.frozenDuration[0]}{contest.frozenDuration[1]})</span> : null}
        </p>
        {contest.link ? <p>{this.genExternalLink(contest.link, 'View Original Ranklist')}</p> : null}
      </div>

      <div className="rows">
        <table>
          <thead>
            <tr>
              {series.map(s => <th key={s.title}>{s.title}</th>)}
              <th>User</th>
              <th>Score</th>
              <th>Time</th>
              {problems.map((p, index) => this.renderSingleProblemHeader(p, index))}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => <tr key={r.user.id || r.user.name}>
              {r.ranks.map((rk, index) => this.renderSingleSeriesBody(rk, series[index], r))}
              <td>{r.user.name}</td>
              <td className="-text-right">{r.score.value}</td>
              <td className="-text-right">{r.score.time ? r.score.time[0] : '-'}</td>
              {r.statuses.map((st, index) => this.renderSingleStatusBody(st, index))}
            </tr>)}
          </tbody>
        </table>
      </div>
    </div>
  }
}
