/*eslint-disable*/
const contents = ['global'];

export default contents.reduce((p, v) => {
  p[v] = require(`./${v}.json`);
  return p
}, {});
