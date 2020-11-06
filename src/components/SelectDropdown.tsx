import React from 'react';
import Dropdown from 'rc-dropdown';
import Menu, { Item as MenuItem, Divider } from 'rc-menu';
import 'rc-dropdown/assets/index.css';
import { SelectInfo } from 'rc-menu/lib/interface';
import './SelectDropdown.less'

export interface SelectDropdownProps {
  options: {
    name: string;
    value: string | number;
  }[];
  onChange?: (selected: string[]) => void;
  onConfirm?: (selected: string[]) => void;
}

interface State {
  visible: boolean;
  search: string;
}

export default class SelectDropdown extends React.Component<SelectDropdownProps, State> {
  constructor(props: SelectDropdownProps) {
    super(props);
    this.state = {
      visible: false,
      search: '',
    };
  }

  selected: string[] = [];

  onVisibleChange = (visible: boolean) => {
    const { onConfirm } = this.props;
    this.setState({
      visible,
    });
    if (!visible && onConfirm) {
      onConfirm(this.selected)
    }
  }

  saveSelected = ({ selectedKeys }: SelectInfo) => {
    const { onChange } = this.props;
    this.selected = selectedKeys as string[];

    if (onChange) {
      onChange(this.selected);
    }
  }

  confirm = () => {
    const { onConfirm } = this.props;
    this.setState({
      visible: false,
    });
    if (onConfirm) {
      onConfirm(this.selected);
    }
  }

  getOptions = () => {
    const { options } = this.props;
    const { search } = this.state;
    if (!search) {
      return options;
    }
    return options.filter(item => item.name.indexOf(search) >= 0);
  }

  render() {
    const { children } = this.props;
    const { search } = this.state;
    const menu = (
      <Menu
        multiple
        onSelect={this.saveSelected}
        onDeselect={this.saveSelected}
        style={{ maxHeight: '400px', overflow: "auto" }}
        className="dropdown-menu"
      >
        <li className="rc-dropdown-menu-item">
          <input
            value={search}
            onChange={e => this.setState({ search: e.target.value })}
            placeholder="Search options..."
            style={{ width: 'calc(100% - 4px)', padding: '0' }}
          />
        </li>
        {this.getOptions().map(item => <MenuItem key={item.value} style={{ paddingRight: '36px' }}>{item.name}</MenuItem>)}
        <Divider />
        {/* <MenuItem disabled>
          <button
            style={{
              cursor: 'pointer',
              pointerEvents: 'visible',
            }}
            onClick={this.confirm}
          >OK
          </button>
        </MenuItem> */}
      </Menu>
    );

    return (
      // @ts-ignore
      <Dropdown
        trigger={['click']}
        onVisibleChange={this.onVisibleChange}
        visible={this.state.visible}
        overlay={menu}
        animation="slide-up"
        className="dropdown"
      >
        {/* ts-ignore */}
        {children}
      </Dropdown>
    );
  }
}
