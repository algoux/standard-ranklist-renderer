import React from 'react';
import ScrollSolutionImpl from './ScrollSolutionImpl';

export interface ScrollSolutionProps {
  enabled: boolean;
  dataUrl?: string;
  interval?: number;
  switchContent?: React.ReactNode | string;
}

interface State {}

export default class ScrollSolution extends React.Component<ScrollSolutionProps, State> {
  static defaultProps: Partial<ScrollSolutionProps> = {
    switchContent: 'Realtime Solutions',
  };

  onCheckEnable = (e: any) => {
    if (!this.props.enabled) {
      window.location.search = '?scrollSolution=1';
    } else {
      window.location.href = `${window.location.origin}${window.location.pathname}`;
    }
  };

  render() {
    const { enabled, dataUrl, interval, switchContent } = this.props;
    const act = (
      <div className="plugin_scroll-solution-act -cursor-pointer" onClick={this.onCheckEnable}>
        <input type="checkbox" defaultChecked={enabled} /> {switchContent}
      </div>
    );
    return (
      <div>
        {enabled && dataUrl && interval ? (
          <ScrollSolutionImpl dataUrl={dataUrl} interval={interval} />
        ) : null}
        {act}
      </div>
    );
  }
}
