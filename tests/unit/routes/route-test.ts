import { module, test } from 'qunit';
import { setupTest } from 'ember-tf/tests/helpers';

module('Unit | Route | /routes', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const route = this.owner.lookup('route:/routes');
    assert.ok(route);
  });
});
