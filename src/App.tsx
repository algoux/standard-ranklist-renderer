import React from 'react';
import './App.less';
import Ranklist from './Ranklist';
import demoJson from './demo.json';
import request from './utils/request';
import ScrollSolution from './components/plugins/ScrollSolution';
import classnames from 'classnames';

/** Deploy config ↓ */
// srk
const srkRefreshInterval = 15 * 1000;
const srkUrl = 'data/your-ranklist.srk.json';
// scroll solution plugin (if not needed, set `scrollSolutionUrl` as empty string)
const scrollSolutionRefreshInterval = 2 * 1000;
const scrollSolutionUrl = 'data_plugin/scroll-solution/your-ranklist.json';
/** Deploy config ↑ */

let isDev = process.env.NODE_ENV === 'development';

interface State {
  error: Error | null;
  errorStack: string;
  data: any;
  loading: boolean;
  id: string;
  srkUrl: string;
  scrollSolutionUrl?: string;
}

class App extends React.Component<any, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      error: null,
      errorStack: '',
      data: null,
      loading: false,
      id: '',
      srkUrl,
      scrollSolutionUrl,
    };
  }

  componentDidMount(): void {
    if (!isDev) {
      this.requestData();
      setInterval(() => this.requestData(), srkRefreshInterval);
    } else {
      this.setState({
        data: demoJson,
      });
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({
      error,
      errorStack: errorInfo.componentStack,
    });
  }

  requestData = async () => {
    try {
      this.setState({
        loading: true,
      });
      const data = await request(this.state.srkUrl, {
        method: 'GET',
        timeout: 30 * 1000,
      });
      // console.log('requestData', typeof data, data, JSON.stringify(data));
      this.setState({
        data,
        loading: false,
      });
    } catch (e) {
      console.error('requestData err:', e);
      this.setState({
        loading: false,
      });
    }
  };

  render() {
    const data = this.state.data;
    const { srkUrl, scrollSolutionUrl } = this.state;
    if (this.state.error) {
      return (
        <div className="error">
          <pre>Error: {this.state.error.message}</pre>
        </div>
      );
    } else if (data) {
      const enableScrollSolution = window.location.search.indexOf('scrollSolution=1') >= 0;
      return (
        <div className={classnames({ 'plugin_root_scroll-solution': enableScrollSolution })}>
          <Ranklist data={data} />
          <div className="-text-center" style={{ marginTop: '60px', marginBottom: '15px' }}>
            Powered by ACM team from SDUT.{' '}
            <a href="https://acm.sdut.edu.cn/acmss/" target="_blank" rel="noopener noreferrer">
              View Contests Collection
            </a>
            <br />
            Copyright © 2019-2020{' '}
            <a href="https://github.com/algoux" target="_blank" rel="noopener noreferrer">
              algoUX
            </a>
            <br />
            Generated by{' '}
            <a
              href="https://github.com/algoux/standard-ranklist"
              target="_blank"
              rel="noopener noreferrer"
            >
              Standard Ranklist
            </a>{' '}
            renderer.{' '}
            <a href={srkUrl} target="_blank" rel="noopener noreferrer">
              Open srk.json
            </a>
          </div>
          <ScrollSolution
            enabled={enableScrollSolution}
            dataUrl={scrollSolutionUrl}
            interval={scrollSolutionRefreshInterval}
          />
        </div>
      );
    } else if (!data && !this.state.loading) {
      return <div>No Ranklist Data</div>;
    }
    return null;
  }
}

export default App;
