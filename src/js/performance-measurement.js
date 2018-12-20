export default function (measurementDescription, measurement) {
    const debugEnabled = insight.isDebugEnabled();
    if (debugEnabled) {
        const startTime = window.performance.now();
        const res = measurement();
        const printEnd = () => {
            const endTime = window.performance.now();
            console.info(`${measurementDescription} has finished in: ${Math.round(endTime - startTime).toLocaleString()} milliseconds`);
        };

        if (res instanceof Promise) {
            return res.then((value) => {
                printEnd();
                return value;
            });
        }

        printEnd();
        return res;
    }

    return measurement();
};