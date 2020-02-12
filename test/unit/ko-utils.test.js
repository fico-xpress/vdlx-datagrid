
import { createMutationObservable } from '../../src/js/ko-utils';

describe('ko-utils', () => {
    it('create mutation observable', () => {
        const mutationObservable = createMutationObservable('element', { childList: true });

        expect(MutationObserver.observe).not.toHaveBeenCalled();
        expect(MutationObserver.disconnect).not.toHaveBeenCalled();
        
        const subscription = mutationObservable.subscribe(() => {});
        expect(MutationObserver.observe).toHaveBeenCalledWith('element', { childList: true });

        subscription.dispose();
        expect(MutationObserver.disconnect).toHaveBeenCalled();

    });
});
