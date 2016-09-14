
/**
 * Tests that clicking on the trigger toggles the visibility of the target.
 * Accounts for animations.
 */
function assertToggles(test, trigger, target) {
    test.assertExists(trigger);
    test.assertExists(target);

    test.assertNotVisible(target);
    casper.click(trigger);
    test.assertVisible(target);
    casper.click(trigger);
    casper.waitWhileVisible(target, function() {
        test.assertNotVisible(target);
    });
}

module.exports = assertToggles;

