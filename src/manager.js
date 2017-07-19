import component, { store } from './app';
import APP from 'codingSDK/utils';

export const global = new APP({
  subscribeDataArray: ['GitState'],
  pkgId: 'coding_web_ide_plugin',
});

const { injectComponent } = global;
export default class {
  pluginWillMount() {
      console.log('this plugin will Moun');
      injectComponent.addComToSideBar('right', {
      text: 'Access URL',
      icon: 'fa fa-external-link',
      key: 'access-url',
      onSidebarActive: () => {
        console.log('Access URL is active');
      },
      onSidebarDeactive: () => {
        console.log('Access URL is deactive');
      },
    }, extension =>  extension.app);
  }
  pluginOnActive() {

  }
  /**
   * this will call only when plugin is unmount
   * @param  {}
   */
  pluginOnUnmount() {
    console.log('this plugin will UnMount');
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
