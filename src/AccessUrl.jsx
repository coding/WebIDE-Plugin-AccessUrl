import React, { Component, PropTypes } from 'react';
var ReactDOM = require('react-dom');
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as AccessUrlActions from './actions';
import cx from 'classnames';
import { global } from './manager';
import QRCode from 'qrcode.react';

const Modal = global.sdk.Modal;
const i18n = global.i18n;

class AccessUrl extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoading: true,
      ticks: 0,
      showQR: false,
    }
  }
  componentWillMount () {
    this.fetch()
  }
  componentDidMount () {
    
  }
  componentWillUnmount () {
    if (this.cdInterval) {
      clearInterval(this.cdInterval)
      this.cdInterval = undefined
    }
  }
  
  render() {
    const { portList, generateDisabled } = this.props
    return (
      <div className="access-url" >
        <div className="access-url-container" >
          <div className="access-url-panel">
            <div className="panel-heading">
              <div className="panel-title">
                <i className="icon fa fa-external-link" />
                {i18n`global.sidebar`}
              </div>
              <div className="panel-title-right">
                {i18n`global.port`}
                <input type="number" min="0" max="65535" defaultValue="8080" ref={(input) => { this.portInput = input; }} />
                <label className="opt-label" onClick={(e) => {
                  if (!generateDisabled) {
                    this.handleGenerate(e)
                  }
                }}>
                  <i className="fa fa-plus" title={i18n.get('global.generate')} />
                </label>
              </div>
              <i className="fa fa-refresh" onClick={this.handleRefrash} title={i18n.get('global.refresh:=Refresh')} />
            </div>
            <div className="panel-body">
              <div className="list-group">
                {portList.length > 0 ? (
                  portList.map((port) => {
                    if ((port.ttl-this.state.ticks) > 0) {
                      return (
                        <PortItem
                          ttl={this.formatTTL(port.ttl-this.state.ticks)}
                          node={port}
                          key={port.token}
                          handleOpenQR={this.handleOpenQR}
                          handleCloseQR={this.handleCloseQR}
                          handleDelete={this.handleDelete}
                        />
                      )
                    } else {
                      return ''
                    }
                  })
                ): ''}
              </div>
            </div>
            <div className={cx('qr-container', {show: this.state.showQR})} ref={(div) => { this.qr = div; }} >
            </div>
          </div>
        </div>
      </div>
    )
  }
  fetch = () => {
    this.setState({
      isLoading: true,
    })
    const portListPromise = this.props.actions.listPorts()
    Promise.all([portListPromise]).then((res) => {
      this.setState({
        isLoading: false,
        ticks: 0
      })
      if (res.length > 0 && !this.cdInterval) {
        this.cdInterval = setInterval(this.tick, 1000)
      }
    })
  }
  tick = () => {
    this.setState({
      ticks: this.state.ticks + 1
    })
    if (this.props.portList.length <= 0 && this.cdInterval) {
      clearInterval(this.cdInterval)
      this.cdInterval = undefined
    }
  }
  formatTTL = (ttl) => {
    var hour, min, sec, text;
    min = Math.floor(ttl / 60);
    sec = ttl % 60;
    hour = Math.floor(min / 60);
    min = min % 60;
    text = 'Expires: ';
    text += hour < 10 ? "0" + hour + ":" : hour + ":";
    text += min < 10 ? "0" + min + ":" : min + ":";
    text += sec < 10 ? "0" + sec : "" + sec;
    return text;
  }
  handleGenerate = (e) => {
    e.preventDefault()
    this.props.actions.createPort({ port: this.portInput.value})
  }
  handleRefrash = (e) => {
    e.preventDefault()
    this.fetch()
  }
  handleOpenQR = (e, url) => {
    e.preventDefault()
    ReactDOM.render(<QRCode value={url} />, this.qr)
    const qrParentRect = this.qr.parentElement.getBoundingClientRect()
    const iconRect = e.target.getBoundingClientRect()
    const left = iconRect.left - qrParentRect.left + iconRect.width + 6
    const top = iconRect.top - qrParentRect.top
    this.qr.style.left = left + 'px'
    this.qr.style.top = top + 'px'
    this.setState({
      showQR: true
    })
  }
  handleCloseQR = (e) => {
    e.preventDefault()
    this.setState({
      showQR: false
    })
  }
  handleDelete = async (port) => {
    var confirmed = await Modal.showModal('Confirm', {
      header: i18n`global.handleDelete.header`,
      message: i18n`global.handleDelete.message${port}`,
      okText: i18n`global.handleDelete.okText`
    })
    Modal.dismissModal()
    if (confirmed) {
      this.props.actions.deletePort({ port })
    }
  }
}

const PortItem = ({ node, handleOpenQR, handleCloseQR, handleDelete, ttl }) => {
  return (
    <div className="port-item">
      <div className="qrcode">
        <i className="fa fa-qrcode" onMouseEnter={e => handleOpenQR(e, node.url)} onMouseLeave={handleCloseQR} />
      </div>
      <div className="port-content">
        <a href={node.url} target="_blank">{node.url}</a>
        <div>{ttl}</div>
      </div>
      <div className="extra">
        <i className="fa fa-trash-o" onClick={handleDelete.bind(null, node.port)}/>
      </div>
    </div>
  )
}

const mapStateToProps = (state) => {
  const {
    local: {
      generateDisabled, portList = []
    }
  } = state
  return ({ 
    generateDisabled,
    portList
  });
};
export default connect(mapStateToProps, dispatch => ({
  actions: bindActionCreators(AccessUrlActions, dispatch)
}))(AccessUrl);