import React, { PropTypes, Component } from 'react';
import { Link } from 'react-router';
import { FormGroup, FormControl, ButtonGroup, Button, Breadcrumb, DropdownButton, MenuItem, Checkbox } from 'react-bootstrap';
import Select from 'react-select';
import _ from 'lodash';
import { notify } from 'react-notify-toast';

export default class Header extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      searchShow: false,
      uploader_id: null,
      uploaded_at: null,
      name: '',
      myfavorite: ''
    };

    this.state.sortkey = window.localStorage && window.localStorage.getItem('document-sortkey') || 'create_time_desc';

    this.refresh = this.refresh.bind(this);
  }

  static propTypes = {
    user: PropTypes.object.isRequired,
    project_key: PropTypes.string.isRequired,
    directory: PropTypes.string.isRequired,
    options: PropTypes.object,
    collection: PropTypes.array.isRequired,
    query: PropTypes.object.isRequired,
    itemLoading: PropTypes.bool.isRequired,
    indexLoading: PropTypes.bool.isRequired,
    index: PropTypes.func.isRequired,
    refresh: PropTypes.func.isRequired,
    sort: PropTypes.func.isRequired,
    mode: PropTypes.string.isRequired,
    changeMode: PropTypes.func.isRequired,
    directoryShow: PropTypes.bool.isRequired,
    toggleDirectory: PropTypes.func.isRequired,
    showCreateFolder: PropTypes.func.isRequired
  }

  componentWillMount() {
    const { index, query={} } = this.props;
    const newQuery = {};
    if (query.uploader_id) {
      newQuery.uploader_id = this.state.uploader_id = query.uploader_id;
    }
    if (query.name) {
      newQuery.name = this.state.name = query.name;
    }
    if (query.uploaded_at) {
      newQuery.uploaded_at = this.state.uploaded_at = query.uploaded_at;
    }
    if (query.myfavorite) {
      newQuery.myfavorite = this.state.myfavorite = query.myfavorite;
    }
    index(newQuery);
  }

  componentWillReceiveProps(nextProps) {
    const newQuery = nextProps.query || {};
    const { directory, index, query } = this.props;
    if (!_.isEqual(newQuery, query) || !_.isEqual(directory, nextProps.directory)) {
      index(newQuery);
    }

    this.state.uploader_id = newQuery.uploader_id || null;
    this.state.name = newQuery.name || '';
    this.state.uploaded_at = newQuery.uploaded_at || null;
    this.state.myfavorite = newQuery.myfavorite || '';
  }

  refresh() {
    const { refresh } = this.props;
    const query = {};
    if (this.state.uploader_id) {
      query.uploader_id = this.state.uploader_id;
    }
    if (this.state.uploaded_at) {
      query.uploaded_at = this.state.uploaded_at;
    }
    if (_.trim(this.state.name)) {
      query.name = _.trim(this.state.name);
    }
    if (this.state.myfavorite == '1') {
      query.myfavorite = '1';
    }
    refresh(query);
  }

  uploaderChange(newValue) {
    this.state.uploader_id = newValue;
    this.refresh();
  }

  uploadedAtChange(newValue) {
    this.state.uploaded_at = newValue;
    this.refresh();
  }

  sortChange(newValue) {
    if (window.localStorage) {
      window.localStorage.setItem('document-sortkey', newValue);
    }
    this.setState({ sortkey: newValue });
    const { sort } = this.props;
    sort(newValue);
  }

  render() {
    const { 
      user,
      project_key,
      directory,
      collection, 
      itemLoading, 
      indexLoading, 
      refresh, 
      mode,
      changeMode,
      showCreateFolder, 
      directoryShow,
      toggleDirectory,
      options, 
      query 
    } = this.props;
    const { createFolderShow, searchShow } = this.state;

    const uploadedat_options = [
      { value: '1w', label: '1周内' },
      { value: '2w', label: '2周内' },
      { value: '1m', label: '1个月内' },
      { value: '2m', label: '2个月内' }
    ];

    const sortOptions = [
      { value: 'create_time_asc', label: '创建时间 ↑' },
      { value: 'create_time_desc', label: '创建时间 ↓' },
      { value: 'name_asc', label: '名称 ↑' },
      { value: 'name_desc', label: '名称 ↓' }
    ];

    return (
      <div style={ { marginTop: '5px', height: '40px' } }>
        <FormGroup>
          <span style={ { float: 'left' } } className='directory-indent' onClick={ () => { toggleDirectory(); } }><i className={ directoryShow ? 'fa fa-outdent' : 'fa fa-indent' }></i></span>
          <span style={ { float: 'left' } }>
            <Breadcrumb style={ { marginBottom: '0px', backgroundColor: '#fff', paddingLeft: '5px', marginTop: '0px' } }>
              { _.map(options.path || [], (v, i) => {
                if (i === options.path.length - 1) {
                  return (<Breadcrumb.Item active key={ i }>{ i === 0 ? '根目录' : v.name }</Breadcrumb.Item>);
                } else if (i === 0) {
                  return (<Breadcrumb.Item key={ i } disabled={ indexLoading }><Link to={ '/project/' + project_key + '/document' }>根目录</Link></Breadcrumb.Item>);
                } else {
                  return (<Breadcrumb.Item key={ i } disabled={ indexLoading }><Link to={ '/project/' + project_key + '/document/' + v.id }>{ v.name }</Link></Breadcrumb.Item>);
                }
              }) }
            </Breadcrumb>
          </span>
          <span style={ { float: 'right' } }>
            <span style={ { float: 'right' } }>
              <Button onClick={ ()=>{ changeMode() } }><i className={ mode == 'list' ? 'fa fa-th' : 'fa fa-list' }></i></Button>
            </span>
            <span style={ { float: 'right', marginRight: '10px' } }>
              <DropdownButton
                pullRight
                title='排序'
                id='basic-nav-dropdown-project'
                onSelect={ this.sortChange.bind(this) }>
                  { _.map(sortOptions, (v, i) =>
                    <MenuItem key={ i } eventKey={ v.value }>
                      <div style={ { display: 'inline-block', width: '20px', textAlign: 'left' } }>
                      { this.state.sortkey == v.value && <span><i className='fa fa-check'></i></span> }
                      </div>
                      <span>{ v.label }</span>
                    </MenuItem> ) }
              </DropdownButton>
            </span>
            <span style={ { float: 'right', marginRight: '10px' } }>
              <Button onClick={ ()=>{ this.setState({ searchShow: !this.state.searchShow }) } }><i className='fa fa-search'></i> 检索{ !_.isEmpty(query) && !searchShow ? '...' : '' }</Button>
            </span>
            { options.permissions && options.permissions.indexOf('manage_project') !== -1 &&
            <span style={ { float: 'right', marginRight: '10px' } }>
              <Button onClick={ () => { showCreateFolder(); } } disabled={ indexLoading || itemLoading || !_.isEmpty(query) }>
                <i className='fa fa-plus'></i>&nbsp;新建目录
              </Button>
            </span> }
          </span>
        </FormGroup>
        { searchShow &&
        <FormGroup style={ { clear: 'both' } }>
          <span style={ { float: 'right', marginTop: '5px', backgroundColor: '#f1f1f1', padding: '10px', borderRadius: '4px' } }>
            <span style={ { float: 'right', marginRight: '10px' } }>
              <Checkbox
                checked={ this.state.myfavorite == '1' }
                onClick={ () => { this.state.myfavorite = (this.state.myfavorite == '1' ? '' : '1'); this.refresh(); } }
                style={ { display: 'inline-block' } }>
                我收藏的
              </Checkbox>
            </span>
            <span style={ { float: 'right', width: '150px', marginRight: '10px' } }>
              <FormControl
                type='text'
                style={ { height: '36px' } }
                value={ this.state.name }
                onChange={ (e) => { this.setState({ name: e.target.value }) } }
                onKeyDown={ (e) => { if (e.keyCode == '13') { this.refresh(); } } } 
                placeholder={ '文档名称查询...' } />
            </span>
            <span style={ { float: 'right', width: '110px', marginRight: '10px' } }>
              <Select
                simpleValue
                placeholder='上传时间'
                value={ this.state.uploaded_at }
                onChange={ this.uploadedAtChange.bind(this) }
                options={ uploadedat_options }/>
            </span>
            <span style={ { float: 'right', width: '150px', marginRight: '10px' } }>
              <Select
                simpleValue
                placeholder='上传者'
                value={ this.state.uploader_id }
                onChange={ this.uploaderChange.bind(this) }
                options={ _.union([ { value: 'me', label: '当前用户' } ], _.map(options.uploader || [], (v) => { return { value: v.id, label: v.name } })) }/>
            </span>
          </span>
        </FormGroup> }
      </div>
    );
  }
}
