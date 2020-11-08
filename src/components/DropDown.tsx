import React from 'react';
import './DropDown.less';

export interface DropdownProps {
  options: {
    key: string;
    value: string;
  }[];
  className?: string;
  onConfirm?: (key: string, value: string) => void;
}

interface State {
  dropdown: boolean;
  buttonText: string;
}

export default class Dropdown extends React.Component<DropdownProps, State> {
  constructor(props: DropdownProps) {
    super(props);
    this.state = {
      dropdown: false,
      buttonText: '',
    };
  }

  componentDidMount() {
    document.addEventListener('click', this.outDropDownHandler.bind(this));
  }

  outDropDownHandler(e: any) {
    if (
      e.target.value !== 'dropdown_select' &&
      e.target.className !== 'caret' &&
      this.state.dropdown
    ) {
      this.setState({
        dropdown: !this.state.dropdown,
      });
    }
  }

  dropDown = (e: any) => {
    this.setState({
      dropdown: !this.state.dropdown,
    });
  };

  onChange = (key: string, value: string) => {
    const { onConfirm } = this.props;
    if (onConfirm) {
      onConfirm(key, value);
    }
    this.setState({
      buttonText: value,
    });
  };

  render() {
    const { options, className, children } = this.props;
    return (
      <div style={{ position: 'relative' }}>
        <button className={className} onClick={this.dropDown} value="dropdown_select">
          {this.state.buttonText === '' ? children : this.state.buttonText}
          <span className="caret"></span>
        </button>
        <ul
          className="dropdown-menu"
          style={{
            display: this.state.dropdown ? 'block' : 'none',
            maxHeight: '400px',
            overflow: 'auto',
          }}
        >
          {options.map((item) => (
            <li key={item.key} onClick={() => this.onChange(item.key, item.value)}>
              {item.value}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
