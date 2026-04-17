/**
 * graph.test.js — Tests for src/graph.js (ForceSimulation physics)
 */

'use strict';

module.exports = function (describe, it, assert, assertEqual, assertDeepEqual, assertApprox, assertGreaterThan, assertLessThan, assertArrayIncludes) {

    var ForceSimulation = window.ForceSimulation;

    /* ─── Constructor ─── */

    describe('ForceSimulation — constructor', function () {
        it('is exported as a class', function () {
            assertEqual(typeof ForceSimulation, 'function');
        });

        it('initializes nodes with positions and velocities', function () {
            var nodes = [{ id: 'a' }, { id: 'b' }];
            var links = [];
            var sim = new ForceSimulation(nodes, links, 600, 400);

            assertEqual(sim.nodes.length, 2);
            for (var i = 0; i < sim.nodes.length; i++) {
                assert(typeof sim.nodes[i].x === 'number', 'node should have x');
                assert(typeof sim.nodes[i].y === 'number', 'node should have y');
                assertEqual(sim.nodes[i].vx, 0, 'initial vx should be 0');
                assertEqual(sim.nodes[i].vy, 0, 'initial vy should be 0');
            }
        });

        it('resolves links by source/target id', function () {
            var nodes = [{ id: 'a' }, { id: 'b' }];
            var links = [{ source: 'a', target: 'b', weight: 0.5 }];
            var sim = new ForceSimulation(nodes, links, 600, 400);

            assertEqual(sim.links.length, 1);
            assertEqual(sim.links[0].source.id, 'a');
            assertEqual(sim.links[0].target.id, 'b');
        });

        it('filters out links with invalid source/target', function () {
            var nodes = [{ id: 'a' }, { id: 'b' }];
            var links = [
                { source: 'a', target: 'nonexistent', weight: 0.5 },
                { source: 'a', target: 'b', weight: 0.3 }
            ];
            var sim = new ForceSimulation(nodes, links, 600, 400);
            assertEqual(sim.links.length, 1, 'invalid link should be filtered');
        });

        it('sets default alpha and decay parameters', function () {
            var sim = new ForceSimulation([], [], 600, 400);
            assertEqual(sim.alpha, 1);
            assertGreaterThan(sim.alphaDecay, 0);
            assertGreaterThan(sim.alphaMin, 0);
            assertGreaterThan(sim.velocityDecay, 0);
        });

        it('handles empty nodes and links', function () {
            var sim = new ForceSimulation([], [], 600, 400);
            assertEqual(sim.nodes.length, 0);
            assertEqual(sim.links.length, 0);
        });

        it('positions nodes within canvas dimensions', function () {
            var nodes = [];
            for (var i = 0; i < 10; i++) nodes.push({ id: 'n' + i });
            var sim = new ForceSimulation(nodes, [], 600, 400);

            for (var j = 0; j < sim.nodes.length; j++) {
                assertGreaterThan(sim.nodes[j].x, -1, 'x should be non-negative');
                assertLessThan(sim.nodes[j].x, 601, 'x should be within width');
                assertGreaterThan(sim.nodes[j].y, -1, 'y should be non-negative');
                assertLessThan(sim.nodes[j].y, 401, 'y should be within height');
            }
        });
    });

    /* ─── tick ─── */

    describe('ForceSimulation — tick', function () {
        it('returns true while alpha > alphaMin', function () {
            var sim = new ForceSimulation([{ id: 'a' }], [], 600, 400);
            var running = sim.tick();
            assertEqual(running, true);
        });

        it('returns false when alpha decays below alphaMin', function () {
            var sim = new ForceSimulation([{ id: 'a' }], [], 600, 400);
            sim.alpha = 0.0001;
            var running = sim.tick();
            assertEqual(running, false);
        });

        it('decreases alpha on each tick', function () {
            var sim = new ForceSimulation([{ id: 'a' }, { id: 'b' }], [], 600, 400);
            var alpha0 = sim.alpha;
            sim.tick();
            assertLessThan(sim.alpha, alpha0, 'alpha should decrease after tick');
        });

        it('repulsive force pushes nodes apart', function () {
            var nodes = [{ id: 'a' }, { id: 'b' }];
            var sim = new ForceSimulation(nodes, [], 600, 400);
            // Force nodes to same position
            sim.nodes[0].x = 300;
            sim.nodes[0].y = 200;
            sim.nodes[1].x = 301;
            sim.nodes[1].y = 200;
            sim.nodes[0].vx = 0;
            sim.nodes[0].vy = 0;
            sim.nodes[1].vx = 0;
            sim.nodes[1].vy = 0;

            sim.tick();

            // After tick, nodes should have moved apart (node[0] moved left, node[1] right)
            assert(sim.nodes[0].vx !== 0 || sim.nodes[1].vx !== 0,
                'repulsive force should produce velocity');
        });

        it('attractive force pulls linked nodes together', function () {
            var nodes = [{ id: 'a' }, { id: 'b' }];
            var links = [{ source: 'a', target: 'b', weight: 0.8 }];
            var sim = new ForceSimulation(nodes, links, 600, 400);
            // Place nodes far apart
            sim.nodes[0].x = 100;
            sim.nodes[0].y = 200;
            sim.nodes[1].x = 500;
            sim.nodes[1].y = 200;
            sim.nodes[0].vx = 0;
            sim.nodes[0].vy = 0;
            sim.nodes[1].vx = 0;
            sim.nodes[1].vy = 0;

            sim.tick();

            // Node 0 should have positive vx (towards node 1) or node 1 negative vx
            var moved = (sim.nodes[0].x > 100) || (sim.nodes[1].x < 500);
            assert(moved, 'linked nodes should be attracted toward each other');
        });

        it('keeps nodes within bounds', function () {
            var sim = new ForceSimulation([{ id: 'a' }], [], 600, 400);
            sim.nodes[0].x = -100;
            sim.nodes[0].y = -100;
            sim.nodes[0].vx = -50;
            sim.nodes[0].vy = -50;

            sim.tick();

            var margin = 80;
            assertGreaterThan(sim.nodes[0].x, margin - 1, 'x should respect margin');
            assertGreaterThan(sim.nodes[0].y, margin - 1, 'y should respect margin');
        });

        it('does not move fixed nodes', function () {
            var sim = new ForceSimulation([{ id: 'a' }, { id: 'b' }], [], 600, 400);
            sim.nodes[0].x = 300;
            sim.nodes[0].y = 200;
            sim.nodes[0].fixed = true;

            var x0 = sim.nodes[0].x;
            var y0 = sim.nodes[0].y;
            sim.tick();

            assertEqual(sim.nodes[0].x, x0, 'fixed node x should not change');
            assertEqual(sim.nodes[0].y, y0, 'fixed node y should not change');
        });

        it('simulation converges after many ticks', function () {
            var nodes = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
            var links = [{ source: 'a', target: 'b', weight: 0.5 }];
            var sim = new ForceSimulation(nodes, links, 600, 400);

            var ticks = 0;
            while (sim.tick() && ticks < 500) ticks++;

            assertLessThan(sim.alpha, sim.alphaMin, 'alpha should fall below alphaMin');
        });
    });

    /* ─── fix / release ─── */

    describe('ForceSimulation — fix / release', function () {
        it('fix sets position and marks node as fixed', function () {
            var sim = new ForceSimulation([{ id: 'a' }], [], 600, 400);
            sim.fix('a', 250, 150);

            assertEqual(sim.nodes[0].x, 250);
            assertEqual(sim.nodes[0].y, 150);
            assertEqual(sim.nodes[0].vx, 0);
            assertEqual(sim.nodes[0].vy, 0);
            assertEqual(sim.nodes[0].fixed, true);
        });

        it('release unfixes a node', function () {
            var sim = new ForceSimulation([{ id: 'a' }], [], 600, 400);
            sim.fix('a', 250, 150);
            sim.release('a');

            assertEqual(sim.nodes[0].fixed, false);
        });

        it('fix with invalid id does nothing', function () {
            var sim = new ForceSimulation([{ id: 'a' }], [], 600, 400);
            sim.fix('nonexistent', 250, 150);
            // Should not throw
            assert(true, 'fix with invalid id should not throw');
        });

        it('release with invalid id does nothing', function () {
            var sim = new ForceSimulation([{ id: 'a' }], [], 600, 400);
            sim.release('nonexistent');
            assert(true, 'release with invalid id should not throw');
        });
    });

    /* ─── reheat ─── */

    describe('ForceSimulation — reheat', function () {
        it('sets alpha to 0.3', function () {
            var sim = new ForceSimulation([{ id: 'a' }], [], 600, 400);
            sim.alpha = 0.001;
            sim.reheat();
            assertApprox(sim.alpha, 0.3, 0.01);
        });

        it('allows simulation to continue after reheat', function () {
            var sim = new ForceSimulation([{ id: 'a' }], [], 600, 400);
            sim.alpha = 0.0001; // below alphaMin
            assertEqual(sim.tick(), false, 'should be stopped');

            sim.reheat();
            assertEqual(sim.tick(), true, 'should resume after reheat');
        });
    });

    /* ─── link weight effects ─── */

    describe('ForceSimulation — link weight', function () {
        it('heavier links produce stronger attraction', function () {
            var nodesLight = [{ id: 'a' }, { id: 'b' }];
            var linksLight = [{ source: 'a', target: 'b', weight: 0.1 }];
            var simLight = new ForceSimulation(nodesLight, linksLight, 600, 400);
            simLight.nodes[0].x = 100; simLight.nodes[0].y = 200;
            simLight.nodes[1].x = 500; simLight.nodes[1].y = 200;
            simLight.nodes[0].vx = 0; simLight.nodes[0].vy = 0;
            simLight.nodes[1].vx = 0; simLight.nodes[1].vy = 0;

            var nodesHeavy = [{ id: 'a' }, { id: 'b' }];
            var linksHeavy = [{ source: 'a', target: 'b', weight: 0.9 }];
            var simHeavy = new ForceSimulation(nodesHeavy, linksHeavy, 600, 400);
            simHeavy.nodes[0].x = 100; simHeavy.nodes[0].y = 200;
            simHeavy.nodes[1].x = 500; simHeavy.nodes[1].y = 200;
            simHeavy.nodes[0].vx = 0; simHeavy.nodes[0].vy = 0;
            simHeavy.nodes[1].vx = 0; simHeavy.nodes[1].vy = 0;

            // Equalize alpha
            simLight.alpha = 1;
            simHeavy.alpha = 1;

            simLight.tick();
            simHeavy.tick();

            var lightDist = Math.abs(simLight.nodes[1].x - simLight.nodes[0].x);
            var heavyDist = Math.abs(simHeavy.nodes[1].x - simHeavy.nodes[0].x);

            assertLessThan(heavyDist, lightDist + 1,
                'heavier link should pull nodes closer');
        });
    });
};
