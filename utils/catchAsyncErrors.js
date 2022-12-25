// the function ' catchAsyncErrors' takes a function 'fn' as an argument
// then returns another function as an argument (the arrow func ) hhhh
module.exports = fn => (req, res, next) => {
        fn(req, res, next).catch(next);
    };