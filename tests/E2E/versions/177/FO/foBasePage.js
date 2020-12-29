// Get resolver
const CommonPage = require('prestashop_test_lib/versions/commonPage.js');

module.exports = class FoBasePage extends CommonPage {
  constructor() {
    super();

    // Selectors
    this.languageSelectorDiv = '#_desktop_language_selector';
    this.languageSelectorExpandIcon = `${this.languageSelectorDiv} i.expand-more`;
    this.languageSelectorMenuItemLink = language => `${this.languageSelectorDiv}`
      + ` ul li a[data-iso-code='${language}']`;
  }

  // Functions

  /**
   * Change language in FO
   * @param page
   * @param lang
   * @return {Promise<void>}
   */
  async changeLanguage(page, lang = 'en') {
    await Promise.all([
      page.click(this.languageSelectorExpandIcon),
      this.waitForVisibleSelector(page, this.languageSelectorMenuItemLink(lang)),
    ]);

    await this.clickAndWaitForNavigation(page, this.languageSelectorMenuItemLink(lang));
  }
};
