'use strict';

const { Contract } = require('fabric-contract-api');
const allPartnersKey = 'all-partners';
const earnPointsTransactionsKey = 'earn-points-transactions';
const usePointsTransactionsKey = 'use-points-transactions';
const allPartnersProductsKey = 'all-partners-products';
const allPartnersAchatsDispoKey = 'all-partners-achats-dispo';
const allPartnersAchatsUseKey = 'all-partners-achats-use';
const allMembersAchatsKey = 'all-members-achats';
const allMembersPoinsKey = 'all-members-points';

class TrackexEchange extends Contract {

    // Init function executed when the ledger is instantiated
    async instantiate(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        
        await ctx.stub.putState('instantiate', Buffer.from('INIT-LEDGER'));

        //Partners listes
        await ctx.stub.putState(allPartnersProductsKey, Buffer.from(JSON.stringify({})));
        await ctx.stub.putState(allPartnersAchatsDispoKey, Buffer.from(JSON.stringify({})));
        await ctx.stub.putState(allPartnersAchatsUseKey, Buffer.from(JSON.stringify({})));
        //liste
        await ctx.stub.putState(allPartnersKey, Buffer.from(JSON.stringify([])));

        //Members listes
        await ctx.stub.putState(allMembersAchatsKey, Buffer.from(JSON.stringify({})));
        await ctx.stub.putState(allMembersPoinsKey, Buffer.from(JSON.stringify({})));

       console.info('============= END : Initialize Ledger ===========');
    }

    // Add a member on the ledger
    async CreateMember(ctx, member) {
        member = JSON.parse(member);

        await ctx.stub.putState(member.accountNumber, Buffer.from(JSON.stringify(member)));

        let allMembersAchats = await ctx.stub.getState(allMembersAchatsKey);
        allMembersAchats = JSON.parse(allMembersAchats);
        allMembersAchats[member.id] = [];
        await ctx.stub.putState(allMembersAchatsKey, Buffer.from(JSON.stringify(allMembersAchats)));

        let allMembersPoins = await ctx.stub.getState(allMembersPoinsKey);
        allMembersPoins = JSON.parse(allMembersPoins);
        allMembersPoins[member.id] = [];
        await ctx.stub.putState(allMembersPoinsKey, Buffer.from(JSON.stringify(allMembersPoins)));

        return JSON.stringify(member);
    }

    // Add a partner on the ledger, and add it to the all-partners list
    async CreatePartner(ctx, partner) {
        partner = JSON.parse(partner);

        await ctx.stub.putState(partner.id, Buffer.from(JSON.stringify(partner)));

        let allPartners = await ctx.stub.getState(allPartnersKey);
        allPartners = JSON.parse(allPartners);
        allPartners.push(partner);
        await ctx.stub.putState(allPartnersKey, Buffer.from(JSON.stringify(allPartners)));

        let allPartnersProducts = await ctx.stub.getState(allPartnersProductsKey);
        allPartnersProducts = JSON.parse(allPartnersProducts);
        allPartnersProducts[partner.id] = [];
        await ctx.stub.putState(allPartnersProductsKey, Buffer.from(JSON.stringify(allPartnersProducts)));

        let allPartnersAchatsDispo = await ctx.stub.getState(allPartnersAchatsDispoKey);
        allPartnersAchatsDispo = JSON.parse(allPartnersAchatsDispo);
        allPartnersAchatsDispo[partner.id] = [];
        await ctx.stub.putState(allPartnersAchatsDispoKey, Buffer.from(JSON.stringify(allPartnersAchatsDispo)));

        let allPartnersAchatsUse = await ctx.stub.getState(allPartnersAchatsUseKey);
        allPartnersAchatsUse = JSON.parse(allPartnersAchatsUse);
        allPartnersAchatsUse[partner.id] = [];
        await ctx.stub.putState(allPartnersAchatsUseKey, Buffer.from(JSON.stringify(allPartnersAchatsUse)));
        
        return JSON.stringify(partner);
    }


