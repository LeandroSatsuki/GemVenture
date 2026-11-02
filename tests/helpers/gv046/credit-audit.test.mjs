import test from 'node:test';
import assert from 'node:assert/strict';
import {buildCreditAudit} from './credit-audit.mjs';
test('fourteen credit categories and Fernando receipt ledger preserve paid totals with repeated same-row contacts',()=>{
 const report=buildCreditAudit();assert.equal(report.cases.length,14);assert.ok(report.cases.every(c=>c.creditMatchesWalletAndHistory&&c.replayCannotPay));
});
