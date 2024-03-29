import React from 'react';
import Dialog from 'rc-dialog';
import 'rc-dialog/assets/index.css';

export interface SolutionsModalProps {
  wrapClassName?: string;
  style?: React.CSSProperties;
}

interface State {
  title: string;
  content: React.ReactNode;
  mousePosition?: {
    x: number;
    y: number;
  };
  visible: boolean;
}

export default class SolutionsModal extends React.Component<SolutionsModalProps, State> {
  constructor(props: SolutionsModalProps) {
    super(props);
    this.state = {
      title: '',
      content: null,
      mousePosition: undefined,
      visible: false,
    };
  }

  onClose = (e: React.SyntheticEvent) => {
    this.setState({
      visible: false,
    });
  };

  render() {
    const { style, wrapClassName } = this.props;
    const { title, content, mousePosition } = this.state;
    return (
      <Dialog
        visible={this.state.visible}
        wrapClassName={wrapClassName}
        animation="zoom"
        maskAnimation="fade"
        title={title}
        onClose={this.onClose}
        mousePosition={mousePosition}
        style={style}
      >
        {content}
      </Dialog>
    );
  }
}
