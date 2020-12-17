
export const pFinally = (promise: any, onFinally: any) => {
    onFinally = onFinally || (() => { });

    return promise.then(
        (val: any) => new Promise(resolve => {
            resolve(onFinally());
        }).then(() => val),
        (err: any) => new Promise(resolve => {
            resolve(onFinally());
        }).then(() => {
            throw err;
        })
    );
};

export class TimeoutError extends Error {
    constructor(message?: any) {
        super(message);
        this.name = 'TimeoutError';
    }
}

export const pTimeout = (promise: any, milliseconds: any, fallback: any) => new Promise((resolve, reject) => {
    if (typeof milliseconds !== 'number' || milliseconds < 0) {
        throw new TypeError('Expected `milliseconds` to be a positive number');
    }

    if (milliseconds === Infinity) {
        resolve(promise);
        return;
    }

    const timer = setTimeout(() => {
        if (typeof fallback === 'function') {
            try {
                resolve(fallback());
            } catch (error) {
                reject(error);
            }

            return;
        }

        const message = typeof fallback === 'string' ? fallback : `Promise timed out after ${milliseconds} milliseconds`;
        const timeoutError = fallback instanceof Error ? fallback : new TimeoutError(message);

        if (typeof promise.cancel === 'function') {
            promise.cancel();
        }

        reject(timeoutError);
    }, milliseconds);

    // TODO: Use native `finally` keyword when targeting Node.js 10
    pFinally(
        // eslint-disable-next-line promise/prefer-await-to-then
        promise.then(resolve, reject),
        () => {
            clearTimeout(timer);
        }
    );
});