     // Add a partner on the ledger, and add it to the all-partners list
     async addProduct(ctx, product) {
        product = JSON.parse(product);

        await ctx.stub.putState(product.id, Buffer.from(JSON.stringify(product)));

        let allPartnersProducts = await ctx.stub.getState(allPartnersProductsKey);
        allPartnersProducts = JSON.parse(allPartnersProducts);
        allPartnersProducts[product.partner].push(product);
        await ctx.stub.putState(allPartnersProductsKey, Buffer.from(JSON.stringify(allPartnersProducts)));
        
        return JSON.stringify(product);
    }

    async buyProduct(ctx, buyProduct) {
        buyProduct = JSON.parse(buyProduct);
        buyProduct.timestamp = new Date((ctx.stub.txTimestamp.seconds.low*1000)).toGMTString();
        buyProduct.transactionId = ctx.stub.txId;

        let product = await ctx.stub.getState(buyProduct.productId);
        product = JSON.parse(product);

        let allPartnersAchatsDispo = await ctx.stub.getState(allPartnersAchatsDispoKey);
        allPartnersAchatsDispo = JSON.parse(allPartnersAchatsDispo);
        if (allPartnersAchatsDispo[buyProduct.partnerId] == null) {
            allPartnersAchatsDispo[buyProduct.partnerId] = [];
        }
        allPartnersAchatsDispo[buyProduct.partnerId].push(buyProduct);
        await ctx.stub.putState(allPartnersAchatsDispoKey, Buffer.from(JSON.stringify(allPartnersAchatsDispo)));

        let allMembersAchats = await ctx.stub.getState(allMembersAchatsKey);
        allMembersAchats = JSON.parse(allMembersAchats);
        if (allMembersAchats[buyProduct.accountNumber] == null) {
            allMembersAchats[buyProduct.accountNumber]= [];
        }
        allMembersAchats[buyProduct.accountNumber].push({id:buyProduct.transactionId, buy:buyProduct, product:product});
        await ctx.stub.putState(allMembersAchatsKey, Buffer.from(JSON.stringify(allMembersAchats)));
        
        return JSON.stringify(buyProduct);
    }

    async buyAchat(ctx, buyAchat) {
        buyAchat = JSON.parse(buyAchat);


        let allPartnersAchatsUse = await ctx.stub.getState(allPartnersAchatsUseKey);
        allPartnersAchatsUse = JSON.parse(allPartnersAchatsUse);
        if (allPartnersAchatsUse[buyAchat.partnerId] == null) {
            allPartnersAchatsUse[buyAchat.partnerId] = [];
        }
        allPartnersAchatsUse[buyAchat.partnerId].push(buyAchat);
        await ctx.stub.putState(allPartnersAchatsUseKey, Buffer.from(JSON.stringify(allPartnersAchatsUse)));

        let allMembersPoins = await ctx.stub.getState(allMembersPoinsKey);
        allMembersPoins = JSON.parse(allMembersPoins);
        if (allMembersPoins[buyAchat.accountNumber] == null) {
            allMembersPoins[buyAchat.accountNumber]= [];
        }
        allMembersPoins[buyAchat.accountNumber].push(buyAchat);
        await ctx.stub.putState(allMembersPoinsKey, Buffer.from(JSON.stringify(allMembersPoins)));
        

        let member = await ctx.stub.getState(buyAchat.accountNumber);
        member = JSON.parse(member);
        if (member.points == null) {
            member.points = 0;
        }
        member.points += 1;
        await ctx.stub.putState(buyAchat.accountNumber, Buffer.from(JSON.stringify(member)));

        return JSON.stringify(buyAchat);
    }

    // get the state from key
    async GetState(ctx, key) {
        let data = await ctx.stub.getState(key);

        let jsonData = JSON.parse(data.toString());
        return JSON.stringify(jsonData);
    }

}

module.exports = TrackexEchange;