import APP from 'webide-plugin-sdk/utils';
import Manager from 'webide-plugin-sdk/Manager';

import component, { store } from './app';

const languagePool = require('../i18n/index.json').reduce((p, v) => {
  p[v] = require(`../i18n/${v}/index`).default;
  return p;
}, {});

export const global = new APP({
  subscribeDataArray: ['GitState'],
  pkgId: 'coding_web_ide_plugin',
  i18n: { customLanguagePool: languagePool },
});

const { injectComponent, i18n } = global;
const { position, inject } = injectComponent;

export default class {
  pluginWillMount() {
    inject(position.SIDEBAR.RIGHT, {
      text: i18n`global.sidebar`,
      icon: 'fa fa-external-link',
      key: 'access-url',
      actions: {
        onSidebarActive: () => {
        },
        onSidebarDeactive: () => {
        },
      },
    }, extension => extension.app);
  }
  /**
   * this will call only when plugin is unmount
   * @param  {}
   */
  pluginWillUnmount() {
  }
  get component() {
    return component;
  }
  get appData() {
    return store.getState();
  }
  get request() {
    return this.getRequest();
  }
}
