import React from 'react';
import * as srk from './srk';
import SelectDropdown from './components/SelectDropdown';
import { arrayIntersection } from './utils/array';
import { isEqual, uniqBy } from 'lodash';
import './FilterBar.less';
import DropDown from './components/DropDown';

export interface FilterBarProps {
  data: srk.RanklistRow[];
  filters: Array<'marker' | 'userName' | 'userOrganization'>;
  filterSwitchText?: [string, string];
  markers?: srk.Marker[];
  markerSelectDefaultPlaceholder?: string;
  userNameSelectPlaceholder?: string;
  userOrganizationSelectPlaceholder?: string;
  onConfirm?: (selected: string[] | undefined) => void;
}

export interface SelectOptions {
  name: string;
  value: string;
}

export interface DropDownOptions {
  key: string;
  value: string;
}

interface State {
  enabled: boolean;
  marker: string;
  userOrganizationOptions: SelectOptions[];
  userNameOptions: SelectOptions[];
  userOrganizationList: string[];
  userNameList: string[];
}

export default class FilterBar extends React.Component<FilterBarProps, State> {
  static defaultProps: Partial<FilterBarProps> = {
    filterSwitchText: ['Enable Filter', 'Disable Filter'],
    markerSelectDefaultPlaceholder: 'Default',
    userNameSelectPlaceholder: 'Select Users',
    userOrganizationSelectPlaceholder: 'Select Organizations',
  };

  private _filteredIds: string[] = [];

  constructor(props: FilterBarProps) {
    super(props);
    this.state = {
      enabled: true,
      marker: '$all',
      userOrganizationOptions: [],
      userNameOptions: [],

      userOrganizationList: [],
      userNameList: [],
    };
  }

  componentDidMount() {
    this.setOptions(this.props.data);
  }

  componentWillReceiveProps(np: FilterBarProps) {
    this.setOptions(np.data);
  }

  dataSort = (data: SelectOptions[]) => {
    return data.sort((a, b) => {
      return a.name.localeCompare(b.name, 'zh');
    });
  };

  setOptions = (data: srk.RanklistRow[]) => {
    const userOrganizationOptions = this.dataSort(
      uniqBy(
        data.map((item) => {
          return {
            name: String(item.user.organization),
            value: String(item.user.organization),
          };
        }),
        'name',
      ),
    );
    const userNameOptions = this.dataSort(
      data.map((item) => {
        return {
          name: String(item.user.name),
          value: String(item.user.id),
        };
      }),
    );
    this.setState({
      userOrganizationOptions,
      userNameOptions,
    });
  };

  saveMarker = (e: string, marker: string) => {
    let that = this;
    this.setState(
      {
        marker: e,
      },
      () => {
        that.onSearch();
      },
    );
  };

  saveSchoolList = (data: string[]) => {
    this.setState({
      userOrganizationList: data,
    });
  };

  saveTeamList = (data: string[]) => {
    this.setState({
      userNameList: data,
    });
  };

  onSearch = (force = false) => {
    const { data, onConfirm } = this.props;
    let marker = this.state.marker;
    let markers: string[] = [];
    if (marker !== '$all') {
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
      .filter(
        (d) => d.user.organization && this.state.userOrganizationList.includes(d.user.organization),
      )
      .map((d) => d.user.id as string);
    const filteredIds = arrayIntersection(
      ...[markers, schoolToIds, this.state.userNameList].filter((f) => f.length),
    );
    const filteredIdsChanged = !isEqual(filteredIds, this._filteredIds);
    if (filteredIdsChanged) {
      this._filteredIds = filteredIds;
    }
    if (filteredIdsChanged || force) {
      if (onConfirm) {
        onConfirm(this._filteredIds);
      }
    }
  };

  onSwitchChange = () => {
    if (!this.state.enabled) {
      this.onSearch(true);
    } else {
      const { onConfirm } = this.props;
      if (onConfirm) {
        onConfirm(undefined);
      }
    }

    this.setState({
      enabled: !this.state.enabled,
    });
  };

  markersList(): DropDownOptions[] {
    const { markers, markerSelectDefaultPlaceholder } = this.props;
    let markersList = [
      {
        key: '$all',
        value: markerSelectDefaultPlaceholder!,
      },
    ];
    if (markers) {
      markersList = [
        ...markersList,
        ...markers.map((item) => {
          return {
            key: item.id,
            value: item.label,
          };
        }),
      ];
    }
    return markersList;
  }

  render() {
    const {
      filters,
      filterSwitchText,
      markerSelectDefaultPlaceholder,
      userNameSelectPlaceholder,
      userOrganizationSelectPlaceholder,
    } = this.props;
    const [enableFilterTExt, disableFilterTExt] = filterSwitchText || [];
    return (
      <div className="filterbar">
        <div>
          <button onClick={this.onSwitchChange} className="filterbar-button">
            {this.state.enabled ? disableFilterTExt : enableFilterTExt}
          </button>
        </div>
        {filters.map((filter) => {
          switch (filter) {
            case 'marker': {
              return (
                <div
                  key={filter}
                  style={{ marginLeft: '15px', display: this.state.enabled ? 'block' : 'none' }}
                >
                  <DropDown
                    className="filterbar-button"
                    onConfirm={(key, value) => this.saveMarker(key, value)}
                    options={this.markersList()}
                  >
                    {markerSelectDefaultPlaceholder}
                  </DropDown>
                </div>
              );
            }
            case 'userName': {
              return (
                <div
                  key={filter}
                  style={{ marginLeft: '15px', display: this.state.enabled ? 'block' : 'none' }}
                >
                  <SelectDropdown
                    options={this.state.userNameOptions}
                    onChange={this.saveTeamList}
                    onConfirm={(selected) => this.onSearch()}
                  >
                    <button className="filterbar-button">
                      {userNameSelectPlaceholder}
                      {this.state.userNameList.length > 0
                        ? ` (${this.state.userNameList.length})`
                        : ''}
                    </button>
                  </SelectDropdown>
                </div>
              );
            }
            case 'userOrganization': {
              return (
                <div
                  key={filter}
                  style={{ marginLeft: '15px', display: this.state.enabled ? 'block' : 'none' }}
                >
                  <SelectDropdown
                    options={this.state.userOrganizationOptions}
                    onChange={this.saveSchoolList}
                    onConfirm={(selected) => this.onSearch()}
                  >
                    <button className="filterbar-button">
                      {userOrganizationSelectPlaceholder}
                      {this.state.userOrganizationList.length > 0
                        ? ` (${this.state.userOrganizationList.length})`
                        : ''}
                    </button>
                  </SelectDropdown>
                </div>
              );
            }
            default:
              return null;
          }
        })}
      </div>
    );
  }
}
