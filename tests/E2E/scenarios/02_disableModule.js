require('module-alias/register');

const {expect} = require('chai');
const browserHelper = require('prestashop_test_lib/kernel/utils/helpers.js');
const configClassMap = require('@utils/configClassMap.js');

// Get resolver
const VersionSelectResolver = require('prestashop_test_lib/kernel/resolvers/versionSelectResolver.js');

const versionSelectResolver = new VersionSelectResolver(global.PS_VERSION, configClassMap);

// Import pages
const loginPage = versionSelectResolver.require('BO/login/index.js');
const dashboardPage = versionSelectResolver.require('BO/dashboard/index.js');
const moduleManagerPage = versionSelectResolver.require('BO/modules/moduleManager/index.js');
const homePage = versionSelectResolver.require('FO/home/index.js');

// Browser vars
let browserContext;
let page;

const moduleToInstall = {
  name: 'Banner',
  tag: 'ps_banner',
};

describe('Disable and enable module', async () => {
  // before and after functions
  before(async function () {
    browserContext = await browserHelper.createBrowserContext(this.browser);

    page = await browserHelper.newTab(browserContext);
  });

  after(async () => {
    await browserHelper.closeBrowserContext(browserContext);
  });

  it('should go to login page', async () => {
    await loginPage.goTo(page, global.BO.URL);

    const pageTitle = await loginPage.getPageTitle(page);
    await expect(pageTitle).to.contains(loginPage.pageTitle);
  });

  it('should login into BO with default user', async () => {
    await loginPage.login(page, global.BO.EMAIL, global.BO.PASSWD);
    await dashboardPage.closeOnboardingModal(page);

    const pageTitle = await dashboardPage.getPageTitle(page);
    await expect(pageTitle).to.contains(dashboardPage.pageTitle);
  });

  it('should go to module manager page', async () => {
    await dashboardPage.goToSubMenu(
      page,
      dashboardPage.modulesParentLink,
      dashboardPage.moduleManagerLink,
    );

    const pageTitle = await moduleManagerPage.getPageTitle(page);
    await expect(pageTitle).to.contain(moduleManagerPage.pageTitle);
  });

  it('should check that the module was installed', async () => {
    const isModuleVisible = await moduleManagerPage.searchModule(
      page,
      moduleToInstall.tag,
      moduleToInstall.name,
    );

    await expect(isModuleVisible).to.be.true;
  });

  it('should check that the module is enabled', async () => {
    const isModuleEnabled = await moduleManagerPage.isModuleEnabled(page, moduleToInstall.name);
    await expect(isModuleEnabled).to.be.true;
  });

  it('should disable module', async () => {
    const textResult = await moduleManagerPage.disableModule(page, moduleToInstall.tag, moduleToInstall.name);
    await expect(textResult).to.contain(moduleManagerPage.successfulDisableMessage(moduleToInstall.tag));
  });

  it('should view my shop and check that banner don\'t exist', async () => {
    page = await moduleManagerPage.viewMyShop(page);

    const bannerExists = await homePage.isBannerVisible(page);
    await expect(bannerExists).to.be.false;
  });

  it('should go back to BO', async () => {
    page = await homePage.closePage(browserContext, page, 0);

    const pageTitle = await moduleManagerPage.getPageTitle(page);
    await expect(pageTitle).to.contain(moduleManagerPage.pageTitle);
  });

  it('should enable module', async () => {
    const textResult = await moduleManagerPage.enableModule(page, moduleToInstall.name);
    await expect(textResult).to.contain(moduleManagerPage.successfulEnableMessage(moduleToInstall.tag));
  });

  it('should view my shop and check that banner exist', async () => {
    page = await moduleManagerPage.viewMyShop(page);

    const bannerExists = await homePage.isBannerVisible(page);
    await expect(bannerExists).to.be.true;
  });
});
