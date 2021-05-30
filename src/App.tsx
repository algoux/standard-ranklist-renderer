import React from 'react';
import './App.less';
import Ranklist from './Ranklist';
import demoJson from './demo/srk.json';
import request from './utils/request';
import ScrollSolution from './components/plugins/ScrollSolution';
import classnames from 'classnames';

/** Deploy config ↓ */
const prodConfigUrl = 'config.json';
/** Deploy config ↑ */

let isDev = process.env.NODE_ENV === 'development';

interface State {
  error: Error | null;
  errorStack: string;
  data: any;
  loading: boolean;
  id: string;
  config: {
    srkRefreshInterval: number;
    srkUrl: string;
    scrollSolutionRefreshInterval?: number;
    scrollSolutionUrl?: string;
  };
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
      config: {
        srkRefreshInterval: -1,
        srkUrl: '',
      },
    };
  }

  componentDidMount(): void {
    if (!isDev) {
      request(prodConfigUrl, {
        method: 'GET',
        timeout: 30 * 1000,
      })
        .then((config) => {
          const { srkRefreshInterval, srkUrl, scrollSolutionRefreshInterval, scrollSolutionUrl } =
            config;
          // console.log(config);
          this.setState({
            config: {
              srkRefreshInterval,
              srkUrl,
              scrollSolutionRefreshInterval,
              scrollSolutionUrl,
            },
          });
          this.requestData();
          srkRefreshInterval > 0 && setInterval(() => this.requestData(), srkRefreshInterval);
        })
        .catch((e) => {
          console.error(e);
          alert('Ranklist config not found, please refresh page');
        });
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
      const data = await request(this.state.config.srkUrl, {
        method: 'GET',
        timeout: this.state.config.srkRefreshInterval,
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
    const { config } = this.state;
    if (this.state.error) {
      return (
        <div>
          <pre>Error: {this.state.error.message}</pre>
        </div>
      );
    } else if (data) {
      const showScrollSolution = !!(
        config.scrollSolutionUrl && Number(config.scrollSolutionRefreshInterval) > 0
      );
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
            Copyright © 2019-2021{' '}
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
            <a href={config.srkUrl} target="_blank" rel="noopener noreferrer">
              Open srk.json
            </a>
          </div>
          {showScrollSolution && (
            <ScrollSolution
              enabled={enableScrollSolution}
              dataUrl={config.scrollSolutionUrl}
              interval={config.scrollSolutionRefreshInterval}
            />
          )}
        </div>
      );
    } else if (!data && !this.state.loading) {
      return <div>No Ranklist Data</div>;
    }
    return null;
  }
}

export default App;
