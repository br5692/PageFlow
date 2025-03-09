import api from './api';

describe('api', () => {
  it('should export an axios instance', () => {
    expect(api).toBeDefined();
  });
});