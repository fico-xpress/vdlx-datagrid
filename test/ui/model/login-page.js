import {Selector, t} from "testcafe";

export default class LoginPage {
    constructor() {
        this.loginUsername = Selector('#inputEmail');
        this.loginPassword = Selector('#inputPassword');
        this.loginButton = Selector('#loginBtn');
    }

    async login () {
        await t
            .typeText(this.loginUsername, 'admin')
            .typeText(this.loginPassword, 'admin123')
            .click(this.loginButton);
    }
}
