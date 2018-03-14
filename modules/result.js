module.exports = function () {
    this.success = false;
    this.message = 'Invalid error! LOL.';
    this.redirect = '';
    this.payload = {};
    this.set_success = (success) => {
        this.success = (success === true);
        return this;
    };
    this.set_message = (message) => {
        this.message = message;
        return this;
    };
    this.set_redirect = (redirect) => {
        this.redirect = redirect;
        return this;
    };
};
