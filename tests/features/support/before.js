module.exports = function () {
    this.Before(function (callback) {
        this.spooky.start();
        callback();
    });
};
