import React from 'react';
import './App.less';
import Ranklist from './Ranklist';
// import demoJson from './demo.json';
import request from './utils/request';
import queryString from 'query-string';

interface State {
  error: Error | null;
  errorStack: string;
  id: string;
  data: any;
}

class App extends React.Component<any, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      error: null,
      errorStack: '',
      id: '',
      data: null,
    };
  }

  componentDidMount(): void {
    this.requestData();
    setInterval(() => this.requestData(), 30 * 1000);
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
        const id = query.id.toString();
        const data = await request(`data/${id}.json`, {
          method: 'GET',
          timeout: 30 * 1000,
        });
        this.setState({
          id,
          data,
        });
      } catch (e) {
        console.error(e);
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
          Copyright © 2019 <a href="https://github.com/algoux" target="_blank">algoUX</a><br />
          <a href={`data/${this.state.id}.json`} target="_blank">Open srk.json</a>
        </div>
      </div>;
    } else {
      return <div>No Ranklist Data</div>;
    }
  }
}

export default App;
