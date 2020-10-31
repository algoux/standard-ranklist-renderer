import React from 'react';
import * as srk from './srk';
import SelectDropdown from './components/SelectDropdown'
import { arrayIntersection } from './utils/array'
import { isEqual, uniqBy } from 'lodash';

export interface SelectListProps {
  data: srk.RanklistRow[];
  markers: srk.Marker[] | undefined;
  onConfirm?: (selected: string[] | undefined) => void;
}

export interface SelectOptions {
  name: string;
  value: string
}

interface State {
  visible: boolean;
  search: string;
  schoolOptions: SelectOptions[];
  teamOptions: SelectOptions[];
  marker: string;
  schoolList: string[];
  teamList: string[];
  show: boolean;
}

export default class SelectList extends React.Component<SelectListProps, State> {
  private _filteredIds: string[] = [];

  constructor(props: SelectListProps) {
    super(props);
    this.state = {
      visible: false,
      search: '',
      schoolOptions: [],
      teamOptions: [],
      marker: 'all',
      schoolList: [],
      teamList: [],
      show: true
    };
  }

  componentDidMount() {
    this.setOptions(this.props.data);
  }

  componentWillReceiveProps(np: SelectListProps) {
    this.setOptions(np.data);
  }

  dataSort = (data: SelectOptions[]) => {
    return data.sort((a, b) => {
      return a.name.localeCompare(b.name, 'zh')
    })
  }

  setOptions = (data: srk.RanklistRow[]) => {
    const schoolOptions = this.dataSort(uniqBy(data.map((item) => {
      return {
        name: String(item.user.organization),
        value: String(item.user.organization),
      }
    }), 'name'));
    const teamOptions = this.dataSort(data.map((item) => {
      return {
        name: String(item.user.name),
        value: String(item.user.id),
      }
    }));
    this.setState({
      schoolOptions,
      teamOptions,
    });
  }

  saveMarker = (e: any) => {
    let that = this;
    this.setState({
      marker: e.target.value
    }, () => {
      that.onSearch();
    })
  }

  saveSchoolList = (data: string[]) => {
    this.setState({
      schoolList: data
    })
  }

  saveTeamList = (data: string[]) => {
    this.setState({
      teamList: data
    })
  }

  onSearch = (force = false) => {
    const { data, onConfirm } = this.props;
    let marker = this.state.marker;
    let markers: string[] = [];
    if (marker !== 'all') {
      for (let i = 0; i < data.length; i++) {
        if (data[i].user.marker === marker) {
          markers.push(String(data[i].user.id));
        }
      }
    } else {
      for (let i = 0; i < data.length; i++) {
        markers.push(String(data[i].user.id));
      }
    }
    const schoolToIds = data
      .filter(d => d.user.organization && this.state.schoolList.includes(d.user.organization))
      .map(d => d.user.id as string);
    const filteredIds = arrayIntersection(...[markers, schoolToIds, this.state.teamList].filter(f => f.length));
    const filteredIdsChanged = !isEqual(filteredIds, this._filteredIds);
    if (filteredIdsChanged) {
      this._filteredIds = filteredIds;
    }
    if (filteredIdsChanged || force) {
      if (onConfirm) {
        onConfirm(this._filteredIds);
      }
    }
  }

  onSearchChange = () => {
    if (!this.state.show) {
      this.onSearch(true);
    }
    else {
      const { onConfirm } = this.props;
      // let list: string[] = [];
      // for (let i = 0; i < data.length; i++) {
      //   list.push(String(data[i].user.id));
      // }
      if (onConfirm) {
        onConfirm(undefined);
      }
    }

    this.setState({
      show: !this.state.show
    })
  }


  render() {
    const { data, markers } = this.props;
    return (
      <div style={{ display: 'flex' }}>
        <div >
          <button onClick={this.onSearchChange}>{this.state.show ? '禁用筛选' : '使用筛选'}</button>
        </div>
        <div style={{ marginLeft: '30px', display: this.state.show ? 'block' : 'none' }}>
          {markers ? <select onChange={this.saveMarker}>
            <option value='all'>默认</option>
            {markers.map((item) => <option value={item.id}>{item.label}</option>)}
          </select> : ''}
        </div>
        <div style={{ marginLeft: '30px', display: this.state.show ? 'block' : 'none' }} >
          <SelectDropdown options={this.state.schoolOptions} onChange={this.saveSchoolList} onConfirm={(selected) => this.onSearch()}><button>选择学校{this.state.schoolList.length > 0 ? ` (${this.state.schoolList.length})` : ''}</button></SelectDropdown>
        </div>
        <div style={{ marginLeft: '30px', display: this.state.show ? 'block' : 'none' }} >
          <SelectDropdown options={this.state.teamOptions} onChange={this.saveTeamList} onConfirm={(selected) => this.onSearch()}><button>选择队伍{this.state.teamList.length > 0 ? ` (${this.state.teamList.length})` : ''}</button></SelectDropdown>
        </div>
        {/* <div style={{ marginLeft: '30px', display: this.state.show ? 'block' : 'none' }}>
          <button onClick={this.onSearch}>筛选</button>
        </div> */}
      </div>
    );
  }
}
