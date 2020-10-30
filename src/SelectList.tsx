import React from 'react';
import * as srk from './srk';
import SelectDropdown from './components/SelectDropdown'
import { mapKeys } from 'lodash';
import { arrayIntersection } from './utils/array'
import { uniqBy } from 'lodash';

export interface SelectListProps {
    data: srk.RanklistRow[];
    markers: srk.Marker[] | undefined;
    onConfirm?: (selected: string[]) => void;
}

export interface dataSort {
    name: string;
    value: string
}

interface State {
    visible: boolean;
    search: string;
    marker: string;
    schoolList: string[];
    teamList: string[];
    show: boolean;
}

export default class SelectList extends React.Component<SelectListProps, State> {
    constructor(props: SelectListProps) {
        super(props);
        this.state = {
            visible: false,
            search: '',
            marker: 'all',
            schoolList: [],
            teamList: [],
            show: true
        };
    }

    dataSort = (data: dataSort[]) => {
        return data.sort((a, b) => {
            return a.name.localeCompare(b.name, "zh")
        })
    }

    selectSchoolList = (data: srk.RanklistRow[]) => {
        return this.dataSort(uniqBy(data.map((item) => {
            return {
                name: String(item.user.organization),
                value: String(item.user.id),
            }
        }), 'name'))
    }

    selectTeamList = (data: srk.RanklistRow[]) => {
        return this.dataSort(data.map((item) => {
            return {
                name: String(item.user.name),
                value: String(item.user.id),
            }
        }))
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

    onSearch = () => {
        const { data, onConfirm } = this.props;
        let marker = this.state.marker;
        let markers: string[] = [];
        if (marker !== "all") {
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
        if (onConfirm) {
            onConfirm(arrayIntersection(...[markers, this.state.schoolList, this.state.teamList].filter(f => f.length)));
        }
    }

    onSearchChange = () => {
        if (!this.state.show) {
            this.onSearch();
        }
        else {
            const { onConfirm, data } = this.props;
            let list: string[] = [];
            for (let i = 0; i < data.length; i++) {
                list.push(String(data[i].user.id));
            }
            if (onConfirm) {
                onConfirm(list)
            }
        }

        this.setState({
            show: !this.state.show
        })
    }


    render() {
        const { data, markers } = this.props;
        return (
            <div style={{ display: "flex" }}>
                <div >
                    <button onClick={this.onSearchChange}>{this.state.show ? "切换完整榜单" : "切换筛选模式"}</button>
                </div>
                <div style={{ marginLeft: "30px", display: this.state.show ? "block" : "none" }}>
                    {markers ? <select onChange={this.saveMarker}>
                        <option value="all">全部榜单</option>
                        {markers.map((item) => <option value={item.id}>{item.label}</option>)}

                    </select> : ""}

                </div>
                <div style={{ marginLeft: "30px", display: this.state.show ? "block" : "none" }} >
                    <SelectDropdown options={this.selectSchoolList(data)} onChange={this.saveSchoolList} onConfirm={(selected) => this.onSearch()}><button>选择学校{this.state.schoolList.length > 0 ? ` (${this.state.schoolList.length})` : ""}</button></SelectDropdown>
                </div>
                <div style={{ marginLeft: "30px", display: this.state.show ? "block" : "none" }} >
                    <SelectDropdown options={this.selectTeamList(data)} onChange={this.saveTeamList} onConfirm={(selected) => this.onSearch()}><button>选择队伍{this.state.teamList.length > 0 ? ` (${this.state.teamList.length})` : ""}</button></SelectDropdown>
                </div>
                {/* <div style={{ marginLeft: "30px", display: this.state.show ? "block" : "none" }}>
                    <button onClick={this.onSearch}>筛选</button>
                </div> */}
            </div>
        );
    }
}
