import { z } from 'zod';
import { webUrl } from './spectator-model';
const title=z.string().trim().min(1).max(240);
const text=z.string().trim().max(2000).default('');
const id=z.string().min(1).max(100);
const discipline=z.enum(['all','sailing','powerboat']);
const date=z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const operationsSchemas={
 payment:z.object({boatId:id,reference:title,description:text,amount:z.number().finite().min(0).max(1000000),paid:z.number().finite().min(0).max(1000000),currency:z.literal('GBP').default('GBP'),dueDate:date,status:z.enum(['draft','invoiced','part-paid','paid','waived','refunded']),method:z.enum(['bank-transfer','card-external','cash','other']),checkoutUrl:webUrl,notes:text}).refine(d=>d.paid<=d.amount,'Paid amount cannot exceed the invoice.').refine(d=>d.status!=='paid'||d.paid===d.amount,'A paid invoice must be fully settled.').refine(d=>d.status!=='part-paid'||d.paid>0&&d.paid<d.amount,'Part-paid invoices need a partial settlement.'),
 declaration:z.object({boatId:id,raceId:id,submittedBy:title,outcome:z.enum(['completed','retired','did-not-start']),compliant:z.boolean(),notes:text,status:z.enum(['submitted','accepted','queried']),reviewNote:text,time:z.string().datetime()}).refine(d=>d.outcome!=='completed'||d.compliant,'Confirm compliance for a completed race.'),
 shoreevent:z.object({title,discipline,venueId:z.string().max(100).default(''),venue:title,date,start:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),end:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),category:z.enum(['social','prizegiving','briefing','family','activation']),audience:z.enum(['everyone','competitors','media','staff']),description:text,url:webUrl,published:z.boolean().default(false)}).refine(d=>d.end>=d.start,'End must follow start on the selected day.'),
 communication:z.object({title,body:text,discipline,className:text,audience:z.enum(['everyone','competitors','media','staff']),category:z.enum(['news','course','delay','committee','briefing','social','weather']),url:webUrl,time:z.string().datetime(),published:z.boolean().default(false)}),
 forecast:z.object({title,discipline:z.enum(['sailing','powerboat']),summary:text,detail:text,issuedAt:z.string().datetime(),validUntil:z.string().datetime(),official:z.boolean().default(false),source:title,url:webUrl,published:z.boolean().default(false)}).refine(d=>d.validUntil>d.issuedAt,'Forecast validity must follow its issue time.'),
 benefit:z.object({title,partner:title,description:text,code:text,url:webUrl,validUntil:date,discipline,active:z.boolean().default(true)}),
 club:z.object({name:title,email:z.string().trim().email().max(240),classes:text,active:z.boolean().default(true)}),
 prize:z.object({raceId:id,boatId:id,clubId:id,title,presentation:text}),
 clubpack:z.object({clubId:id,date,subject:title,body:z.string().max(60000),fingerprint:title,status:z.enum(['prepared','exported']),time:z.string().datetime()}),
 delivery:z.object({clubId:id,date,fingerprint:title,status:z.enum(['sent','failed']),providerReference:text,time:z.string().datetime(),error:text}),
 crewaccess:z.object({boatId:id,codeHash:z.string().regex(/^[a-f0-9]{64}$/),expiresAt:z.string().datetime(),active:z.boolean().default(true)}),
};
