import React, {Component} from "react";
import "./App.css";
import axios from "axios";
import nanoid from "nanoid";

class JacuList extends Component {
  constructor(props) {
    super(props);
    this._createHeader = this._createHeader.bind(this);
  }

  onSort(data) {
    this.props.onSort(data);
  }

  _createHeader() {
    return (
      <tr>
        {
          this.props.cols.map(col => {

            let thProps = {
              key: nanoid(),
            };
            let hasSort = false;
            if(!Object.keys(col).includes("sort")){
              thProps.onClick = () => this.onSort(col);
              thProps.className = "sv-pointer";
              hasSort = true;
            }

            if(Object.keys(col).includes("sort") && col["sort"] === true){
              thProps.onClick = () => this.onSort(col);
              thProps.className = "sv-pointer";
              hasSort = true;
            }

            let cssClassSort = "";

            if(hasSort) {
              debugger;
              cssClassSort = "fa fa-sort";
            }

            if(this.props.sorts.length) {
              const sort = this.props.sorts.find(s => col.key === s.key);
              if(sort) {
                cssClassSort = "fa fa-sort-" + sort.direction;
              }
            }

            return (
              <th {...thProps}>
                {col.label}
                {hasSort && <i className={`sv-ml--5 ${cssClassSort}`} />}
              </th>
            );
          })
        }
      </tr>
    );
  }

  _createBody() {
    return this.props.data.map(d => {
      return <tr key={nanoid()}>{this.props.cols.map(col => <th key={nanoid()}>{d[col.key]}</th>)}</tr>;
    });
  }

  render() {
    return (
      <React.Fragment>
        <div className="sv-row">
          <div className="sv-column" />
          <div className="sv-column" />
          <div className="sv-column sv-form">
            <div className="sv-input-group">
              <input type="text" className="at-first" /><button className="sv-button info at-last">Filtrar</button>
            </div>
          </div>
        </div>
        <div className="sv-row">
          <div className="sv-column">
            <table className="sv-table with--stripes with--hover with--borders">
              <thead>{this._createHeader()}</thead>
              <tbody>{this._createBody()}</tbody>
            </table>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      dataSize: 0,
      sorts: [],
    };
    this.sorts = [];

    this.onSort = this.onSort.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  loadData(page=1, limit=20) {
    const req = axios.get(`http://localhost:3001/pessoas?_page=${page}&_limit=${limit}`);

    req.then(response => {
      this.setState({
        data: response.data,
        dataSize: parseInt(response.headers["x-total-count"], 10),
        sorts: [],
      });
    }).catch(error => console.log(error.message));
  }

  onSort(data) {
    let sortItemIndex = this.sorts.findIndex(s => s.key === data.key);
    if(sortItemIndex >= 0) {
      if(this.sorts[sortItemIndex].direction === "asc") {
        this.sorts[sortItemIndex].direction = "desc";
      } else {
        this.sorts.splice(sortItemIndex, 1);
      }
    } else {
      this.sorts.push({key: data.key, direction: "asc"});
    }

    let sortString = "_sort=";
    let directionString = "_order=";

    sortString += this.sorts.map(s => s.key).join();
    directionString += this.sorts.map(d => d.direction).join();

    const req = axios.get(`http://localhost:3001/pessoas?_page=1&_limit=20&${sortString}&${directionString}`);

    req.then(response => {
      this.setState({
        data: response.data,
        dataSize: parseInt(response.headers["x-total-count"], 10),
        sorts: this.sorts,
      });
    }).catch(error => console.log(error.message));

  }

  onSearch(query) {
    console.log(query);
  }

  render() {
    return (
      <div className="sv-pa--25">
        <JacuList
          cols={
            [
              { label: "Código", key: "codigo" },
              { label: "Nome", key: "nome" },
              { label: "Razão Social", key: "razaoSocial" },
              { label: "CNPJ/CPF", key: "cpfCnpj", sort: false },
              { label: "Alterado Em:", key: "alteradoEm", type: "date" },
              { label: "Origem:", key: "origem" },
            ]
          }
          data={this.state.data}
          dataSize={this.state.dataSize}
          onSort={this.onSort}
          onSearch={this.onSearch}
          sorts={this.state.sorts}
        />
      </div>
    );
  }
}

export default App;
