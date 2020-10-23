import React from 'react';
import Dialog from 'rc-dialog';
import 'rc-dialog/assets/index.css';

export interface TeamFilterModalProps {
  style?: React.CSSProperties;
  wrapClassName?: string;
}

interface State {
  visible: boolean;
  mousePosition?: {
    x: number;
    y: number;
  };
}

export default class TeamFilterModal extends React.Component<TeamFilterModalProps, State> {
  constructor(props: TeamFilterModalProps) {
    super(props);
    this.state = {
      visible: false,
      mousePosition: undefined,
    };
  }

  onClick = (e: React.MouseEvent) => {
    this.setState({
      mousePosition: {
        x: e.pageX,
        y: e.pageY,
      },
      visible: true,
    });
  }

  onClose = (e: React.SyntheticEvent) => {
    this.setState({
      visible: false,
    });
  }

  render() {
    const { children, style, wrapClassName } = this.props;
    return (
      <>
        <span onClick={this.onClick}>{children}</span>
        <Dialog
          visible={this.state.visible}
          wrapClassName={wrapClassName}
          animation="zoom"
          maskAnimation="fade"
          onClose={this.onClose}
          style={style}
          mousePosition={this.state.mousePosition}
          focusTriggerAfterClose={false}
          title="Filter Teams"
        >
          {/* modal content */}
        </Dialog>
      </>
    );
  }
}
