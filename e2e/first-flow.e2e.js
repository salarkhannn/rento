describe('Rento E2E flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true, url: 'rento:///' });
  });

  it('shows the browse list on launch', async () => {
    await expect(element(by.id('browse-flatlist'))).toBeVisible();
  });

  it('can search for an item in browse', async () => {
    await expect(element(by.id('browse-search-input'))).toBeVisible();
    await element(by.id('browse-search-input')).tap();
    await element(by.id('browse-search-input')).typeText('Tent');
    await expect(element(by.text('Camping Tent'))).toBeVisible();
  });
});
