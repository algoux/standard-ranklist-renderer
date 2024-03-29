import React from 'react';
import './Ranklist.less';
import * as srk from './srk';
import srkChecker from './srk-checker/index.d.ti';
import { createCheckers } from 'ts-interface-checker';
import _ from 'lodash';
import moment from 'moment';
import { numberToAlphabet, secToTimeStr } from './utils/format';
import classnames from 'classnames';
import Color from 'color';
import semver from 'semver';
import { solutionsModal } from './components/SolutionsModal';
import ProgressBar from './ProgressBar';
import FilterBar from './FilterBar';
// @ts-ignore
import TEXTColor from 'textcolor';

const MIN_SUPPORTED_VERSION = '0.0.1';
const MAX_SUPPORTED_VERSION = '0.2.1';

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
  usingFilters?: Array<'marker' | 'userName' | 'userOrganization'>;
}

interface State {
  theme: keyof typeof EnumTheme;
  marker: string;
  filteredIds?: srk.User['id'][];
  error: string | null;
}

const { Ranklist: ranklistChecker } = createCheckers(srkChecker);

const defaultBackgroundColor = {
  [EnumTheme.light]: '#ffffff',
  [EnumTheme.dark]: '#191919',
};

export default class Ranklist extends React.Component<RanklistProps, State> {
  private _themeMedia: MediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');

  constructor(props: RanklistProps) {
    super(props);
    this.state = {
      theme: this._themeMedia.matches ? EnumTheme.dark : EnumTheme.light,
      marker: 'all',
      filteredIds: undefined,
      error: null,
    };
  }

  componentDidMount(): void {
    this.preCheckData(this.props.data);
    // @ts-ignore
    this._themeMedia.addEventListener('change', this.listenThemeChange);
    // this.setState({
    //   rows: this.props.data.rows,
    //   // rows_select: this.props.data.rows
    // })
    // let fill = document.getElementById("fill");
    // var count = 0;
    // var timer = setInterval(() => {
    //   count++;
    //   if (fill) {
    //     fill.style.width = count + "%";
    //   }
    //   if (count === 100) {
    //     clearInterval(timer)
    //   }
    // }, 1000);
  }

  UNSAFE_componentWillReceiveProps(np: RanklistProps): void {
    const p = this.props;
    if (!_.isEqual(p.data, np.data)) {
      // console.log('componentWillReceiveProp', JSON.stringify(np.data));
      this.preCheckData(np.data);
      // this.setState({
      //   rows: np.data.rows,
      //   // rows_select: np.data.rows
      // })
    }
  }
  componentWillUnmount() {
    // @ts-ignore
    this._themeMedia.removeEventListener('change', this.listenThemeChange);
  }

  listenThemeChange = (mql: MediaQueryList) => {
    if (mql.matches) {
      this.setState({
        theme: EnumTheme.dark,
      });
    } else {
      this.setState({
        theme: EnumTheme.light,
      });
    }
  };

  preCheckData(data: any): void {
    try {
      // console.log('preCheckData', JSON.stringify(data));
      ranklistChecker.check(data);
      this.setState({
        error: null,
      });
    } catch (e) {
      this.setState({
        error: 'Ranklist Data Check ' + e.toString(),
      });
      // throw new Error('Ranklist Data Check ' + e.toString());
    }
  }

  formatTimeDuration(
    time: srk.TimeDuration,
    targetUnit: srk.TimeUnit = 'ms',
    fmt: (num: number) => number = (num) => num,
  ) {
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
    } else if (color) {
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
    let usingTextColor: typeof textColor = textColor;
    // 未指定前景色时，尝试自动适配
    if (backgroundColor && !textColor) {
      if (typeof backgroundColor === 'string') {
        usingTextColor = TEXTColor.findTextColor(backgroundColor);
      } else {
        const { light, dark } = backgroundColor;
        usingTextColor = {
          light: light && TEXTColor.findTextColor(light),
          dark: dark && TEXTColor.findTextColor(dark),
        };
      }
    }
    const textThemeColor = this.resolveThemeColor(usingTextColor || '');
    const backgroundThemeColor = this.resolveThemeColor(backgroundColor || '');
    return {
      textColor: textThemeColor,
      backgroundColor: backgroundThemeColor,
    };
  }

