import { TInventoryDatabaseDocument } from "@/src/models/inventoryModels/inventoryModel";
import { IVoidTearParticipantInfo } from "@/src/types/requestTypes";
import { ExportRelics, ExportRewards, TRarity } from "warframe-public-export-plus";
import { getRandomWeightedReward, IRngResult } from "@/src/services/rngService";
import { logger } from "@/src/utils/logger";
import { addMiscItems, combineInventoryChanges } from "@/src/services/inventoryService";
import { handleStoreItemAcquisition } from "@/src/services/purchaseService";
import { IInventoryChanges } from "../types/purchaseTypes";

// export const crackRelic = async (
//     inventory: TInventoryDatabaseDocument,
//     participant: IVoidTearParticipantInfo,
//     inventoryChanges: IInventoryChanges = {}
// ): Promise<IRngResult> => {
//     const relic = ExportRelics[participant.VoidProjection];
//     const weights = refinementToWeights[relic.quality];
//     logger.debug(`opening a relic of quality ${relic.quality}; rarity weights are`, weights);
//     const reward = getRandomWeightedReward(
//         ExportRewards[relic.rewardManifest][0] as { type: string; itemCount: number; rarity: TRarity }[], // rarity is nullable in PE+ typings, but always present for relics
//         weights
//     )!;
//     logger.debug(`relic rolled`, reward);
//     participant.Reward = reward.type;
//
//     // Remove relic
//     const miscItemChanges = [
//         {
//             ItemType: participant.VoidProjection,
//             ItemCount: -1
//         }
//     ];
//     addMiscItems(inventory, miscItemChanges);
//     combineInventoryChanges(inventoryChanges, { MiscItems: miscItemChanges });
//
//     // Give reward
//     combineInventoryChanges(
//         inventoryChanges,
//         (await handleStoreItemAcquisition(reward.type, inventory, reward.itemCount)).InventoryChanges
//     );
//
//     return reward;
// };

//开启一次遗物获取多次奖励，每次概率独立判断代码方法
export const crackRelic = async (
    inventory: TInventoryDatabaseDocument,
    participant: IVoidTearParticipantInfo,
    inventoryChanges: IInventoryChanges = {},
    rewardCount: number = 3 // 新增参数，默认1次
): Promise<IRngResult[]> => { // 返回奖励数组
    const relic = ExportRelics[participant.VoidProjection];
    const weights = refinementToWeights[relic.quality];

    logger.debug(`opening a relic of quality ${relic.quality}; rarity weights are`, weights);

    // 生成多次独立奖励
    const rewards: IRngResult[] = [];
    for (let i = 0; i < rewardCount; i++) {
        const reward = getRandomWeightedReward(
            ExportRewards[relic.rewardManifest][0] as { type: string; itemCount: number; rarity: TRarity }[],
            weights
        )!;
        rewards.push(reward);
        logger.debug(`relic roll #${i+1}`, reward);
    }

    // 只设置第一个奖励到participant（兼容原有逻辑）
    participant.Reward = rewards[0].type;

    // 扣除一个遗物（保持不变）
    const miscItemChanges = [{
        ItemType: participant.VoidProjection,
        ItemCount: -1
    }];
    addMiscItems(inventory, miscItemChanges);
    combineInventoryChanges(inventoryChanges, { MiscItems: miscItemChanges });

    // 添加所有奖励到库存
    for (const reward of rewards) {
        combineInventoryChanges(
            inventoryChanges,
            (await handleStoreItemAcquisition(reward.type, inventory, reward.itemCount)).InventoryChanges
        );
    }

    return rewards; // 返回所有奖励结果
};
const refinementToWeights = {
    VPQ_BRONZE: {
        COMMON: 0.76,
        UNCOMMON: 0.22,
        RARE: 0.02,
        LEGENDARY: 0
    },
    VPQ_SILVER: {
        COMMON: 0.7,
        UNCOMMON: 0.26,
        RARE: 0.04,
        LEGENDARY: 0
    },
    VPQ_GOLD: {
        COMMON: 0.6,
        UNCOMMON: 0.34,
        RARE: 0.06,
        LEGENDARY: 0
    },
    VPQ_PLATINUM: {
        COMMON: 0.5,
        UNCOMMON: 0.4,
        RARE: 0.1,
        LEGENDARY: 0
    }
};
