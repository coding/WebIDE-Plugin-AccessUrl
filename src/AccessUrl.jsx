import React, { Component, PropTypes } from 'react';
var ReactDOM = require('react-dom');
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Clipboard from 'lib/clipboard';
import * as AccessUrlActions from './actions';
import cx from 'classnames';
import { global } from './manager';
import QRCode from 'qrcode.react';

const { notify, NOTIFY_TYPE } = global.sdk.Notify;
const Modal = global.sdk.Modal;
const i18n = global.i18n;

class AccessUrl extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoading: true,
      ticks: 0,
      showQR: false,
      port: 8080,
    }
    this.handlePort = this.handlePort.bind(this);
    this.handlePortIncrease = this.handlePortIncrease.bind(this);
    this.handlePortDecrease = this.handlePortDecrease.bind(this);
    this.handleEnterGenerate = this.handleEnterGenerate.bind(this);
    this.handleGenerate = this.handleGenerate.bind(this);
  }
  componentWillMount () {
    this.fetch()
  }
  componentDidMount () {
      const clipboard = new Clipboard('.clipboard', {
        text: trigger => trigger.parentElement.parentElement.querySelector('.ip-content').getAttribute('href'),
      });
      clipboard.on('success', (e) => {
        notify({message: `${e.text} ${i18n.get('global.message.copySuccess')}`});
      });
      clipboard.on('error', (e) => {
        notify({message: i18n.get('global.message.copyFailed')});
      });
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
              <i className="fa fa-refresh" onClick={this.handleRefrash} title={i18n.get('global.refresh:=Refresh')} />
            </div>
            <div className="panel-body">
              <div className="create-url">
                <div className="url-tip">
                  <span>{i18n`global.description`}</span>
                  <a href="https://coding.net/help/doc/cloud-studio/compile.html#i-4" target="_blank">{i18n`global.help`}</a>
                </div>
                <div className="url-generate">
                  <div className="port">
                    <span>0.0.0.0&nbsp;:</span>
                    <input type="text" value={this.state.port} onChange={this.handlePort} onKeyUp={this.handleEnterGenerate} />
                    <div className="change">
                        <div className="fa fa-angle-up" onClick={this.handlePortIncrease}></div>
                        <div className="fa fa-angle-down" onClick={this.handlePortDecrease}></div>
                    </div>
                  </div>
                  <button className="btn btn-primary" onClick={this.handleGenerate}>{i18n`global.generate`}</button>
                </div>
              </div>
              <div className="list-group">
                {portList.length > 0 ? (
                  portList.map((port) => {
                    if (port.ttl === -1) {
                      return (
                        <PortItem
                          ttl={port.ttl}
                          node={port}
                          key={port.token}
                          handleOpenQR={this.handleOpenQR}
                          handleCloseQR={this.handleCloseQR}
                          handleDelete={this.handleDelete}
                        />
                      )
                    } else if ((port.ttl-this.state.ticks) > 0) {
                      return (
                        <PortItem
                          ttl={this.formatTTL(port.ttl-this.state.ticks)}
                          node={port}
                          key={port.token}
                          handleOpenQR={this.handleOpenQR}
                          handleCloseQR={this.handleCloseQR}
                          handleDelete={this.handleDelete}
                          handlePermanent={this.handlePermanent}
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
    text = i18n.get('global.expires');
    text += hour < 10 ? "0" + hour + ":" : hour + ":";
    text += min < 10 ? "0" + min + ":" : min + ":";
    text += sec < 10 ? "0" + sec : "" + sec;
    return text;
  }

  handlePort(e) {
    let value = e.target.value;
    if (value !== '') {
        value = Number(value);
        if (Number.isNaN(value) || value > 100000) {
            return;
        }
    }
    this.setState({port: value});
  }

  handlePortIncrease() {
    if (this.state.port < 10000) {
        this.setState((prevState) => ({
            port: prevState.port + 1,
        }));
    }
  }

  handlePortDecrease() {
    if (this.state.port > 0) {
      this.setState((prevState) => ({
          port: prevState.port - 1,
      }));
    }
  }

  handleEnterGenerate(e) {
    if (e.keyCode === 13) {
      this.handleGenerate(e);
    }
  }

  handleGenerate = (e) => {
    e.preventDefault()
    this.props.actions.createPort({ port: this.state.port}).then((res) => {
      this.setState({
        isLoading: false,
        ticks: 0
      })
      if (res.length > 0 && !this.cdInterval) {
        this.cdInterval = setInterval(this.tick, 1000)
      }
    })
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
      message: i18n`global.handleDelete.message${{port}}`,
      okText: i18n`global.handleDelete.okText`
    })
    Modal.dismissModal()
    if (confirmed) {
      this.props.actions.deletePort({ port })
    }
  }
  handlePermanent = (e, port) => {
    e.preventDefault()
    if (global.sdk.config.userProfile.vip >= 4) {
      this.props.actions.savePort({ port })
    } else {
      notify({
        notifyType: NOTIFY_TYPE.INFO,
        message: <a href='https://coding.net/vip' target='_blank' rel='noopener noreferrer' >{i18n`global.message.memberInfo`}</a>,
        dismissAfter: 10000,
      });
    }
  }
}

const PortItem = ({ node, handleOpenQR, handleCloseQR, handleDelete, handlePermanent, ttl }) => {
  const ip = `0.0.0.0:${node.port}`;
  let ttlDom = '';
  if (ttl === -1) {
    ttlDom = <div className="post-item-info">{i18n`global.neverExpires`}</div>
  } else {
    ttlDom = <div className="post-item-info">
      <label className="post-item-ttl">
      {ttl}
      </label>
      <span className='post-item-upgrade' onClick={e => handlePermanent(e, node.port)}>
        <i className="fa fa-hourglass-half"></i>
        {i18n`global.permanent`}
      </span>
    </div>
  }
  return (
    <div className="port-item" key={node.token}>
      <div className="qrcode">
        <i className="fa fa-qrcode" onMouseEnter={e => handleOpenQR(e, node.url)} onMouseLeave={handleCloseQR}></i>
      </div>
      <div className="port-content">
        <a className="ip-content" href={node.url} target="_blank">{ip}</a>
        {ttlDom}
      </div>
      <div className="extra">
        <i className="clipboard fa fa-copy"></i>
        <i className="fa fa-trash-o" onClick={handleDelete.bind(null, node.port)}></i>
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
