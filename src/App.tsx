import React from 'react';
import './App.less';
import Ranklist from './Ranklist';
import demoJson from './demo.json';
import request from './utils/request';
import ScrollSolution from './components/plugins/ScrollSolution';
import classnames from 'classnames';

let isDev = process.env.NODE_ENV === 'development';
const srkPath = 'data/ccpc2020changchun.srk.json';
const scrollSolutionPath = 'data_plugin/scroll-solution/ccpc2020changchun.json';

interface State {
  error: Error | null;
  errorStack: string;
  id: string;
  srkPath: string;
  data: any;
  loading: boolean;
}

class App extends React.Component<any, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      error: null,
      errorStack: '',
      id: '',
      srkPath,
      data: null,
      loading: false,
    };
  }

  componentDidMount(): void {
    if (!isDev) {
      this.requestData();
      setInterval(() => this.requestData(), 15 * 1000);
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
      const data = await request(srkPath, {
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
    const { srkPath } = this.state;
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
            <a href={isDev ? '' : srkPath} target="_blank" rel="noopener noreferrer">
              Open srk.json
            </a>
          </div>
          <ScrollSolution
            enabled={enableScrollSolution}
            dataUrl={scrollSolutionPath}
            interval={2000}
            switchContent={
              <span>
                实时提交 <sup>Beta</sup>
              </span>
            }
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
