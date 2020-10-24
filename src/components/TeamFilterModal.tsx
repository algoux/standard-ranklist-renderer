import React from 'react';
import Dialog from 'rc-dialog';
import 'rc-dialog/assets/index.css';
import * as srk from '../srk';

export interface TeamFilterModalProps {
  style?: React.CSSProperties;
  wrapClassName?: string;
  rows: any;
  selectList: Function
}


export interface RanklistProps {
  rows: srk.RanklistRow[];
}
interface State {
  visible: boolean;
  mousePosition?: {
    x: number;
    y: number;
  };
  school: string[];
  team: string[];
  school_list: string[];
  team_list: string[]
}

export default class TeamFilterModal extends React.Component<TeamFilterModalProps, State> {
  constructor(props: TeamFilterModalProps) {
    super(props);
    this.state = {
      visible: false,
      mousePosition: undefined,
      school: [],
      team: [],
      school_list: [],
      team_list: []
    };
  }

  school = new Set<string>()
  team = new Set<string>()
  school_list = new Set<string>()
  team_list = new Set<string>()

  onClick = (e: React.MouseEvent) => {
    this.setState({
      mousePosition: {
        x: e.pageX,
        y: e.pageY,
      },
      visible: true,
    });
    this.searchSchool("")
    this.searchTeam("")
  }

  onClose = (e: React.SyntheticEvent | any) => {
    this.setState({
      visible: false,
    });
  }

  componentDidMount() {
    const { rows } = this.props;
    // let rows = data.rows;
    console.log(rows);

    for (let i = 0; i < rows.length; i++) {
      if (rows[i].user.organization) {
        this.school.add(rows[i].user.organization);
      }
      if (rows[i].user.name) {
        this.team.add(rows[i].user.name)
      }
    }

  }

  componentWillReceiveProps(np: RanklistProps): void {
    const p = this.props;
    let rows = np.rows;
    this.school = new Set<string>();
    this.team = new Set<string>();
    // this.school_list = new Set<string>()
    // this.team_list = new Set<string>()
    // this.setState({
    //   school: [],
    //   team: [],
    //   school_list: [],
    //   team_list: []
    // })
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].user.organization) {
        this.school.add(String(rows[i].user.organization));
      }
      if (rows[i].user.name) {
        this.team.add(rows[i].user.name)
      }
    }
  }


  searchSchool = (name: any) => {
    let str = name.target ? name.target.value : "";
    let data: string[]
    data = Array.from(this.school);
    let arr = [];
    if (str != "") {
      for (let v of data) {
        if (v.indexOf(str) >= 0) {
          arr.push(v);
        }
      }
    }
    else {
      arr = Array.from(this.school_list);
    }
    this.setState({
      school: arr
    })
  }

  searchTeam = (name: any) => {
    let str = name.target ? name.target.value : "";
    let data: string[]
    data = Array.from(this.team);
    let arr = [];
    if (str != "") {
      for (let v of data) {
        if (v.indexOf(str) >= 0) {
          arr.push(v);
        }
      }
    }
    else {
      arr = Array.from(this.team_list);
    }
    this.setState({
      team: arr
    })
  }

  onSearch = () => {
    const { rows } = this.props;


    // let rows = data.rows;
    let params = new Set<string>();
    for (let i = 0; i < rows.length; i++) {
      if (this.school_list.has(rows[i].user.organization) || this.team_list.has(rows[i].user.name)) {
        if (!params.has(rows[i].user.id)) {
          params.add(rows[i].user.id)
        }
      }
    }

    this.props.selectList(Array.from(params))
    this.onClose("")
  }

  changeSchoolCheck = (e: any) => {
    if (this.school_list.has(e.target.value)) {
      this.school_list.delete(e.target.value);
    }
    else {
      this.school_list.add(e.target.value)
    }
    this.setState({
      school_list: Array.from(this.school_list)
    })
  }

  changeTeamCheck = (e: any) => {
    if (this.team_list.has(e.target.value)) {
      this.team_list.delete(e.target.value);
    }
    else {
      this.team_list.add(e.target.value)
    }
    this.setState({
      team_list: Array.from(this.team_list)
    })
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
          <div style={{ display: "flex", height: "200px", overflow: "auto" }} >
            <div style={{ flex: 1 }}>
              搜索：<input placeholder="请输入学校名" onInput={(value) => this.searchSchool(value)}></input>
              <p style={{ fontSize: '10px', marginTop: "2px" }}>不输入默认显示已选择学校</p>
              <div style={{ display: "flex", flexWrap: "wrap" }} >
                {this.state.school.map((item) =>
                  <span><input type="checkbox" name="school" value={item} onChange={this.changeSchoolCheck} checked={this.state.school_list.includes(item)} /> {item}</span>
                )}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              搜索：<input placeholder="请输入队伍名" onInput={(value) => this.searchTeam(value)}></input>
              <p style={{ fontSize: '10px', marginTop: "2px" }}>不输入默认显示已选择队伍</p>
              <div style={{ display: "flex", flexWrap: "wrap" }} >
                {this.state.team.map((item) =>
                  <span><input type="checkbox" name="school" value={item} onChange={this.changeTeamCheck} checked={this.state.team_list.includes(item)} /> {item}</span>
                )}
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right", marginTop: "10px" }}>
            <button onClick={this.onSearch}>筛选</button>
          </div>
        </Dialog>
      </>
    );
  }
}
