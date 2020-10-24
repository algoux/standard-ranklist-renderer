import React from 'react';
import './Ranklist.less';
import * as srk from './srk';
import srkChecker from './srk-checker/index.d.ti';
import { createCheckers } from 'ts-interface-checker';
import _ from 'lodash';
import moment from 'moment';
import { numberToAlphabet, secToTimeStr } from './utils/format';
import classnames from 'classnames';
import TeamFilterModal from './components/TeamFilterModal';

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

  UNSAFE_componentWillReceiveProps(np: RanklistProps): void {
    const p = this.props;
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

  formatTimeDuration(time: srk.TimeDuration, targetUnit: srk.TimeUnit = 'ms', fmt: (num: number) => number = num => num) {
    let ms = -1;
    switch (time[1]) {
      case 'ms':
        ms = time[0];
        break;
      case 's':
        ms = time[0] * 1000;
        break;
      case 'min':
        ms = time[0] * 1000 * 60;
        break;
      case 'h':
        ms = time[0] * 1000 * 60 * 60;
        break;
      case 'd':
        ms = time[0] * 1000 * 60 * 60 * 24;
        break;
    }
    switch (targetUnit) {
      case 'ms':
        return ms;
      case 's':
        return fmt(ms / 1000);
      case 'min':
        return fmt(ms / 1000 / 60);
      case 'h':
        return fmt(ms / 1000 / 60 / 60);
      case 'd':
        return fmt(ms / 1000 / 60 / 60 / 24);
    }
    return -1;
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
    let light = this.resolveColor(typeof themeColor === 'string' ? themeColor : themeColor.light);
    let dark = this.resolveColor(typeof themeColor === 'string' ? themeColor : themeColor.dark);
    return {
      [EnumTheme.light]: light,
      [EnumTheme.dark]: dark,
    };
  }

  resolveStyle(style: srk.Style) {
    const { textColor, backgroundColor } = style;
    const textThemeColor = this.resolveThemeColor(textColor || '');
    const backgroundThemeColor = this.resolveThemeColor(backgroundColor || '');
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
    if (typeof banner === 'string') {
      imgSrc = banner;
    } else {
      imgSrc = banner.image;
      link = banner.link;
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
      {stat ? <span className="-display-block" style={{ color: textColor[theme] }}>{stat.accepted} / {stat.submitted}</span> : null}
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

  renderUserName = (user: srk.User) => {
    const { teamMembers = [] } = user;
    const memberStr = teamMembers.map(m => m.name || '').join(' / ');
    return (
      <span title={memberStr}>{user.name}</span>
    );
  }

  renderMarker = (markerId?: srk.Marker['id']) => {
    if (!markerId) {
      return null;
    }
    const { data: { markers = [] } } = this.props;
    const { theme } = this.state;
    const marker = markers.find(m => m.id === markerId);
    if (!marker) {
      return null;
    }
    const markerStyle = marker.style;
    let className = '';
    let textColor: ThemeColor = {
      [EnumTheme.light]: undefined,
      [EnumTheme.dark]: undefined,
    };
    let backgroundColor: ThemeColor = {
      [EnumTheme.light]: undefined,
      [EnumTheme.dark]: undefined,
    };
    if (typeof markerStyle === 'string') {
      className = `marker-${markerStyle}`;
    } else if (markerStyle) {
      const style = this.resolveStyle(markerStyle);
      textColor = style.textColor;
      backgroundColor = style.backgroundColor;
    }
    return <span
      className={classnames('marker -ml-md', className)}
      style={{ color: textColor[theme], backgroundColor: backgroundColor[theme] }}
      title={marker.label}
    ></span>;
  }

  renderSingleStatusBody = (st: srk.RankProblemStatus, problemIndex: number) => {
    const result = st.result;
    const commonClassName = '-text-center';
    switch (result) {
      case 'FB':
        return <td className={classnames(commonClassName, 'fb')}>{st.tries}/{st.time ? this.formatTimeDuration(st.time, 'min', Math.floor) : '-'}</td>;
      case 'AC':
        return <td className={classnames(commonClassName, 'accepted')}>{st.tries}/{st.time ? this.formatTimeDuration(st.time, 'min', Math.floor) : '-'}</td>;
      case '?':
        return <td className={classnames(commonClassName, 'frozen')}>{st.tries}</td>;
      case 'RJ':
        return <td className={classnames(commonClassName, 'failed')}>{st.tries}</td>;
      default:
        return <td></td>;
    }
  }

  render() {
    const { data } = this.props;
    console.log('ranklist data', this.props.data);
    const { type, version, contest, problems, series, rows, sorter, _now } = data;
    if (type !== 'general') {
      return <div>Ranklist type "{type}" is not supported</div>
    }
    const hasOrganization = rows.filter(d => d.user.organization).length > 0;
    return <div className="ranklist">
      <div className="contest -text-center">
        {this.renderContestBanner()}
        <h2>{contest.title}</h2>
        <p>
          {moment(contest.startAt).format('YYYY-MM-DD HH:mm:ss')} - {moment(contest.startAt).add(this.formatTimeDuration(contest.duration), 'ms').format('YYYY-MM-DD HH:mm:ss Z')}
          {contest.frozenDuration ? <span> (Frozen {secToTimeStr(this.formatTimeDuration(contest.frozenDuration, 's', Math.floor))})</span> : null}
        </p>
        {contest.link ? <p>{this.genExternalLink(contest.link, 'View Original Ranklist')}</p> : null}
      </div>

      <div>
        <TeamFilterModal>
          <button>show TeamFiltermodal</button>
        </TeamFilterModal>
      </div>

      <div className="rows">
        <table>
          <thead>
            <tr>
              {series.map(s => <th key={s.title}>{s.title}</th>)}
              {hasOrganization && <th className="-text-left">Org.</th>}
              <th className="-text-left">Name</th>
              <th>Score</th>
              <th>Time</th>
              {problems.map((p, index) => this.renderSingleProblemHeader(p, index))}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => <tr key={r.user.id || r.user.name}>
              {r.ranks.map((rk, index) => this.renderSingleSeriesBody(rk, series[index], r))}
              {hasOrganization && <td className="-text-left">{r.user.organization}</td>}
              <td className="-text-left">
                {this.renderUserName(r.user)}
                {this.renderMarker(r.user.marker)}
              </td>
              <td className="-text-right">{r.score.value}</td>
              <td className="-text-right">{r.score.time ? this.formatTimeDuration(r.score.time, 'min', Math.floor) : '-'}</td>
              {r.statuses.map((st, index) => this.renderSingleStatusBody(st, index))}
            </tr>)}
          </tbody>
        </table>
      </div>
    </div>
  }
}
