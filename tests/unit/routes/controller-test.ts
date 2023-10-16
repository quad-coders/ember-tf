import { module, test } from 'qunit';
import { setupTest } from 'ember-tf/tests/helpers';

module('Unit | Controller | /routes', function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    const controller = this.owner.lookup('controller:/routes');
    assert.ok(controller);
  });
});
