import { global } from './manager';

const request = global.request;
const config = global.sdk.config;

export function createPort({ port }) {
  return request.post(`/hf/${config.spaceKey}`, { port });
}

export function listPorts() {
  return request.get(`/hf/${config.spaceKey}`);
}

export function deletePort({ port }) {
  return request.delete(`/hf/${config.spaceKey}`, { port });
}