  genExternalLink(link: string, children: React.ReactNode) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
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
  };

  renderSingleProblemHeader = (p: srk.Problem, index: number) => {
    const { theme } = this.state;
    const alias = p.alias ? p.alias : numberToAlphabet(index);
    const stat = p.statistics;
    const { textColor, backgroundColor } = this.resolveStyle(p.style || {});
    const innerComp = (
      <>
        <span className="-display-block" style={{ color: textColor[theme] }}>
          {alias}
        </span>
        {stat ? (
          <span className="-display-block problem-stats" style={{ color: textColor[theme] }}>
            {stat.accepted} / {stat.submitted}
          </span>
        ) : null}
      </>
    );
    const cellComp = p.link ? this.genExternalLink(p.link, innerComp) : innerComp;
    const bgColor = Color(backgroundColor[theme] || defaultBackgroundColor[theme])
      .alpha(0.75)
      .string();
    return (
      <th key={p.alias || p.title} className="-nowrap problem" style={{ backgroundColor: bgColor }}>
        {cellComp}
      </th>
    );
  };

  renderSingleSeriesBody = (rk: srk.RankValue, series: srk.RankSeries, row: srk.RanklistRow) => {
    const { theme } = this.state;
    const innerComp: React.ReactNode = rk.rank ? rk.rank : row.user.official === false ? '*' : '';
    const segment =
      (series.segments || [])[rk.segmentIndex || rk.segmentIndex === 0 ? rk.segmentIndex : -1] ||
      {};
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
    return (
      <td
        key={series.title}
        className={classnames('-text-right -nowrap', className)}
        style={{ color: textColor[theme], backgroundColor: backgroundColor[theme] }}
      >
        {innerComp}
      </td>
    );
  };

  renderUserName = (user: srk.User) => {
    const { teamMembers = [] } = user;
    const memberStr = teamMembers.map((m) => m.name || '').join(' / ');
    return <span title={memberStr}>{user.name}</span>;
  };

  renderUserBody = (user: srk.User) => {
    const {
      data: { markers = [] },
    } = this.props;
    const { theme } = this.state;
    let className = '';
    let bodyStyle: React.CSSProperties = {};
    let bodyLabel = '';
    const marker = markers.find((m) => m.id === user.marker);
    if (marker) {
      bodyLabel = marker.label;
      const markerStyle = marker.style;
      let backgroundColor: ThemeColor = {
        [EnumTheme.light]: undefined,
        [EnumTheme.dark]: undefined,
      };
      if (typeof markerStyle === 'string') {
        className = `marker-${markerStyle}`;
      } else if (markerStyle) {
        const style = this.resolveStyle(markerStyle);
        backgroundColor = style.backgroundColor;
        bodyStyle.backgroundImage = `linear-gradient(90deg, transparent 0%, ${backgroundColor[theme]} 100%)`;
      }
    }
    return (
      <td
        className={classnames('-text-left -nowrap marker-bg', className)}
        style={bodyStyle}
        title={bodyLabel}
      >
        {this.renderUserName(user)}
        {user.organization && (
          <p className="user-second-name" title="">
            {user.organization}
          </p>
        )}
      </td>
    );
  };

  renderResultLabel = (result: srk.Solution['result']) => {
    switch (result) {
      case 'FB':
        return <span className="solution-result-text result-fb">First Blood</span>;
      case 'AC':
        return <span className="solution-result-text result-ac">Accepted</span>;
      case 'RJ':
        return <span className="solution-result-text result-rj">Rejected</span>;
      case '?':
        return <span className="solution-result-text result-fz">Frozen</span>;
      case 'WA':
        return <span className="solution-result-text result-rj">Wrong Answer</span>;
      case 'PE':
        return <span className="solution-result-text result-rj">Presentation Error</span>;
      case 'TLE':
        return <span className="solution-result-text result-rj">Time Limit Exceeded</span>;
      case 'MLE':
        return <span className="solution-result-text result-rj">Memory Limit Exceeded</span>;
      case 'OLE':
        return <span className="solution-result-text result-rj">Output Limit Exceeded</span>;
      case 'RTE':
        return <span className="solution-result-text result-rj">Runtime Error</span>;
      case 'CE':
        return <span className="solution-result-text">Compile Error</span>;
      case 'UKE':
        return <span className="solution-result-text">Unknown Error</span>;
      case null:
        return <span className="solution-result-text">--</span>;
      default:
        return <span className="solution-result-text">{result}</span>;
    }
  };

  renderSingleStatusBody = (st: srk.RankProblemStatus, problemIndex: number, user: srk.User) => {
    const {
      data: { problems },
    } = this.props;
    const result = st.result;
    let commonClassName = '-text-center -nowrap';
    const problem = problems[problemIndex] || {};
    const key = problem.alias || problem.title || problemIndex;
    const solutions = [...(st.solutions || [])].reverse();
    const hasSolutions = solutions.length > 0;
    if (hasSolutions) {
      commonClassName += ' -cursor-pointer';
    }
    const onClick = hasSolutions
      ? (e: React.MouseEvent) =>
          solutionsModal.modal(
            {
              title: `Solutions of ${numberToAlphabet(problemIndex)} (${user.name})`,
              content: (
                <table className="table solutions-table">
                  <thead>
                    <tr>
                      <th className="-text-left">Result</th>
                      <th className="-text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solutions.map((s, index) => (
                      <tr key={`${s.result}_${s.time[0]}_${index}`}>
                        <td>{this.renderResultLabel(s.result)}</td>
                        <td className="-text-right">
                          {secToTimeStr(this.formatTimeDuration(s.time, 's'))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ),
            },
            e,
          )
      : () => {};
    switch (result) {
      case 'FB':
        return (
          <td key={key} onClick={onClick} className={classnames(commonClassName, 'fb')}>
            {st.tries}/{st.time ? this.formatTimeDuration(st.time, 'min', Math.floor) : '-'}
          </td>
        );
      case 'AC':
        return (
          <td key={key} onClick={onClick} className={classnames(commonClassName, 'accepted')}>
            {st.tries}/{st.time ? this.formatTimeDuration(st.time, 'min', Math.floor) : '-'}
          </td>
        );
      case '?':
        return (
          <td key={key} onClick={onClick} className={classnames(commonClassName, 'frozen')}>
            {st.tries}
          </td>
        );
      case 'RJ':
        return (
          <td key={key} onClick={onClick} className={classnames(commonClassName, 'failed')}>
            {st.tries}
          </td>
        );
      default:
        return <td key={key}></td>;
    }
  };

  selectList = (ids: (string | number)[] | undefined) => {
    this.setState({
      filteredIds: ids,
    });
  };

  render() {
    // console.log('ranklist render')
    const { filteredIds, error } = this.state;
    if (error) {
      return (
        <div>
          <div className="error">
            <pre>Error: {error}</pre>
            <p>Please wait for data correction or refresh page</p>
          </div>
        </div>
      );
    }
    const { data, usingFilters } = this.props;
    const rows = data.rows;
    const { type, version, contest, problems, series, _now, markers } = data;
    if (type !== 'general') {
      return <div>srk type "{type}" is not supported</div>;
    }
    if (
      !(
        semver.valid(version) &&
        semver.gte(version, MIN_SUPPORTED_VERSION) &&
        semver.lte(version, MAX_SUPPORTED_VERSION)
      )
    ) {
      return (
        <div>
          srk version "{version}" is not supported ({MIN_SUPPORTED_VERSION} to{' '}
          {MAX_SUPPORTED_VERSION})
        </div>
      );
    }
    return (
      <div className="table ranklist">
        <div className="contest -text-center">
          {this.renderContestBanner()}
          <h2>{contest.title}</h2>
          <p>
            {moment(contest.startAt).format('YYYY-MM-DD HH:mm:ss')} -{' '}
            {moment(contest.startAt)
              .add(this.formatTimeDuration(contest.duration), 'ms')
              .format('YYYY-MM-DD HH:mm:ss Z')}
            {contest.frozenDuration ? (
              <span>
                {' '}
                (Frozen{' '}
                {secToTimeStr(this.formatTimeDuration(contest.frozenDuration, 's', Math.floor))})
              </span>
            ) : null}
          </p>
          <ProgressBar
            _now={_now}
            startAt={contest.startAt}
            duration={contest.duration}
            frozenDuration={contest.frozenDuration}
            getTimeDurationMs={(t) => this.formatTimeDuration(t, 'ms')}
          />
        </div>

        <div className="filter" style={{ marginTop: '10px', display: 'flex' }}>
          <div>
            <FilterBar
              data={data.rows}
              filters={
                Array.isArray(usingFilters)
                  ? _.uniq(usingFilters)
                  : ['marker', 'userOrganization', 'userName']
              }
              markers={markers}
              onConfirm={this.selectList}
            />
          </div>
        </div>

        <div className="rows">
          <table>
            <thead>
              <tr>
                {series.map((s) => (
                  <th key={s.title} className="series -text-right -nowrap">
                    {s.title}
                  </th>
                ))}
                <th className="-text-left -nowrap">Name</th>
                <th className="-nowrap">Score</th>
                <th className="-nowrap">Time</th>
                {problems.map((p, index) => this.renderSingleProblemHeader(p, index))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) =>
                !filteredIds || filteredIds.includes(r.user.id) ? (
                  <tr key={r.user.id || r.user.name}>
                    {r.ranks.map((rk, index) => this.renderSingleSeriesBody(rk, series[index], r))}
                    {this.renderUserBody(r.user)}
                    <td className="-text-right -nowrap">{r.score.value}</td>
                    <td className="-text-right -nowrap">
                      {r.score.time
                        ? this.formatTimeDuration(r.score.time, 'min', Math.floor)
                        : '-'}
                    </td>
                    {r.statuses.map((st, index) => this.renderSingleStatusBody(st, index, r.user))}
                  </tr>
                ) : null,
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}
