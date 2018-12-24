const VDL_QUERY_PARAM = 'vdl=';
const KEY_PREFIX = 'TableState';
const KEY_SEPARATOR = '__';
/**
 * Generate the URL part for the storage key. Strips out all but the vdl query parameter.
 *
 * @returns {string}
 */
function generateUrlKey () {
    let key = window.location.pathname + window.location.hash;

    if (window.location.search) {
        const matchedVdl = window.location.search
            .substr(1)
            .split('&')
            .filter(function (part) {
                // Find the vdl query parameter
                return _.startsWith(part, VDL_QUERY_PARAM);
            });

        if (matchedVdl.length) {
            key += '?' + matchedVdl[0];
        }
    }
    return key;
}

/** @typedef {{sorters: Array, filters: Array}} State*/


/**
 * @param {string} tableId
 * @param {string} keySuffix
 */
export const createStateManager = (tableId, keySuffix) => {
    const key = [KEY_PREFIX, generateUrlKey(), tableId, keySuffix].join(KEY_SEPARATOR);
    return {
        /** @param {State} data */
        saveState: data => {
            try {
                window.sessionStorage.setItem(key, JSON.stringify(data));
            } catch (e) {
                console.error('Could not save table state for tableId: ' + tableId, e);
            }
        },

        /** @returns {State} */
        loadState: () => {
            try {
                return JSON.parse(window.sessionStorage.getItem(key));
            } catch (e) {
                console.error('Could not load table state for tableId: ' + tableId, e);
                return {
                    filters: [],
                    sorters: []
                };
            }
        }
    };
}
