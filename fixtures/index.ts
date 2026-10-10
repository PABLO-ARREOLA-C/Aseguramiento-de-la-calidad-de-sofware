import { test as base, expect } from '@playwright/test';
import { CuraAppointmentPage } from '../pages/CuraAppointmentPage';

type Fixtures = {
	curaPage: CuraAppointmentPage;
};

export const test = base.extend<Fixtures>({
	curaPage: async ({ page }, use) => {
		await use(new CuraAppointmentPage(page));
	},
});

export { expect };

