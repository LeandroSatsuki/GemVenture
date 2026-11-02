import test from 'node:test';
import assert from 'node:assert/strict';
import {createState} from '../dist/core.js';
import {topicById} from '../dist/learning-path.js';
import {expeditionBriefing,isExpeditionTopic} from '../dist/expedition-briefing.js';

test('first descent briefing explains the core loop before first-use eligibility without mutating the profile',()=>{
 const s=createState(43),before=JSON.stringify(s),pages=expeditionBriefing(s);
 assert.deepEqual(pages.map(p=>p.topic),['movement','breath','combo','items','cards','camp','return','discoveries']);
 for(const page of pages){assert.ok(page.title&&page.text&&page.image);assert.equal(page.image,topicById(page.topic).image);}
 assert.equal(JSON.stringify(s),before);
});
test('advanced encounters follow actual progress, and Abyss preparation includes its own systems',()=>{
 const s=createState(43);s.best=2;assert.ok(expeditionBriefing(s).some(p=>p.topic==='sentinel'));assert.ok(!expeditionBriefing(s).some(p=>p.topic==='boss'));
 s.best=5;assert.ok(expeditionBriefing(s).some(p=>p.topic==='boss'));assert.deepEqual(expeditionBriefing(s,'abyss').slice(-2).map(p=>p.topic),['orbs','abyss']);
 assert.equal(isExpeditionTopic('breath'),true);assert.equal(isExpeditionTopic('expedition'),true);assert.equal(isExpeditionTopic('forge'),false);
});
