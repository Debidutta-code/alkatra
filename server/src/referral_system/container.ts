import { ReferralRepository, RewardRepository, WalletRepository } from "./repositories";
import { ReferralService, RewardService, WalletService } from "./services";
import { ReferralController, RewardController, WalletController } from "./controllers";

const referralRepository = new ReferralRepository();
const rewardRepository = new RewardRepository();
const walletRepository = new WalletRepository();

const walletService = new WalletService(walletRepository);
const rewardService = new RewardService(rewardRepository);
const referralService = new ReferralService(referralRepository, walletService);

const referralController = new ReferralController(referralService);
const rewardController = new RewardController(rewardService);
const walletController = new WalletController(walletService);

export {
  referralController,
  rewardController,
  walletController,
  referralService,
  rewardService,
  walletService,
};