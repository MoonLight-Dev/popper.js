import Popper from 'src/popper/index.js';
import getOppositePlacement from '../../src/popper/utils/getOppositePlacement';

// Utils
import appendNewPopper from '../utils/appendNewPopper';
import appendNewRef from '../utils/appendNewRef';
import simulateScroll from '../utils/simulateScroll';
import getRect from '../utils/getRect';
const jasmineWrapper = document.getElementById('jasmineWrapper');

describe('[flipping]', () => {
    it('should flip from top to bottom', (done) => {
        const ref = appendNewRef(1, 'ref', jasmineWrapper);
        ref.style.marginLeft = '100px';
        const popper = appendNewPopper(2, 'popper');
        new Popper(ref, popper, {
            placement: 'top',
            onCreate: (data) => {
                expect(data.placement).toBe('bottom');
                done();
            },
        });
    });

    const flippingDefault = [
        'top', 'top-start', 'top-end',
        'bottom', 'bottom-start', 'bottom-end',
        'left', 'left-start', 'left-end',
        'right', 'right-start', 'right-end',
    ];

    const flippingVariations = {
        'top-start' : 'top-end',
        'top-end' : 'top-start',
        'bottom-start' : 'bottom-end',
        'bottom-end' : 'bottom-start',
        'left-start' : 'left-end',
        'left-end' : 'left-start',
        'right-start' : 'right-end',
        'right-end' : 'right-start',
    };

    flippingDefault.forEach((val) => {
        it(`should flip from ${val} to ${getOppositePlacement(val)} if boundariesElement is set`, (done) => {
            const relative = document.createElement('div');
            relative.style.margin = '100px 300px';
            relative.style.height = '100px';
            relative.style.width = '100px';
            relative.style.background = '#ffff00';
            jasmineWrapper.appendChild(relative);

            const ref = appendNewRef(1, 'ref', relative);
            ref.style.width = '70px';
            ref.style.height = '70px';
            ref.style.background = "green";
            // ref.style.marginTop = '100px';
            const popper = appendNewPopper(2, 'popper');

            new Popper(ref, popper, {
                placement: val,
                modifiers: {
                    flip: { boundariesElement: relative },
                },
                onCreate: (data) => {
                    expect(data.flipped).toBe(true);
                    expect(data.placement).toBe(getOppositePlacement(val));
                    expect(data.originalPlacement).toBe(val);
                    data.instance.destroy();
                    done();
                },
            });
        });

        it(`should NOT flip if there is no boundariesElement`, (done) => {
            const relative = document.createElement('div');
            relative.style.margin = '100px 300px';
            relative.style.height = '100px';
            relative.style.width = '100px';
            relative.style.background = '#ffff00';
            jasmineWrapper.appendChild(relative);

            const ref = appendNewRef(1, 'ref', relative);
            ref.style.width = '70px';
            ref.style.height = '70px';
            ref.style.background = "green";
            // ref.style.marginTop = '100px';
            const popper = appendNewPopper(3, 'popper');

            new Popper(ref, popper, {
                placement: val,
                onCreate: (data) => {
                    expect(data.flipped).not.toBe(true);
                    expect(data.placement).toBe(val);
                    expect(data.originalPlacement).toBe(val);
                    data.instance.destroy();
                    done();
                },
            });
        });
    });
    function getSecondaryMargin(val) {
        return (val === 'start' ? '-' : '') + '100px'
    }

    Object.keys(flippingVariations).forEach((val) => {
        it(`(variations) should flip from ${val} to ${flippingVariations[val]} if boundariesElement is set`, (done) => {
            const relative = document.createElement('div');
            relative.style.margin = '100px 300px';
            relative.style.height = '300px';
            relative.style.width = '300px';
            relative.style.background = '#ffff00';
            relative.style.position = 'relative';
            jasmineWrapper.appendChild(relative);

            const ref = appendNewRef(1, 'ref', relative);
            ref.style.width = '200px';
            ref.style.height = '200px';
            ref.style.background = "green";
            ref.style.position = "absolute";
            ref.style.zIndex = "10";
            const valElems = val.split('-');

            switch(valElems[0]) {
                case 'top':
                    ref.style.top = '100px';
                    ref.style.left = getSecondaryMargin(valElems[1]);
                    break;
                case 'bottom':
                    ref.style.bottom = '100px';
                    ref.style.left = getSecondaryMargin(valElems[1]);
                    break;
                case 'left':
                    ref.style.top = getSecondaryMargin(valElems[1]);
                    ref.style.left = '200px';
                    break;
                case 'right':
                    ref.style.top = getSecondaryMargin(valElems[1]);
                    ref.style.right = '200px';
                    break;
            };

            const popper = appendNewPopper(2, 'popper');

            new Popper(ref, popper, {
                placement: val,
                modifiers: {
                    preventOverflow: {
                        enabled: true,
                        escapeWithReference: true
                    },
                    flip: {
                        flipVariations: true,
                        boundariesElement: relative
                    }
                },
                onCreate: (data) => {
                    expect(data.flipped).toBe(true);
                    expect(data.placement).toBe(flippingVariations[val]);
                    expect(data.originalPlacement).toBe(val);
                    data.instance.destroy();
                    done();
                },
            });
        });
    })

    xit('flips to opposite side when rendered inside a positioned parent', (done) => {
        const page = document.createElement('div');
        page.className = 'page';
        page.style.paddingTop = '110vh'; // Simulates page content
        page.style.background = 'lightskyblue';
        jasmineWrapper.appendChild(page);

        const parent = document.createElement('div');
        parent.className = 'parent';
        parent.style.position = 'relative'; // Also fails if absolute. Comment out for test to pass.
        parent.style.background = 'yellow';
        page.appendChild(parent);

        const ref = appendNewRef(1, 'reference', parent);
        const popper = appendNewPopper(2, 'popper', parent);

        new Popper(ref, popper, {
            onCreate: (data) => {
                simulateScroll(page, { scrollTop: '110vh', delay: 10 });

                const popperRect = popper.getBoundingClientRect();
                const refRect = ref.getBoundingClientRect();
                const arrowSize = 5;

                expect(data.flipped).toBe(true);
                expect(popperRect.bottom + arrowSize).toBeApprox(refRect.top);

                data.instance.destroy();
                jasmineWrapper.removeChild(page);
                done();
            },
        });
    });

    xit('flips to bottom when hits top viewport edge', (done) => {
        jasmineWrapper.innerHTML = `
            <div id="s1" style="height: 3000px; background: red;">
                <div id="reference" style="background: pink; margin-top: 200px">reference</div>
                <div id="popper" style="background: purple">popper</div>
            </div>
        `;

        const reference = document.getElementById('reference');
        const popper = document.getElementById('popper');

        new Popper(reference, popper, {
            placement: 'top',
            onCreate() {
                simulateScroll(document.body, { scrollTop:  200, delay: 50 });
            },
            onUpdate() {
                expect(getRect(popper).top).toBe(getRect(reference).bottom);
                done();
            },
        });
    });
});
