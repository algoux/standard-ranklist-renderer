import React from 'react';
import './App.less';
import Ranklist from './Ranklist';
import demoJson from './demo.json';

const data: any = demoJson;

interface State {
  error: Error | null;
  errorStack: string;
}

class App extends React.Component<any, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      error: null,
      errorStack: '',
    };
  }

  componentDidMount(): void {
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({
      error,
      errorStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.error) {
      return <div className="error">
        <pre>
          {this.state.error.message}
        </pre>
      </div>
    } else {
      return <Ranklist data={data} />;
    }
  }
}

export default App;
