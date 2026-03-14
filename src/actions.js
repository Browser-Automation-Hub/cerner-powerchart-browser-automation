/**
 * actions.js — Core automation actions for Cerner PowerChart
 *
 * Each function accepts a Puppeteer Page instance and options.
 * All actions use retry() + humanDelay() for reliability.
 */
'use strict';

require('dotenv').config();

/**
 * login_powerchart — Authenticate to PowerChart with SSO/MFA support
 * @param {import('puppeteer').Page} page
 * @param {Object} opts
 * @returns {Promise<Object>}
 */
async function login_powerchart(page, opts = {}) {
  const { retry, humanDelay, log } = require('./utils');

  log('Running: login_powerchart', opts);

  return retry(async () => {
    await humanDelay(500, 1500);
    try {
      const BASE_URL = process.env.CERNER_URL;
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    // Cerner typically uses SSO redirect
    if (page.url().includes('login') || page.url().includes('sso')) {
      await page.waitForSelector('#j_username, input[name="username"]', { timeout: 15000 });
      await page.type('#j_username, input[name="username"]', process.env.CERNER_USERNAME);
      await page.type('#j_password, input[type="password"]', process.env.CERNER_PASSWORD);
      await page.click('.btn-login, input[type="submit"]');
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
    }
    await page.waitForSelector('#menuBar, .power-chart-header, [id*="PatientListContainer"]', { timeout: 20000 });
    return { status: 'logged_in', url: page.url() };
    } catch (err) {
      await page.screenshot({ path: `error-login_powerchart-${Date.now()}.png` }).catch(() => {});
      throw err;
    }
  }, { attempts: 3, delay: 2000 });
}

/**
 * search_patient — Search and open patient charts
 * @param {import('puppeteer').Page} page
 * @param {Object} opts
 * @returns {Promise<Object>}
 */
async function search_patient(page, opts = {}) {
  const { retry, humanDelay, log } = require('./utils');

  log('Running: search_patient', opts);

  return retry(async () => {
    await humanDelay(500, 1500);
    try {
      await page.waitForSelector('#patSearch, input[placeholder*="Patient"], .pt-search-field', { timeout: 15000 });
    await page.click('#patSearch, input[placeholder*="Patient"]');
    await humanDelay(300, 700);
    await page.type('#patSearch, input[placeholder*="Patient"]', opts.patientName || opts.mrn || '');
    await page.keyboard.press('Enter');
    await page.waitForSelector('.pt-info-name, .patient-result-row, [id*="patientResult"]', { timeout: 15000 });
    const patients = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.pt-info-name, .patient-result-row')).slice(0, 10).map(el => ({
        name: el.querySelector('.pt-name, .name')?.textContent?.trim() || el.textContent.trim(),
        mrn: el.querySelector('.mrn, .pt-mrn')?.textContent?.trim(),
      }))
    );
    if (opts.openFirst !== false && patients.length > 0) {
      await page.click('.pt-info-name:first-child, .patient-result-row:first-child');
      await page.waitForSelector('.power-chart-header, [id*="PatientBanner"]', { timeout: 15000 });
    }
    return { status: 'ok', patients };
    } catch (err) {
      await page.screenshot({ path: `error-search_patient-${Date.now()}.png` }).catch(() => {});
      throw err;
    }
  }, { attempts: 3, delay: 2000 });
}

/**
 * view_results — Extract lab results and clinical data
 * @param {import('puppeteer').Page} page
 * @param {Object} opts
 * @returns {Promise<Object>}
 */
async function view_results(page, opts = {}) {
  const { retry, humanDelay, log } = require('./utils');

  log('Running: view_results', opts);

  return retry(async () => {
    await humanDelay(500, 1500);
    try {
      await page.waitForSelector('a[href*="results"], #resultsTab, .results-nav', { timeout: 15000 });
    await page.click('a[href*="results"], #resultsTab');
    await page.waitForSelector('.result-row, .lab-result-row, [class*="resultItem"]', { timeout: 15000 });
    const results = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.result-row, .lab-result-row')).map(row => ({
        test: row.querySelector('.result-name, .lab-name')?.textContent?.trim(),
        value: row.querySelector('.result-value, .lab-value')?.textContent?.trim(),
        date: row.querySelector('.result-date, .lab-date')?.textContent?.trim(),
        status: row.querySelector('.result-status')?.textContent?.trim(),
      }))
    );
    return { status: 'ok', results };
    } catch (err) {
      await page.screenshot({ path: `error-view_results-${Date.now()}.png` }).catch(() => {});
      throw err;
    }
  }, { attempts: 3, delay: 2000 });
}

/**
 * create_order — Submit medication or lab orders
 * @param {import('puppeteer').Page} page
 * @param {Object} opts
 * @returns {Promise<Object>}
 */
async function create_order(page, opts = {}) {
  const { retry, humanDelay, log } = require('./utils');

  log('Running: create_order', opts);

  return retry(async () => {
    await humanDelay(500, 1500);
    try {
      // TODO: Replace with actual Cerner PowerChart selectors
    // await page.goto(`${process.env.CERNER_URL}/path/to/create-order`);
    // await page.waitForSelector('.main-content, #content, [data-testid="loaded"]', { timeout: 15000 });
    const result = await page.evaluate(() => {
      return { status: 'ok', data: null };
    });
    log('create_order complete', result);
    return result;
    } catch (err) {
      await page.screenshot({ path: `error-create_order-${Date.now()}.png` }).catch(() => {});
      throw err;
    }
  }, { attempts: 3, delay: 2000 });
}

/**
 * export_documentation — Export clinical documentation to structured format
 * @param {import('puppeteer').Page} page
 * @param {Object} opts
 * @returns {Promise<Object>}
 */
async function export_documentation(page, opts = {}) {
  const { retry, humanDelay, log } = require('./utils');

  log('Running: export_documentation', opts);

  return retry(async () => {
    await humanDelay(500, 1500);
    try {
      // TODO: Replace with actual Cerner PowerChart selectors
    // await page.goto(`${process.env.CERNER_URL}/path/to/export-documentation`);
    // await page.waitForSelector('.main-content, #content, [data-testid="loaded"]', { timeout: 15000 });
    const result = await page.evaluate(() => {
      return { status: 'ok', data: null };
    });
    log('export_documentation complete', result);
    return result;
    } catch (err) {
      await page.screenshot({ path: `error-export_documentation-${Date.now()}.png` }).catch(() => {});
      throw err;
    }
  }, { attempts: 3, delay: 2000 });
}

module.exports = {
  login_powerchart,
  search_patient,
  view_results,
  create_order,
  export_documentation,
};
