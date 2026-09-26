## Stage

<!-- The stage from docs/build-plan.md, e.g. `CI`, `STABLE-APP`. One stage per PR. -->

## What

<!-- What is different afterwards, in plain words. Review ids (M…, S…, K…, W…) where they apply. -->

## Checks

- [ ] `python3 tools/validate_content.py` (0 errors)
- [ ] `python3 tools/test_validate.py`
- [ ] `python3 tools/check_sizing.py --summary` (0 breaches)
- [ ] `npm run typecheck`
- [ ] `npm run lint` and `npm run format:check`
- [ ] `npm test`
- [ ] CI green on this PR

## Test checklist

<!-- What David tests on his phone, with preview links (deep links like `#level-09-2/3`). -->

1.
