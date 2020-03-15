import React from 'react';
import './App.less';
import Ranklist from './Ranklist';
import demoJson from './demo.json';
import request from './utils/request';
import queryString from 'query-string';

let isDev = process.env.NODE_ENV === 'development';

interface State {
  error: Error | null;
  errorStack: string;
  id: string;
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
      data: null,
      loading: false,
    };
  }

  componentDidMount(): void {
    if (!isDev) {
      this.requestData();
      setInterval(() => this.requestData(), 30 * 1000);
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
    const query = queryString.parse(window.location.search);
    if (query.id) {
      try {
        this.setState({
          loading: true,
        });
        const id = query.id.toString();
        const data = await request(`data/${id}.json`, {
          method: 'GET',
          timeout: 30 * 1000,
        });
        this.setState({
          id,
          data,
          loading: false,
        });
      } catch (e) {
        console.error(e);
        this.setState({
          loading: false,
        });
      }
    }
  }

  render() {
    const data = this.state.data
    if (this.state.error) {
      return <div className="error">
        <pre>
          Error: {this.state.error.message}
        </pre>
      </div>
    } else if (data) {
      return <div>
        <Ranklist data={data} />
        <div className="-text-center" style={{ marginTop: '60px', marginBottom: '15px' }}>
          Powered by Standard Ranklist<br />
          Copyright © 2019-2020 <a href="https://github.com/algoux" target="_blank">algoUX</a><br />
          <a href={isDev ? '' : `data/${this.state.id}.json`} target="_blank">Open srk.json</a>
        </div>
      </div>;
    } else if (!data && !this.state.loading) {
      return <div>No Ranklist Data</div>;
    }
    return null;
  }
}

export default App;
