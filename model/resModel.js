class BaseModal {
    constructor(data, message) {
        if (typeof data === 'string') {
            this.message = data;
            data = null;
            message = null;
        }
        if (data) {
            this.data = data;
        }
        if (message) {
            this.message = message
        }
    }
}

class SuccessModel extends BaseModal {
    constructor(data, message) {
        super(data, message);
        this.errno = 0
    }
}

class ErrorModel extends BaseModal {
    constructor(data, message) {
        super(data, message);
        this.errno = -1
    }
}

module.exports = {
    SuccessModel,
    ErrorModel
}