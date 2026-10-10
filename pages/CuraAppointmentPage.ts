import { expect, Locator, Page } from '@playwright/test';

export class CuraAppointmentPage {
    readonly page: Page;
    readonly makeAppointmentButton: Locator;
    readonly usernameInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;
    readonly errorMessage: Locator;
    readonly facilitySelect: Locator;
    readonly visitDateInput: Locator;

    constructor(page: Page) {
        this.page = page;
        this.makeAppointmentButton = page.locator('#btn-make-appointment');
        this.usernameInput = page.locator('#txt-username');
        this.passwordInput = page.locator('#txt-password');
        this.loginButton = page.locator('#btn-login');
        this.errorMessage = page.locator('.text-danger');
        this.facilitySelect = page.locator('#combo_facility');
        this.visitDateInput = page.locator('#txt_visit_date');
    }

    async navigate() {
        await this.page.goto('/');
        await this.makeAppointmentButton.click();
    }

    async login(username: string, password: string) {
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }

    async expectLoginError(message: string) {
        await expect(this.errorMessage).toHaveText(message);
    }

    async selectFacility(facility: string) {
        await this.facilitySelect.selectOption({ label: facility });
    }

    async selectVisitDate(isoDate: string) {
        const [year, month, day] = isoDate.split('-');
        await this.visitDateInput.fill(`${day}/${month}/${year}`);
    }
}