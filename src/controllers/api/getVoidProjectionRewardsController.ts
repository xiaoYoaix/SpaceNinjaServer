import { getJSONfromString } from "@/src/helpers/stringHelpers";
import { crackRelic } from "@/src/helpers/relicHelper";
import { getInventory } from "@/src/services/inventoryService";
import { getAccountIdForRequest } from "@/src/services/loginService";
import { IVoidTearParticipantInfo } from "@/src/types/requestTypes";
import { RequestHandler } from "express";

// export const getVoidProjectionRewardsController: RequestHandler = async (req, res) => {
//     const accountId = await getAccountIdForRequest(req);
//     const data = getJSONfromString<IVoidProjectionRewardRequest>(String(req.body));
//
//     if (data.ParticipantInfo.QualifiesForReward && !data.ParticipantInfo.HaveRewardResponse) {
//         const inventory = await getInventory(accountId);
//         await crackRelic(inventory, data.ParticipantInfo);
//         await inventory.save();
//     }
//
//     const response: IVoidProjectionRewardResponse = {
//         CurrentWave: data.CurrentWave,
//         ParticipantInfo: data.ParticipantInfo,
//         DifficultyTier: data.DifficultyTier
//     };
//     res.json(response);
// };

//新方法，一次遗物获取三次奖励
export const getVoidProjectionRewardsController: RequestHandler = async (req, res) => {
    const accountId = await getAccountIdForRequest(req);
    const data = getJSONfromString<IVoidProjectionRewardRequest>(String(req.body));

    if (data.ParticipantInfo.QualifiesForReward && !data.ParticipantInfo.HaveRewardResponse) {
        const inventory = await getInventory(accountId);
        // 添加 rewardCount 参数
        await crackRelic(inventory, data.ParticipantInfo, {}, 3); // 传递空对象作为inventoryChanges
        await inventory.save();
    }

    const response: IVoidProjectionRewardResponse = {
        CurrentWave: data.CurrentWave,
        ParticipantInfo: data.ParticipantInfo,
        DifficultyTier: data.DifficultyTier
    };
    res.json(response);
};

interface IVoidProjectionRewardRequest {
    CurrentWave: number;
    ParticipantInfo: IVoidTearParticipantInfo;
    VoidTier: string;
    DifficultyTier: number;
    VoidProjectionRemovalHash: string;
}

interface IVoidProjectionRewardResponse {
    CurrentWave: number;
    ParticipantInfo: IVoidTearParticipantInfo;
    DifficultyTier: number;
}

interface IVoidProjectionRewardRequest {
    CurrentWave: number;
    ParticipantInfo: IVoidTearParticipantInfo;
    VoidTier: string;
    DifficultyTier: number;
    VoidProjectionRemovalHash: string;
}

interface IVoidProjectionRewardResponse {
    CurrentWave: number;
    ParticipantInfo: IVoidTearParticipantInfo;
    DifficultyTier: number;
}
