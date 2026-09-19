import { Page } from '@playwright/test';

export async function loginAs(page: Page, username: string) {
  const passwords: Record<string, string> = {
    'standard_user': 'secret_sauce',
    'problem_user': 'secret_sauce',
    'performance_glitch_user': 'secret_sauce',
    'locked_out_user': 'secret_sauce'
  };

  await page.goto('https://www.saucedemo.com');
  await page.locator('#user-name').fill(username);
  await page.locator('#password').fill(passwords[username] ?? 'secret_sauce');
  await page.locator('#login-button').click();
}